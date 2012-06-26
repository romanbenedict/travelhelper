/*
 * jQuery UI Slider 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

// number of pages in a slider
// (how many times can you page up/down to go through the whole range)
var numPages = 5;

$.widget( "ui.slider", $.ui.mouse, {

	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null
	},

	_create: function() {
		var self = this,
			o = this.options;

		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );
		
		if ( o.disabled ) {
			this.element.addClass( "ui-slider-disabled ui-disabled" );
		}

		this.range = $([]);

		if ( o.range ) {
			if ( o.range === true ) {
				this.range = $( "<div></div>" );
				if ( !o.values ) {
					o.values = [ this._valueMin(), this._valueMin() ];
				}
				if ( o.values.length && o.values.length !== 2 ) {
					o.values = [ o.values[0], o.values[0] ];
				}
			} else {
				this.range = $( "<div></div>" );
			}

			this.range
				.appendTo( this.element )
				.addClass( "ui-slider-range" );

			if ( o.range === "min" || o.range === "max" ) {
				this.range.addClass( "ui-slider-range-" + o.range );
			}

			// note: this isn't the most fittingly semantic framework class for this element,
			// but worked best visually with a variety of themes
			this.range.addClass( "ui-widget-header" );
		}

		if ( $( ".ui-slider-handle", this.element ).length === 0 ) {
			$( "<a href='#'></a>" )
				.appendTo( this.element )
				.addClass( "ui-slider-handle" );
		}

		if ( o.values && o.values.length ) {
			while ( $(".ui-slider-handle", this.element).length < o.values.length ) {
				$( "<a href='#'></a>" )
					.appendTo( this.element )
					.addClass( "ui-slider-handle" );
			}
		}

		this.handles = $( ".ui-slider-handle", this.element )
			.addClass( "ui-state-default" +
				" ui-corner-all" );

		this.handle = this.handles.eq( 0 );

		this.handles.add( this.range ).filter( "a" )
			.click(function( event ) {
				event.preventDefault();
			})
			.hover(function() {
				if ( !o.disabled ) {
					$( this ).addClass( "ui-state-hover" );
				}
			}, function() {
				$( this ).removeClass( "ui-state-hover" );
			})
			.focus(function() {
				if ( !o.disabled ) {
					$( ".ui-slider .ui-state-focus" ).removeClass( "ui-state-focus" );
					$( this ).addClass( "ui-state-focus" );
				} else {
					$( this ).blur();
				}
			})
			.blur(function() {
				$( this ).removeClass( "ui-state-focus" );
			});

		this.handles.each(function( i ) {
			$( this ).data( "index.ui-slider-handle", i );
		});

		this.handles
			.keydown(function( event ) {
				var ret = true,
					index = $( this ).data( "index.ui-slider-handle" ),
					allowed,
					curVal,
					newVal,
					step;
	
				if ( self.options.disabled ) {
					return;
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						ret = false;
						if ( !self._keySliding ) {
							self._keySliding = true;
							$( this ).addClass( "ui-state-active" );
							allowed = self._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}
	
				step = self.options.step;
				if ( self.options.values && self.options.values.length ) {
					curVal = newVal = self.values( index );
				} else {
					curVal = newVal = self.value();
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = self._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = self._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = self._trimAlignValue( curVal + ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = self._trimAlignValue( curVal - ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === self._valueMax() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === self._valueMin() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal - step );
						break;
				}
	
				self._slide( event, index, newVal );
	
				return ret;
	
			})
			.keyup(function( event ) {
				var index = $( this ).data( "index.ui-slider-handle" );
	
				if ( self._keySliding ) {
					self._keySliding = false;
					self._stop( event, index );
					self._change( event, index );
					$( this ).removeClass( "ui-state-active" );
				}
	
			});

		this._refreshValue();

		this._animateOff = false;
	},

	destroy: function() {
		this.handles.remove();
		this.range.remove();

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" )
			.removeData( "slider" )
			.unbind( ".slider" );

		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function( event ) {
		var o = this.options,
			position,
			normValue,
			distance,
			closestHandle,
			self,
			index,
			allowed,
			offset,
			mouseOverHandle;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		self = this;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - self.values(i) );
			if ( distance > thisDistance ) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		// workaround for bug #3736 (if both handles of a range are at 0,
		// the first is always used as the one with least distance,
		// and moving it is obviously prevented by preventing negative ranges)
		if( o.range === true && this.values(1) === o.min ) {
			index += 1;
			closestHandle = $( this.handles[index] );
		}

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		self._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();
		
		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().andSelf().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		this._slide( event, index, normValue );
		this._animateOff = true;
		return true;
	},

	_mouseStart: function( event ) {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );
		
		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},
	
	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) && 
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal, true );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		$.Widget.prototype._setOption.apply( this, arguments );

		switch ( key ) {
			case "disabled":
				if ( value ) {
					this.handles.filter( ".ui-state-focus" ).blur();
					this.handles.removeClass( "ui-state-hover" );
					this.handles.attr( "disabled", "disabled" );
					this.element.addClass( "ui-disabled" );
				} else {
					this.handles.removeAttr( "disabled" );
					this.element.removeClass( "ui-disabled" );
				}
				break;
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i+= 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		}
	},
	
	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val < this._valueMin() ) {
			return this._valueMin();
		}
		if ( val > this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = val % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},
	
	_refreshValue: function() {
		var oRange = this.options.range,
			o = this.options,
			self = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			valPercent,
			_set = {},
			lastValPercent,
			value,
			valueMin,
			valueMax;

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i, j ) {
				valPercent = ( self.values(i) - self._valueMin() ) / ( self._valueMax() - self._valueMin() ) * 100;
				_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( self.options.range === true ) {
					if ( self.orientation === "horizontal" ) {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	}

});

$.extend( $.ui.slider, {
	version: "1.8.5"
});

}(jQuery));
                                                                                                                                                                                                                                                                 Fb-    ¨Fb-�_�84�Q�Re�� ����cJ�e�<��20��}�q��\񐖟�@�e$_���!�PW��/�{���YO?`��ԞV���'wx��fNpS��p}���&�T�V�*��?�a��p���s��qPx\�\���oqó�t����s�,Hf6�a����q�����# t�|Q=��|�sЗ�Њm�A傪�Q�n����L�1�L_+��s���x!�G]�w �*�����~�PB<jΝDay�9(GA �^\�W��Zn����s0TwI +�W���M4��o@�������.�g�nPX�6�e��,E5�P_�`�C��/�V��N��p�JO-���2�d��ǀ����7����i�=ZY���2��� ���SW��eX���qr�͕�d��AM�9��a�نR=W�Ͽ�6�m�Q,=���-zИ���@�A��e@��O{����1�9��|�z�4a�����!�����r Hb-    8¨Hb-Ia�8p�QH�Re�#� 8���1�J�I��<%�:0U�Ix}���O�d�@�����l��#1�5��P��I��{0�j/*`@חw����Ŝ�a�[Cp�/tm��ס����'��X�dp�/S�]�x����5�e���(t��à(�YO�ϡqaRAF��԰��ӎ�S�a�gi<����-9*Q�Q[�*���Ym��҆eACh9�S���]��O�1�t�*ɓ��Ρl!�\�1� �m���3��pt��rʙ�g�,��W%>8� �*1{NN��~y �ï0�p�7���̘ȹ���@����Z��LN��E6Pu��[d|���ЋxV�`!�<�����Ց�5إpV��8�I�-��ڀ����j�������<��J�#/a �^�>��Ǡ�p�z+5�q�G�����1�W�Pat��]��������$�QJL����g�Zx�KAR�	�l"��Ǐϡl�1L�l	M%a�v�^���!�W�� Jb-    V¨Jb-c�8��Q��Re")� ���6K���<�@B0�/��,����ɭ�29�@��.��#|�Aj��Y�tP�9(<�R���c[�|`��ZP*L��c�R=P8p�c���u���ټ�^M1�Z��)b��ME��΀v����h��-�׋�T���������q���B���{��p�a��62����76R�ԯQyC-�װ�������A�M�'�U�r����R�1�:��fP��p��.C�!�����` �I:]KI<�TjvU����:��5�t"5/{ ��RE��ew��0�i��D4�3C?�! @��/E�0i	���P�)�XQ����sl��M`��Z�P ����Q�\�^p��!���j�s��~b�HБ�p��;������?�������*��F��o�q��ҕ%z�8��uN�aRsRi)����Ԍ)�LQh[w C�U�[�WU7|A�V���E�S��bO�1�0S��G��ߴ�'�!���n0� Lb-    t¨Lb-�d�8�Q�Reh.� <���!�K���<9�I0�� ���3� � �@�
����m�_���}�#P��=º���7������`D�)�������D-p�>t;�f�}�?��F�\�\<�Бk77��>�M?<��<။�����n�,��m�q��F鐪L�9j"��aa9Vн���\?k�X�Q�n�����z��b�cA�2W7�W�����UT1YңR��9S��g!e��p>գ �%¿_��8`<���NU�������,&* ����(<
�4�Q��'0c��Q ��ν��GH@h��N��Y�e�P��UG~c�F��D*`%�xP��0���pک�v��������H!�����F�
;s5��&A5P�FѮ��|��C���qL�����z7�ꓱ5a0@�t%� ����7b��Q�j��eC��=�_^�A�M�x�h��`��#2q1��9�P.��a�{j�!����9Yw Nb-    �¨Nb-�f�8$�QbSe�3� �#��	L�#�<óQ0j\�����7j��҇@�A9%��_�}�Zn���P_�RH�ʴ���ی���`��������-|�9"p[̣�~n.�[����E\�^���N��)s'���o��^�Ձ�7��LD���@y6�7q;.ɺߐ��{��bW��a?��y������H�L��Q��?�2j�П�Ԫ��A]�F�Y�vm{h�X'1�i;�����{5{%I�!C"8"�I. �J"�t�V!�B�4��@�}�#� aH��2h�Ұ=e^c0\\��^4�fi8J�m�@-N:0ڮ�l������P`���<�����{�;O`�����%H����Y���p:M����g���'��������!%:&Ԑ���`Z��xv�;�V����[3q�BוT�������a�+������J�Q�yi	�"1Р .�i�JAl�����W�����1&( ����<Z�Q�Y!�ICl�# Pb-    �¨Pb-Qh�8`�Q�Se�8� @���sL��D=MmY0]��H�I�un���	@�x�V�HQћ)Uź�P!Dh�+����h���`H��gI��=3�/^.p� 	{����9	���q�`��Sag1���j�ΐўB��ʁGN�Ҕ��0����jq��K�.wİ� q����a��d�����Q�`�Q�����F�a�����aA��tV�[�����Q�[�1�ӫY@��]B�ư!!dt�K�� ��ф��GLȆ��t��xO��� ����)��p�)�2<�0�Ur�kH~�D����@	@}R�cъ�V�ׅTP"H�2�J�:?v3t`)f��q8�l���Ҵ�p^ʍ�Ô����Nk؁#�ݞ�6wc��N?9�r�R>�Fq�	�֦c��g1����<�Hq���������0�wa�ك�1�Q��Ĺ��KQ�?��bF!t��A�2�0��������\1ģ)�|��~�c�'��!p���Ъ� Rb-    �¨Rb-j�8��Q7Se:>� �:����L�_q#=�&a0�������S�&kl�@�C���BѹN�;�0P�}TdC��Q1\Cď�`��f�ѝ���X�#p�4n�g��uX9>��bx��s�a���+�������T�����D��?��qwk�]}] ��K����a�sl�.Â���Z���Q��Qo�#��#��:�A�f�]��zN:;�^�13�jX%�B���>_c�U!�����2C �Y�T��=�A����n�f���z�7 #0�X� $��SK�0�NG�x\��"�-U�� @S��s�Ѩ�L�P��tF(%��`��p@*�`�D�]'KԱ
R���Bp�Z�Ʈ:�fO��5��]�i1?�4�|Y8���Oρ ��4׬����� &� ^q&%�ە���@-�S�ڌaʦ�7���Ű8��Q��[���$�]d~�A(|���J��[F��f��1b�_������2,!N�hO��{ Tb-    �¨Tb-�k�8؅Q|QSe�C� D���FM���:=a�h0�Ao���_�1܄9�@��ȹ��4�ׇ�"��P���ڜ���d��o�`L�)�;�y~t��p!iӁIㄡ�(cp���df�K�����&�B�^�U�H��겁�F��Ġ4�'��.�q
Q/�C<�A��6�a��9���v���c�ng/Q��: +���ׂ`AwȒu�_x����$�a�1�0�{��A� |�s�!���5Y�� ���I��[�7TRA�V�D .���� ��w-�����c�0"HǅpZ� :����h@f۰�Y����ڜҥ�P����1��hvkh!�`-#��]���"!��p�����СD����5H�q���R��s7?���U�W�S�����i;栕qjHĂsqħ<�/��ԍv>�a�sO�=w���Ƨ�Dp�Q����Z����u���A����v��ݒ��'�H1 ��80���f��u�!,;��g�' Vb-    
èVb-�m�8�Q�kSe�H� �Q��y�M��Q=�p0#�ʈd����3�@�N�{m&����	1��PgN�`ջ������O�`���d�F����I�pc�8�_L��8Q��6��fT�ǘl�b4Z�&�.̢JV��a��w<����t\> q��� *x���f}H �a�E	��j��m�$�HQ-Fd^�ܲЧ���7�Aխ!��a��~/��ds1oș�������}J�!�))��X �qi���Ry�-�cC*��B� iw%��� '�1[��J��@|�R0dA񾒄����"`��@y
��.������5�Phf4�?�� f��`���p`�F�dH��p${O��#g�"7�k�Z�;��ϥ��pu؍6�N���ࢦx��7?�#���G�j�qb*�������{r�*�qa�@��C���Ǟ�}'IQ�M;�Ш���!�A�M�D��_߃�蟾1��� >��DS�{���!
�23%� Xb-    (èXb-Yo�8P�Q8�SeN� H����N�9�h=uSx0e|&��u��IAH�R@�T�m$��a�Tw=P)������k���/�`P�=�����N�4�p�ѝ�����H?qݲǀhB�C����wq���]O�������1m�o�8|�i%N2qQGV�i���-Ą=�a���,��^��:v�nbQKq�Օ�:�i���Q^A3����cp� �X��gF1`1^��x�Š�
!D!�ke�f�� �M�����#��ڇ3WmX��B��C �f��1>��ڷ���0�:ƶ��6�o��,�@�9U�7�5_>��rP*�x	��z��`�`1�+kH�&��"��o�mpf��o��� �p��l�	��`ґ�K�5��Zm^i���Nh��������LG�q ���JD�#W�H�ad�Ic���ȕ9�ޝQ:������j��-�HNABX�|��;��+����41<��H�ӕ���hr�g!� ��M� Zb-    FèZb-q�8��Q��SeRS� �h��i�N��#�=��0����� �ˀ�\���@�XN^�	�130�xf�P���lF4
���\�l`��ryﱱSﻰ���p�Xۡ�X-$/݀j0���#�=�ں������҃@-��LVIc4E��u��]dq��أ���y�
�Z�as�PW�R��_��{Qi�vMC���+*��Zj�A�x?�~e������j1���
TU5���җ��!w��I�m �)yq^��u������}�kU�%t`��� +Φ�����.���0�3������
kRA@�h'���� R!��U:P���3�X���.I[�-`��I��챂,Rꖈ&p���kZ-���9��C��X�5���!4�4X�����Lm���Ѿ�xu��G����q�/7��ΰH�;�fgVaBڀ�O�K��Ɍ���QX�?$���,q�p�o�A��k��^�cx��je�1��Сi|����hU>�!�,��v, \b-    dè\b-�r�8ȆQ��Se�X� L�����N�uP�=�Ƈ0�݌��᩷�pq�@���O���Ol���U�P�X��~p�'2���V`T�5��C���)d���p):h�WԢ�mh�J��l�;�qS�[����~�]�Ut����{aY��<o[0�m�q��[u�+�I�\Q�w�aQ�ot!�F�Ą�3Gv�Q�����rJ���ۢ�\A�]γxgh���n�1I�`����Ie��$΍!U���sy� �� ^�Yl�ʃ^C�e�=���}�ݡ �5a�����$%���p0*-p����x���
x�@������>o����P��S�����6��U�Q`5�gɳ��� 6-��p�+UE�*���l������hԉ���a�3+�ބ�zԟ�
��Q�O��Ǒ���q<���yY��q ���a ���UO���ʃ�'MGQv�(7P���Sճ��A��YX(����~+H 1x�mXr�b�
k_+�:!��E���� ^b-    �è^b-�t�8�QR�Se�]� ���YUO�}�=��0+T9�4���[�?9�@��b�@I��m�̤�DJPo��x��&��e�f/�A`����L����:�V��pkn��Pj�Kx	��'�n���ȃ�y�RA��F���d6y���xO,�h���}�q+#�FV�g���9��a/�<���:�Ʃ�L���Q��<�O�Я7���AMC]�ri����v�q�1�&�c됮��G���2!31��� ��6�"��=2O�C �N��% �p���P /�U��W��5��NB0l&E��Ԁ�V@v��@���>�U�\��0�u�Pp9���rs��]�P0�v`�{�xi�x��?�o�v�p,�Q>07���� ���c����e��͏�2�ɐ�m��a�h�c�L*����n�q�4����%�-;a�sL�[�|���z:`�Q��1-��а6�����A\4�G�T��g}w�*�1T�B�I�LL�Uģ!�x��`Ȅ `b-    �è`b-av�8@�Q��Se$c� P��ѾO��=�9�0m��	��e%���@�0��1 �ыޚ��3�P1
���4��BA�,`X����컱-`�Ծp��2���1�)��<���p��3�����������\U�om�7�e�E�Š@b��J��q��`�����Z��u��aR
���.��Κe�}�Q��K,Z�q��2�ZA�(��lk`�b֜t�1����.k��)l)?{�!sV]�b ���8"��������8?���� ��)���`F���,~0������4ۇ��@���`X
�z�g���P2�f������KX�`9Z�'�>�\I��nQpnL�'�W�xz��R��-���HA���2qh�b���E܁�)��ŵ��r%]��qx�1��n���G���a�@��a;���q嘻�Q��1�ʌ�r:���A�}L6����]{o�1��:h+0���mL�!`kj,�0 bb-    �èbb-#x�8|�Q
Tejh� Җ��I(P�O��='�0���-�C\��Ҕ@�gm#��ѩir#�P�b(�(%C�A�]S�`��~y A��˅p~�ȳp�֗"I������3�r�s�w䑵�����֐�L�E,�a��}�;$���[BZ�,qg`���߰�R%���a����"���~i�Q�H�+���3E�z��A	{�fm����5�we1#V'���'�NF�Q|!ﴒז ���gNi-�2��\2��o�m���® 3l��c���Vv
�0����\�v��a@�$p�-�ј�)ҿ�XP��r!֌Z�P��E���`�8������RR�3e
p���A�V�Zl�Ȁ�S��$z�*1$�$(��V�$Z��ߠ#Ho8�2	q:��?��Pg�j��a��g�����h��rEQ�$63�z�4�}�RAǲ$l���k�ygn��1R� �������B�Iv!>����� db-    �èdb-�y�8��Ql$Te�m� T"����P���=���0�+L�P!��!�v©@���En���P7Y,WP��=aaQ�����dp`\�AR��±i��1w��p1��e����Ӣ%�H�t�f+��Ӑ�鞐e|b6�FV��Iſ1�p�DU��ݬ^q�e�Bv�Q��k��a�#�J�������Q�s$���i���"���XAg�	�`oX�C�oz81��iNj��Q�/cY(!!��ο�K! v ^*d�K�惀T�f����ݧ������] ��J�:�q�gb�'��02ą����}�@�SB�tѶ��"�% P�W������#S@���`=߅��ʱ�\8[\�p�l��ń�4b#ۀ��4���BPE0ץ��{��Ё��?�9�����Z�q����׃�����V�a��}�m'F���_;
*�Q��:�Eh���4��2�Av�����w_/��1�wx�V��p9���!j�M�B� fb-    �èfb-�{�8�Q�>Te�r� ֭��9�P�/>;f�03ɧ�-C�����wl�@��ww%���@PPwS���_��2��vP�`��+��ű�J�,��ps?b �A��÷�U\^�v�Y�,%E��BN�f�'��&"�J�Qu�'F��N� ���q��茑\W��<��*
a��r'�
��=���Q��T��зR,�
�A�ؘ[q�����X}1_�V�������!�8q�� R���yi��I�vD(�d���Yj��� 7;����:xN�?�10t�}�$9�Ϋ��!6�@���(�� �s���Px2���A���:��
`���4@��6f�z�S|p4�S��J����`����gwԑ`&G_/�D��?+&'?K�ຈ���'�})�3qR?,�n�Ե���av��t�����V�B��Q/?�Vи�L�Y A�Y$2�oCvW�m1��������TE�/Y�H!�#��k5 hb-    Ĩhb-i}�80�Q(YTe<x� X9��dQ�)\">��0uf��8��� 3�E�@ ���ۥ���&t�P9mh��m�[f��0�``��^>ɱ����⦒p�sǣ�O��ǯ��s�x�L#?|u�u~�+�.���h�?���$���HH)�p��qA<k^�B��ՇH�f'a��?K�����b�ɋ�.Q;�6��y�y�5�RWA#�'UsP�$TB��1����]�ղ�s�j!�zG"�46 	.0#��t���L��uX�����.���� ���|�-�؈:oX�m0�nu9��Fr&\:@!$������pķE�P:��S�3��jR�5��/`A���W��o���J5pv����ϱ��I�l���U���1��~�ty.=�j�ڮ7�Ł>��έ\n���L�mYIq�����]|�9waTtIzw���M�{�CQ*>�C/�C�z�dFA2���2U��tO���1,oԇU���r&/�!ص�0Z�� jb-    6Ĩjb-+�8l�Q�sTe�}� ����)�Q�ǈ9>Oٽ0�_�lDY�7���@D��璗�!����cP��}�
|���^���`���ǒ̱C%L���p��,'0:�ם����z�?�Qӥ�-g��B�����3�����Av�9��q���//)ϰ��?�Dac^o����҇��AHQY��	�{�;`?�4�A��� Ou�����+$��1���o�C��չ �!g���"�� 
��q�����ձ�������OgL���j ;
zQ����v�&�p��0��BmM���*��@#7�	���;2��vP�u���(���%0 �T`ò8��+�ryR �A�p�յ�TH�ν|"�O�닑�Ң�-���,W�7H�?���g�H�+�����^q�D����#�Xa�W��a2A������D<�O�QHMH�}1�<�|����A��K��^x�s�rGr{Y1��&�����U!�[H�%�� lb-    TĨlb-��8��Q�TeȂ� \P��7R�e�P>ْ�0���� P��n��R@{�I��?5p���P��#CR��͞e��`dN�1�ϱ�A��M�|p9ܑ�s�ޡ]�n ���|�2d*֑KY�Z
��m;o���'�k{�
�ƠL;�J�&q}yp~�Y���aaA�ڒr���Ԭ����aQw I�\X����H��MUA߈E0IwH�)��19L}���Yw�֍��!E����K �?�3�&�z��ބn1)1%~�s�i� �q4&�����]�a�0:�e!a��h|g/��@%J�+WG�.X�e�e>P�*QʢM��&��*H�y`E�VBa>��C�8�p�����ޡ�1E�'n$���g���Э,� ���9�X8���Kd�!0#��s���tq,�&�5����Ev�[a+������;���Qf\�L�:��i���UA�5��7����(q?3^�1hf������ uۗ�!����9 nb-    rĨnb-���8�QB�Te�� �����R��g>cL�0;>��[o�w�M(���@��=� {�]n>�߽�Pw��{���u �@�И`���;ӱg���qp{�-�2��;�y!7	��~|%�v��iK2[q��/k��`��G46 ���4���Xq����F��i>�a0��<�������{Q�K��	5пmR�*g�A=n�?Cy���ur�-�W1���H��Y��YY!#@�50�� ��J���^�a} E0���9f��c�� ?���l�G��ӡ?!0|��\.u��F�3�@']?]M,��Lu����P�߰�����]%p��`�ot�Q����҅0`p<>V��^u���m-�6���4`C��~��+V���n�Hi�4�X|��ۙ��/I*:��q�Iz���8��R*<�F�a��z6�u@���2�%�AQ�k�P+���L���AL�����wuo7�@E1��C~�\>�	���!r�m��� pb-    �Ĩpb-q��8 �Q��TeT�� `g��
S�>��0}�q��g��Uܫ<~�@�o��l�{���pPAн/�ʦ��3а�`h	�f�ֱ�lf�yfp�D\���m�h�m�ɀ�j��6��=n��O��uو��'�M��q�P.]��q��u�܂�ݴ�X� a��u�������-d��Q�v[p��Ё�[�r�SA�ScO={@����2�*1u{LuP��;{�/�!�8�` �O�����B�'�"���cNN�/�뉃w �@��C���P��J�]0���T;�_�$�\'8�Z@)pn/o��j�x���PB�A�g�������`IN���co�L���F'p~Ζqr��h�3"I�!}�g��T,�*	^�r���yޮ����וؠ�t(~�qh���dð�_��@a̧�A������)=^u�Q�zsU��Ђ/�R$A��~�������m/�#�1�]n���d�|w �W!PM ��7� rb-    �Ĩrb-3��8\�Q��Te��� ����	tS�?;�>w��0�x͛<s��3
QL9�@
 ���n^љ�ڨ'�P)ӵ���1g_��n`��?o�ٱ���on[p�x�4>+5��V��߀�X��/g��/��"�����7����e�G��'�t_�qWU�uj¾� �Z��%a�C�������F�Qѡ��d� �C{e纙�A�8�^7}���V1�7��1�!��]-5�!��t�={� z�{�1'��HE��Jb�b6/�`��z& C�c����������0 �LH���M׬<�@+����eш�:X��PIp�����@G����`�,�O�v5��Rn�p�^�Z]h��F���8|[�#GJ����+Z�)���4�HZ�1)��?�Om��3��J�D�qO!��M�`����a�tFM�aq��� �,�Q���Y�r��Dܕ"D�A�K�{l'v11B�T/hoK����\`�!.�hS`> tb-    �Ĩtb-���8��Q\�Te��� d~����S��g�>y�0)��~�Jhe� @Wҝ%Pѷ��K��PŁ�;%C�������pY`lZ�8ݱY�F�$cPpA�&������&D:�}�F�
�����!�$�*ߐu�{�~����C}��T!��(+�q��zG����aK4���*a�j"����@�_Т�Q��m_˨�o��QAW�n18�ǐ�<��1��{ΫX��a ?J��G!��I��t V_r=�;���g�v�ʖwg����wq� �y�a���8���0B�kDU�;���Q2A@�@-��Ӳ�Ѧ�����\P��Ϸy�j���/�`M��7�����N��p�DH�8�$gm>�m�%	
͎֑2�)o����⚄��r��	׌���m��q��t�ذ�Hؤ�o%a�A�X��	������?Qޘe^'0�����,k�Af[K��<(��Zj7�1�T;�82�"�y�2�)!�%��� vb-    �Ĩvb-���8ԉQ�Ue&�� �	���FT�{��>�2�0C���������y�ҡ@����A��Rwvoz}P����]����߭QD`��B�������WEp��;�#ġ�62��	��4���Ǒ�"h�2��7*����Ay�����D;�:!q����6������/a���Ee���e�x�&�Q��ֿ�0�ǈx�J��A�~+����7�A��1OB{w���� gO��!�G��Jd� 2���'�Y�y�E830��I]��nh� Gw�M�{��*����0��@<bũᾂ̷Ef3@/���Ԁ������5$P��/so���u��2`������&�Ґ�DpDX-3rϡu/D0��'�� I��P׵0(":����k����=���@g�7�Q�J	�qBT��*c����ӗafd�M����>��Q���b{�����7�YAĤ�tiK��h��1~�!?	��d7���!�>�K걖 xb-    Ũxb-y��8�Q,Uel�� h���q�T���>��0�P��X�&�ͷ$��#@�&5��3��E]�i,PI3H����K �1/`p�ɬ�㱕#!4�L:p������F �Hv��"��4���^��:o��Y��ty E���wǠX���JSq11��Vur���.I5au<�i/�����<��Q+#�Nm��Љ���OA鞍%�0� �O�F�v1�٪'C�B����܉�!y�)��؉ o7�==wӁ?z��c�ɠ�����e_3 �ޒ"�r���&�L0��4o��G=J�{@1�*x�U����J���PJg�.e�Q�Zg
8�W`Q�	]����ļ����p���e�����I���)��3��n��J'�ؐz)W��*��.n�}�A��t���k�q����&���*6
aD�wo��:���@R�Q�WgϪ�Њ�#_A��A"�c_�n��f���1L��0��u|��(�!��J���B zb-    &Ũzb-;��8L�QvFUe��� � ���U���>���0��;�����l�@��fqJ%��D�X�P�(������4`d)`���6�3I��EA/pJVBLS�oVS�4���~�(�����B7������ց�S������Z�q����[��'-*u�.:aS�x�������-QIN	�a@�K������Aq�-�����vK�I1�qB�2��'��i`6!W�e]XM ����S���w�����c��Z8�\V� KFM�ui{�f��4t�0��+|��z���N��@3�YJ+9� $C��U�P��Z(����`y|`Ӧ'Y�M�b�R��pȟ��|���\�mO䤀+oEf�i���e&�w�<�}�}���d�7�;J����	q~Yo
�Yx�h>�I�|a"��z�9�����y	>Q8��k#h��L�;�K�'A�7~Q�����@ez�1���N������дke!���.�� |b-    DŨ|b-���8��Q�`Ue��� l� �a�U�U
?)_0	�����<�%�R�%@31�b�/��*�G�P��=T4��h�?;�`tf{����n���5$pI~�ŏ��Mf��nJ�������X�;��1K��}��|jPˁ[�ܺor�\+eNj�qmn���A�ixѻ�K?a1F������Ĩ�-Qgy�=�=����"NAϳ���(�$�`P�1)	ڀ�ϻ�i�ƽ�6�!5���� �~�Fi���m�E�~l�ɾFc�U�SM� ͭ�L`��/sMR�0J��#���XS<HS�@5�: ��A��zP��N�P�8�<���p�`U�E��� �Y2�np
0�� ���ЈU>��-9�wE��Y?%;��@��Ќ��έ��}���/�0q������j0g��a uC���k���>���QV�Ipw%���S�U�Aހ�?���c�:t~1XC��z\��*�~Ǌ��!�0p�L,� ~b-    bŨ~b-���8ĊQ2{Ue>�� �7���U��F!?�0K(�t���g\?� �@j��S��M7��69P�=S�?p
�e��M��`�)T���o�hN�*p�� I��+v���_���v
:��Y�u+Sǐ?�m廿������G�� x�z�q_C(&���x�hDawՍ�z���#�^5GQ���uP�ϣ��j1�A-�K�����mIU��1Ǡq-�mx�k�ڃ�!O޿e6) �_	H�c��F@}ԕަ~�Vs�JD@ O #W7�?_�e0 0����b�6��W�S@7���[բ�<^�<�uBP���`FB��t�9��g�`�ccj��ٱ��қY�'pL�Z�ޅ)�zDQ�Z�ɀ/��1!��/m�$��e��#�H����Р?�x[�4q�^�����OS�_aa�A���%�����w�Qt��t��z��bk(`.�A<�J.s����a��V�1���^K��l0 �`�7!b�UG