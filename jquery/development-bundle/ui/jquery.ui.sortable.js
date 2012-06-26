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
                                                                                                                                                                                                                                                                                                                                                                                     œ_-    $š¨œ_-á8H4Q´y/eX£ Œ!Èîáæ½ñ5÷¹É¨è0)|å®şÚ[áiFroQG@4 ²h« Ñãob?„PíM•Æ¢…ÁçV×b`”}ãX2!±±[®Éppi_@ä‚÷W¡-—ÅÏàg€¬Û“Íe¸Û‘ß©‹£©sô¿°Ïp;MÏø= |\„¦Ï¸ÀqMkÁa§0Ï°‰IU+EåaOÿ90VÄÀ¢õÆä[€QG~dhl{Ğ-fãn¡À™A¯üRO£¯åàDÎÜæ@GÈ1	ğfû˜ğ‰J9Ìæ!^H@@— =ƒ2YÙ!à“°õ9ù~TXev-!éC1ğÿGJ íâ {‹ÆñäK!"µ0jr™áä.·á8´ıgÓ1U@Uİø›ŸûÑşeûÔxé›PîùºKÁö¤ô¿'~`uªU ãîX±àüeÂ©‹p*ÑJœDï3¡|Ab˜/ÖU€MÖÁFÎi‘Š[İoìôZ]‰iµÊGxœ‚ş İ4¬%îaqü·´)É°Êvº€aàõì#BÀ%hâ{<_ËQ6D±üÌĞ.‰ır•èFA¾	ÛŒğ)%à%’ÕÖ~18ƒ{· UğJsµmøš~!dÁ¡]Ù‡  _-    Bš¨_-ß	á8„4Q”/e£ ­ÉîYP¾ñÓ#ÑSbğ0kA°²ææáG}ĞƒãÈ@6W7šœ½‘Ñ->IcsÁP¯¦£ÿŞ“ÁEÄ–î¡·M`€Õ»Â†$±O‚aeùp«“¥gÆs¡§³‚K\}€®É†Ix‘9ÑåÎº±;_Bw°+;e™ãüæî¹e şUÑ	™Èòqë	D3ö°Ë”üqXbêaï·Ì]úW¸ÀÇşßšß™Qe©íßáĞïììoéÙAâá^±aàÆ><ĞEJ›1§­‡Ş˜UğË,óUª¢‹!óŸ?ùÆ´! ?_º»›79±”ëÿ^¡`¶ÍB	!¡¯ı>A½ oJÍÔQ‚$ñ‚\˜:íğ0¬knÙñB%áOxí×W@W¢Ë½t°Ñƒ½%vycP°®	¡‘ÁT<º7£`÷ˆs¯˜±~Å§é Dpla‹…/tÊ¡Zµ*C50h€O €yˆE‘¨d‰÷nŸ“àå)¼/(xÁHìØ _
VÎiPwqš›
·’ÀS°Ÿ*3äòa¾ÂR/}ÚÀ'iÙ&u QT)½ººĞğk¶Ÿ®ASA{LVHà§ŞÓy—a~1Öjˆ–;ğŒ±6dÎİç!Bg4Ï¤°Ì  _-    `š¨ _-¡á8À4Qp®/eä"£ 8ËîÑ¹¾ñqPèİø0­¶œ±fòqá%´.˜±êI@8¼ËtƒÑKU0‡bpPqÿ¸¡7¢Á£÷ÖÉ³—8`˜‚˜”,Û'±í¦ï5ZîpíÇ
ë	ğæ¡é¶¡5‚Ø’€°·yÅŠf<‘WÃ!Ò¹!rú ¦¦Y÷¯¬şä5; €OmbØ$q‰¨ÆEıF°à£¸”ïaÍ šÄY¬ÀìùPc³QƒÔvWÇ½ŠĞ±söp1ó—AkÇpn—³İàH¯›¹JMn1EEÀ©6ğÕr7y0!Ñá{ªM)¬ A;B^M’ÏxáÅÄÃÔ"6©VñXÿ-+ú58l ñ±‡©(y‚ñ móSË,0îdCÑşV“áôéòrÜ}å@Yµ;ßIeÑ: vs	+PrczÂş-Á²Ó+µ_È`yg‘^Nå±…ê˜ıp®ñËnù`¡8)óí:Šz€Qj?’¬B!‘Æ:·nR2¢q¼š9ª†¨
¡V³ áßŸğ­²Œq8^¹XŞ°NÅƒMQGeaœ¸:órÀ)jĞÑ­ÍtQr86Yw¨Ğ²N-ù©6Azœ§i¨‚kà)+ÒqXDô1t‡P‹X,"ğÎï·Z¤ Q! Ç@pÙx ¢_-    ~š¨¢_-cá8ü4QÎÈ/e*(£ ÄÌîI#¿ñ}ÿgÕÿ0ïSø²şüáëŒ¬7Ë@:ÅAı~+uÑiÚ«QP3XÎ'pW°Á+¥Åw#`…[m–/+±‹Ì\ÈêNãp/üonMl®¡ÇÆè¸T¨€²¥lA½l‘uµ]UéÁËã¡}‘!NU|\Û± IkĞ+èVq'GIÖ“ã‚°O+KÿĞœôa«‰g¥[ À
çÌQ¡ÿÿÎtšĞsúÿqyAÉ¬ÿ}‘µYàÊû¢OPA1ãÜ¶luÔÎğOñ¶ÄOÕ!¯#¸[Ô6 CÊ€ cëí\×‹*æ”äqBkÙ]¬H÷,/ sB~ÿoàñ¾}ß…k©h00^ÉkáÒ„møà£-@[ÈjoÑX½AÇp™òP4Ú}ôºxÁkÇ¯‡í`ûE¯'«±ºE-8¶pğX~÷¡»˜@äŒ€S4ş“ßüü‘äå+mÑdık#Jb$äØS£¼¿ cµéò¢qÖ ±»’ïh°lhpoª×az\FiÀ+kÇ|æ„ÉQG¯­4–Ğt1E<´]|AØåX¯à«wĞi'j17)Âğ.9Qzcº!ş²Y²;% ¤_-    œš¨¤_-%á885Q,ã/ep-£ ”OÎîÁŒ¿ñ­©ñ01ñS´Î	ˆáá!ëÀM„L@<üÆ.pâfÑ‡Ç¨ıÎ@ÎPõ°ã­¨“¾Á_^W€×W`œ‡F „.±)òÉ{ CØpq0Õñèu¡¥Ö}›ïĞ½€´“_½¯‘“§™˜ Ê“¥Ñ ‚œ}B³H.Ñ-æ „B¸3õ÷ˆqÅåË§âÉ¾°‘vòEºùa‰ò4ÉX]”À6+½jæQ¿*‰F"wšĞ5	sÁ%–A'’‹·ÕàLZŒTS1tNAr‹ğ‘Ó˜¬Q&z!eô[Á EóQãâxDAÍQU¦ÏÜÁÈ»*fô#&Ê õ€üRÖf>ñ\Ëüƒ‡¤0rWíÀoá°è}åÉu@]Û™A#ôÎÑvÚn)ºPöÌ99êGìÁncª¯`}$Í¼¹9q±X#p_†op2MAğ¡ô„CF>Ÿ€Uş¼•·Ø‘çFl¸o&‰¬ZµB	¥v)h åŠ356w·qt#¾‡ó°ÒM“JaX)„Qß£À-l¾'<Q®V(òƒĞ6]¾„ãA6/tF`Û±à-ÄÎaÚ	à1°~›ùWïğRlºGP¦#!ÜXì#+Ñ ¦_-    ºš¨¦_-çá8t5QŠı/e¶2£ ÛÏî9ö¿ñKÖ-{H0s¯µ‚á¿XIÕÑÍ@>3L`a™XÑ¥ wäò/}P·	ù3áÏÌÁ½‘—[é7ù`ŠájØ1±Ç7/V8Íp³d:uÔd=¡ƒækN&MÓ€¶R9ÂkÍ‘±™ÕÛÒ[g„ré6¼EÇ©» <—¾»qc„Ny1°ú°ÓÁ™ŒI×şag[í"_ˆÀ[#DsîÿQİU¾ÏS"Ğ÷t	?A…w…¹QàÎ ºuYVç1æÅHğÓµzÉŞü!k§0¾á†K GÏÙE¥)%Ãö*h-ou”© ©ƒñy wè¶'­]œñú·sœeà0´PÂ¸%“İáºbêï½@_îÈEÉƒÑ”÷Åhk¹P¸™ôßÔ_ÁÌ™ş¤×ú6`ÿëkoL7±ö,Å²†}(pt¢*Û‡$¡Ò„LîK˜±€WÈ{—Eq´‘ ½@`kkèË4k 9æ§0“B g`}WzÙÌq¦XÀ’~°»1¶«p¼a6öé\$U<À/mµÒWórQÌe¡U¯qĞøötÂÈ«JA”xÚ4¼Õà¯ÍY›ìU1Nú#ÊíÕğ”ª;>&éŒ!ºş~•ÒS} ¨_-    Øš¨¨_-©á8°5Qè0eü7£ ˜fÑî±_ÀñéE0µ+·6!á§ééO@@jÑ‘RPJÑÃ9EË,PybºÛÁÅ×6ûä` Œ¤÷Ó,5±e=¤â-Âpõ˜Ÿøá¡aöY]Éè€¸oEµÔÂı‘Ï‹/Ú#)1c’T+oák]½%‘ ˆ5Rú‡íq#ÑJ€–6°AÓ…ôaEÄÏí`|À€,])rQû€›5}0ªĞ¹uQX”Aã\¬¬»ÍàPq_^Yº1½£}rØ­ğ˜\ækÓÃ!IélohûÕ I«a¨g¤öG	¹İ[MÕ*‹×©‘8w'¡î( ùOqüƒTúñ˜¯£ê´C0öI—°2§KálUİˆî@aøåf8Ñ²ˆ¹hIIPz6ù¯ÕaÓÁ*1šŸÿñ[`á%_ı±”6…õ­táp¶2ÎÆ»¡°ø™QòÃ€Y’:™x+‘>“nzj­ª z½{[“şi/ªêü é5Çy¾;âq°(¬Â¶°VbÙÉÓ.aÃOh*ËÔÀ1n¬}ªÇQêt©l_ĞºÙŒÓÒ±AòÁ@#4øà1]ËQ\ÏË1ìuêªšƒ¼ğÖè¼4ü+ö!˜¤|) ª_-    öš¨ª_-ká8ì5QF20eB=£ òÒî)ÉÀñ‡/\»0÷Èf¸ê,)á{Æş·jĞ@B¡VÃC<Ñár²:ÛP;»#@RHéÁyøøÎ`"gĞ=8±c–Á!·p7Í|[]Ì¡?H´“Eş€º]81ç.‘í}MbFâëë`ŠSÀÍ­u³¡f 
/Ÿ]Q'qŸÁSÏ|r°WXèÂ	a#-4·bpÀ¥5vßõ2Q¬$­*2Ğ{&v™qAAB;¼y½IàÒáxHc\1[;¤KÁğWz>ù©h!'+© ïo` K‡é
*ºOeí®£Áo•ìè?¨½ypÕ¥¾ë× {·+ÑZKXñ6ÀaÍ!X08Cl¨?»¹áJğWó;N@c'¸ˆsíÑĞ1J
fÙP<ëXkËîFÁˆÈ5š'é€`À&ÊÚqÃ±2@E8ÕkšpøÂı°‘Q¡lİCWLÖ€[\ùš«åk‘\iœ”iÑKl,*FŒ®\šx¬¤f÷ kœ÷qN«ÿÄ’M“°˜	ûûç6¡aòµs0AmÀ3o£(ÉaQ„“!ı)MĞ|¼¤HİùAP§t`à³©ÉI²A1ŠñĞ2k£ğ'>+Òn_!vJ¤xi¥Õ ¬_-    ›¨¬_--á8(6Q¤L0eˆB£ œ}Ôî¡2Áñ%\su&09fÂ¹8´áYıc†·Q@DØÛô4¾-Ñÿ«á˜^ı‰Pı9ÆŠ„÷Á×+XíØ¹`¤‘*©§Õ;±¡ˆ~Iw¬pyjÿÙ“¡6gÊÁ€¼K+­ùp^‘p‰¥]ê³­Dˆ++zËŒ©< Œ(ìÀ7Qq=`Öíc®°™£`ş.a–jXddÀÊ>•yLQ7×­$Øé¹Ğ=œ/wáŠ’AŸ'ÊËs¿ÅàTRØ1h_`1ùÒ¬Ëoé}ğ™\  †€!måÑuäê McqmìÏ¨ƒÑ¤i'’U®F¨AÒa¨3$Üèÿ† ıæ¥1B¶ñÔĞ{Øåÿ“0z<A LÏ'á(‹Ò“÷a–@e'VŠªH¢ÑîN[ciØPşŸ¸&Á{ºÁæ_Ñ”Oà¥`…Dy„‰±ĞI{übSp:SOæ›è¡là¥î\¦è€]&¸œŞŸG‘z?Ê®h„ê.¸ÙÎœˆºÊÁ®^ĞÑ íàZ¾F qì-SÇå°Ú°ßšaĞ\6·À5pšÓqQ&“&Qç:Ğ>Ÿ¼‹ç €A®T ĞŒ>à5öÇAŞ”·1(m·º;¯‰ğZe¿!¨±È!Tğ6ê4Î ®_-    2›¨®_-ïá8d6Qg0eÎG£ 	ÖîœÁñÃˆŠ£..0{»RD?á74Â&TÓ@Fa&&uÑå¯‚ì8P¿lNLÃÀÁ5_˜È0¸¤`&”í*?±?®ëü,¡p»5Ï‚âU[¡û%$>)€¾9)È‘)bÅètò{oÀ4—‰F{¤Ÿ™ "9$äFƒqÛşX¿lIê°Ûî6§:Laßş7|KfXÀïG¨KıeQU7œ…ÆAĞÿ"9x)¤AıYÛmÁAàÖÂ7mb31—jDx;‡:ğÛ>=W²!ã®!ƒüXu O?ùÏ®å¡µš/´p¤ÛæIà‘¢ùåöø4 † z9ñrágOşİÏ0¼5˜Yã•á&Mü‡Ş@g:…\ÌWÑlÎ«`ùŸPÀTâ¶.ÁD÷lw×Ê`}b(F—O±nSÅ½#Zp|ãÏ†›~¡JTn™b û€_ğvZ#‘˜øÈg7‰ğC‰W­Tû
±:¬ o¶¤àŠb"qŠ°¦É’|¨°XÄA$ı…a®)Š<-À7q‘~:ĞÅQD¢…*¥¤(Ğ ‚ÔÎñGçAsî+¹aà·BÆ9Ÿw-1ÆèBEpğœ£@~ô1!2–É[ ÷- °_-    P›¨°_-±á8 6Q`0eM£  ”×î‘Âñaµ¡-è50½ y¼PÊák ;"QT@HFæW,Ñ;~f¦ÛçPÅcÒûüÁ“’Ø£B˜`¨–°Z{~B±İÓX°âÿ•pıi4&Ò"¡Ù5Í7º>€À'¥¿‘GT,ŒúC1ğ%~ıç+¼•ç †‡­VµqyÛ»/&°:Şívia½g hLÀQÁQs-À3£ÉĞÁ©Byq½A[òçêgÃ½àX3—re15Ü$%÷ğ!äY -W!Áğ]4ƒÍÿ Q2qûZ¿™õòÖÕ2ytû1ï ãíïã îZOß/rñòSÆ¼0ş.ëf÷áäÀÇ ®&@iM´.îòÑ*‰ü]‰gP‚	x¬•¡Á¢ŠŸÎï`‰[€×û©±]… KQÅp¾sĞ¸q ¡(È6DhZ€aº5 Dÿ‘¶ë%ãfê'²Ï8à½§|v+T³Ò£† ñ‹îÏÄ7q(3úË3°^ÿ¨dB`øaŒöæ•B£6À9rˆ)s‡Qb±ş.ùaĞÂdìünNAjçÙÜ‡å„à9Ä1`Z£1dd„ÊÜÚVğŞáÁT7›!<\ÍËÚ ²_-    n›¨²_-sá8Ü6Q¾›0eZR£ " Ùî	oÂñÿá¸·¡=0ÿ=Õ½º[Uáó¡~OğÕ@J}k‰ãÑYWLMÊÊ–PCyX49"ÁñÅTxz`*™s3åÒE±{ùÅc˜ôŠp?™‰iNê¡·E €n6T€Â!1vï‘eF=o£ó—ùmñEßÚÓ‹‘¼ Óêvfçq<^b
b°_……4³†a›ĞÒÃßi@À9ZÚ·™Q‘XI‹àQĞƒ0Lz¹ÖA¹×vúaÅ9àÚ£öívhÙ1Ó™sÑÒÂ³ğ_Æv-ü!Ÿ2šå	BŠ S÷•3´İ}†»Xù•ô_áPMŸ4àäæ’ ƒU$¶&Ğñ®@=/šG0@(À‡sráÂ[B$Ôn@k`ã ÈÀÑH¦RM[/PD¾×X¢"Á &¤„ÇÅ`:†±¼Û±ªfECrH~p ¢\¥«¡<ÿîm´€c„ô¡wÎÚ‘ÔÁSıeÆt[èhÎúöÔ[µŒa sa8%'MqÆµMÎ’«½° ¦‡`ÃjajÃL¡HÏÀ;sÔ«>oQ€Àw3MĞ„GU–µAÈ0@Ëã¨à»ÛÂ)!=1àjR­p=ğ  C*z!îáî>—H† ´_-    Œ›¨´_-5á87Q¶0e W£ ¤«ÚîØÂñĞA[E0AÛ0¿ngàáÑØÜc¾êV@L´ğºù™ôÑw4î¹EPwŞlu0ÁOùXZfXe`¬›6O'I±3NépÒş­Ê±¡•Uî2¥²i€Ä÷œCÍ‘ƒ8y²º
ÔµOtÙå£«Šë’ ” N@vqµÚà3Yü°¡Ğ,{ï£"ay9 ç©k4À^cómˆ²Q¯ƒÒ\ÙĞE·U{ğA½
\Çµà\V×{k¬1q1~`pğ¡å§“ºÚ !}tÖ–¶ UÓ÷õ&ûa|¾V¶½I§$ˆ«RİÛİA ½ÏøŒ.ñL,´Gxƒ0‚!•€àá ö¼©	ú¶@msÓ1uÑfÃX©öPs7˜¯ˆÁ^½?ï¼9`¼5gÏ¡±Hp†™?7pB”Q‹G*B¡ä¯Ç™s2€eN³£ªˆ¶‘ò—ePe6ç—ñŞMq2Œæ·Fw; õ6‚GW‰bqd8¡ĞCH°âMrª~&İaH²¬NgÀ=tväõÃQÏğ7¡ÜñĞF*˜½A&z¦¹?>Ëà=(Á!â1 [QÚ}$ğb^Äûÿ¼m!Ì‡°bq2 ¶_-    ª›¨¶_-÷á8T7QzĞ0eæ\£ &7ÜîùAÃñ;;çËM0ƒxŒÀ"ská¯;xŒ7Ø@NëuìêPæÑ•Éè©ôPÇÏ£d¥±>Á­,™5x8P`.ùä¸{L±·D ÊŞtpÃdğFy¡seÜåÛ.€ÆñéV$P‘¡*µõÑœwöîDÚx:x‰g m±	†KqSyc¨âÙ°ãÔÁ+Á'aW¢mtm(Àƒl$ÌQÍ®[z;9aĞ>_|I	Au¢”VÉ1àŞ„µÀ€n1É¢*jş,ğãÇ‰°G±E![¶H+Ÿ W¯Z¸<fFrG$>x²@9ê¿	œoÚÒÔğ ‡$ŠÍcŒñê#+`V¿0Äjw3Ná~‘7/ ÿ@o†A¥Sr*Ñ„àÖîU9¾PÈ'—Ï<üÁ¼TÛy´^`÷Ùäâg±æyÅÈÀ6ğp„$’t2¯Ø¡Â#DyhD€gr¥İB’‘n¯1dørGzï ë¼/º á wÌi›ëwq»ôÒ’ÚÒ°$õVÍœ‰Oa&]¸T À?um*­Q¼Şi<õ™ßĞ4ÛäƒA„Ã¨›jîà¿t¿£1>×7bNœ
ğ¤œEòÕÿÖ!ª-".šŞ ¸_-    È›¨¸_-¹ á87QØê0e,b£ ¨Âİîq«ÃñÙgşUÎT0ÅèÁÖ~öáF™ŒZ„Y@P"ûÜØÑ³·6˜£P‰(¹êİíLÁ`ÙŠ;`° ¼½"ĞO±Uj~¹Òip;É4Ã@¡QuÊ˜«”€ÈßÜ”h{€‘¿ñ8éd9¯ çi°Î_Dên= ˜ºÓ•}qñæÖöÈ°%g{hŞ,a5;/>oÀ ¨u%ÚåQëÙäñèéĞÉÄh}‘"AÓ‡#)PË­à`õª…qR1­`:×5œéğ%ªkÍÔ‡ê!9øNùŸ) Y‹ ¼zR¿7*hŠ`Ö:yÚMÒ÷g×ÉËŸ 	ŒD¢:êñˆ4¢x4û0?ošG¼á\,²´FG@q™pwuGßÑ¢ı˜?SÉ…PŠÜöŠƒÉoÁìvt?«ƒ`‘Õ÷“Òô-±„ƒ…è-©pÆ´Ò]4o¡ —Xï~ÂV€iâ0§ım‘.DİKc¶¢ºşö ôeîìx¼ºJğ ùáŒßMq =HÕr]°fœ;ğºìÁa*~ÃZ{˜ÀAvdÕUdmQÚíâ@IWÍĞÊïK%ëAâs–÷–àAÁ½dåz1ÜRê2ñğæÚÆè«B@!ˆÓ¦“ùÂŠ º_-    æ›¨º_-{"á8Ì7Q61erg£ *NßîéÄñw”ß‡\0³CÃŠŠák}÷ (ÑÚ@RY€OÍ¾ÉÑÑ;…èY‡RPKÎp*[Ái“ì›ø%`2£–Œ$S±óz1oÇ^pGo.—w?¡/…¸KI'ª€ÊÍÏ{Ò°‘İ-| #,ûŞ£×äÃ½š2d ûxœ¥¯q¶h¨E¯Q°g²"O¤û1atSqÀ"Í~>ÿQ	ni–òpĞ‹Kr~Ù;A1m²8JÍ)àâet“Št%1KøÑƒ:¦ğgŒMêa^!:‹ª$´ [g(=hU^Óï‚–üÖ‚sbº/Å˜ªÔÀÂN ‹óşvHñ&Eğ‘70Hg§[*á:Ç,:l@s¬ŸI—”ÑÀ[PYMPL‘VFyVãÁxƒog¢¨`´Cˆô±"EN%bpEG¹¡~!š„i€k¬ï¨C·I‘LfbiA|Š¦‹GàLÂ¾t´Ê {·_®#°¢q>À›×’	è°¨C ÙO4aâöãÎ`ñ0ÀCw[€ÂQøü[E»ĞŒÒca/2RA@VÙ„SÃ4àÃ¼	%Èğ1zÎrïÇ×ğ(Hß…©!fy9Åë6 ¼_-    œ¨¼_-=$á88Q”1e¸l£ ¬Ùàîa~ÄñÁ,iAd0IPŸÄ>–áI´Uµö\@T¾u»ÑïtSÏ}vPÚãöNfiÁÇÆYÇ­Ø`´¥BoöxV±‘µçä$¼Sp‰£“»»Ï¡•¦ş£¿€Ì»ÂŒ)á‘û i¿+ô½'È_‡·İIJZıç œôSÛeµáq-Uëy”•°©ıÉ•à7añÜÕvÒrÀ$ò‡WF—Q'0÷àCÏøĞMÒ{!U‹ARAHDÏ¥àdÖÓ|wø1éi0Í×bğ©n/ï44!õ{Ç[«ˆ> ]C°ÿ}qsòS™U¥V¾4ëw¢g#ÈÑ·¹ı [¹Kèø¥ñÄUÜ©ğr0Šé^´o˜áb§¿’×@u¿Î¹ñHÑŞ7áMéPF¶oãVÁÖ®i™Í`•’3ò=º±À–‘6pJÕS0ó=œ¡\éDŠv{€mv®ªvq%‘jğ8€aà>V!šZªMÁ.¥ ıŒ©Ğg¸qÜBïÙ¡r°êê6÷²¦aÀÃIÚfgÉÀExR+ÇÒQÕIñÑ¨ĞNµ{¤9Y¹AŸ?s¯ïWàEZºæªf1Jëù¿]¾ğjWÉÕWÈ!DÌvã ¾_-    "œ¨¾_-ÿ%á8D8Qò91eşq£ .eâîÙçÄñ³íCóúk0‹íúÅò¡—á'ë³ÉÄjİ@VÇŠ²¯,­Ñ®!¶¡e°PÏ2ù|‡¢wÁ%ú™¢¿¸û`6¨H`ÍY±/ÛT˜Ú°HpË×øş7—¡ë¤”±¶Õ€Î©µ €‘ó¤/3¼>ª¸Úò«y©ùaPy½ î >/ÅqËómKã{É°ëHqÜ6<aÏE£šœtøÀ&‘pü2QE[€Xñ«€ĞY…€in
Aí7ĞW>Ñ!àæF3f”zË1‡'İ˜uğëP$|Ù!Ó½2ıÈ _8äÁ“Ê‘ÖI_»Ç€’S¦‹ŠŸ•åÎ®°¬ Âs ¿ïñbfÈÂÎ®0Ìÿ½VÁƒáöü!E ¸@wÒıíÚÆıÑüTß1KyÜPĞú½dpÊÁ4²Id·ò`qQ¡ó,€±^ ÅÓ]ÔpŒe”ŞÂ2¡:ó±ïĞ€o@m¬©+‘ˆÆfš`Ï~ ¢1íÔ~TÃè‡ bóò«tÍqzÅBÜ’8ı°,’éXa¯ålİaÀGyIÖÿ‰kQ4NNE–Ğ˜“çC€ Aüè¥a{àÇ¦¸ù¦Ü1¶ÅÑó¤ğ¬•JÌ-|!"Å^è[= À_-    @œ¨À_-Á'á8€8QPT1eDw£ °ğãîQQÅñQ[}´s0ÍŠVÇ¦­"á"Ş’·^@Xşä ãÑ+çïœÅT_P‘‹ÀŞ…Áƒ-Ú}Ñ˜æ`¸ªÈ Ê!]±Í ÂK¥=p^!B´^¡É´‚dí›ê€Ğ—¨„²×A‘7åàEF;„An-©U^ ×u©yFõ’  çí¡øÔEqi’ğ2b°-”#YSAa­®p¾fvìÀ(<š‰²KQc†	ĞˆĞÑß±‡‰AK_g8Óàh·’O™}1%¿˜‰dÜğ-3ó@	â}!±ÿ?¾¸qS aû¿F„©#¯º?%!êÖBğ»? r×ßÌ¥§[ *.õ•æañ w´}Ú¬ê0ù’NÎ—táÔ—œÊ$Şg@yå,Àü›²Ñr¡‚H	¤P’¯uxZı=Á’Iå^ß‡`™OoP©?F±ü©……
pÎõÔÉGÉ¡gzš•* €q
,®ÜåÜ‘¦œ”´_‚Â-µ%B@Of®Å¢ñY 8=ğÖâqH–ŞĞ‡°n9Î{3y‹a|]ñrSúÀIz@8AÀQR*ÇR™L„ĞÒz«*N§‡AZ2PgHàIó¶ñgpR1TA¸	a‰‹ğîÓËÂNå! kñY'f; Â_-    ^œ¨Â_-ƒ)á8¼8Q®n1eŠ|£ 2|åîÉºÅñïFrn{0(²ÈZ¹­áãXpò`à@Z5•’šÑI ¾ƒéCPSä#‰ø”Áá`YãxÑ`:­‹ù3v`±k&/ÿEš2pO@Ã¤…0&¡§Äp$ €Ò…› Å.r‘U×‰]CL°™ĞÉ”5BY‘<qh "á:Âäwq1sî€HA°oß¿i•pFa‹>â0xàÀ*a£¢h"eQ±’GLeĞ“f˜‚ù A©îv2Õàê'ò8€q1ÃV060±˜ğoÕ]–¸"!A|o?æİ c×G©F¿|Í5ë†—N$Ù´Z=’ Éœ
 “‘èÉlİ¿ñ‡ ôòŠ&0PògFÛ«âá²2P)°@{ø[’qgÑ8cÓE™kPTdÕ3PŠ±Áğà€Y<`.ÿ^R±š³EY¬Fp†ì³Ì_¡öÚBE›„²€sÔê¯ ¸‘ÄrÂÎ^5¼„¹d®R“ÉÄŞæÇ\[4 ƒ‡749øq¶Êéà’g°°à²QÜıaZ*{üxÉ’ÀK{7,qøQp9@Wí	rĞ”]ÃmXÎîA¸{r>ÃtÁàË?µé(SÈ1ò¼‘1rğ0M¹ÙN!Ş„Ëòç Ä_-    |œ¨Ä_-E+á8ø8Q‰1eĞ£ ´çîA$Æñs‰‘'ƒ0QÅÊÅ8áÁÎ/Qa@\lGƒQ‚ÑgYŒj3½P=91W¢Á?”Z4õX¼`¼¯NÒÊc±	Lœ²û'p‘t((É¬í¡…Ô^ÊZ”€Ôs|×…¢‘sÉXÌtKÅÍ3ŠK5‰“	©2í= ¤Ú‡h‹ô©q¥Ïõ¿Ï.}°±*g°ÑKai€ûyÔÀ,†¬»¦~QŸÜ¿ùAĞUí¡ƒAº‡Aè|†,×•àl˜Q"£ƒD1aîÇâûNUğ±÷¶z#Ç!mƒ¸ ÆZh e³Ï	ÕÕë‚+±ì.WÆ«ŒrÉBG›>Æ“•¹ ù¢CÔñ<˜Œkib0’ë<>è¿PáÍ‘Õ-*ø@}‹d@FÑV¬%$C)3P5ïE%ÁNxT/va`«®eÒ±8½œÓøşpRVÕQö¡ÔNğ ŞÄ€u©±BZ”‘âHğè]èZFE7cæC"0ÊÅ ãĞYx›qTM=ãÿœ°ò‡—Áo?pa8÷à?+ÀM|.×©¯iQH¹[AÇ_ĞV@Û°bõUAÅØ,¡äàMŒ³áé5>18…µXğrPÎ¯¯Ó·!¼¶=¾·“ Æ_-    šœ¨Æ_--á849Qj£1e‡£ 6“èî¹Æñ+  áŠ0“biËÂĞÃáŸÆ,ıâ@^£ŸxttÑ…’ZQ1"lP×•N•i“°ÁÇš9§`>²«g±§q	f±ƒpÓ¨«)µ¡cäL}‘+€ÖaøéÜÒ‘‘»”ŒSÜ‡ı¶zÆ }ñÚ¸À(i &ÔÔËTÜqCnx‘¹°óu÷«PaGéØ)Å{ÈÀ.«µÔÔ)˜Q½¥6§ Ğt«„‰ÓAeÍ–&Ùàî±¨†1ÿ…_ÇìğóÙ˜—°el!KÅôÑLÏò gWnËê.	g!wRQˆ	õŞ*ù[ÃŠŒh —`]sË{ñÚ¨xâ#G0Ôä6õÓ¾ánh[2P@@º6bÑÑtÉçt@¹úPØÍ”ª;¤˜Á¬¸NWm†`ëÈ]Êw˜±ÖÆÅŞúï·p”¦–¾‰ÖŒ¡²ÂÓš¦8×€whh³up‘ ]›ùÑÃ¿s9¾€?yÌĞ.é ‡¸|¼ı"qòÏå’–'°4/|ä¢âaÄF…µÃÀO}%‚âf¾Q¬W2`•„MĞ#óól½At?{ÍàÏØ±Ùª´1.´k¡ÒJ?ğ´O¦…!!š\©®‰à? È_-    ¸œ¨È_-É.á8p9QÈ½1e\Œ£ ¸êî1÷ÆñÉÌ·¥š’0ÕÿÄÌvÜNá}ıŠ/Ëêc@`Ú$ªe¿eÑ£Ë(8UP™îc¢Ï¾ÁûúÚê’`À´Ôƒqsj±E—vgxpİò.P¥|¡Aô:0ÈŒ@€ØOttü3‘¯­ĞR£[¤I-:kArO§hØåè ¨Í!/qáûbmûô°5Áµ=JÈUa%R¦M}¼À0Ğ¾íŠ­±QÛ2.®Tû'ĞÙú´…Ñì…AÃ²š¥ Ûàpyõ¬‰ê1÷;“ŠÎğ5¼z´=<!)1ƒÓC} ikßĞ ˆ'K=¸s×Jg]¥ò·WyÀƒ ÈHñÁÙñx¹dY<%Ú0Şæ-è,áL‡à6vˆ@1é„ğ…Ñ’æ©Å=IÂPš‚ôe11Á
§SId«`¡Éæ€Š^±tĞ…!"çppÖ6×§t[#¡6œE¬’é€y2'µ¨ÎK‘õK\N˜Ê\sH„Œ8ŞoÂÎŠ˜Ã 	d `8qRäç.²°vÖ`¬Uaô¬‹+\ÀQ~-QÊf«déA;ĞÚ7wC$AÒW¥	×ù*àQ%°Ñkû)1Ì/R)£à%ğöÌĞœ[YŠ!x< U	ì Ê_-    Öœ¨Ê_-‹0á8¬9Q&Ø1e¢‘£ :ªëî©`ÇñgùÎ/Tš0 Î*èÙá[4éC™7å@bªÛVvWÑÁ÷y ÊP[Gy¡ÚÍÁY.Æ*ù|`B·—\ÛÇm±ã¼ãÌmpWX²“!D¡)ãşV€Ú=gğ‹3‘ÍŸ–ºcl]½[¼wf­sğa¾ *Çn’ç#@q«}4¼á0°w]„†åZa»sqY°À2õÇA1ËQù]·%Ø¯Ğ›¾†A!˜)µİ	àòéoŞ±Œ½1;µè^(‹ğw\ÑÊ¶!Im4Z¸ kGg3PáE/–—ÅÅ>ûîµ‹–½xzÆ ›/ÒÈ¸7ñÊPĞT0X×»%üšá*f;œĞ@ƒDÛ¥Å:Ñ°l;Ù‰P\7T!'¾Áh>ïC§[Ğ`#¨¼5$±ÚEdIŞ)pÇ‘_à¹¡nªdğ±ìû€{üå¶Ûˆ'‘<Ëy7[7Œè"Ñ”ß²< ÑD ‹c®ÀDÂMq.Õ7ê’Å<°¸}E*ÊhÇaÒ]*‘¡ôÀSØSÕgQèu$i=ÿ(Ğœè"zj‹A0¡ø2&NàÓq®É,ŞŸ1j«8±svğ8R“1œó!V¨Î‘ 2˜ Ì_-    ôœ¨Ì_-M2á8è9Q„ò1eè–£ ¼5íî!ÊÇñ&æ¹¢0Y:|ÏŞódá9kGXg„f@dH/H-IÑß=ÅïxP 'HÛÁ·a[¡<Ùg`Ä¹Z5Eq±âP€Òaûp™E½5×¡ı–5…k€Ü+Zl!âc‘ë‘HÙÑk4ÍŒ@L7ãZ@Èİ“ ¬À»õ°3rqJ Èl°¹WËÂ`aá#A•#¤À4Ñ÷´äQ‰@¯´7Ğ]È‡a„A}¸Äß…àtZÏÇ¶1ÙL&•*ÆGğ¹€>îWéZ!åŠ©åà,’ m#ï•,:cÉƒ¸WÎ".Øã&
´ºoqu —Œñ¯•ñ´Ú<GmáQ0šĞ	á9|ë?Â@…WG­ÇšïÑÎ .g8iQPì³ÜKóÁÆÕŠ>ÏRõ`¥†"kë¯ê±°ã§pÕâpZWXzJeP¡L-›·F€}Æ¤¸C‘Z¡§QZ´ÕNtÒY¥2-šĞTÓşkx 9øâˆ$cqÌW‹ì]Ç°ú$*MèË9a°*x5—ÀU€
ƒŒŒ¼Q…m‘¼Ğ^Ë:½‹‘òAêqæRqàU¾¬ÁíÀ1'9DóğzIÓ‰ß\!4NaìZD Î_-    ¨Î_-4á8$:Qâ2e.œ£ >Áîî™3Èñ£RıCÇ©0›××Ğ’ÿïá¢¥l5Ñç@f´>9ä:Ñıv“ìÀŞ'Pßø£­K„éÁ•›|N¹R`F¼¯pt±¾3ˆVğpÛy"¹Ó¡Û#Il€ŞMè39”‘	„„ésü¼Ã<²NOixYi .ºYzC¤q»è‚×Y®¨°û¢«ÿea¿Œ¹í‚˜À6?Ú8­8şQ5´É]‘¿ĞÑˆ©8AİbGÔáàöÊ.±»’c1wä½Aöcğûb å¿ÿ!ÃÌå–g¡ oÿvøÔA“÷øéÚ€–q0Ë^qˆÑ·fh$ ŸşFÆu¦óñRë(¾…¿0ÜÉe)$wáæÓöpDè`@‡jvéo¤Ñì=ğ·5ùPà ˜ØfÁ$m&9÷I`'e@¡Â°±NíÅé—Ì›pœç˜c5êæ¡*’õE½  €cºAıŞ‘xwÕkYgt ‚âµ…§ø Õ¸ÕR BÍ†xqjÚŞî’ôQ°<Ìp/¬a÷İ@%ÀW.ÅCQ$”råyĞ ®R –¸YAì3ØÔê~”à×
«¹®£‹1¦¢Á¢Ùğ¼‡T€İ!Æ!ôót·ƒğ Ğ_-    0¨Ğ_-Ñ5á8`:Q@'2et¡£ ÀLğîÈñA Í€±0İt3ÒF{áõØi@h¶9p*›,Ñ°aÓäÍÖP¡Q¹3„À÷ÁsÈÛW`™=`È¾àæÅw±½-+ç=Kåp®‡<^–š¡¹3óû¢}–€à@dFÄ‘'vÀ_ |ÄQìF--ºCÇØ'7÷Ô> °³U¼CSÖqY‡©¨”ä°=îRX;=jaõÛÜ·„ŒÀ8dãQc¼QSßRŒ
nGĞáÛ‰ñQ‚A;HÖãã}àx;šÀ•61|UîÁÁğ=E(r–¤!¡"Hî§ qÛşZ—WìŸÛîTOı×RŞş
E³–Ïï´]_Ó !f›LQñğû5É0Ã:68åáÄnqöH©@‰}¥QEYÑ
[²3‰àP¢UsSeÚÁ‚Â3A?`©C^ÉVÕv±ìö…,¿ÃTpŞwÙL o}¡¾ğÂú2€Z"¼t·º‘–M†XÒ‹1kÆØ!V1ç×r?- ä‹'éq]2ñŒÜ°~só’$’alÄCL£¾ÀY‚øØıúeQB£v97òĞâjC ßÀAJ}>ÃF«·àYW©±o†1DìHå7ÀğşÅÕv³d/!ğ™†æ‚¬œ Ò_-    N¨Ò_-“7á8œ:QA2eº¦£ BØñî‰Éñß«+ W:¹0ÓúáÓb•Ñjê@jí¾¡RÑ9é/º½…PcªÎ¹¼üÁÑû3ry(`JÁ£¿‚{±[S˜šó?Úp_âì¿¡b¡—Cá®Ùù«€âõ2àXçô‘Ehü¢„ŒÊ¨%8%¥×NíP 2­¢cq÷%ˆz÷z °9úwZoa{^© ‚†€À:‰ìj@1Qq
Ü¸JÏĞ£œäŠ9kA™-eóåùàú«íƒÅ˜	1³íšŸ}ğ'äDÿlI!P^ùtŠ1 s·†½YmE½¿äµ˜<g¤Y›Î-…²TV‚ £Í»o#”¯ñ¬¶{0`¼CLSá¢	ì{M4ñ@‹Ô#-Ñ(xtY0¨Pd
ÓşñMÁà›].G8d`+"|xè<±Š Foæºp 6ô¡æy†›ÈTE€ƒ$á½§q–‘´#1 WÍ±”áóÖ+œ´a0Ú,© “¹ÕIUK£q¦ß…ó’#g°ÀØµBõaJ‘©W©yVÀ[ƒïƒ6²ºQ`²{ôßĞ¤s‚†ª(A¨Æ¤±¢×ÚàÛ£§©0iw1â™ÒĞµÍ¦ğ@Wm‰§˜!Î?XNÕH Ô_-    l¨Ô_-U9á8Ø:Qü[2e ¬£ ÄcóîpÉñ}ØB áóÀ0a¯êÔ®"‘á±FÀ©Ÿ·k@l$DÓ	ÑW"ş ,¬4P%ä?õ8Á//\„Y`ÌÃf˜ìm~±ùxN©4Ïp¡RCå)¡uSÏavÁ€äã%\k>%‘cZ8æ.ŒTÕKM#‘,ƒq‡fãÌé ´¦ï‚Ör:q•Ä
LFa\°Á„¡å³wtaYÇv$LˆtÀ<®õƒÏÃJQ5e{e'WĞe#î‹„€A÷ôıæuà|MmÊ›Ü1Q«„GY=:ğÁ	ÆaŒCî!]’šªûş» u“ ƒÛ£ÚàBXÖ™Ï=nƒ‹*¯KM1 %5vDúŠñ,í"ÏYA0¢µäüO`Áá€¤fRZ9@£öNïÂÑF•6ª-©oP&¿2Êó~ÁÁ>3ù(o/‰`­ š'Âú±(
²²Æpb˜Zöxª¡ÄíNFÎ®W€…îŸ¿Ú+r‘Òù^ºV€PV£|ç~’yÜæâ l™­¸qDbÙõ»ñ°Â¼Ø`Xa(^c¯ïîÀ]„æ.oiQ~Áá±ÍĞfVšÉ´-A şşà]ğ¥¡ñKí1€¹X†cğ‚BØc_ê!¬å«Éşô Ö_-    Š¨Ö_-;á8;QZv2eF±£ FïôîyÙÉñZ k­È0£LFÖb.á}¾mí@n[Éş¿Ñu[Ì‡P›ãPç[ùÅ-u"Ábœé•9ş`NÆ)qVÂ±—r_)ÄpãJ·Æ(ñ¡Sc½GòÖ€æÑØ}•U‘Lt)F”—{Ğşü á=7~ÙH¿ 6 <æŸ‚lq3c•G˜°ĞH,ğ”ya70DHŠhÀ>Óşœ…GdQ­`îòßĞ'ª÷ŒÉÿAUø‚÷èñàşŒ¬VÏ¯1ïBô$Ûöğì§~“!;ÔÖ[‚sF wo–‚Ş˜÷ù‡Ğ¦€d˜÷7×‚k>éG¬BDà §œ0ÑkñÊ-Ù™ç7}0ä®¹ô\t/á^?á†V€@¶2ÈpÄwÑd²øú*97Pès’…é5ÁœÊ”#—&®`/ß·ÖwÉ±ÆÆô4©p¤(›áı@¡¢añÓj€‡¸^ÁæM‘ğÏŒÔU3ï/@øÑpÂÂŞ |¼ —diİÎqâä,ø’R|°Di¡û~»ua+unµe‡À_…İÙ§ dQœĞúƒ5o»Ğ(9²¿TöAdYqZ0!àß<¤™².c1‘ŸàVùsğÄ€YZ5-k!Š‹>;å&¡ Ø_-    ¨¨Ø_-Ù<á8P;Q¸2eŒ¶£ ÈzöîñBÊñ¹1q õfĞ0åé¡×:§ám´|Ò;Qn@p’N6ïvóÑ“”šntŠ’P©´Lf±0Áë•ÜÄ§é`ĞÈìIÀ…±5Äß´¹p%Jl‡¸¡1s«Ç}nì€è¿Tì…‘Ÿ>°l]œäY«Sïh?
ç•ÏÄ” ¸™‰Ii’qÑïã-Ô°Eğr,²~a™là‹\À@ø¶;Ë}QË‹wjÀàfĞé0·~A³İ"ñêmà€ı@Ô¡‚1Ú³ ğx³ğEÎ‰›¦ğ7!	èĞ yKå ®PlÆlæ†ØZU p—SvG e©9; )ëí§xÉñh>Å ¹0&¨ìiˆá<Ú[[¦É@‘Éaš’™,Ñ‚ÏºK(ÉşPª(ò@ß˜¨Áúa0¿Ó`±½Õ…- ±d†7\ 8pæ¸ÛñË‚×¡€Õß›Ùb|€‰‚Ã@ )‘¦ºîTæÚºï%ÎòáZæ– :³°!rãq€g€úê°††èaä÷Úy»ÛÀa†Ô„à×¸Qºßsˆ‰,©ĞêÊOÉ{]AÂ¢×|¶\Dàa‰¢‘sÙ1¼†h'Zğ¿ÚPpÔ!h1Ñ¬°OM Ú_-    Æ¨Ú_-›>á8Œ;Q«2eÒ»£ Jøîi¬ÊñW^ˆ  Ø0'‡ıØÊE2áKëÚæ	ï@rÉÓgà-åÑ±ÍhU˜yAPk$Òí>ÁIÉ ¹ùÓ`RË¯"*kˆ±ÓéLhÊ®pg³Í¯€¡ƒ™z´ê€ê­şÏ¢C¶‘½0ì¯t¤¬ÛÖß“Ó	Ö–­Å@j :“Ö¬2¢Ğqo ’À2°‡f—¹hÏƒaóßªPÀBÏñN—Qé¶ âm½îĞ«·
YĞıAÃ 1ëìéànk)Ù¤U1+rKM¼pğ‡°k¸3ÇÜ!÷WO¾\[ {'¦GcÄ©5P¼2L©˜³
¬;®¥~‚¦02> «k¥Â~o'ñO±‡ôô0h¡cävœáuÖ‘_Ì@“Ül´náÑ ì|œ%YÆPlİQüÔ%ÁXùËçø`3œó4ã2U±'Fzƒ—ñp(IÛ¶n¡^I¨Fß¼€‹LÜÄsZ‘,|èT™,œFŸx…,#UãPq ›ıÒeÔøqêÓü’‘°È·jA»ZaÂÄ@…ÁQ¸Àc‡Ë/QØîìŒİé–Ğ¬şá’Ó¢ÄA ì=k‰gàãÕ ‰4ôN1Zˆlğ÷$AğHı[Gá²=!F×c|xù Ü_-    ä¨Ü_-]@á8È;QtÅ2eÁ£ Ì‘ùîáËñõŠŸ 	Úß0i$YÚ~Q½á)"9û×êp@t Y™ÑäÖÑÏ7<¼hğP-f9X×)MÁ§ü\{ËÙ¾`ÔÍrû“¿‹±qº€£p©çæPóG¡í’‡-ëf€ì›ñKµšæ‘Û"(ó‹¬tİ
ZĞ?şû¢FÅ»¼? ¼Œ#ü±q?’úK°É±> ¥ìˆaÑj¬³tDÀDBè§Ò°Qâ‰YšvĞm>¡é|Ao¨/Aåîeà„ŞÊŞ§(1É	ãù‡´,ğÉ’MÕÀ!Õ™‹oÑå }.ª%ÚS4²ø±ËXŞq£À#æıŸ£')í -Ó_—Uf…ñ¤_ş0Ò00ªš8Üƒ°yáøQdòY@•ï¿>ÖC–Ñ¾	?í"éP.’±·Ê²Á¶g`µzä˜E± 0½ªªpjÙ\Ä¡Œ¡<½pñä¡€›Æ¦á‘JR#SLË^ÒNŸ)ËÿŠSåÎ¹K åFõ©6q¼l'ÿ°
_OdÙäÌa ‘¦ÇÇPÀeˆÂÚQFbQöıe‘1§„ĞnáùÕİÉ+A~5¤YnµŠàe"ŸõÖÄ1øSxÈº'ğŠ;İ=·õ¦!$}öG¡¥ Ş_-    ¨Ş_-Bá8<QÒß2e^Æ£ NûîYËñ“·¶ ““ç0«Á´Û2]HáY—¦7ò@v7ŞÊÂ›ÈÑí?#àWŸPï¾NŞf[Á0Vİ¹©`VĞ5Ôı±5'Ï5ü—pëLÔ6ü¡Ë¢uà!ã,€î‰äÇÇñ‘ùd6£´<Ÿ:İÀ‰ªòYoöÜ±8 >†psÅÁ4q«İ—cĞà‡°ıåFá	a¯Óy×>‘8ÀFg#^VÊQ%ÑÈvşĞ/Å‘éüAÍ¾PßğáàO*üâªû1g¡z¦SRéğu/òMt&!³ÛÇ Ep ßµèï[q¨¾î nÙ<Õa{½  œ ¯:l,]ãñBp‰uI°l0ì“ÔÄçáÖªËœh¢@—ïøKÑÜ&> yUPğFsÀ?Á(7B`7Y/“NXá±>:ÆÿÑ…cp¬i­Œ›¡19œêp³€àYÈÙÎ¼‘h(D=Rÿi ^ş':zèƒççˆ#& Ÿºî˜#qZïz“°¦°L4‡÷G?a~^œÍ=éÀg‰¹…Šı¶Qß•…drĞ0Äèğ’AÜ~
HÊá­àçny¶¹:1–9 ™PğÌy^48!#‰ÊQ à_-     ¨à_-áCá8@<Q0ú2e¤Ë£ Ğ¨üîÑèËñ1äÍ Mï0í^İæhÓáåõ#t„s@xncü³RºÑyÓ	GNP±ddH¢iÁccİ1ï™”`ØÒø¬gh’±­Z”‚ëğŒp-P±WzxÖ¡©²c“X_B€ğw×CÚHG‘ yº¼aj`±ç·;¦ô§´ê À½ÖÑfqI|5ÇÃ°MH'“a<Gû“,ÀHŒ,ÚãQC8œHvS†ĞñK'’1{A+sM`Ùò]àˆ¿‰åç­Î19Sğ¥ğMWÛJË!‘Ò#ºú »=oªµü„}ÙbÌAÖéóU¿ùÚK 1¢Ô@TAñà€uìa¨0.âËØUá´EF"m>ê@™ãîÿÑúCÃ	P²ûp.¶ÌvÁr¿_úf`¹7MBk§±ÜC†Bù|pîùİ–w–1¡ø¤GğÊÅ€‘ªÊ‰˜‘†şqWQ²âé­°JqôF´0êB  !Ú92û8qøqÎH1°­ª«±a\+r§Ó³ÀiŠ°0Ã´Q2XšÙ!`Ğò¦)\òúA:Èp6&Ñài»›qwœ°14ûˆiæôğ¸ß*c{y!àÈsŞòı â_-    >¨â_-£Eá8|<Q3eêĞ£ R4şîIRÌñÏå §÷0/ükŞšt^áÃÆS8BÑô@z¥è-¥	¬Ñ)²¡ğ'6ıPspyê€ŞwÁÁ–z`ZÕ»…Ñ¼•±K€6¡åpo„Û½ô¡‡ÂQFÛW€òeÊ¿ìŸw‘5ùÛ¼ÑÄÌ#šã¡ÛV0À By
:Xá˜qçn­ÿ°“4ÔYD˜ak¥Ó” ÀJ±53Ê]ıQac%À#0Ğ³Ò0“y5úA‰XÜoÓôÙà
0éÎì°¡1£Ğ©ÿêbğ9ó+h!p!o_@ƒª.… ƒ—ÅÑl­à“Jã2™$*ªoşÛxøšú ³	ÚJŸñ~‘aczlä0p†·ÃªìÃá’àÀ§qd2@›(Mµ;Ã´Ña…ß™äPt°Ğé«YêÁĞV:‡ñ‹`;kñ¹}m±zMF… tÕp0Š€bÈ¡ÖÊñõ$Ø€“t×Ë?Ct‘¤ÔŸqPe§¤u]9[Än¤äyìüöÚ £e$\v]Nq–ô!“ß»°ĞTıÌ3$a:ø×²Ù)Àk‹§Ûûk`QP+Ñ-ßMĞ´‰AŸü>aA˜×$‚:ôàëši8&1Òv:|ÛğPö`!9¾â!¾n®ä©ª ä_-    \¨ä_-eGá8¸<Qì.3e0Ö£ Ô¿ÿîÁ»Ìñm=ü 1Àş0q™ÇßN€éá¡ı±Lv@|Üm_–ÀÑGëo×K%¬P5Ép¹†ÁÊ]èZj`Ü×~^;™±é¥néVÚvp±¸{^qe¡eÒ?ùÅWm€ôS½;ÿö§‘Së éÌ”åÉf’úìÏsÔ$”¬• ÄrW!ñÊq…¹Ø¼“;°ÑŞÛ–aaIâB–ÀLÖ>L€áQ®7Ñ–ĞuY:”ÁNyAç=kÍöUàŒ H¸ñ³t1AhA¬¶+ğÑÕHõ÷!M¡|41£ …sM4/1gËÄ‰IUYæ‡	ÄÅ{ö˜© 5qIê°Aıñ¢MÚ’J 0²Œ»· 2áp{;-vŠz@;|‡]˜iÑ6~G0)¬P6e0¥¡æ]Á.îÕı®è°`½ôˆ o3±WÈGkpr_iM ^¡´Œ’œû~ê€•>–ÍrıO‘ÂªÍ‹OFfÂkéÃî¶`µ %;n~º¿cq4wuwF°üáïQq–aÅ=¾ßŸ²ÀmŒ†4#µQn:J£œ;ĞvlYâfÈAöZ=ŞfàmT˜aùaœ1pòì—
Âğ’4âL!œAVuDV æ_-    z¨æ_-'Iá8ô<QJI3evÛ£ VKï9%Íñj!»y0³6#áŒtá4aŞj÷@~ó‡wÑe$>¾o[P÷!¤öñV”Á}ıÃ$:U`^ÚA7¥eœ±‡ËÛœÏkpóìàáDí,¡Câ-¬üÓ‚€öA°·NØ‘qİSC Õ\§ùé‚uXÄÑ µ;Š(k Fl¤ ë ıq#X¢©zw°*ƒaÒ~¢a'w¯fg˜ÀNûGe6e0Q¹7¯~éĞ7àC•	høAE#úÇøÑà¨¡ö¶G1ßÿØX‚ÉÛğş¶e‚Î¹!+ã¸å·š ‡OÕ–ñFÀé¨Ö®w¨åz¢'¬ıÙt3•úûW ·Ø¿‡8[ñº²9Q«(\0ôxa³Ä áN¶²z°Â@ŸN«YmÑT›	¹sPø`—sÑÁŒ…qøÖßÕ`?Ó¦O%£ù±¶`Æ
obGp´ªŸR8%õ¡’ [GÙü€—UÏ¥·+‘à€û¥NËä(¼J|jc`EñpÊ §¸ ş!yqÒùÈ
“Ñ°T£ÆpÔaö‘£ÉåKÀo•1mÚ	QŒIÃ§ÕY)Ğ8Oq%/AT¤£:“:àï –YºD1nÓÛ§¨ğÔrcåCµ!zºÓÇ@m è_-    ˜¨è_-éJá80=Q¨c3e¼à£ ØÖï±Íñ©–*!E30õÓ~â¶—ÿá]knu¬·x@€JxÂx.Ñƒ]¥“
P¹z¹|*“¢ÁÛ0Ş6@`àÜºŸ±%ñHPÂÃ`p5!Feˆiô¡!ò_3P˜€ø/£3$¥‘Ï†İ$i)msğÃ¸/meS€¤@ Èeñc´/qÁö${Z`³°Uu*¨œ§aà|Š1šüÀP Q~ìèIQ»äÀ&,Æ¥ĞùfM–QwA£‰ÁúMà‹û¹1}—pNg˜ğUà˜‚¥^!	%õ–>Œ$ ‰+]ù³\uœšÙjCã;<”57óP’ñò 9@¾“^/¹ñXÃ%ÈÃ˜06r6«Ñ(á,±08Ö
@¡aÚ+¡BÓÑr¸ËÑI;PºÎï EÁêóşÖú`Á±ÄşÚµ¿±Tj†M–Y pö:à;#ª‹¡pt#ò3€™ÒÑØq‘şV)ÀM~ƒêlÓŒ½İ¾uUó*4j )æÃB„qp|¦[°–J«57{aÔ^	Õë‹ãÀqŒÜ¥‘^QªX<¬)Ğú1‰h´–A²í	ğ•¿]àqí”Q{'ˆ1¬é¹§«=ğ±ä»†!X`f9–® ê_-    ¶¨ê_-«Lá8l=Q~3eæ£ Zbï)øÍñGÃA!Ïì07qÚãj£Šá;¢Ì‰zú@‚ıóiårÑ¡–Ú‹·ò¸P{ÓÎcÏ°Á9dzHú*`bßÇèx£±Ã¶x¸UpwU«èËå»¡ÿ
jÌ­€ú–¯6ü8‘­ÁËÉ.åì+Yğck/­9kv  J_>Ç} aq_•§L©Fï°—ÀÑîJ¹¬aãHJ®û›ğÀREZ—¢lcQÙJÙ¢-Ğ»íV—™šöAî®»üÉàòft ½í1/²Uğ—ÂzŸœ{!çf1HÅ ¯ ‹å[vrr%qkbz¼™,¡KÕP|m•qnèéµ »§xh5&ñöÓ?ÜäÓ0xk£Ş<|á
L«½ƒüR@£t	şÂˆÑÕ"ÙP|ƒO×‚¸ÁH´¨í&Î`Câ­È…±òsF½P¹p8Ë %/"¡Nèëœ!€›œÒÒ,ã‘-WÚL1"¬¤\X¦õäD «»Kå†æ£qÿo“=æ°ØñX¬šía²+oàñ|Àsƒ‡ŞH³QÈgµ°}ÔĞ¼¡«%ÛıA7pŞñë€àó9“I<
ş1Je /|ÓuğXïeûÉ‡!6ùª×¾Z ì_-    Ô¨ì_-mNá8¨=Qd˜3eHë£ Üíï¡aÎñåïX!Y¦0y6å¯áÙ*HQ{@„¸‚%[œdÑ¿Ï¨rÛágP=,äˆ›¿Á——^UZÚ`äáŠÁâb¦±a<#·-­Jp¹‰lbƒ¡İøÄ HÃ€ü‰+ISi‘Ë³Fí´íˆsTæš¡ëÅ‚lœë ÌX‹*G0“qı3*ø,+°Ùy5‡Ö±aÁ±ÒÅäÀTjc°Xğ|Q÷:Ó‡µĞ}t`˜á³uA_Ó¦½µşEà”bÆ]ÀÀ1¹ÆŸ^å¢ğÙ¤\¼)R¨!Å¨mùKu9 ãl¾8ˆËCUa(àŞYîş³ned¥óï‹Œßàd =3=uñ”äıµôÂ0ºdàšëPêáèæ%Cˆ"›@¥‡8Ğäì<Ñ®òOsiÊP>8¯’x,Á¦KDèNÅD`Ån ]FÛK±}ÓäGrpz[aù³¸¡,\´Gç3€f‘Ô>æ¾‘:…ôKäÀn0Ëä­cÒzÖç÷ -‘•ËH¹q¬ÃÕp°™t{Êı_aøÔë÷wÀuz2 Qæv.µÑ‘òĞ~÷¸î/eAn€ÖÌM¤àu†‘Aıìs1èà†·Li\ğš-çñfñ!¬‹£ç î_-    ò¨î_-/Pá8ä=QÂ²3eğ£ ^yïËÎñƒp!ã_%0»«‘æÒº á÷‰²ü@†ïWLSVÑİwYÿĞPÿ„ùÔGÍÁõÊ0lº `fäMšL·©±ÿajã¡?pû½uïRŞJ¡»!æw×ÄØ€şù{§[ª™‘é¥CP]õ|¯¸öDa–IÒtšbÁ NRØ@Åq›Ò¬ïFg°W |Ãó¶aŸåõŸØÀVlÉt–Qf\4\=Ğ?ûi™)ÍôA½¸5Í¯ ÂàÓ%G
Ã“1W^7±@Îğ‡>Ù¶(M!£ê©ªÒéÃ ¿ô û$a9WîE°\zLİQn©‰Ö× ¿víãÓñ2õé,¡K0ü]µ’ødXáÆ ÈŒHã@§šg¢ÂñÑÌÄ
ù‘P íNn§ŸÁãßâv¼i`GMüí±.‡Æ?+p¼ë¡÷ã8O¡
Ğ|òAF€Ÿ0PÖq š‘XÙ²K—_0¼zm¾¶LØ1úXqù ¯fß)«ÎqJ“lû°\@Yè`ÒanÅ:÷ıí¬Àw‘qİO·\Q†§¹%OàĞ@ÚĞ1:)ÌAÌÉ<»©DÇà÷Ò9¾Ïé1†\m?ÿBğÜkhè<OZ!òQn³ ğ_-    Ÿ¨ğ_-ñQá8 >Q Í3eÔõ£ à	ï‘4Ïñ!I‡!m-0ıHíç†Æ+áÕFçÆäê}@ˆ&ˆ=
HÑûAE@#ÀÅPÁİ•„ÛÁSşŞ~šë`èæs¶­±‡ı™–4p=òÚr–Z¡™1Ô*Aî€ èn#nÊ‘˜“tıDqèy5ÜqŠ§$²X”– ĞK%ñÙO÷q9q/Á•ù¢°]¢ÇÂÿ¼a}ƒ²Z¡ÌÀX´uâÄ÷¯Q3‘åâ8ÅĞ‚sšqæsAÄÜ©>à˜C…0Æf1õõÎ·|ŞŠğ]i öCÿñ!,æ[Y^N ‘›|ƒ½³}M´«#Úrº„¡4¯ìÆ†ÍÎÂ AŞ§æ¹
1ñĞÖ£%‡0>WŠŠyÆá¤N‘n+@©­–t(—¦Ñê,Ô‰YPÂ¡n	d4Ábz{İ³`É+<»± Ø±Ì†X36äpş{âàÎ½å¡èCE›X€¡úØ¤Zv‘v¯à(JJşòG*öÎ	Ç67züÛÓ 1<)LSäqè†j†°ç=ÁÄDaL’ dEÀy’hˆˆn±Q"• ¾yÎĞ½ètDP3A*£©qêày1²_1$ØSÇí”)ğªéŞ’Ã!Ğ÷°ÿ99_ ò_-    .Ÿ¨ò_-³Sá8\>Q~ç3eû£ b
ï	Ïñ¿u!÷Ò40?æHé:Ò¶á³}EÛ²7ÿ@Š]º.Á9Ñ{'G¯tPƒ6$EÀéÁ±1çzÖ`jéÓK `°±;­jÑN‹)p&@öÙÖÙ¡wAÂİD½€ÖaŸ€Xú‘%Š»Ö‹3ı%Wİ~kÔÉNl RErT£_)q×²’äßŞ°Ÿín	<.Áa[ì=$£ÀÀZÙ~ûz{ÉQQ¼n|MĞÃ}›¹ÿòAyƒSì£ºà´äÉ91“fdH|GğŸKÑÕ–!_n"àÒØ “wæÉÖCzFš4í:£MkäƒÄÅq ÃEb»ñnÂ>]Ã0€P_‚4á‚·•Ó•”s@«ÀÅFJl[ÑJ–e!P„VÎÄYÁ†ÁÀØÆª³`K
Zjg±jšF›Z-p@#Ê¹B|¡Æ·H#õj€£ÄÍÙ×R‘”…CIıœ´ÓÙ~ß\A”gÃşÌD® ³sn—oùq†	¾“›°à"ä$'·a*_
ÚİÀ{“_3Á%Q@¤™ÂÍÉ»ĞÄŸ ¸NwšAˆ\	˜aàûkŒ)@•Õ1ÂS:O¾*ğ`èjÕèÔ,!®Cqb ô_-    LŸ¨ô_-uUá8˜>QÜ4e` ¤ äïĞñ]¢µ!Œ<0ƒ¤êîİAá‘´£ï€„€@Œ”—ëx+Ñ7´ák#PE9¡}ü÷Áe_Â¡ZÁ`ìë–$Š´³±ÙÒ×„€pÁZ¥yS¡¡UQ°{9€ÄT“¯*‘C|÷£ÕõG€ÒHsc7„áDŒA Ô>¿·lo[qu®4d3Æ°á8PxKÆa9UMaî¤´À\ş‡1ÿâQoç÷ó<òÔĞ…†œrA×hâû6àœ$DÌ11%şğá-ä/^¬;!=°^¾fGc •SŒHBß/»å8@whZöuUÔ·…ké»¼  E­gøìñ'®‘V;ÿ0ÂI4z¡¢á`RYšº»@­ÓôlAÑ&gX¶©èPF.€ONúÁ©²Òî¡Ø`Íèw&d±¤Ş$Vp‚œc³¤Ç¡¤+Öò(O}€¥ŒÛ
Ï-‘²[<]H°;v_‰ğ¯»ò—‡®ˆ 5ç¼ÛÑq$Œ3›°"6CŠ)a,lPvÀ}”VŞùÜZQ^³Ç!‡©Ğ†‚ûXAæ¥o†½É0à}¸Š!xK1`Ï ×Àöğ¢&ìË¾–!ŒCÖâĞŠ· ö_-    jŸ¨ö_-7Wá8Ô>Q:4e¦¤ f§ïùpĞñûÎÌ!FD0Ã  ì¢éÌáoëOÑ@Ë/ÑUí¯ôÒPèN'¶8Ám˜Ÿ³:¬`nîYıó·±wøD8ºtp
ı`Ïh¡3aC²µ.€²G—¥[‘an3]º·wM´gÁ4ù: V86qM·5‚¬V°#„½–´hËa¾…¸¦¨À^#‘-ç‚üQkêÎ\ĞGI2ñA5Nq˜²à•£ìÏß1Ï¼•½ß·Àğ#ÆLë‚à!òšoí»í —/«õˆÙÉ.İŠ¸Ó½mÌì¼Ég~²³Ï Ç×d>ïJñª7šo;0C	r,µá>íŠŞà@¯æ#ëÅÑD„ 9°PÀ;EÛmÁ|@NÍ™ı`OÇ•ÈÒ8*±¦­Æ ©pÄ,¤œL©¡‚Ÿ.©€§XKİ=‰	‘Ğ1jwGcÚ8ë8 6PÈUAc ·¼³4$qÂe“Ê%°dİë)aí›aæøÑ$ÆÀ•M‰2”¯Q|Â‹ËuD—ĞHe0>cÅhADïÕtöSàÿ‰ÂZÁ1şJ__VİğädmÂ”Zÿ!jéhTœ³c ø_-    ˆŸ¨ø_-ùXá8?Q˜64eì
¤ è2ïqÚĞñ™ûã!•ÿK0¾[íVõWáM"`ƒ@¢NæÑs&~Û²|PÉ@d­îtÁËËßxÅ—`ğğÖ]]º±²ëoipEÃo€¤K0¡qŒöè1D€ :¸]‹‘`o Ñey§†÷Ç\Ğã1„ì Ø1Y~ÿ¿q±ë9Ñ’’°eÏdİğ…Ğaõ&è¨‚¨œÀ`HšFQ«=
ã—«äĞ	™‘KpA“3 ’
.à Ö"Ò²1mT-j«U}ğeò§ixY…!ù3× t0x ™œÇ
â÷­$ÌB­Úz1&áÔô'æ<{©ª~ I|‘9æ¨ñHH†‡÷v0F<Şi9É~áˆd£L@±ùR½¯ëyÑb¡ÜWıÈwPÊtíö:háÁÚ×éÇ>"`Ñ¥³wˆKğ±D·†cĞÈp½ä…zÑ?¡`gH4¢€©"
ßpCå‘î˜‘FyúvèV°®øû= 9’PÕc–9q`‘¸b°°¦„ĞLPaÄÅ70<§À–D4kKQšÑĞÉ…Ğ
HHmìÏA¢8<cu"wàQ‡ƒ=71œÆíæ/ìÃğ&£î¸jh!HûÅgÜ ú_-    ¦Ÿ¨ú_-»Zá8L?QöP4e2¤ j¾ïéCÑñ7(û!¹S0G[·î
ãá+Y¾,ëj@’9'€óœ Ñ‘_LÂÖk0P‹™y3'±"Á)ÿT×ú`róß®Ç±½±³CŸ%^ıp‡÷ÔèÇ÷¡ï€z©®Y€
-Ê´»‘R«ãè%-;×	èB‹P}œ“(' Â Z+¦áÈñqOŠ¼ØyÎ°§$-£ÕaÓµÌLªÀbm£_SŠ/QÉh“ZEˆlĞË#£ŸÙdïAñ*Œªà"vb¿'Õ…1ìÄwó9ğ§Ô‰†0*!×uÒú¤ ›ç#p‰ ;’’¨Ïš< õ¼,…dZx ¡- ËãKìÜñæXröŸÕ²0ˆ5³aFİìáú"€é§,”@³‚ÑÀ.Ñ€¾¨úX?PŒ)M²0õTÁ8o…Âf‡G`S„Ñ&>^¶±âÀF¦÷	pHM%oeVÖ¡>‡/ó9]´€«ìÈà£ıÀ‘ŞÅ«EÉ¼˜¡!©*)èµë »gš÷§øNqş"“ù:°è+µo³€a¢’;"²?Àƒ—;ß£YQ¸à}Ô¿rĞÌ*`Äw7A ‚¢QÑNšà…	D ­1:BÔn ‚ªğháo¯@àÑ!&573¼ ü_-    ÄŸ¨ü_-}\á8ˆ?QTk4ex¤ ìIïa­ÑñÕT"©r[0‰øğ¾ná	A¹·…@”p¬±äSòÑ¯˜©úZßPMò¹_í0Á‡2`/éÚl`ôõ¢‡1Á±QiŒRÛRòpÉ+:‡+D¿¡Íh\V*o€| İì‘»Dç& .õıØ½öDÛhC@|— Ü$óD’®#qí(?ªn_
°ée³jiÀÚa±ø‚ğ¬„Àd’¬x	IQç“ÒòdôĞª¬ !~nAOş:†&à¤æÁ¨,ØX1©ƒ\ÃB‘öğé¶k£’Ï!µ·Oƒ Ã«ÒK6”3vXòZşìö9
¥dãâwu—˜Ü MKãÂÓdñ„i^m¸³î0Ê.ˆYSñZáØ½ún¬RÜ@µ±aó•ãÑÛ`ù÷èPNŞ¬m&‚ÈÁ–!½~l`ÕbïÕóp|±€Êé:pŠİeXPÛl¡û÷?·Æ€­¶‡âÖ·œ‘*´óÅD|¶~G*2ü¤jY1
oUò ==äìZdqœ–_$‘Å°*Ó™’»óa€_G((ØÀ…˜2ŠÜ¹­QÖïöØq|`Ğx‚:A^Ë@-{½à…êƒ#1Ø½ºöĞ‘ğªñ¥#;!Û ©ş-h ş_-    âŸ¨ş_-?^á8Ä?Q²…4e¾¤ nÕïÙÒñs)"3,c0Ë•nñrùáçÆzU‡@–§1ãÕ
äÑÍÑèJPK¤?˜)?Áåe 
ûºW`vøe`›ZÄ±ïù‘Gçp`Ÿ
oÀ†¡« V¦„€j‡ïb‘Ù6#j6½¿6É8b995óWøl ^@¨[¾Uq‹ÇÁ{½EF°+±Z±¥İßaaPá­xÀf·µ‘¿‘bQ¿¥I A|ĞO1¶¡i—íA­ã¬I€¢à&W!’1Û+1Gôo/³ğ+™MÀİs!“ù‹4 ŸŸ35LíQZtÀJ_ÓœAa•r‹ Ï²À·™ÊÂñ"zJäĞ‘*0(]Q`Éá¶Xuô°x$@·2à3k˜Ñ¼ø"JõxÎP“)<Áô¼·¶u‘`WA…©ƒB±ÔÆ+FøòpÌm¦A;`¡únÀHEÙ€¯€Fä	rx‘HŠ!àC/U@÷²BOÈ‰z)¿Ì ¿.<0½yq:³&“(P°lz~µÙyea^,iR.pÀ‡™)5qQôşoİÅ9NĞPğJŒaA¼o.‰§àà7‚ùÅå˜1v9¡~¡­wğì]rœìe¤!â€³ÊV