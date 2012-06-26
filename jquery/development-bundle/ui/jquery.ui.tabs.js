/*
 * jQuery UI Tabs 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var tabId = 0,
	listId = 0;

function getNextTabId() {
	return ++tabId;
}

function getNextListId() {
	return ++listId;
}

$.widget( "ui.tabs", {
	options: {
		add: null,
		ajaxOptions: null,
		cache: false,
		cookie: null, // e.g. { expires: 7, path: '/', domain: 'jquery.com', secure: true }
		collapsible: false,
		disable: null,
		disabled: [],
		enable: null,
		event: "click",
		fx: null, // e.g. { height: 'toggle', opacity: 'toggle', duration: 200 }
		idPrefix: "ui-tabs-",
		load: null,
		panelTemplate: "<div></div>",
		remove: null,
		select: null,
		show: null,
		spinner: "<em>Loading&#8230;</em>",
		tabTemplate: "<li><a href='#{href}'><span>#{label}</span></a></li>"
	},

	_create: function() {
		this._tabify( true );
	},

	_setOption: function( key, value ) {
		if ( key == "selected" ) {
			if (this.options.collapsible && value == this.options.selected ) {
				return;
			}
			this.select( value );
		} else {
			this.options[ key ] = value;
			this._tabify();
		}
	},

	_tabId: function( a ) {
		return a.title && a.title.replace( /\s/g, "_" ).replace( /[^\w\u00c0-\uFFFF-]/g, "" ) ||
			this.options.idPrefix + getNextTabId();
	},

	_sanitizeSelector: function( hash ) {
		// we need this because an id may contain a ":"
		return hash.replace( /:/g, "\\:" );
	},

	_cookie: function() {
		var cookie = this.cookie ||
			( this.cookie = this.options.cookie.name || "ui-tabs-" + getNextListId() );
		return $.cookie.apply( null, [ cookie ].concat( $.makeArray( arguments ) ) );
	},

	_ui: function( tab, panel ) {
		return {
			tab: tab,
			panel: panel,
			index: this.anchors.index( tab )
		};
	},

	_cleanup: function() {
		// restore all former loading tabs labels
		this.lis.filter( ".ui-state-processing" )
			.removeClass( "ui-state-processing" )
			.find( "span:data(label.tabs)" )
				.each(function() {
					var el = $( this );
					el.html( el.data( "label.tabs" ) ).removeData( "label.tabs" );
				});
	},

	_tabify: function( init ) {
		var self = this,
			o = this.options,
			fragmentId = /^#.+/; // Safari 2 reports '#' for an empty hash

		this.list = this.element.find( "ol,ul" ).eq( 0 );
		this.lis = $( " > li:has(a[href])", this.list );
		this.anchors = this.lis.map(function() {
			return $( "a", this )[ 0 ];
		});
		this.panels = $( [] );

		this.anchors.each(function( i, a ) {
			var href = $( a ).attr( "href" );
			// For dynamically created HTML that contains a hash as href IE < 8 expands
			// such href to the full page url with hash and then misinterprets tab as ajax.
			// Same consideration applies for an added tab with a fragment identifier
			// since a[href=#fragment-identifier] does unexpectedly not match.
			// Thus normalize href attribute...
			var hrefBase = href.split( "#" )[ 0 ],
				baseEl;
			if ( hrefBase && ( hrefBase === location.toString().split( "#" )[ 0 ] ||
					( baseEl = $( "base" )[ 0 ]) && hrefBase === baseEl.href ) ) {
				href = a.hash;
				a.href = href;
			}

			// inline tab
			if ( fragmentId.test( href ) ) {
				self.panels = self.panels.add( self._sanitizeSelector( href ) );
			// remote tab
			// prevent loading the page itself if href is just "#"
			} else if ( href && href !== "#" ) {
				// required for restore on destroy
				$.data( a, "href.tabs", href );

				// TODO until #3808 is fixed strip fragment identifier from url
				// (IE fails to load from such url)
				$.data( a, "load.tabs", href.replace( /#.*$/, "" ) );

				var id = self._tabId( a );
				a.href = "#" + id;
				var $panel = $( "#" + id );
				if ( !$panel.length ) {
					$panel = $( o.panelTemplate )
						.attr( "id", id )
						.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
						.insertAfter( self.panels[ i - 1 ] || self.list );
					$panel.data( "destroy.tabs", true );
				}
				self.panels = self.panels.add( $panel );
			// invalid tab href
			} else {
				o.disabled.push( i );
			}
		});

		// initialization from scratch
		if ( init ) {
			// attach necessary classes for styling
			this.element.addClass( "ui-tabs ui-widget ui-widget-content ui-corner-all" );
			this.list.addClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" );
			this.lis.addClass( "ui-state-default ui-corner-top" );
			this.panels.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" );

			// Selected tab
			// use "selected" option or try to retrieve:
			// 1. from fragment identifier in url
			// 2. from cookie
			// 3. from selected class attribute on <li>
			if ( o.selected === undefined ) {
				if ( location.hash ) {
					this.anchors.each(function( i, a ) {
						if ( a.hash == location.hash ) {
							o.selected = i;
							return false;
						}
					});
				}
				if ( typeof o.selected !== "number" && o.cookie ) {
					o.selected = parseInt( self._cookie(), 10 );
				}
				if ( typeof o.selected !== "number" && this.lis.filter( ".ui-tabs-selected" ).length ) {
					o.selected = this.lis.index( this.lis.filter( ".ui-tabs-selected" ) );
				}
				o.selected = o.selected || ( this.lis.length ? 0 : -1 );
			} else if ( o.selected === null ) { // usage of null is deprecated, TODO remove in next release
				o.selected = -1;
			}

			// sanity check - default to first tab...
			o.selected = ( ( o.selected >= 0 && this.anchors[ o.selected ] ) || o.selected < 0 )
				? o.selected
				: 0;

			// Take disabling tabs via class attribute from HTML
			// into account and update option properly.
			// A selected tab cannot become disabled.
			o.disabled = $.unique( o.disabled.concat(
				$.map( this.lis.filter( ".ui-state-disabled" ), function( n, i ) {
					return self.lis.index( n );
				})
			) ).sort();

			if ( $.inArray( o.selected, o.disabled ) != -1 ) {
				o.disabled.splice( $.inArray( o.selected, o.disabled ), 1 );
			}

			// highlight selected tab
			this.panels.addClass( "ui-tabs-hide" );
			this.lis.removeClass( "ui-tabs-selected ui-state-active" );
			// check for length avoids error when initializing empty list
			if ( o.selected >= 0 && this.anchors.length ) {
				this.panels.eq( o.selected ).removeClass( "ui-tabs-hide" );
				this.lis.eq( o.selected ).addClass( "ui-tabs-selected ui-state-active" );

				// seems to be expected behavior that the show callback is fired
				self.element.queue( "tabs", function() {
					self._trigger( "show", null,
						self._ui( self.anchors[ o.selected ], self.panels[ o.selected ] ) );
				});

				this.load( o.selected );
			}

			// clean up to avoid memory leaks in certain versions of IE 6
			// TODO: namespace this event
			$( window ).bind( "unload", function() {
				self.lis.add( self.anchors ).unbind( ".tabs" );
				self.lis = self.anchors = self.panels = null;
			});
		// update selected after add/remove
		} else {
			o.selected = this.lis.index( this.lis.filter( ".ui-tabs-selected" ) );
		}

		// update collapsible
		// TODO: use .toggleClass()
		this.element[ o.collapsible ? "addClass" : "removeClass" ]( "ui-tabs-collapsible" );

		// set or update cookie after init and add/remove respectively
		if ( o.cookie ) {
			this._cookie( o.selected, o.cookie );
		}

		// disable tabs
		for ( var i = 0, li; ( li = this.lis[ i ] ); i++ ) {
			$( li )[ $.inArray( i, o.disabled ) != -1 &&
				// TODO: use .toggleClass()
				!$( li ).hasClass( "ui-tabs-selected" ) ? "addClass" : "removeClass" ]( "ui-state-disabled" );
		}

		// reset cache if switching from cached to not cached
		if ( o.cache === false ) {
			this.anchors.removeData( "cache.tabs" );
		}

		// remove all handlers before, tabify may run on existing tabs after add or option change
		this.lis.add( this.anchors ).unbind( ".tabs" );

		if ( o.event !== "mouseover" ) {
			var addState = function( state, el ) {
				if ( el.is( ":not(.ui-state-disabled)" ) ) {
					el.addClass( "ui-state-" + state );
				}
			};
			var removeState = function( state, el ) {
				el.removeClass( "ui-state-" + state );
			};
			this.lis.bind( "mouseover.tabs" , function() {
				addState( "hover", $( this ) );
			});
			this.lis.bind( "mouseout.tabs", function() {
				removeState( "hover", $( this ) );
			});
			this.anchors.bind( "focus.tabs", function() {
				addState( "focus", $( this ).closest( "li" ) );
			});
			this.anchors.bind( "blur.tabs", function() {
				removeState( "focus", $( this ).closest( "li" ) );
			});
		}

		// set up animations
		var hideFx, showFx;
		if ( o.fx ) {
			if ( $.isArray( o.fx ) ) {
				hideFx = o.fx[ 0 ];
				showFx = o.fx[ 1 ];
			} else {
				hideFx = showFx = o.fx;
			}
		}

		// Reset certain styles left over from animation
		// and prevent IE's ClearType bug...
		function resetStyle( $el, fx ) {
			$el.css( "display", "" );
			if ( !$.support.opacity && fx.opacity ) {
				$el[ 0 ].style.removeAttribute( "filter" );
			}
		}

		// Show a tab...
		var showTab = showFx
			? function( clicked, $show ) {
				$( clicked ).closest( "li" ).addClass( "ui-tabs-selected ui-state-active" );
				$show.hide().removeClass( "ui-tabs-hide" ) // avoid flicker that way
					.animate( showFx, showFx.duration || "normal", function() {
						resetStyle( $show, showFx );
						self._trigger( "show", null, self._ui( clicked, $show[ 0 ] ) );
					});
			}
			: function( clicked, $show ) {
				$( clicked ).closest( "li" ).addClass( "ui-tabs-selected ui-state-active" );
				$show.removeClass( "ui-tabs-hide" );
				self._trigger( "show", null, self._ui( clicked, $show[ 0 ] ) );
			};

		// Hide a tab, $show is optional...
		var hideTab = hideFx
			? function( clicked, $hide ) {
				$hide.animate( hideFx, hideFx.duration || "normal", function() {
					self.lis.removeClass( "ui-tabs-selected ui-state-active" );
					$hide.addClass( "ui-tabs-hide" );
					resetStyle( $hide, hideFx );
					self.element.dequeue( "tabs" );
				});
			}
			: function( clicked, $hide, $show ) {
				self.lis.removeClass( "ui-tabs-selected ui-state-active" );
				$hide.addClass( "ui-tabs-hide" );
				self.element.dequeue( "tabs" );
			};

		// attach tab event handler, unbind to avoid duplicates from former tabifying...
		this.anchors.bind( o.event + ".tabs", function() {
			var el = this,
				$li = $(el).closest( "li" ),
				$hide = self.panels.filter( ":not(.ui-tabs-hide)" ),
				$show = $( self._sanitizeSelector( el.hash ) );

			// If tab is already selected and not collapsible or tab disabled or
			// or is already loading or click callback returns false stop here.
			// Check if click handler returns false last so that it is not executed
			// for a disabled or loading tab!
			if ( ( $li.hasClass( "ui-tabs-selected" ) && !o.collapsible) ||
				$li.hasClass( "ui-state-disabled" ) ||
				$li.hasClass( "ui-state-processing" ) ||
				self.panels.filter( ":animated" ).length ||
				self._trigger( "select", null, self._ui( this, $show[ 0 ] ) ) === false ) {
				this.blur();
				return false;
			}

			o.selected = self.anchors.index( this );

			self.abort();

			// if tab may be closed
			if ( o.collapsible ) {
				if ( $li.hasClass( "ui-tabs-selected" ) ) {
					o.selected = -1;

					if ( o.cookie ) {
						self._cookie( o.selected, o.cookie );
					}

					self.element.queue( "tabs", function() {
						hideTab( el, $hide );
					}).dequeue( "tabs" );

					this.blur();
					return false;
				} else if ( !$hide.length ) {
					if ( o.cookie ) {
						self._cookie( o.selected, o.cookie );
					}

					self.element.queue( "tabs", function() {
						showTab( el, $show );
					});

					// TODO make passing in node possible, see also http://dev.jqueryui.com/ticket/3171
					self.load( self.anchors.index( this ) );

					this.blur();
					return false;
				}
			}

			if ( o.cookie ) {
				self._cookie( o.selected, o.cookie );
			}

			// show new tab
			if ( $show.length ) {
				if ( $hide.length ) {
					self.element.queue( "tabs", function() {
						hideTab( el, $hide );
					});
				}
				self.element.queue( "tabs", function() {
					showTab( el, $show );
				});

				self.load( self.anchors.index( this ) );
			} else {
				throw "jQuery UI Tabs: Mismatching fragment identifier.";
			}

			// Prevent IE from keeping other link focussed when using the back button
			// and remove dotted border from clicked link. This is controlled via CSS
			// in modern browsers; blur() removes focus from address bar in Firefox
			// which can become a usability and annoying problem with tabs('rotate').
			if ( $.browser.msie ) {
				this.blur();
			}
		});

		// disable click in any case
		this.anchors.bind( "click.tabs", function(){
			return false;
		});
	},

    _getIndex: function( index ) {
		// meta-function to give users option to provide a href string instead of a numerical index.
		// also sanitizes numerical indexes to valid values.
		if ( typeof index == "string" ) {
			index = this.anchors.index( this.anchors.filter( "[href$=" + index + "]" ) );
		}

		return index;
	},

	destroy: function() {
		var o = this.options;

		this.abort();

		this.element
			.unbind( ".tabs" )
			.removeClass( "ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible" )
			.removeData( "tabs" );

		this.list.removeClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" );

		this.anchors.each(function() {
			var href = $.data( this, "href.tabs" );
			if ( href ) {
				this.href = href;
			}
			var $this = $( this ).unbind( ".tabs" );
			$.each( [ "href", "load", "cache" ], function( i, prefix ) {
				$this.removeData( prefix + ".tabs" );
			});
		});

		this.lis.unbind( ".tabs" ).add( this.panels ).each(function() {
			if ( $.data( this, "destroy.tabs" ) ) {
				$( this ).remove();
			} else {
				$( this ).removeClass([
					"ui-state-default",
					"ui-corner-top",
					"ui-tabs-selected",
					"ui-state-active",
					"ui-state-hover",
					"ui-state-focus",
					"ui-state-disabled",
					"ui-tabs-panel",
					"ui-widget-content",
					"ui-corner-bottom",
					"ui-tabs-hide"
				].join( " " ) );
			}
		});

		if ( o.cookie ) {
			this._cookie( null, o.cookie );
		}

		return this;
	},

	add: function( url, label, index ) {
		if ( index === undefined ) {
			index = this.anchors.length;
		}

		var self = this,
			o = this.options,
			$li = $( o.tabTemplate.replace( /#\{href\}/g, url ).replace( /#\{label\}/g, label ) ),
			id = !url.indexOf( "#" ) ? url.replace( "#", "" ) : this._tabId( $( "a", $li )[ 0 ] );

		$li.addClass( "ui-state-default ui-corner-top" ).data( "destroy.tabs", true );

		// try to find an existing element before creating a new one
		var $panel = $( "#" + id );
		if ( !$panel.length ) {
			$panel = $( o.panelTemplate )
				.attr( "id", id )
				.data( "destroy.tabs", true );
		}
		$panel.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide" );

		if ( index >= this.lis.length ) {
			$li.appendTo( this.list );
			$panel.appendTo( this.list[ 0 ].parentNode );
		} else {
			$li.insertBefore( this.lis[ index ] );
			$panel.insertBefore( this.panels[ index ] );
		}

		o.disabled = $.map( o.disabled, function( n, i ) {
			return n >= index ? ++n : n;
		});

		this._tabify();

		if ( this.anchors.length == 1 ) {
			o.selected = 0;
			$li.addClass( "ui-tabs-selected ui-state-active" );
			$panel.removeClass( "ui-tabs-hide" );
			this.element.queue( "tabs", function() {
				self._trigger( "show", null, self._ui( self.anchors[ 0 ], self.panels[ 0 ] ) );
			});

			this.load( 0 );
		}

		this._trigger( "add", null, this._ui( this.anchors[ index ], this.panels[ index ] ) );
		return this;
	},

	remove: function( index ) {
		index = this._getIndex( index );
		var o = this.options,
			$li = this.lis.eq( index ).remove(),
			$panel = this.panels.eq( index ).remove();

		// If selected tab was removed focus tab to the right or
		// in case the last tab was removed the tab to the left.
		if ( $li.hasClass( "ui-tabs-selected" ) && this.anchors.length > 1) {
			this.select( index + ( index + 1 < this.anchors.length ? 1 : -1 ) );
		}

		o.disabled = $.map(
			$.grep( o.disabled, function(n, i) {
				return n != index;
			}),
			function( n, i ) {
				return n >= index ? --n : n;
			});

		this._tabify();

		this._trigger( "remove", null, this._ui( $li.find( "a" )[ 0 ], $panel[ 0 ] ) );
		return this;
	},

	enable: function( index ) {
		index = this._getIndex( index );
		var o = this.options;
		if ( $.inArray( index, o.disabled ) == -1 ) {
			return;
		}

		this.lis.eq( index ).removeClass( "ui-state-disabled" );
		o.disabled = $.grep( o.disabled, function( n, i ) {
			return n != index;
		});

		this._trigger( "enable", null, this._ui( this.anchors[ index ], this.panels[ index ] ) );
		return this;
	},

	disable: function( index ) {
		index = this._getIndex( index );
		var self = this, o = this.options;
		// cannot disable already selected tab
		if ( index != o.selected ) {
			this.lis.eq( index ).addClass( "ui-state-disabled" );

			o.disabled.push( index );
			o.disabled.sort();

			this._trigger( "disable", null, this._ui( this.anchors[ index ], this.panels[ index ] ) );
		}

		return this;
	},

	select: function( index ) {
		index = this._getIndex( index );
		if ( index == -1 ) {
			if ( this.options.collapsible && this.options.selected != -1 ) {
				index = this.options.selected;
			} else {
				return this;
			}
		}
		this.anchors.eq( index ).trigger( this.options.event + ".tabs" );
		return this;
	},

	load: function( index ) {
		index = this._getIndex( index );
		var self = this,
			o = this.options,
			a = this.anchors.eq( index )[ 0 ],
			url = $.data( a, "load.tabs" );

		this.abort();

		// not remote or from cache
		if ( !url || this.element.queue( "tabs" ).length !== 0 && $.data( a, "cache.tabs" ) ) {
			this.element.dequeue( "tabs" );
			return;
		}

		// load remote from here on
		this.lis.eq( index ).addClass( "ui-state-processing" );

		if ( o.spinner ) {
			var span = $( "span", a );
			span.data( "label.tabs", span.html() ).html( o.spinner );
		}

		this.xhr = $.ajax( $.extend( {}, o.ajaxOptions, {
			url: url,
			success: function( r, s ) {
				$( self._sanitizeSelector( a.hash ) ).html( r );

				// take care of tab labels
				self._cleanup();

				if ( o.cache ) {
					$.data( a, "cache.tabs", true );
				}

				self._trigger( "load", null, self._ui( self.anchors[ index ], self.panels[ index ] ) );
				try {
					o.ajaxOptions.success( r, s );
				}
				catch ( e ) {}
			},
			error: function( xhr, s, e ) {
				// take care of tab labels
				self._cleanup();

				self._trigger( "load", null, self._ui( self.anchors[ index ], self.panels[ index ] ) );
				try {
					// Passing index avoid a race condition when this method is
					// called after the user has selected another tab.
					// Pass the anchor that initiated this request allows
					// loadError to manipulate the tab content panel via $(a.hash)
					o.ajaxOptions.error( xhr, s, index, a );
				}
				catch ( e ) {}
			}
		} ) );

		// last, so that load event is fired before show...
		self.element.dequeue( "tabs" );

		return this;
	},

	abort: function() {
		// stop possibly running animations
		this.element.queue( [] );
		this.panels.stop( false, true );

		// "tabs" queue must not contain more than two elements,
		// which are the callbacks for the latest clicked tab...
		this.element.queue( "tabs", this.element.queue( "tabs" ).splice( -2, 2 ) );

		// terminate pending requests from other tabs
		if ( this.xhr ) {
			this.xhr.abort();
			delete this.xhr;
		}

		// take care of tab labels
		this._cleanup();
		return this;
	},

	url: function( index, url ) {
		this.anchors.eq( index ).removeData( "cache.tabs" ).data( "load.tabs", url );
		return this;
	},

	length: function() {
		return this.anchors.length;
	}
});

$.extend( $.ui.tabs, {
	version: "1.8.5"
});

/*
 * Tabs Extensions
 */

/*
 * Rotate
 */
$.extend( $.ui.tabs.prototype, {
	rotation: null,
	rotate: function( ms, continuing ) {
		var self = this,
			o = this.options;

		var rotate = self._rotate || ( self._rotate = function( e ) {
			clearTimeout( self.rotation );
			self.rotation = setTimeout(function() {
				var t = o.selected;
				self.select( ++t < self.anchors.length ? t : 0 );
			}, ms );
			
			if ( e ) {
				e.stopPropagation();
			}
		});

		var stop = self._unrotate || ( self._unrotate = !continuing
			? function(e) {
				if (e.clientX) { // in case of a true click
					self.rotate(null);
				}
			}
			: function( e ) {
				t = o.selected;
				rotate();
			});

		// start rotation
		if ( ms ) {
			this.element.bind( "tabsshow", rotate );
			this.anchors.bind( o.event + ".tabs", stop );
			rotate();
		// stop rotation
		} else {
			clearTimeout( self.rotation );
			this.element.unbind( "tabsshow", rotate );
			this.anchors.unbind( o.event + ".tabs", stop );
			delete this._rotate;
			delete this._unrotate;
		}

		return this;
	}
});

})( jQuery );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                       �b-    lʨ�b-U��8ؔQ��Ye �� ĦD��g�}�C�BW0a�Vް�"᱓7��^@l��r��W�S�b�P%&�_��n�/<��Ltc`̆꼱}���q6E>p�y [*�c�u �������H%ڧ�c�#��`���Ӌ�́��9��#���ev� Rq������5��g��R aY�؁7w�<1��T�Q��%ɘ+"�eF8�p&A�LY�x�|�u|(#a1Q�*��&��l��70!]_���j u���&?�а��ڋ�<\ZT����g[ǿ� %x\9���,
��~0��Z��s���N9ar@�&�<
��FBb�&��P&��ٌ��>@\g��`��g�H�(w��l9pb�2 T�q�ĺ�rN�ހ���]]x	��& ���\�VF⃴��BJꩀ������qDOs�԰��/��a(��{����]h�o>"Q~n5�i�fynm�IAy9���]��em�1��r2Rn����%Q+�!���%D/2 �b-    �ʨ�b-��8�QZZeF�� F2F�yh��Ck�^0�/��d����pK�9�@nޛL�)��u"�*QJP�~����|��o��^TN`N���a���+%�93p㭅�mp+�S0�ySD���}�71ؑ�y_+�(����5����9��6�ٴ0�q3P{aϽq��9'Zo%a7}a�K9k�>V�*�ةQ��@F��'�Aˉ�AU�h����O�e-&41�ק���O{����!;�96�=� wr`Nr<�����)�K����h���X��R ���0�]�����\J0�/�ЇM�^�ɾ��@�9�,w��d_$$5�P�!��|������� `/�����ƀ�d�p��s�>^��.�T񀇻�_�2���M����ґ�j�pO�L�[���)�v�q��pu��_�DL�R�h
ax(��n8�__L��vQ�}�9<mW�(\��#�Adf�'@������&P71�X�"�T���6'nO!�X7�X� �b-    �ʨ�b-���8P�Q�Ze��� ȽG��vh�4C��f0����8�m�_Z�a@p!~���ѓA�N@�P��l/���)�p49`Ћpn����51�ء.(p%��a���1@�,��&���p@J���k�FB��YN�����?���Π���<~@�q���2���E��m��*a�. ;_�@{�Ca\�Q�88���1��SK�$A��ix�p���4O2)1�G�s*��E1]�Q�y!�u�� yN�4R���]�Z�,�}rRG��U�� )G�纻�h+�r�:�0&��ݛ��<'DD#�@�L��MLlт|�n!�VP�K�Px	���n���E`���2�0��d��W@[�p���)㞡����Yk���La�����{3�d���]A�ս����N^}5�}sU��q�T�w*갆�u��|a�D������a	V���Q��
>�*E��>��-A¯E���aL��2�1�y?B�G;�"����!h��ۀ� �b-    �ʨ�b-���8��Q8ZeҤ� JII�i�h�WKKCon0'ji�����K8-t(��@rL����wѱz��r/�Pk0)�gB��I�i��$`R�3G�	���V�W#pgP��h��P���<<��c�\�8��]׉YǸ�~������cI5�1��:�L�GP�qo��m�鰇I��ҩ/a�N�C�<S�B��\��Q�c�/���Ы�T[��A������1�87,�1+߮0?�\��?ߚ!�$���&
 {*p�gJ5}�#�A�V�&�Z���R��� ��@ڽ��<����0h�٣�)�¾�'�J@�_-�o!!Ѡ���UPl �n�o�X/��j`3_��iCq��T�gRdp(���h5�^Vs_���Oc����,��M�9������,�Q���R�A�:q�z��t�Țe��.�a����Zi�c
M�d Q؛�B��2Ь!�682A ���*����#1Z�%���!�H`9	��!!F�\z��6 �b-    �ʨ�b-]��8ȕQtRZe�� ��J��Ii��wbC	)v0i���N�)o���d@t�+�Ni�ϳ�q�WP-�>x�~���	�[��`Ԑ�Y^��q|r?p�J�h8偡�_����Q��V8o6i��O�pπ�ݭ!�ww���/�L߭y��ϙ`q,ֻp%�ɔ/��4aѷ�g�>G�D��u�c�Q�J�N�A�ma^��"Ao�����h����!</�1�vF�
f��� (lq�!�f�I �� }�u�}�Sa��Zd�޳���B���O��_ -����w�L�`���0�}���×��\9O,��@�r\����Ѿ�j��P.�@�c#������ȏ`�=ߐV7���ݎIpj<5���ˡ<�e(���d)ax�J�g��א^u���c|���fS�P�(dݜ!q�Yk|Y��
BJ��aa��Y����eDMRuQ���F8� �n�yBY�A~B�S?M�e�i��1�pR�s������6�!$J��q�� �b-    ˨�b-��8�Q�lZe^�� N`L�Y�i�yC��}0�� �4������l�@v���[���ZX�P��S�غ��=�6���`V���²������p�~�{aI��o�E.5g��I������AO��H��ݤ��ⓁY��d�)O�>��f�oLq�ʅ�
Wa���AK�9a� ��t@;�F�ڎ��Q%���z��/�g��A͚�����SA2�1gމ����E�Gh!��*�� ��{��qE~���L�fY�*�a�L�� �}��k���B]����90�v��������0�@���W�ˊ���,au�P�i��Y�V�5f�.��`7�?�h��>���@�p��u��qb����jy:���f\T�hU��}v� P/�����U��Ġ��P�!�6qZܾ~����L�.�+��a~����F��g;����Q�uK�b�0��L�MA܋x�kp��1w*�1����d	����;�~y�!��]=�� �b-     ˨�b-���8@�Q0�Ze��� ��M��j�1ѐC��0�A|���d���G���f@x�5D~�L�&)?���P�:i����cp*���`ؕ|�,����L�x�p-�o����{�d�|��z<0��ɑ4�S���a(vmN����X|˥$���3ʣ~qIiyY=��M+~��?a��d�>B/�H�9k)QC�\��WQ��nq 3!A+�����`�����E5S1�u6����M��a�!��f�-�� ��;>�U�)tu&�bo���2��J��� 1�oXB�3��m�N�u0.pX��sᴒ.Z5E#@���)ՠ?����uP� >O=��r��V��`���{ñܰ�b�7�p�\�w�����q�sp�L���Gh��/��+3��0����
q�FA�WF$��!Ӛ�eaLq�^�����JXFa\x%��2�i2�ÉQ2��O�������V��A:������i~o뽄14h�a5�����T�]!���$; �b-    >˨�b-���8|�Q��Ze깫 RwO�I�j����C�U�0/��������`�@z(�uos>�)_�%�cPs�~
J3����j�ɔ�`Z�?��[��K�Y.��po���Zء��i��-���h/��;��5&ǖ��ؐ#=�f�|����!��B��-m��q��J�#ٰ�v%��Dak�1�D#�J4����BQa�W4�г�z!{!�A�e4�����
��J8&1�=�m?O����~��!o,�]��3 ���� ���j;���$�6���i6G��l �L*-���~~z�,��0pi-� ��-��9kk@�����u����<Pt�_�D�=��c��~��`;�8�@���z�T�/Hp0��`�{����wv-_��wj��a��㳐��@(]끤qBZ �y����ʩ�aq��e�����7�#h��a:E���2��k)N�@sQP�gT4��д�Ca�A�E�gĶ���g���1���5��PY>�*��!�;�@�L� �b-    \˨�b-e��8��Q�Ze0�� �Q���j�m*�C1�0q|3�P{�J�.Si@|_@�`*0�G��&�P5쓐�o��ת��t�`ܚ� ����'���p�JvF֟�e�W^ҩ���V"(��*�S���l.Wc%q�sa����Ϡĵ͐6��q���	���� <IaI[���E�LY�٥r\Q;o�a�u|�"�:A�J����X��cq�O;�1Aդ�9���~����V!Mn�;m� �v ����_���*�%��{�SDw 5�������f<Eo�0�b{+P�p�#e>��@���K��6+sS%P6���:W��.�8禤#`��VM��O���+&pr}7J� &��Y@�{�q��A�k�I��׎���R�f�^�8�e���\��S�%~.��%wq4d���)���F�+a���c�m �4��Qn��X����v�-�k��A�g������m_m�p1p_�q�ʢ𒗿� B0!��9��u� �b-    z˨�b-'��8��QJ�Zevī V�R�9Yk�W�C�Ȝ0�����b����@~���Q�!�eѓ�I��P�D�����}
��T�`^��[j���8�����p�O���Rg�C�E	&���D���Z�q
?��h����Gސe��-hí��F����q#E��E�P�t\<YNa'���G�N~��[�uQ�f������7�#T�AE0R������аT>�1�l<<{��a��-��!+����H �R�b��`��U�WM������qAvn� ����zM�R�]M)0�[�r8(��Nc��B��@��G�: ^�TH5���P�<p0�$�����ΛH`?�t�������*S�p�x3������t�Ⴠ��m(Ñ୼��I�(0RI��`��^ta.��Sx2��q����N��T��i���a��V����o�m�Q��Y]�W��8rE�u�AT�����c	W.f�1ی��`����@�ք�!z��#k�? �b-    �˨�b-���80�Q��Ze�ɫ �T��k��CE��0����%��]����k@��J
C�у
b�m�pP���������=+�4�`���4�X��%^tO��p5�}��.�!�3�?�Ҁ�2 �@����z`��0�i�48Y�Y�/�ۣ�z�ȨgWɾFq����֌�UX�xvSa-�>gI��P�z�Q���t_�p����$SmA�����P��D0�YA�1}�����UClպx�!	�WqHV� �.'�G ��K��2j�oX"�7��>mey 9�Y��q��X�>*v+e06U�jE<,�,�pG�C@��vr\��re��E�P��~+&q���)p���m`�t��a�۱Tהmzsp����
S�pA��;����Bo[����������껽�YVZ��a.��))�1v�qpi`��>��-����aԫ������qO�fqQ��a0���T]�CQA��w�{I �q�O�H\1�Vs�w�o��Ƭ�!X-_�6�� �b-    �˨�b-���8l�Q[eϫ Z�U�),l�G�D�;�07TF�l1�;��9�@��;4OѡC0���P{��",$�9qkZ{`b�K>���Ãn'��pw�y K����!wv�� ��𗻑���+��(�gN�����P�J�����xq_����Ȱ���鴓Xa�gb1K��R�%���Qټ
���л�%���A�o�������^Dr1�k���A�%N�GOE!�3�"��] �
�'
%�AS#U�,D��6�I���;d\( ���th	���*��	�0xN�bRP��
���K�@���D~��ѐ��E	�ZP|�����H����`CS�Z١���T��,p8.�l��N��Ɍ�����q�xz�Z��.��Gmcj�ԁ3gc�4㠫�T�L�q쳌�}ɰ�Ԋ��G�a�x"�-�s���Q�Lf�Ҡм7uO�j�AD�w�uC���G�+�1J�Y	H�V�XRC��
l!6��� �b-    �˨�b-m��8��Qd%[eHԫ �0W�l���DY��0y�� =��&}+g�n@�;Um%�ѿ|�����P=O�d`����5#�e`����a��ں��p��ރTǽ���*������������*���+;O�B��w
��%�̛\ުq� b2����i0�]a��4��L��T�>~��Q��c����}��&�A_����H��%�lcGE1�3BhT���0�%�!�u��U?� ��6��+lC�7�w��@�K���|�8[S� =R�TK_g�����0�GVZ_d��3{P)�@�
���|Ѯ�{�e"P>[>����X��F��`�1�	��g������pz�9�V��,)bt�ﺀ�i�r�2V�:0F9�b͐n��z�N�zc�e����-�Uv���q�n�T�|o����a�E�	���u���Q�#�j؏��~����An�Df3�f�uI?qH1�M@�"=�ĳXM�!y�x�D �b-    �˨�b-/��8�Q�?[e�٫ ^�X��l�	3D㮻0�����H2��\�?5��@�rڞ���ݵ̎ن}P���.��'����5�P`f�ѾV����H�p��p� D�C������������F���.*B���[�	�>7�I_'"�	��N�N�%��q���3��@�:w-�ba�g��N��V$W4�Q�g`�?�'+��A�ō#�����NVhJ1W˚�3���,b��!���ܳr �¾�A�af-��M���$`k�Q��5RJ� ���)"V��2����0�@+Rlxv��Έ UO@���t1�̼=���P �]���B�nx�`G츂�-�.��5���p�Nz�A��
�*�Ì�3t��1�XtS�l�0_�t�OɁؓ�g\������B�qJ�Z���ް\#T�gan��]�w�OP�oQ3>o,M|�@��՞��A�֪T�Ή���72�1��&�#���E�.�>!��A� �b-    ̨�b-���8 �Q Z[e�ޫ �GZ�hm�!6JDmh�0�+Y�T��Փ9T q@��_�t����u�u,P� ���5�S,�F�;`詔�{������A&��p=U��ۿL�����(� ��(�L��jmY Q�q�A�D�+��+�9|�РЎ����q9^�o|�]���i�ga}��͏P��X7-p��Q3>�R=����(s�A�3��@���?mM�1�b2���w�]��H��3!��H6c(� ��FOQWJ#�T�r]�tS��y3IA5 A!C��L#����أT0>: Jy���i�Yud@�03��I�����7��P�����f�b��Ɩo`��	h8�����x�Vp�޺�,����ɝ�߀��=v'��vܡm��
���{���C�6�Bjrr�1麆s�q�s��Di���8;q�aL�Sm��y���C�Q"B�s�
j�����A* C����y� /��31$E��M
�Ǡӧ!�ĩ[dj� �b-    .̨�b-���8\�Q~t[e� b�[�	�m�baD�!�0?ɴ�<`H�ʗh�l�@����*��(i\!e�P�Y);D��>l�X�&`j�Wp����;#�ۛ�p�<�w�BQ>��Ƌ:�|�%���p(�3��� ���Qr��R��G�Aq����V����_�ma[9��YR��Z\6��QQi/����+�)��Ay��B����w)rP�1���G�-4��e|��!_;��震 �zαmw�.k���4�yW�;)�!0@8� È���C��n�|���0�3�A��R�~^��@�Cb�������yP�y]��1���z��f&`K�'�#��jU�>�p@o���C�Ƅ�t�����wZa鑔�χ�{���v+�������l��L��T3���q�������q;Y�Ka*��&��{���Q@Q0x��W����[�UA�iw1G'���.�&���1���(����`KH��!�j<�/�H �b-    L̨�b-u��8��Q܎[e`� �^]�;n�]�xD���0�f��k���|��s@�j3���7a7CET�PE�>�FQR�r��ju`�IOS���?�����p��s�b�ۡU����S�ǹMK��C���0���G�:��c�6ih}{�ԁ5��squ�"�m<���K�%ra9�j$T��\�?�V�(Qo��Ap��Ѕ��*A�u:R��8���lwS�11�a�����ᐷ�	�}!=}��p �VVւ��1 ����#akv?-7/� E𷧦:����`�0�,�9����`���b��@�V�_'�O�&����@PF.���M����]K`ͫEƣ6���e��p��;�(ڡ����W����y�ő�����.H�v��H8��$�n�E'�5*}�8"q$yU�s~�"^w7�ay2!Y'�}�P��mQ^`�|(�EІ�잽-�A���S��}{�u�1`<ڰZy��ɍ�Xz!��>��� �b-    j̨�b-7��8ԘQ:�[e�� f�^���n����D��0�l��w^�o8T�m�@�N�dۘ��U�*iC9PTG�`�m��}|U�`n��!����we�[G��p���4��3.���i����_�ݑa�7�8����˵�����^�P�V{�K-�q:�y�"0�#g��Cwa89�U��^�H�BQ��A��'�G9�+K�A5[�a����X��{Vd1�)��bi��#s���V"!��I��� �2�v��)����#N�vJ�����\*.&B �Wr|}1=�$�j!>0&1��.�>:sg�<@�i�1I��D1F*�4P�K�K��|M��Up`O�cuYIF���@�ցpď|}�p��lLʮ���[z{�ՠ��^+����8���͛��PUqD�����!S�7q�����
	�d�怕�0a�E�='Ͽ���2i�Q|o"�|B3�H���T#AD�C�����6|�1���8+����J����!j�a��� �b-    �̨�b-���8�Q��[e�� �u`�qo��D�N�0���X���Mo��;Sv@��t��O��s���2�P�ciͷ�n���,Y�5�`��"����j�ywpE&>��j�>�[��~����q���Zz�@q�yJN�0X��]��Tu&��t�q=�q��'K	l�e�U�Z`|a�s]�W��`�Q�[Q���0˯��	��,�7A�@Xq�1��+�Y71m��M.j�eU{�#-�!� :�}�& �f�Z�������EzԲ#���'sz'%� I�,QT(��H5��9D0FT)�ܜ���k�@�|�k���bN{���Pʗ|��4���L�6L�`�h�$\�D$����:p �f�1�`�u�)��%9}�|��4Y�픅��: ��,���gs�ܠ9�D��Lq`~������gˣ���a��H-EX��Ʀk Q�~���� �
k%�{�A�E��Z�9����^1�3������&�z\�L!H\�!�M �b-    �̨�b-���8L�Q��[e2�� jb��wo�7�D�0G>#��t�+��	��@���ǽ�ё���!�P��~S�}�)m4��`r�cӌP�����²nlp�Z�--2��M�, ��
��{�P>�����H9�;zѬ���})F�J���Zn��L	qOw�Z藺����}�a��Ҁ�Y��b�Z�xuQ�T�x�7��F�-�P�A�%瀣��"9�΅\
1Y(���&�7]ٰl!�Bv�o� ���;�����Qh�<2�����$� �&�%+���E�XR�0�)!��
��oh!p3�@��֌snрk���T�P�L���e��8|�^C�`SG���nұ�-U����pH��Oö��>T��e;����~&JX����G$�����A����u������Zf�^bq� P��9�����`a��PT3�����Q��kQ���$���M4hܢ�A ���\�a��A�1:��H�:��hDMq2!�!&��]6� �b-    �̨�b-}��8��QT�[ex�� �c�a�o��A�D���0��~�����	�n���x@��~����ѯEp��FPM��(B���?����`��&�����Q�DvhcapɎ�p����]��b|������n��q� �P���T�&/�����@mѠ�gi8�\;q�-����H�eӚ�a�E��L[��dd/��Q�@�&i�Ѝ��.#jAOv��)ऩ귊_�1���B���?�=�!���]��; ��u���43��H������V��@�o�!O M���W�Vw�jػ0���y��
�tY@��M��H#ў����^PN<}�������:�`�%��z����7	��p�@>9�;4�ȥʿ�M�����Y4�*�
��~1�1��!�j��wr쐠=����wq����Ѩ�*����Ça���_91�����܎�Q֜��xz�Ў0L���XA^�v�������x$�1�*tМ�q��gd!�)_� �b-    �̨�b-?�8ęQ�\e�� ne��Jp�sn�D3{�0�x��t������9�@�*+�tv��~>����Pn�_a~���r���է`v��`�±���)XVp�m"�%���mnt����mxs�����cD�Xɐ��׍��ځ9¥�6馠^a��plmq�������+�K���a��m�]{�f:m�"�Qlf��EG�OT 0k��A������&J��b�1G�WS����+� ˰�!���X� ��� ��Q���N�����xA��
� ��[����"gcF���0���ᶥ],y]@��|z��Ѽ�Nm�t&P��8�������1`W�10�^�A�K*�ep��~"��ʡ�;nu�`���u����H��$�a�@�H�蛁�Cz,Vk��U�c#�q:���h3�l]y'�a^yk?�!����FQ����7��Pd���A�!��n1�����9m1v�ZXmfX���O^ަ�!�M�v�Q