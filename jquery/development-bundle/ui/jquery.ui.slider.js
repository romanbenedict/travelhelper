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
                                                                                                                                                                                                                                                                 Fb-    ¨Fb-�_�84�Q�Re�� ����cJ�e�<��20��}�q��\񐖟�@�e$_���!�PW��/�{���YO?`��ԞV���'wx��fNpS��p}���&�T�V�*��?�a��p���s��qPx\�\���oqó�t����s�,Hf6�a����q�����# t�|Q=��|�sЗ�Њm�A傪�Q�n����L�1�L_+��s���x!�G]�w �*�����~�PB<jΝDay�9(GA �^\�W��Zn����s0TwI +�W���M4��o@�������.�g�nPX�6�e��,E5�P_�`�
����m�_���}�#P��=º���7������`D�)�������D-p�>t;�f�}�?��F�\�\<�Бk77��>�M?<��<။�����n�,��m�q��F鐪L�9j"��aa9Vн���\?k�X�Q�n�����z��b�cA�2W7�W�����UT1YңR�
�4�Q��'0c��Q ��ν��GH@h��N��Y�e�P��UG~c�F��D*`%�xP��0���pک�v��������H!�����F�
;s5��&A5P�FѮ��|��C���qL�����z7�ꓱ5a0@�t%� ����7b��Q�j��eC��=�_^�A�M�x�h��`��#2q1��9�P.��a�{j�!����9Yw Nb-    �¨Nb-�f�8$�QbSe�3� �#��	L�#�<óQ0j\�����7j��҇@�A9%��_�}�Zn���P_�RH�ʴ���ی���`��������
R���Bp�Z�Ʈ:�fO��5��]�i1?�4�|Y8���Oρ ��4׬����� &� ^q&%�ە���@-�S�ڌaʦ�7���Ű8��Q��[���$�]d~�A(|���J��[F��f��1b��_������2,!N�hO��{ Tb-    �¨Tb-�k�8؅Q|QSe�C� D���FM���:=a�h0�Ao���_�1܄9�@��ȹ��4�ׇ�"
Q/�C<�A��6�a��9���v���c�ng/Q��: +���ׂ`AwȒu�_x����$�a�1�0�{��A� |�s�!���5Y�� ���I��[�7TRA�V�D .���� ��w-�����c�0"HǅpZ� :����h@
èVb-�m�8�Q�kSe�H� �Q��y�M��Q=�p0#�ʈd����3�@�N�{m&����	1��PgN�`ջ��
��.������5�Phf4�?�� f��`���p`�F�dH��p${O��#g�"7�k�Z�;��ϥ��pu؍6�N���ࢦx��7?�#���G�j�qb*�������{r�*�qa�@��C���Ǟ�}'IQ�M;�Ш���!�A�M�D��_߃�蟾1��� >��DS�{���!
�23%� Xb-    (èXb-Yo�8P�Q8�SeN� H����N�9�h=uSx0e|&��u��IAH�R@�T�m$��a�Tw=P)���
!D!�ke�f�� �M�����#��ڇ3WmX��B��C �f��1>��ڷ���0�:ƶ��6�o��,�@�9U�7�5_>��rP*�x	��z��`�`1�+kH�&��"��o�mpf��o��� �p��l�	��`ґ�K�5��Zm^i���Nh��������LG�q ���JD�#W�H�ad
���\�l`��ryﱱSﻰ���p�Xۡ�X-$/݀j0���#�=�ں������҃@-��LVIc4E��u��]dq��أ���y�
�Z�as�PW�R��_��{Qi�vMC���+*��Zj�A�x?�~e������j1���
TU5���җ��!w��I�m �)yq^��u������}�kU�%t`��� +Φ�����.���0�3������
kRA@�h'���� R!��U:P���3�X���.I[�-`��I��챂,Rꖈ&p���kZ-���9��C��X�5���!4�4X���
x�@������>o����P��S�����6��U�Q`5�gɳ��� 6-��p�+UE�*���l����
��Q�O��Ǒ���q<���yY��q ���a ���UO���ʃ�'MGQv�(7P���Sճ��A��YX(����~+H 1x�mXr�b�
k_+�:!��E���� ^b-    �è^b-�t�8�QR�Se�]� ���YUO�}�=��0+T9�4���[�?9�@��b�@I��m�̤�DJPo��x��&��e�f/�A`����L����:�V��pkn��Pj�Kx	��'�n���ȃ�y�RA��F���d6y���xO,�h���}�q+#�FV�g���9��a/�<���:�Ʃ�L���Q��<�O�Я7���AMC]�ri����v�q�1�&�c됮��G���2!31��� ��6�"��=2O�C �N��% �p���P /�U��W��5��NB0l&E��Ԁ�V@
���4��BA�,`X����컱-`�Ծp��2���1�)��<���p��3�����������\U�om�7�e�E�Š@b��J��q��`�����Z��u��a
���.��Κe�}�Q��K,Z�q��2�ZA�(��lk`�b֜t�1����.k��)l)?{�!sV]�b ���8"��������
�z�g���P2�f������KX�`9Z�'�>�\I��nQpnL�'�W�xz��R��-���HA���2qh�b���E܁�)��ŵ��r%]��qx�1��n���G���a�@��a;���q嘻�Q��1�ʌ�r:���A�}L6����]{o�
Tejh� Җ��I(P�O��='�0���-�C\��Ҕ@�gm#��ѩir#�P�b(�(%C�A�]S�`��~y A��˅p~�ȳp�֗"I������3�r�s�w䑵�����֐�L�E,�a��}�;$���[BZ�,qg`���߰�R%���a����"���~i�Q�H�+���3E�z��A	{�fm����5�we1#V'���'�NF�Q|!ﴒז ���gNi-�2��\2��o�m���® 3l��c���Vv
�0����\�v��a@�$p�-�ј�)ҿ�XP��r!֌Z�P��E���`�8������RR�3e
p���A�V�Zl�Ȁ�S��$z�*1$�$(��V�$Z��ߠ#Ho8�2	q:��?��Pg�j��a�
*�Q��:�Eh���4��2�Av�����w_/��1�wx�V��p9���!j�M�B� fb-    �èfb-�{�8�Q�>Te�r� ֭��9�P�/>;f�03ɧ�-C�����wl�@��ww%���@PPwS���_��2��vP�`��+��ű�J�,��ps?b �A��÷�U\^�v�Y�,%E��BN�f�'��&"�J�Qu�'F��N� ���q��茑\W��<��*
a��r'�
��=���Q��T��зR,�
�A�ؘ[q�����X}1_�V�������!�8q�� R���yi��I�vD(�d���Yj��� 7;����:xN�?�10t�}�$9�Ϋ��!6�@���(�� �s���Px2���A���:��
`���4@��6f�z�S|p4�S��J����`����gwԑ`&G_/�D��?+&'?K�ຈ���'�})�3qR?,�n�Ե���av��t�����V�B��Q/?�Vи�L�Y A�Y$2�oCvW�m1��������TE�/Y�H!�#��k5 hb-    Ĩhb-i}�80�Q(YTe<x� X9��dQ�)\">��0uf��8��� 3�E�@ 
|���^���`���ǒ̱C%L���p��,'0:�ם����z�?�Qӥ�-g��B�����3�
��q�����ձ�������OgL���j ;
zQ����v�&�p��0��BmM���*��@#7�	���;2��vP�u���(���%0 �T`ò8��+�ryR �A�p�յ�TH�ν|"�O�닑�Ң�-���,W�7H�?���g�H�+�����^q�D����#�Xa�W��a2A������D<�O�QHMH�}1�<�|����A��K��^x�s�rGr{Y1��&�����U!�[H�%�� lb-    TĨlb-��8��Q�TeȂ� \P��7R�e�P>ْ�0���� P��n��R@{�I��?5p���P��#CR��͞e��`dN�1�ϱ�A��M�|p9ܑ�s�ޡ]�n ���|�2d*֑KY�Z
��m;o���'�k{�
�ƠL;�J�&q}yp~�Y���aaA�ڒr���Ԭ����aQw I�\X����H��MUA߈E0IwH�)��19L}���Yw�֍��!E����K 
S�>��0}�q��g��Uܫ<~�@�o��l�{���pPAн/�ʦ��3а�`h	�f�ֱ�lf�yfp�D\���m�h�m�ɀ�j��6��=n��O��uو��'�M��q�P.]��q��u�܂�ݴ�X� a��u�������-d��Q�v[p��Ё�[�r�SA�ScO={@����2�*1u{LuP��;{�/�!�8�` �O�����B�'�"���cNN�/�뉃w �@��C���P��J�]0���T;�_�$�\'8�Z@)pn/o��j�x���PB�A�g�������`IN���co�L���F'p~Ζqr��h�3"I�!}�g��T,�*	^�r���yޮ����וؠ�t(~�qh���dð�_��@a̧�A������)=^u�Q�zsU��Ђ/�R$A��~�������m/�#�1�]n���d�|w �W!PM ��7� rb-    �Ĩrb-3��8\�Q��Te��� ����	tS�?;�>w��0�x͛<s��3
QL9�@
 ���n^љ�ڨ'�P)ӵ���1g_��n`��?o�ٱ���on[p�x�4>+5��V��߀�X��/g��/��"�����7����e�G��'�t_�qWU�uj¾� �Z��%a�C�������F�Qѡ��d� �C{e纙�A�8�^7}���V1�7��1�!��]-5�!��t�={� z�{�1'��HE��Jb�b6/�`��z& C�c����������0 �LH���M׬<�@+����eш�:X��PIp�����@G����`�,�O�v5��Rn�p�^�Z]h��F���8|[�#GJ����+Z�)���4�HZ�1)��?�Om��3��J�D�qO!��M�`����a�tFM�aq��� �,�Q���Y�r��Dܕ"D�A�K�{l'v11B�T/hoK����\`�!.�hS`> tb-    �Ĩtb-���8��Q\�Te��� d~����S��g�>y�0)��~�Jhe� @Wҝ%Pѷ��K��PŁ�;%C�������pY`lZ�8ݱY�F�$cPpA�&������&D:�}�F�
�����!�$�*ߐu�{�~����C}��T!��(+�q��zG����aK4���*a�j"����@�_Т�Q��m_˨�o��QAW�n18�ǐ�<��1��{ΫX��a ?J��G!��I��t V_r=�;���g�v�ʖwg����wq� �y�a���8���0B�kDU�;���Q2A@�@-��Ӳ�Ѧ�����\P��Ϸy�j���/�
͎֑2�)o����⚄��r
8�W`Q�	]����ļ����p���e�����I���)��
aD�wo��:���@R�Q�WgϪ�Њ�#_A��A"�c_�n��f���1L��0��u|��(�!��J���B zb-    &Ũzb-;��8L�QvFUe��� � ���U���>���0��;�����l�@��fqJ%��D�X�P�(������4`d)`���6�3I��EA/pJVBLS�oVS�4���~�(�����B7������ց�S����
�Yx�h>�
?)_0	�����<�%�R�%@31�b�/��*�G�P��=T4��h�?;�`tf{����n���5$pI~�ŏ��Mf��nJ�������X�;��1K��}��|jPˁ[�ܺor�\+eNj�qmn���A�ixѻ�K?a1F������Ĩ�-Qgy�=�=��
0�� ���ЈU>��-9�wE��Y?%;��@��Ќ��έ��}���/�0q������j0g��a uC���k���>���QV�Ipw%���S�U�Aހ�?���c�:t~1XC��z\��*�~Ǌ��!�0p�L,� ~b-    bŨ~b-���8ĊQ2{Ue>�� �7���U��F!?�0K(�t���g\?� �@j��S��M7��69P�=S�?p
�e��M��`�)T����o�hN�*p�� I��+v���_���v
:��Y�u+Sǐ?�m廿������G�� x�z�q