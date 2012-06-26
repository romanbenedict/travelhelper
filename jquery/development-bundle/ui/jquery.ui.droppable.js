/*
 * jQuery UI Droppable 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.mouse.js
 *	jquery.ui.draggable.js
 */
(function( $, undefined ) {

$.widget("ui.droppable", {
	widgetEventPrefix: "drop",
	options: {
		accept: '*',
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: 'default',
		tolerance: 'intersect'
	},
	_create: function() {

		var o = this.options, accept = o.accept;
		this.isover = 0; this.isout = 1;

		this.accept = $.isFunction(accept) ? accept : function(d) {
			return d.is(accept);
		};

		//Store the droppable's proportions
		this.proportions = { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight };

		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[o.scope] = $.ui.ddmanager.droppables[o.scope] || [];
		$.ui.ddmanager.droppables[o.scope].push(this);

		(o.addClasses && this.element.addClass("ui-droppable"));

	},

	destroy: function() {
		var drop = $.ui.ddmanager.droppables[this.options.scope];
		for ( var i = 0; i < drop.length; i++ )
			if ( drop[i] == this )
				drop.splice(i, 1);

		this.element
			.removeClass("ui-droppable ui-droppable-disabled")
			.removeData("droppable")
			.unbind(".droppable");

		return this;
	},

	_setOption: function(key, value) {

		if(key == 'accept') {
			this.accept = $.isFunction(value) ? value : function(d) {
				return d.is(value);
			};
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	},

	_activate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) this.element.addClass(this.options.activeClass);
		(draggable && this._trigger('activate', event, this.ui(draggable)));
	},

	_deactivate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) this.element.removeClass(this.options.activeClass);
		(draggable && this._trigger('deactivate', event, this.ui(draggable)));
	},

	_over: function(event) {

		var draggable = $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) this.element.addClass(this.options.hoverClass);
			this._trigger('over', event, this.ui(draggable));
		}

	},

	_out: function(event) {

		var draggable = $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
			this._trigger('out', event, this.ui(draggable));
		}

	},

	_drop: function(event,custom) {

		var draggable = custom || $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return false; // Bail if draggable and droppable are same element

		var childrenIntersection = false;
		this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function() {
			var inst = $.data(this, 'droppable');
			if(
				inst.options.greedy
				&& !inst.options.disabled
				&& inst.options.scope == draggable.options.scope
				&& inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element))
				&& $.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)
			) { childrenIntersection = true; return false; }
		});
		if(childrenIntersection) return false;

		if(this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.activeClass) this.element.removeClass(this.options.activeClass);
			if(this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
			this._trigger('drop', event, this.ui(draggable));
			return this.element;
		}

		return false;

	},

	ui: function(c) {
		return {
			draggable: (c.currentItem || c.element),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	}

});

$.extend($.ui.droppable, {
	version: "1.8.5"
});

$.ui.intersect = function(draggable, droppable, toleranceMode) {

	if (!droppable.offset) return false;

	var x1 = (draggable.positionAbs || draggable.position.absolute).left, x2 = x1 + draggable.helperProportions.width,
		y1 = (draggable.positionAbs || draggable.position.absolute).top, y2 = y1 + draggable.helperProportions.height;
	var l = droppable.offset.left, r = l + droppable.proportions.width,
		t = droppable.offset.top, b = t + droppable.proportions.height;

	switch (toleranceMode) {
		case 'fit':
			return (l <= x1 && x2 <= r
				&& t <= y1 && y2 <= b);
			break;
		case 'intersect':
			return (l < x1 + (draggable.helperProportions.width / 2) // Right Half
				&& x2 - (draggable.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (draggable.helperProportions.height / 2) // Bottom Half
				&& y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
			break;
		case 'pointer':
			var draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left),
				draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top),
				isOver = $.ui.isOver(draggableTop, draggableLeft, t, l, droppable.proportions.height, droppable.proportions.width);
			return isOver;
			break;
		case 'touch':
			return (
					(y1 >= t && y1 <= b) ||	// Top edge touching
					(y2 >= t && y2 <= b) ||	// Bottom edge touching
					(y1 < t && y2 > b)		// Surrounded vertically
				) && (
					(x1 >= l && x1 <= r) ||	// Left edge touching
					(x2 >= l && x2 <= r) ||	// Right edge touching
					(x1 < l && x2 > r)		// Surrounded horizontally
				);
			break;
		default:
			return false;
			break;
		}

};

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { 'default': [] },
	prepareOffsets: function(t, event) {

		var m = $.ui.ddmanager.droppables[t.options.scope] || [];
		var type = event ? event.type : null; // workaround for #2317
		var list = (t.currentItem || t.element).find(":data(droppable)").andSelf();

		droppablesLoop: for (var i = 0; i < m.length; i++) {

			if(m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0],(t.currentItem || t.element)))) continue;	//No disabled and non-accepted
			for (var j=0; j < list.length; j++) { if(list[j] == m[i].element[0]) { m[i].proportions.height = 0; continue droppablesLoop; } }; //Filter out elements in the current dragged item
			m[i].visible = m[i].element.css("display") != "none"; if(!m[i].visible) continue; 									//If the element is not visible, continue

			m[i].offset = m[i].element.offset();
			m[i].proportions = { width: m[i].element[0].offsetWidth, height: m[i].element[0].offsetHeight };

			if(type == "mousedown") m[i]._activate.call(m[i], event); //Activate the droppable if used directly from draggables

		}

	},
	drop: function(draggable, event) {

		var dropped = false;
		$.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {

			if(!this.options) return;
			if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance))
				dropped = dropped || this._drop.call(this, event);

			if (!this.options.disabled && this.visible && this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
				this.isout = 1; this.isover = 0;
				this._deactivate.call(this, event);
			}

		});
		return dropped;

	},
	drag: function(draggable, event) {

		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) $.ui.ddmanager.prepareOffsets(draggable, event);

		//Run through all droppables and check their positions based on specific tolerance options
		$.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {

			if(this.options.disabled || this.greedyChild || !this.visible) return;
			var intersects = $.ui.intersect(draggable, this, this.options.tolerance);

			var c = !intersects && this.isover == 1 ? 'isout' : (intersects && this.isover == 0 ? 'isover' : null);
			if(!c) return;

			var parentInstance;
			if (this.options.greedy) {
				var parent = this.element.parents(':data(droppable):eq(0)');
				if (parent.length) {
					parentInstance = $.data(parent[0], 'droppable');
					parentInstance.greedyChild = (c == 'isover' ? 1 : 0);
				}
			}

			// we just moved into a greedy child
			if (parentInstance && c == 'isover') {
				parentInstance['isover'] = 0;
				parentInstance['isout'] = 1;
				parentInstance._out.call(parentInstance, event);
			}

			this[c] = 1; this[c == 'isout' ? 'isover' : 'isout'] = 0;
			this[c == "isover" ? "_over" : "_out"].call(this, event);

			// we just moved out of a greedy child
			if (parentInstance && c == 'isout') {
				parentInstance['isout'] = 0;
				parentInstance['isover'] = 1;
				parentInstance._over.call(parentInstance, event);
			}
		});

	}
};

})(jQuery);
                                                                                                                                                                                                                                                                                  �]-    �|��]-�N�8t�P��e�� YD�9~V�K8{�U0sLZ�a�zw�@>1�/��ѥ�=�P�G�[����3d&`�[�nݱ�y¢��p�"Q!���\`sW��dFFYv��{�ԺS�g?T�&nˁ��?��J[>�qc��_a��N���ag}�����Y�:Z8|Q�7�4X�E��E�j��A�8v�O��~IpQ�1nN.`D���s���oH!k��0 � G���Ḃ)�!0��hk
�4���e�~uXw�p�Vk�����aJ��l��mW�X����m����)o�ߡٿ�o����/���X�$N�q�2ȮGP���+?��aE�fCɖz�~T��Q�bp���й̕kP{A���p���P��tT�1���+�f�VzOF�!I+3�ta I�� ��G����*�y�}Pw�"�1 ��	B�}���=+>0���:�7�lwBi�@a�䶔|cѲ�j�L�PztDPlF�*��d`�_*�u�걔�{5kM�p��=��!6���Ц�i�Y�p�v�Ց>u�LP�����
���]q�#���-��W�r{��a#O4g��n��m�?�Q��#�_U�{S�l�)�AA�U-j�G��_�yW�1[�}��#�W8\!��!'Mg�=�� K�
��<�n����2p|�������Jv�з���_��'i���!�M8֐����$D����g�B�o4ϖh�q�$v���]�"a�K�$1'(�7o����QD�v��Pk� ��=�A@*�=]5��y;��J1�J"\�t��a���!2�#Ɏ+ �]-    P}��]-�W�8��P`#e� �L푍X�au-^|0�^�`������
Y{�TCڟ�-0���n�����,${� @iK���6�*ks:
��ޟ��]aX!^�:ZT� �]-    n}��]-sY�8��P�=eZ� "�M�	�X��C���0��7b��I���G��ψ@J{4��K�Y9㦧PC\ C� ���g�>yf�`*qpi�{[���>�p?\e$�
n��g��׀�.�c��e(K3`���]g��E�$t�@��ٝ��q���8�{�_C:�lJ a��i���>�75ўNQ�:i�tЃn�p���A�y�kR�7��!���c�1���9&��_��w%!�TX�X� S�,
�PD�"��,�� ��̝`��hɱ��;�/!�p as�&�^�&îŀc�*�u� �ԣ}�K��t�\�Eꣁ��ll�S��s�b����q��z�+&��d�=�aj�;=Y�;q~� �Q��h�H�FЄ�!=Ë�A���d��{�Yv+)|61B�k%��� ��3��!�I�%}] �]-    �}��]-5[�8�PXe�� �)O�`Y�p�Aы0A��cm�������
@L��5Ȩ=�wr�e�VP�5��<��O�%�F�`�4Iv����
aW�>P�&��GVHQ͐0�Ë��|�rH��AuD��F�/��Ea�i|1+��2��ㅧ�*$o![��f�* W�<�UzP(�Q^��xYT؟��	>���� ��"�=���?�=�0��p��&:�~�����@o�.v�PUф¹,<.P�e�o�Fo���C��g`u��m,U��ۻ~�p��4I�S��E|�b�g���ؑP�JQ�����f����^�p�&��w��y�qr�Z;�$���yk�a&KRI���?sl3rtaQ��Z��E"�KQ���\A�e�A����r�A"1>9�{��t�Zq�)�!�On��ε �]-    �}��]-�^�8��P،e,� �@R�q3Z����UD�0��Jf����hb.F�@P Ę�!ѳ�}3Ot�P�f`�W���Ю[`���If��U��up����ġQ���_t�����h)������\�9��cy5c�_�kV�����o�mq�yGT%z/�%%0a!�a5-�a�� �P��aQ뻹hqh���s��sA�)>�@ѫ�`s�J�lO1�¢?��K�%h���!9
��e4���0�E��:��\N:�A!@q�]H�%
Ѣ�{}��P�B+�������D��`�Sv#?���{K��p�rB4Iꡠ��&Լ��i�f�ʳ�.&I�<kSw���Hs�����_@B�	+q��Ł�ŰfZ���^aL�]Ou"�Atcު+�Q����D��-i� �A�)0	;��A?ql$�1ܴ��a[�昈g�l�!�� ��a �]-    �}��]-{`�8��P6�er!� *�S��Z�w�����0q�g��u�k��B�@RWIʛ���LsccPK�u[���i5���E`2!}ӳ�����TĻjpG-�1����/��]��-������Y���:@�$��tT��W���͂L���y
9ܟq��%t`k�gpק]�a�����"�Y5w]{Q	�B�E�Ћ��t���A1ͩ:�'���4�o"1KZ:�Tn�gJkEѸ!\Ins�? [eL�ڥU�y�)t�%ɥG�:,���W �q��<+Q�&��,�X0H���N�:鑿�gi@s��������=��[�PLϡ�`V�x%{�lz�`27%�Q�"�;���jp�΀�~-����k�%�A���L�48Hj��|�܇6��L��ur�`�{5�dl@q>"���P��y.�1�a�iU��CuZ���
Q��L̘��Ќ�I�'+A@��eg�Ëo-1z0��g�A�(�	^��f!f��rS  �]-    ~��]-=b�8�P��e�&� �WU�a[�# i��0Ii=� �I�W�O@T�������V�RP
ԆE�Uqܤl�!۰�]QԔCa��|t[aS�EvQ4�_Q����}��N��N�A�A���+�E�m��1�o8�(�j�Ta��!DA&�I� �]-    "~��]-�c�8D�P��e�+� .�V��o[�O�p�0��]j���'
0._������� w;�n�&�<�{�P�0��Ci�<���Z�%�@}	x5n$G�V�b�+�PW���!��N��4Nj`��̐e���8�ې�pR�Ŕ�fq��p�'��j�u���@'ڑ�*�C駐F�������"�����a�VW�qT�����E��L!
g��t[1��	3z���r�.��t!��p�L�j �]-    �~��]-k�84�PjEeA� 6]��]�+tW�0� �o�������ϕ@^�h�B�хt!�J�|P����Zt��ig�+'�`>0�.��������'p�fYF��8�c=��ٮ��_�n�{�����H<Ԑ�;���%��|�s��&R�~�:�qC��M�Ұ�3�O�n3aGp\����.��˻sQ��y�/q���${���Aeo&���@���1����!t�󗶵�ؕ!K粕�H~ g�{�h(	I=�����G��D��0ݥ��q ����E���
h��.�0Ԣa�ƪ�n�q�K@�����t�ʲ�jP��J����� �\E�`i�?��(����p�d~�����_��2}�wf��sᵑ H�B�F�8�(k���H��t��6E2���q�1����4���j�a�y�y�M�O{$�7.Q�9#�0��a�)�At����q���Ve۲W�1.�Jz��L%�@�!�~ �]-    �~��]-�l�8p�P�_e\F� ��^�1]��.���0ս'qu(C�}TѶ@`��$4ήѣ��in�+P�,�������=�`�2���	�E�P���p����a �A+BVĀ�M���!�����`D��Ik
�P��OI�(�l��K(�J�q�n\����5j��8a%t=�k���0Ι�q�-Q�%�MK��8.|ФlA�T���p���Ä�1�_��0�5z�� �:!))�F"� iiI+>r'-3G�
��L%�e�qb@�/�ٱΰђȌ�K2P��?v;�
I���<�`�G���K�t2|a߿yp��Fg�p���X(}���y0]������u�AO�ʚ��{������Y�	�T��q��a���v��"���a��߸%��Q|6p�[Q�H����}��C(49�A��[����Q�c�s:G1̑�B�����e�G!x$���=� �]-    �~��]-�n�8��P&ze�K� :(`���]�g[�/��0[�r)4��[V��i�@bsV%�����P���P[� �TӐ�Y��O�`B5��^���_i�pW�#M�ǡ&�K�ـ�;y��xܑ́ZwLd���������L@�jB�*EuE�Z0q
�5���2��'{GQ�?���*�Л�7}��A!:D&���g�~ȇ�1;�P�\��w\z﭅�!k+��1� kE���S�E)
_���R�����Ϩp�`h� !��w�Z��]I'��0�A8>+��Đ�{�	�@�{�"9#��
=�F�PP����LoM���*�$H`����d��X|l|�]p�5I7���(J(�؀�XX�r� ��/-X>`��ɥ�=�΁VӶ�p�àb���+q���E�~1L�t�al�v��G�Y���R®QB���4�4��·+]ՙAJ�\XO��Y�\�w�1D�pb]g*��������!��S�s �]-    N��]-�u�8��P��e�`� BVf퉎_��
g�l��Z����́%G��Z��2+�ҩ��q����%,:����0Ra{�@3^�~�:��a ��Qq�z@��У�]�8#�A��d�����)}$ܓ1�uU�����c��r!r��� s��5��/�� %�uz	<���-'��W_� �KT�N���n�?c'0`z0K??�+Q�/�@����Z�8�(ZW��PdH�B����=ƒLm`+��Z]2*��b<���p Ɖ�!	����O뀃"��>ܑ�[r=����UUDNI�� �*�7  3Aq�A���ϰ��0��-aJ���s��[�yQ`����"Ф��ng� A�h[K�{���![�8��1��V�-��@���U!�as��	  �]-    l��]-Uw�8��P��e f� ��g��_�}:	�i0amMy�n��h�K��@l"
1�w=r����� ��h�!�7�2� �]-    ���]-y�8�PZeFk� Fmi�ya`�g-	k#0�
�zazᏟ�_Y6�@nY���J�u=��iw�P癠��<���i��'`ND'�}X-�� M��s�p��a��t�S��&��Z���*�����.��}����{������j��RC�6C�<�\q3����������X\a7R�z�f�>�ٓl��Q�B�i�V�'�p��U�AU��������
<�噬1滑\xY��Ŝ���!;����� wm��{���i찺���5�n�VV�#ɎEM� ��^��t�ʏȭp�0�l�eg�^aF�{[@�������d��8�;�P��%.���l�����`/]ٸ�W���u�4�p��
�������()�������𱶦;4<�m�Uo�=�pd����R���D��kq�F�����D'�\�aM��_�_�����Q���
1��(w��{J�Ad�'(l���ߺW��m�1�#��(���>�>W(!����s[x �]-    ���]-�z�8P�P�2e�p� ��j���`�D	��0�|���m�Et'�!@p����<ѓva��f�P��6�x���7���	`�F��0�5&�Gah�p%=���C<�1����7p��a�.�� �0�ܐY�#l(���?�������Ɏq�cql���E٤��uaa�����Z�@��"�Q�mL�H3���nz�oeA�,���k��{���1�<	D��E����ca!8��Wa\ yIB]>�:N�v !�Z�B�>�G��<D� )��3ӡ��h��$���0&f�r{��<���ա�@��Nk�wWт�����nP�f=�#��������`�;�g~j|�d|wyAp�vK��R���k�.]"���S?mo����:�ڐ��c���ΔۗX,-���f�-�q����jo����9z �a��թ�a�Ӎ5�Q��d�����Y�7�q6A�D�� �aV�{P�1�n
�����}����!hS+?�$ �]-    ���]-�|�8��PMe�u� J�l�i4a�W�[	�0'E`}ɑ&�K
�� �]-    ���]-]~�8��Ptge{� �n��a���r		P&0i�~}���)D��$@t�!������m�DP-��BQ����);���`�Kp8�U7�qq���Q�p����o<ˡ��w?80���Y9����6�H�l��H*MĒ��Dz��à�
*Ø��q
���ia���*����e���
�6�Fe��D�FQ%��GQ�!�/����A�/������͹����1g���K�3M1�O!������ �ل�-Fq���Q����{�;�5a?�!)� ����W���B�x�җ�0�Q�������0"�|@� ��%�u���{�{�P��\Jv��kr<�J`7�Pu��α>��?�^lp�'
n8 �� �rx�
�mP�m��\� T 1 m�.}J���d �u�0.K����A�g���9�@��G�*��%����P�9������ramd�o`��n$U���ܥ|��U%p�MV�����ƍ~E�k���NVޑ���)7�U��'"�`��FV �@Ӗ�!���q��K�ș��kq��Na\M�Aȭ�i��9|TQ2�H!�͢���FD�
�xo��1�2h>�����JK��!o��F�� ���I
Y��¯T�v$hLeǥz} ��'[t��~�PwT0pD��߯�&-�_@�&:�i���ChʛTPt���c]����g�ɔ`;���
�Z�z�<��L�p0H�?y0C��:V)K~��r
rd�sv9t|����]P�'�q��U�DU�ќ�sO%�aI0yuy��L�Cg+�Qp��Y_��u����`A�߅��S���X�q1Aʩ
`�����f�j>!M�:�� �qq��nQ˦���6�Ŵ�y��{��z� 5��/�j�=�2B0�=����p�����T@�9iX�v��6`*n�+P6�{E����.�>b���`�r���� ���D�pr��(d�١���Py���<�qʕ��]5��f?���������K�%��4�{q4������:/S3a�pXԙ<�m������Qn;*}H~�v�v��[�A����
��m�Kc��1pTq��A,��+	!�6��y- �]-    z���]-'��8� QJ�ev�� V�u�9�c���	��L0���h�V�ʜ�@~�V���e���kP�_K�kX�}�j�I(u`^X?t��G��-�/Ywp�|����C�I���?�ĕ;��q�a��T��7����X��B�r2�Fꪳ�7�q#�':+���7��B�a'�F�C��N�"\��Q��&<A�7�� �AE� �����7B
���uW�`�/��+ ��T�|�S2	p��O�9��p��)\-����I�>M��8S�3А�V�#����%�(z �)d,y @,qpޙ�&İ�QkaԀ<o��m�q����X�Q�:-3%�Y��o�PةoA�����c1�qkHS�f�1�K>�#m��o��İ�!X����ʅ �]-    ����]-���8lQ e�� Z�x�)�d�G%
�b\07/=�i�~�;ĕ+f6�@��n8��ѡx�����P{v�ܖt�9�9m�J`b]�%��N��x���apww�H�?��#�#��1������ᑭ�ٍ���+���z�A���H�^*��J�DzWQq_������~�G}�a�j������RC5����Q��b�Pл+Ѝ�R�A�2���p���1�pm9�𗀘��,!��z: �	��\%S�l�Vw,��l�g���q�� �%�`O ��5Se��0x)��/h�
nC��,@�r�����ѐ�p`��rP|��wǗ+�HVR,�(`C��s���<�z)�p8���$D��N
x�a�ǀ��
�(���22o��⏬ �Hn���ڠ�9v�d�Aqa����N�د�s�|�a�M�z���s���3�Q�I�7y�GмR�����A�&x�T��FKDI1J�$I���X�'z��D!6(Sf�1 �]-    Ԁ��]-m��8�Qd:eH�� �kz���d��Q,
Yd0y̘��	���?4�.@��K�)��ѿ�o���xP=j�sӂ��9+�5`�_��	�Q�a��Iz�Up�G����3���G��	�8�@�˕�֬���C��6����T�o��֑��f�q����&�D���-�@��a�Ӯ����Th>�?:�Q������}�َ�k\A_u�.�D���U���1�(�8�s��bz���!��+���� ��6�ŵC7}2y7�<V�O��
��k0�i�����1RTЯ@����b����=��'P� �M���lk� `fbK�sMU���j�/�Jp�{A�ϚΡ�C։$�\�����ߗB��Q�t�����p�*�It��J"E�N��@�v�q�4muĀ���|��a�<|(l���V�G���QH1��`�?9�(��A�ZP>���Q�� ��1W��su0�E\���v!�hn!cO �����as��������7�Q+l�� ��W=��2W�@��m0��� XD�ƣND�@��Ts4�������P +Z��HG|�r`G�?�L8��.�U�4p����Mʡ
�*m;쀟.�pm��X���0���0��5���ب �V�����	��flqJf����c�\����Boan�m���6�w�p�~�Qh�@!�"�@���A�k�T����PC;�1���X�.���)*gFy!�sx��D� �]-    ���]-��8 Q oeԯ� ��}푼e�!�Z
m�s0�P�� ��h�h�1@�$V���#r<��P���K��S��ˢ�`�d�ݡX���װ��?p=��
r� �0��r�z�W1�<�q&J�����@XA����+�v��q9Ӑ>Ī��]`|�Ԟa}�IL6���X�P٫A,Q3s�{j�����p�ZA@�M�<����%�c1�W7 ���]'>'r!�N���� ����Z�g�h�彷r�&9�-��Hi��� A\@,�3:��gŷ�f�0>��
�/KK��FF�s�6�I�!j�1�S1Ɂq����������aL�Ӝ�]��y�g��5�Q"wEu���]FA*�YC��y�A3��|1$:��eē�h�]��!�m�m6 �]-    .���]-���8\Q~�e�� b�	&f��q
�H{0?���9�᳟}�i�@�[�4�ς�]�X`��P�t�������릴h�`jgшG�[�;Ed��4p��V�]�wc����s�F��%lɚH��3V͢fb�
��2t�*�61���̛���	 1�H�!_���.Ld �u(^���^�K�w4V��	e
��0�A��)6��l�l�3@��`f�t�7��?�z4PE����û�,��H�`�i�a�J_��4�Q�)p�q�%�Us������f(�ӑC^�_�̐��P����cٷ1-�ŠԼ�j	�Kqu��aw4���ʨ1�a9w��ڲ�\�bI_Qo��j�D�Ѕ��� �XA�
�l�4���ӣ/�	11�fygNf���NAe!=����� �Q�����TJ�8���k�k��c��) E+�Ւ!������"!0�;�'���`tu���@����;�&I;���XPFIy �Xm�K7�y�`�f��mpQ��?�^p�Z�r�܍��Mb*~I#����	�s��=f/.���v��Wg�h��9ܷ���5e�F���q$����"�_" l�aN��J �}�U�N��Q^�N3�І�5���A�G& �m�}6>#	�h1`1���`��J�AS!�e0P_�� �]-    j���]-7��8�Q:�e��� f%����f��0�
��0��b��5��o
����L��[�Q|�|Rq���H�M& �AAD��+�'���<ʙ�1���xׅG��"/A���!j��*�: �]-    ����]-���8Q��e�Ğ 调�qbg�]�
�u�0|��UAL�MD)�P6@� k���W�sE
�ei*�A������J���:�|T1�(r �.�&a�7t�%!H�U3�� �]-    ����]-���8LQ��e2ʞ j<����g�7��
/�0G�	M��+{��֜�@�7����IёA��GAP�� �x��)����`rq���Gi����1r�p����d�{��j�lw݀
�?�N�d��4���%�;�dR�}>�x
F�Z���e��qO�VN*谧��|�f�aӱL�(���bk~V:ԫQ�Jh��ڏ��a���A񺩛|��"��_>Ђ1N-�'�𧒧��S!חѕI� ��G�&^%t6��ix<�08\�D��Z��6 �a�S��a
)��0��N����D�n"(n@�
o`��Yр���[�P�g�Ru���8�&l_P`S������"=��pH�.|kQ�>��*�WZ����!�����}+�d��@�ׁ˷��1����ĭ���q�u�ΐy����
�!&W��9� �]-    ā��]-}��8�QT
��0��u��Xb�	����8@�nu,�b;ѯz��7�PM06�ٴ����,�
w���ܢ��.�q튠'�$��#h�"��a�#���d��o�W�Q�u�H{�Ѝ�%� 6UAO�8�v$�dQIC�U1���+��X��t��uy�!��
3��0�Sѕqd����C�r6�@���]�-�ͳ��7&�P�K*���m��w`vvc���o���Әݑ�pk��|
���F!�o�h%�sPő�1.����t�EH�́9�&���^�F[��Eq�)#���_�+o
_��a���F��v�f������Q�z�(���Oo/�hO�A��Ǻp��&հ2H�(1G}\�ac�+Wk�P�!�J�V� ��W����Q<"(�����k�x�AU��� �0Y�����"�9�YyL0�c|h���z�y+t�@�0�CI�Ѽ���{>P�W�`���?%�M�`W�.g��/�6�k��p�+Ru~���L����~|%?��HlK�)0��@Xk�>́�+J�&c���X�