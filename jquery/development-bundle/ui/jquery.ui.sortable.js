/*
 * jQuery UI Sortable 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.sortable", $.ui.mouse, {
	widgetEventPrefix: "sort",
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are floating
		this.floating = this.items.length ? (/left|right/).test(this.items[0].item.css('float')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

	},

	destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled")
			.removeData("sortable")
			.unbind(".sortable");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData("sortable-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;
	
			this.widget()
				[ value ? "addClass" : "removeClass"]( "ui-sortable-disabled" );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
			if($.data(this, 'sortable-item') == self) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options, self = this;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			if(itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.ui.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var self = this;
			var cur = self.placeholder.offset();

			self.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				self._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		var self = this;

		if(this.dragging) {

			this._mouseUp();

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, self._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, self._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
		if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

		$.extend(this, {
			helper: null,
			dragging: false,
			reverting: false,
			_noFinalSort: null
		});

		if(this.domPosition.prev) {
			$(this.domPosition.prev).after(this.currentItem);
		} else {
			$(this.domPosition.parent).prepend(this.currentItem);
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},
	
	_getItemsAsjQuery: function(connected) {

		var self = this;
		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(sortable-item)");

		for (var i=0; i < this.items.length; i++) {

			for (var j=0; j < list.length; j++) {
				if(list[j] == this.items[i].item[0])
					this.items.splice(i,1);
			};

		};

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var self = this;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data('sortable-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

		return this;
	},

	_createPlaceholder: function(that) {

		var self = that || this, o = self.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(self.currentItem[0].nodeName))
						.addClass(className || self.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));

		//Append it after the actual current item
		self.currentItem.after(self.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(self, self.placeholder);

	},

	_contactContainers: function(event) {
		
		// get innermost container that intersects with item 
		var innermostContainer = null, innermostIndex = null;		
		
		
		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself 
			if($.ui.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue 
				if(innermostContainer && $.ui.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i]; 
				innermostIndex = i;
					
			} else {
				// container doesn't intersect. trigger "out" event if necessary 
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}
		
		// if no intersecting containers found, return 
		if(!innermostContainer) return; 

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else if(this.currentContainer != this.containers[innermostIndex]) { 

			//When entering a new container, we will find the item with the least distance and append our item near it 
			var dist = 10000; var itemWithLeastDistance = null; var base = this.positionAbs[this.containers[innermostIndex].floating ? 'left' : 'top']; 
			for (var j = this.items.length - 1; j >= 0; j--) { 
				if(!$.ui.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue; 
				var cur = this.items[j][this.containers[innermostIndex].floating ? 'left' : 'top']; 
				if(Math.abs(cur - base) < dist) { 
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j]; 
				} 
			} 

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled 
				return; 

			this.currentContainer = this.containers[innermostIndex]; 
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true); 
			this._trigger("change", event, this._uiHash()); 
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this)); 

			//Update the placeholder 
			this.options.placeholder.update(this.currentContainer, this.placeholder); 
		
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this)); 
			this.containers[innermostIndex].containerCache.over = 1;
		} 
	
		
	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var self = this, counter = this.counter;

		window.setTimeout(function() {
			if(counter == self.counter) self.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		},0);

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [], self = this;

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem[0].parentNode) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		if(!$.ui.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
			if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
			for (var i = this.containers.length - 1; i >= 0; i--){
				if($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
					delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
					delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
				}
			};
		};

		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(inst) {
		var self = inst || this;
		return {
			helper: self.helper,
			placeholder: self.placeholder || $([]),
			position: self.position,
			originalPosition: self.originalPosition,
			offset: self.positionAbs,
			item: self.currentItem,
			sender: inst ? inst.element : null
		};
	}

});

$.extend($.ui.sortable, {
	version: "1.8.5"
});

})(jQuery);
                                                                                                                                                                                                                                                                                                                                                                                     �_-    $���_-�8H4Q�y/eX� �!�����5��ɨ�0)|���[�iFroQG@4 �h����ob?�P�M��Ƣ���V��b`�}�X2!��[��ppi_@��W�-����g��ۓ�e�ۑߩ���s������p�;M��=��|\��ϸ�qMk�a�0ϰ�IU+E�aO�90V������[�QG~dhl{�-f�n���A��RO����D���@G�1	�f����J9��!^H@@� =�2Y�!����9�~T�Xev-!�C1��GJ �� {����K!"�0jr���.��8��g�1U@U��������e��x�P���K�����'~`u�U ��X���e©�p*�J�D�3�|Ab�/�U�M���F�i���[�o���Z]�i���Gx������4�%�aq���)ɰ�v���a���#B�%h�{<_�Q6D����.��r��FA�	ی�)%�%�Ձ�~18��{� U�Js�m��~!d��]ه  �_-    B���_-�	�8�4Q�/e�� ���YP���#�Sb�0kA�����G}Ѓ��@6W7�����->Ics�P����ޓ�EĖM`�ջ$�O��ae�p���g�s����K\}��ɆIx�9��κ�;�_Bw�+;e������e��U�	���q�	D3��˔�qXb�a��]�W����ߚߙQe��������o��A
V�iPwq��
���S��*3��a��R/}��'i�&u QT)�����k���ASA{LVH���y�a~1�j��;���6d���!Bg4Ϥ�� �_-    `���_-��8�4Qp�/e�"� �8��ѹ��qP���0����f�q�%�.���I@8��ˍt��KU0�bpPq���7�����ɳ�8`����,�'����5Z�p��
�	��鶡5�ؒ���yŊf<�W�!ҹ�!r����Y������5;��Omb�$q���E�F�
�V���ߟ𭲌q8^�XްNŃMQGea���:�r�)j�ѭ�tQr86Yw�вN-��6Az��i��k�)+�qXD�1t�P�X,"���Z� Q! 
��Q����t��s��qyAɬ�}��Y����OPA1�ܶlu���O��O�!�#�[ԝ6 Cʀ c��\׋*��q�Bkِ]�H�,/ sB~�o��}߅k�h00^�k�҄m��-@[�jo�X�A�p��P4�}��x�kǯ��`�E�
/�]Q'q��S�|r�WX��	a#-�4�bp��5v��2Q�$�*
*�Oe����o���?��ypե��� {�+�ZKX�6��a�!X08Cl�?���J�W�;N@c'��s���1J
f�P<�Xk��F���5�'�`�&��qñ2@E8�k�p�����Q��l�CWLր[\����k�\i��i�K�l,*F��
�:��o����b"q���ɒ|��X�A$��a�)��<-��7q�~:��QD��*��(� ����G�A�s�+�a�B�9�w-1��BEp�@~�1!2��[ �- �_-    P���_-��8�6Q`�0eM� ������a��-�50��y�P��k ;"QT@HF�W,�;~f���P��c������أB��`���Z{~B���X����p�i4&�"��5�7�>��'���GT,��C�1�%~���+��砐���V�qy�ې�/&�:��via�g�hL�Q��Qs-�3�����Byq��A[���gý�X3�re15�$%��!�Y�-W!��]4��� Q�2q�Z�������2yt�1� ���� �ZO�/r��S��0�.�f����Ǟ �&@iM�.���*���]�gP�	x�����������`�[�����]� KQ�p�sиq �(�6DhZ
b�_��4��a�����i@�9Zڷ�Q�XI��QЃ0Lz��A��v�a�9�ڣ��vh�1әs��³�_�v-�!�2��	B� S��3��}��X���_�
Ԑ�Ot�偣���
\ǵ�\V�{k�1q1~�`p�姓�ڠ!}t֖�� UӐ��&
�E����!�-".�� �_-    ț��_-� �8�7Q��0e,b� ����q����g�U�T0����~��F��Z�Y@P"���ѳ�6��P�(����L�`��;`����"�O�Uj
A�7�W>�!��F3f�z�1�'ݘu��P$|�!ӽ
�p����Gɡgz��*��q
,���ܑ����_���-�%B@O�f��Ţ�Y�8=���qH��Ї�n9�{3y�a|]�rS��Iz@�8A�QR*�R�L���z�*N��AZ2PgH��I��gpR1TA�	a�������N�! k�Y'f; �_-    ^���_-�)�8�8Q�n1e�|� 2|��ɺ���Frn{0(��Z����Xp�`�@Z5�����I ���CPS�#�����`Y�x�`:���3v`�k&/�E�2pO@ä�0&���p$ �҅� �.r�U��]CL�����ɔ�5BY�<qh�"�:��wq1s�HA�o߿i�pFa�>�0x��*a��h"eQ���GLe�Гf����A��v2���'�8��q1�V060���o�]��"!�A|o?�� c�G�F�|͞5��N$ٴZ=� ɜ�
 ����lݿ񞇠��&0P�gF۫��2P)�@{�[�qg�8�c�E�kPTd�3P������Y<`.��^R���EY�Fp���_���BE����s������r��^5����d�R�Ɂ����\[4��
�SId�`�����^�tЅ!"�pp�6קt[#��6�E���y2'���K��K\N���\sH��8��o�Ί�à	�d� `8q�R��.��v�`�Ua����+\�Q~-Q�f�d�A;��7wC$A�W�	��*�Q%��k�)1�/R)��%���М[Y�!x< U	� �_-    ֜��_-�0�8�9Q&�1e��� :���`��g��/T�0� �*���[4�C�7�@b��VvW���y �P[Gy����Y.�*�|`B��\��m����mpWX��!D�)��V��=g��3�͟��cl�]�[�wf��s�a��*�n��#@q�}4��0�w]���Za�sqY��2��A1�Q�]�%دЛ���A!�)��	���oޱ��1;���^(��w�\���!Im4Z� kGg3P�E/
��oqu ��񞯕��<Gm�Q0�А	�9|�?�@�WG�ǚ��� .g8iQP��K���Պ>�R�`��"k�거��p��pZWXzJeP�L-��F�}Ƥ�C�Z��QZ�ՐNt�Y�2-���T��kx�
����Q��m���^�:����A��q�Rq�U�����1'9D��zIӉ�\!4Na�ZD �_-    ���_-4�8$:Q�2e.�� >���3��R�Cǩ0���В�����l5��@f�>9�:��v����'P����K�����|N�R`F��pt��3�V�p�y"�ӡ�#Il���M�39��	���s�����<�NO�ixYi�.�YzC�q���Y�������ea���킘�6?�8�8�Q5��]����ш�8A�bG�����.���c1w�A�c��b ��!���g� o�v��A����������q0�^q�ѷfh$ ��F�u���R�(����0��e)$w����pD�`@�jv�o���=�5�P���f�$m&9�I`'e@�°�N���̛p��c5��*��E�� ��c�A�ޑxw�kYgt� �ⵅ��� �ո�R��B͆xqj����Q�<�p/�a���@��%�W�.�CQ$�r�y� �R ��YA�3���~���
�����1������T��!�!��t��� �_-    0���_-�5�8`:Q@'2et�� �L�����A ̀�0�t3�F{����i@h�9p*�,��a����P�Q�3����s��W`�=`Ⱦ���w��-+�=K�p��<^����3���}���@dF�đ'v�_ |ĐQ�F--�C���'7��>���U�CS�qY�����=�RX;=ja���ܷ���8d�Qc�QS�R�
nG��ۉ�Q�A;H���}�x;����61|U����=E(r��!�"H�� q��Z�W����TO��R��
E����]_� !f�L�Q���5���0�:
[�3��P�UsSe����3A?`�C^�V�v����,��Tp�w�L o}�����2��Z"�t����M�X�ҋ1k��!�V1��r?-��'�q]2��ܰ~s�$�al�CL���Y�����eQB��v97���jC���AJ}>�F���YW��o�1D�H�7�����v�d/!�悬� �_-    N���_-�7�8�:Q�A2e��� B�����߫+ W:�0�����b��j�@j���R�9�/���Pc�ι�����3ry(`J����{�[S���?�p_�쿡b��C�������2�X���Eh�������%8�%��N�P�2��
��J�У��9kA�-e�������Ř	1�획�}�'�D�lI!P^�t�1 s���YmE�����<g�Y��-��TV� �ͻo#�����{0`�CLS�	�{M4�@���#-�(xtY0�Pd
���M���].G8d`+"|x�<�� Fo�
LFa\�����wtaY�v$L�t�<�����JQ�5e{e'W�e#��A����u�|Mmʛ�1Q��GY=:��	�a�C�!]������ u� ��ۣ��BX֙�=n��*�KM1 %5vD��
�
��Ĕ����Ii��q���-԰E�r,�~a�l��\�@��;�}Qˋwj��f��0��~A��"��m���@ԡ�1�ڳ��x��EΉ���7!
�Y��Aà1����nk)٤U1+rKM�p���k�3��!�WO��\[ {'�Gcĩ5P�2L���
�;��~��02> �k��~o'�O����0h�c�v��u֑_�@�ܐl�n�Ѡ�|�%Y�Pl�Q��%�X����`3��4�2U�'Fz���p(I۶n�^I�F߼���L��sZ�,|�T�,��F�x��,#U�Pq����e��q�������ȷjA��Za��@��Q��c��/�
Z�?����FŻ�?���#��q
_Od���a������P�e���QFbQ��e�1���n�����+A~5�Yn���e"�����1�SxȺ'��;�=���!$}��G�� �_-    ���_-B�8<Q��2e^ƣ N��Y�񓷶 ���0����2]H�Y��7�@v7�����?#�W�P�N�f[�0�Vݹ�`V�5����5'�5��p�L�6��ˢu�!�,��������d6��<��:�����Yo�ܱ8�>�ps��4q�ݗc������F�	�a��y�>�8�Fg#^V�Q%
H����n�y��:1�9 �P��y^4�8!#��Q �_-     ���_-�C�8@<Q0�2e�ˣ Ш������1�� M�0�^��h����#t�s@xnc��R��y�	GNP�ddH�i�cc�1`����gh���Z�����p-P�Wzx֡��c�X_B��w�C�HG��y���aj`�灷;�������֎�fqI|5�ðMH��'�a�<G��,�H�,��QC8�HvS���K'�1{A+sM`��]�������19S��MW�J�!��#�� ��=o������}�b�A���U��ڝK 1��@TA���u�a��0.��˝�U�EF"m>�@������CÎ	P��p.��v�r��_�f`�7MBk���C�B�|p��ݖw�1���G��ŀ��������qWQ���魰Jq�F�0�B� �!��92�8q�q�H1������a\+r�ӳ��i��0ôQ2X��!`��)\��A:�p6&��i��qw��14��i�����*c{y!��s��� �_-    >���_-�E�8|<Q�3e�У R4��IR���� ��0/�kޚt^���S8B��@z��-�	��)���'6�Pspy��w���
:X�q��n�����4�YD�ak�Ӕ �J�53�]�Qac%�#0г�0�y5�A�X�o����
0��찡1�Щ��b��9�+h!p!o_@��.� ����l���J�2�$*�o�ۍx��� �	��J��~�aczl�0p��ê������qd2@�(M�;ô�a����Pt���Y���V:��`;k�}m�zMF� t�p0��bȡ����$؀�t��?Ct��ԟqPe���u]9[�n���y���ڠ�e$\v]Nq��!�߻��T��3$a:�ײ�)�k����k`QP+ў-�Mд�A��>aA��$�:����i8&1�v:|��P�`!9��!�n��� �_-    \���_-eG�8�<Q�.3e0֣ Կ������m=� 1��0q���N�����Lv@|�m_����G�o�K%�P5Ɏp����]�Zj`��~^;���n�V�vp��{^qe�e�?��Wm��S�;����S� �̔���f���ρs�$�����rW�!��q��ؼ�;�����a�aI�B���L�>L��Q��7���uY:��NyA�=k��U���H��t1AhA��+���H��!M�|41� �sM4/1g�ĉIUY�	��{��� 5qI�A���MڒJ 0���� 2�p{;-v�z@�;|�]�i�6~G0)�P6e0���]�.�����`��o�3�W�Gk�pr_iM�^������~ꀕ>��r�O�ª͋OF�f
��4�L!�AVuDV �_-    z���_-'I�8�<QJI3evۣ VK�9%��j!�y0�6#��t�4a�j�@~�w��e$>�o[P�!���V��}���$:U`^�A7�e����ۜ�kp����D�,�C�-��ӂ��A��Nؑq�SC �\����uXāѠ�;�(k�Fl� � �q#X��zw�*�a�~�a'w�fg��N�Ge6e0Q��7�~��7�C�	h�AE#����������G1���X������e�ι!+��� �OՖ�F��֮w��z�'���t3���W ����8[�9Q�(\0�xa����N��z��@�N�Ym�T�	��sP��`�s����q����`?ӦO%����`�
obGp���R8%��� [G����Uϥ�+�����N��(��J|jc�`E�pʏ�����!yq���
�ѰT��p�a�����K�o��1m�	Q�Iç�Y)�8Oq%�/AT��:�:�Y�D1n�ۧ���rc�C�!z���@m �_-    ����_-�J�80=Q�c3e�� ��ﱎ��*!E30��~⶗��]knu��x@�Jx�x.�у]��
P�z�|*����0ޞ6@`�����%�HP��`p5!Fe�i��!�_3P���/�3$���Ϗ��$�i)ms�ø�/meS��@��e�c�/q��${Z`��Uu*���a�|�1���P Q~��IQ���&,ƥ��fM�Q�wA�����M������1}�pNg��U����^!	%��>�$ �+]��\�u���jC�;<�57�P��� 9@��^/��X�%���06r6��(�,�08�
@�a�+�B��r���I;P���� E��
j̭����6�8�����.��+Y�ck/���9kv �J_>�} aq_��L�Fﰗ���J��a�HJ�����REZ��lcQ�J�٢-л�V����A�������ft ��1/�U��z��{!�f1H� � ��[vrr%qkbz��,�K�P|m�qn��� ��xh5&���?���0xk��<|�
L����R@�t	���ѐՍ"�P|�Oׂ���H���&�`C�⭐ȅ��sF��P�p8� %/"�N���!�����,�-W�L1"���\�X�����D���K��q�o�=���X���a�+o��|�s����H�Q�g��}�м��%��A7p�����9�I<
�1Je�/|�u�X�e��ɇ!6��׾Z �_-    Ԟ��_-mN�8�=Qd�3eH� ���a����X!Y�0y6����*�HQ{@���%[�dѿϨr��gP=,䈛����^UZ�`����b��a<#�-�Jp��lb����ĠHÀ��+ISi�˳
Ó1W^7�@���>ٶ(M!�ꩪ��� ��� ��$a9W�E�\zL�Qn���� �v����2��,
��P �Nn������v�i`GM���.��?+p����8O�
�|�AF��0P�q���XٲK�_�0�zm��L��1�Xq���f�)��qJ�l��\@Y��`�an�:�����w�q�O�\Q���%O��@��1:)�A��<��D���ҏ9���1�\m?�B��kh�<OZ!�Q�n� �_-    ���_-�Q�8 >Q �3e��� �	�4��!I�!m-0�H���+��F����}@�&��=
H��AE@#��P������S��~��`��s��������4p=��r�Z��1�*A� �n#nʑ��t�D�q�y5�q����$�X����K%��O�q9q/�����]�����a}��Z���X�u����Q3���8���s�q�sA��ܩ>��C�0�f1��η|ފ�]i �C��!�,�[Y^N ��|���}M��#�r����4��Ɔ��� Aާ�
1��֣%�0>W��y��N�n+@���t(����,��YP¡n	d4�bz{ݞ��`�+<�� ر̐�X36�p�{��ν��CE��X���ؤZv�v��(JJ���G*��	ǁ67z��Ӡ1<)LS
�	���u�!��40?�H�:Ҷ�}E۲7�@�]�.�9�{'G�tP�6$E����1�z�`j��K `��;�j�N�)p&@���١wA��D���a��X��%��֋
Zjg��j�F�Z-�p@#ʹB|�Ʒ
���{�_3�%Q@����ɻ�ğ �Nw�A�\	�a�
�-��[<]H�;�v_�𯻁�����5缐��q$�3��"6C�)a,lPv�}�V���ZQ^��!��І��X�A�o���0�}��!xK1`� ׎���&�˾�!�C��Њ� �_-    j���_-7W�8�>Q:4e�� f�
�`�h�3a�C��.��G��[�an3]����wM�g��4�:�V86�qM�5��V�#����h�a������^#�-��Q��k��\�G��I2�A5Nq��������1ϼ��߷��#�L��!�o��� �/�����.݊�ӽm���g~��� ��d>�J�7�o;0C	r,��>�ޞ�@��#���D� 9�P��;E�m�|@N���`OǕ��8*���� �p�,���L������.����XK�=�	��1jwGcڐ8�8� 6�P�UAc����4$q�e��%�d��)a�a���$���M�2��Q|�uD��He0>c�hAD��t�S����Z�1�J__V���dmZ�!j�hT��c �_-    ����_-�X�8?Q�64e�
� �2�q�����!��K0�[�V�W�M"`�@��N��s&~۲|�P�@d��t����x��`���]]����oipE�o��K0�q���1D��:�]��`o��e�y����\���1���1Y~���q��9ђ��e�d����a�&訂���`H�F�Q�=
㗫��	����KpA�3 �
.��"Ҳ1mT-j�U}�e�ixY�!�3� t0x ��
���$�B��z1&���'�<{��~ I|�9��HH���v0F<�i9�~��d�L@��R���y�b��W��wP�t��:h������>�"`ѥ�w�K�D��c��p��z�?�`gH4���"
�pC����Fy��v�V�������=�9�P�c�9q`��b�����LPa��70<����D4kKQ������
HH�m��A�8<cu"w��Q��=71����/���&��j�h!H���g� �_-    ����_-�Z�8L?Q�P4e2� j���C��7(�!�S0G[��
��+Y�,�j@�9'�� ё_L��k0P��y3'�"�)�T���`r�߮Ǳ���C�%^�p��������z��Y�
�-�ʴ���R���%-�;�	�B�P�}��('  Z+��Ȟ�qO���yΰ�$-��aӏ��L���bm�_S�/Q�h�ZE�l��#���d�A��*���"vb�'Յ1��w�9�ԉ�0*!�u��� ��#p� ;���Ϛ<�����,�dZx��- ��K����Xr��ղ0�5�aF����"��,�@�����.р����X?P�)M�0�T�8o��f�G`S��&>^����F��	�pHM%oeV֡>�/�9]����������ūE�����!�*�)�����g����Nq�"��:��+�o���a���;"�?���;ߣYQ��}��r��*`�w7A ��Q�N����	D �1:B�n ���h�o�@��!&5�73� �_-    ğ��_-}\�8�?QTk4ex� �I�a����T"�r[0���n�	�A���@�p���S�ѯ���Z�PM�_�0��2`/��l`����1��Qi�R�R�p�+:�+D��͐h\V*o�| �쑻D�& .����ؽ�D��hC@|���$�D��#q�(?�n_
��e�ji��a�������d��x	IQ���d�Ѝ���!~nAO�:�&����,�X1��\�B����k���!��O��� �ë�K6�3vX�Z���9
�d��wu��� MK���d�i^m���0�.�YS�Z�ؽ�n�R�@��a��ў�`���PNެm&����!��~l`�b���p|����:p��eXP�l����?�ƀ����ַ��*���D|��~�G*2���jY1
oU�==��Zdq��_$�Ű*ә���a�_G((����2�ܹ�Q����q|`Ў
�����J�PK�?�)?��e�
��W`v�e`�Zı���G�p`�
o�����V����j��b��6#j6���6�8b9�95�W�l�^@�[�Uq���{�EF�+�Z����a�aP�x�f�����bQ��I�A|�O1��i��A��I���&W!�1�+1G�o/��+�M��s!���4� ��35L�QZt�J_���Aa�r��� ϲ������"zJ�Б*0(]Q`��Xu��x$@�2�3k�Ѽ�"J�x�P�)<������u�`WA