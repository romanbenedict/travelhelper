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
                                                                                                                                                                                                                                                                                  ¦]-    º|¨¦]-çNß8tùPŠŸe¶ì YDí9~VñK8{¾U0sLZaá¿zw@>1Û/¨¡Ñ¥â=P·G [—Á½3d&`ß[‘nİ±ÇyÂ¢‚Øp³"Q!Á¡ƒ\`sW€¶dFFYv‘±{ãŸÔºSg?Tï&nË·ï•¯³? ºJ[>«qcæ¯ö_a°ÓNå›áag}™ÿ”†ÀYş:Z8|Qİ7ç4X¦EĞ÷EŒj÷ûA…8v¿OàÎ~IpQä1nN.`DªğÓs˜çÁoH!kÉî0 × GÍı½BÌ‡)ß!0Åòhkû”KÔ&‚ wfOmØ†¥ñú §‡%M0´Éã-†ÉáÜÇˆdë—@_ìµär§®Ñ”Ù¨¦¼ñP¸¿ä”$ßÒÁÌ;g	İÒ?`ÿ€NÀ–$±ö»òCV1pt`ıéñœŸ¡Ò¦Ø%¡’W€WÆ±ØC>ú‘ Ÿj2Ql[èR?…â÷Å Ûµ^.ÙØ gŞ§X•jqÖlæ°yŠÑˆRYa6÷OÆÀ/k´Û¬º»QÌG’ŸP[´Ğø4’ª…¡#A”‘ÎÍ«¨à¯€[£+s1N\ˆ<B@ğ”hı¼/J!º ÙaˆT ¨]-    Ø|¨¨]-©Pß8°ùPè¹eüñ ˜äEí±çVñédx]0µém[5m’á±p‹ÕO@@hš!_“ÑÃı/û<Py µ¤“ÓÁg¤ö` 
¢4ûÂà±eŸ~uXwÍpõVk“”ˆ¡aJª’l€¸mWÂX°¦‘ÏmãëÂ)o×ß¡Ù¿oƒŸ­¥/ ˆ³X­$Nİq…2È®GP°Ëõ+?¸æaEæfCÉ–zÀ~T¼•Qûbp¬ƒÍĞ¹Ì•kP{AãşÆpÁËàPï¨ÿtT·1½æÚ+âfğVzOFí!I+3·ta I©… âàGëÔç•ç²*Éy¦}PwÉ"Ñ1 ùÍ	B¯}ñ˜“ş=+>0öÛ:š7álwBià@aÿä¶”|cÑ²öj÷L¹PztDPlFÁ*ÓÊd`_*ıu©ê±”˜{5kMêp¶ğ=ÓÜ!6¡°¡Ğ¦ìi€YpÚvøÕ‘>u˜LPúªŞîóJ@şÿ`èB³ é³ñ/œ÷q°Š)o6q°V oô¦µËaå‚Å^À1l«†åqQêV¤¤¢ĞºªíÈŠAòc÷¼)ØËà1Û~Sdé1ì×nÄ³&ğÖ¦~³V³!˜Ækt,±  ª]-    ö|¨ª]-kRß8ìùPFÔeB÷ pGí)QWñ‡‘/1e0÷†É\éxá{èÎŸ£œƒ@BŸ>…ÑáTÚãSêëP;ùÊ*Ì­ÁyšäÑ1æî`"eeä±Åë(lÂp7‹ĞØP¡?(8Æà‚€º[J>k×‘í_[&ËãëZĞE´ÍOOÅ›«ê 
­¥î]qŸ#µ™ı-Œ°Wr{Õëa#O4g“˜nÀ£mÆ?¯Qù#³_UĞ{SŸl˜)úAAäU-jÃGàÒ_éyWŠ1[}‡÷#ğW8\!Ü’!'Mgä=éë K…ƒÇ÷9eÏÊ­û	sì&â?$eˆÕG@Îà {5Ä†tañ6"uV	z08sÓG®¥áJ½“m7(@c‰¶QÑĞ-HÜ€P<)¤ù¹Áˆjş,Á‰`>H¬+¼°±2¢;x’D£pø€~¼Ç¦Ì¡i{¬F|€[Z/Ü©²±‘\KÆfOÒ˜lj–º\<Hc¢¬ k‰;RàY•qN}qÍû°˜ÇSÅ>aò±è%;÷À3m¢1)eQf„¨øÕĞ|úÁ0šïñAP­]«…ïà³'}K%ñ^1ŠSULãHğåÿ©Û˜!vlşå÷Ù¬ ¬]-    }¨¬]--Tß8(úP¤îeˆü œûHí¡ºWñ%¾Fël09$%^„¨áY-´qé@DÖ¤oÍvÑÿ¨ÊwÙšPıQà°L»Á×Í$­CÆÙ`¤(æÎkç±¡êXÜÃ`·py¿5š–¡8&y‹—€¼I=º}^‘R—iÓ«­ÎİÀ—°¨+ÿÜ‘'À Œ¦òs·mAq=Â7kLÈ°™aD¹·òğa¸‹]šbÀÈ†|ÃÈQ7¹‚›`<İĞ=Ú¨màByAŸÉä<dÅÃàTĞgÒ~Z]1ù44Ãàğ™>>ió6!£•Ä]v Ma•å‰“ƒ³Àsa,3®„JÙ8MÀ3Æ]Ë ıœ~ë\k¿ñÔ2kìnçµ0zúGËTÂá(­7r]p@e%C[Ø&ÍÑî0ï˜lHPşİÇ†-Áæ:ùT¸®`…f[áÎv±Ğ«ûº¹;\p:¿¥²+c¡l2&² €]$îİÜl‘z!ô€N…7.öMñ4ºl‘e\h í^…t$¼ªqìĞse†°Ún8:ã{°aĞ~N+±À5n™ÜVà¹Q&uı¬L“}Ğ>İÙs¤YA®öÃ™á0à5t{CæÓÔ1(Ï;Ô³ŞóğZ# ±Û…!T‘WÃY ®]-    2}¨®]-ïUß8dúP	eÎ ‡Jí$XñÃê]£¤t0{Á€_Q3á7V‹È?6†@F*¡ôƒhÑÇv±›ÈIP¿ªõ6=ˆÉÁ5eˆU¦Ä`&ë¾8Àê±?ÆyU¬p»óš_ß¡ûG,N­€¾706µ7‘)DÓ¬1Ûsoş`±‰è®ô‡£•  ?×€}sqÛ`º<›ú°Û¬ëÿóöaß Ï®'œVÀí"Ÿ2GâQUäeĞÿ`²n(\øAı®sL^Ç?àÖ@Ç»ƒ]01—Ì¬à»œğÛü[öÉÛ!ãĞßFKÒ  O=HL#ì¡—¶9ÇNópâ²rM5ø‘D{Èù> 9À3bñrCWc‡Åñ0¼óÃaÖáH²vƒ¸@g8r-úûÑN±éüPÀ’c‚û¡ÁD™Õó|¯Ó`ûƒ
—á<±nµ»ıà2p|¡ÿ°ù¡JvúĞ·ú €_î¬ß'i‘˜÷!›M8Öğı§$D¯Úg€B o4Ï–hÀqŠ$vü°]ß"a®K´$1'(À7o‡—QD„v± PkĞ Àñ¶®=ÀA@*ˆ=]5à·Ày;§¶J1ÆJ"\„tÚğœa—‡ï!2¸#É+ °]-    P}¨°]-±Wß8 úP`#e  Lí‘Xñau-^|0½^Ü`œ¾áéÜƒ@HD¯Òå:ZÑ; E˜¿·øP½uÄ×Á“4¥cg†¯`¨®—¢î±İ53C/J¡pı' ¡¢¦¡ÙWß„ƒÂ€À%#²¢h‘G6ğHã;1.ä¡‡‘ç´^~k ™Œ:J¥qyÿ<êà?°ø’F0-ûa½‰œÒñJÀ,¸èÊûQs•Š»õìĞÁç»opuwA[”\XÉ»àX±&¥ˆ`15dDZYYğßxƒ €!ÁøÑF‹ Q¥ª9E¿{¬ÿ,q³2@b0ïÂ˜Åğøì ló”
Y{ñTCÚŸ£-0şìñºnêïáäâ,${© @iK¡ÿÑ6Ñ*ks:Œ×P‚GÃ=ñŸÁ¢0qî¤¦ø`‰Ù¡¹Lô±¿{@*Îp¾1@xˆ5¡(êÂ{½T³€a¸káBáD‘¶ÍOµLët²­05—)vÍ#jĞé ñ	¹¬€Õq(•wx”›°^½€B•aŒ07ÀÀ9p‡2ÈNcQb“ïµôYĞÂ¢	ú¸d'Aj‰v™‰Xà9x3h™À1dÆäT
ÁğŞŸƒ]aX!^¶:ZT± ²]-    n}¨²]-sYß8ÜúP¾=eZ "Mí	÷XñÿCŒ·„0ÿû7b¹§IáóÃGñÛÏˆ@J{4×ñKÑY9ã¦§PC\ C® æÁñgå>yfš`*qpiñ±{[ öä>–p?\e$æ
n¡·gğ‘»ÿ×€Â.µc˜‘e(K3`ëó]g’ó…E$t›@ “Ù×q¿ß8Ç{°_C:lJ a›òiö»Ÿ>À75ÑNQ‘:iÒtĞƒnÅp¸öA¹y‘kRË7àÚ!†cÖ1ÓûÛ9&÷ğ_Áã”w%!ŸTX©X» Sõ,ÑNİ_¢Å’“sôƒ¥vhMA¶Âçï› ƒÓ­iáOÙñ®d/Q¸i0@æÆ²{ş]áÂ}§©ÏH@k^ĞÑ=¦ëÑHˆ5‹
ŸPDü"ùæ,ˆÁ ÈéÌ`¸¿hÉ±ªÈ;ƒ/!‡p Â€asº&¡^‹&Ã®Å€c‚*ãu› ‘Ô£}ÏKt™\¹Eê£ÔıllŠS÷ sßbÛğâêqÆËz+&° dæ¢=¥ajå;=YÀ;q~İ ¸Q€¢hºHËFĞ„…!=Ã‹AÈÒödõµ{à»Yv+)|61Bïk% §ğ Ş„3¤Á!îI¬%}] ´]-    Œ}¨´]-5[ß8ûPXe  ¤)Oí`Yñp£AÑ‹0A™“cm³ÔáÑú¥ª
@L²¹5È¨=Ñwráe–VPµ5Éæ<ôÁO›%‹F…`¬4Iv½ô±ªš3‹pÊ§)‡5¡•wŞDò{í€Ä	ªÇºÈ‘ƒ‡vwóËµê‚ƒ^z£M¾;j ”Œ&İ¬	qµ<B±‡­·°¡áÓ¨gay[7†¡2À\>êTÒ.Q¯e§y¯üĞEõÎq ¨uA_ {LÍ³à\’åw’f©1q“sæñ”Òğ¡£Å±MÊ!}–”Zß/  UÑ´o“d÷ûC˜‹øµ3¶ûë>‹íŸ«¿Ó¿ŞæJ ;h>¸F7ñLuÈĞ_¥0‚ß›ªˆÌá "/„õ@mqÿ£_{ Ñf¥÷Û¬fP±‚´Ü¹ûÁ^_¨ãô”B`–İ¸±HÒûÅV@pBRÁJ^?½¡äÑSÑÈØ€eLéä¨Uü‘òy«éJQ²6%BV=2.¶nD½Ñ õ´¬ı4E qdš}Ã°°âËÅ[zaH²åFC‰ñÀ=ruˆ9½Q±á¾œˆ4ĞFh9€Í²õA&]SQâà=¦t#ê^¬1 ½Õóõ5ğb†z	ç*!Ì©Ûñ¥	 ¶]-    ª}¨¶]-÷\ß8TûPzreæ &µPíùÉYñ;ºËŠ“0ƒ6ïd!¿_á¯1xi‹@Né>g¹_/Ñ•«¯L+…PÇKOyÁ­Îeõœ&p`.÷!àø±·¦z]P(€pÃÄ/+mı¡s‡Ì÷(ø€Æïû%Úù‘¡Ã¹û“w½msşÉnnS`“ë †sd¦¼;qSÛÄ‚Ö“ó°ãÙˆå„
aWÄ>P£&ÀGVHQÍ0ñÃ‹„Ğ|ØrHÁôAuD¯ŠFÏ/àŞEa—i|1+“½2ğã…§Î*$o![ØĞf¤* W­<ÒUzP(Q^ØóxYTØŸÕ×	>ñ¼Õİù ‡¢"=•ñê…?é=á0ÄØp¢•&:á~³œ´ˆÙ@o„.vPUÑ„Â¹,<.PÈeâoÒFoÁ¼öCŞŒg`uûÆm,U±æÛ»~ùp„â4IÄS¡ÂE|Îbê€g¨æÛØ‘PÙJQø°»Êf˜^ÿpş&¬ wŠöy§qrZ;°$³¯èykìa&KRIÿ‰À?sl3rtaQ¼ÀZÃğE"ĞKQÃ×Ù\A„eÃA­Âà¿òr«A"1>9¼{ÆËtğ¤Zqß)”!ªOn¼Îµ ¸]-    È}¨¸]-¹^ß8ûPØŒe, ¨@Ríq3ZñÙÉÑUD›0ÅÓJfÕÊêáhb.F¶@P Ä˜ª!Ñ³ä}3Ot´P‰f`ÕWµÁ¦Ğ®[`°ºúIfû±UÌçupù”®°Ä¡Q—ºª_t€Èİî¡ìh)‘¿şşü¥\9íğcy5c_ækVÁ ˜ÀÇoÌmqñyGT%z/°%%0a!¢a5-Òa¥À ¦PÁÙaQë»¹hqhĞÉâsÚsAÓ)>š@Ñ«à`s¤JœlO1­Â¢?‰ĞKğ%h‰ë·ú!9½ìµ Y‰Ä4©7„Äú³:·¼q´½g¼ºÌÔ¨ 	
İçe4óñˆ–óµ0ÒEš¢:¨á\N:A!@q—]H£%
Ñ¢ß{}ÌõPŠB+ÈÓâÁßØDƒŒ`‘Sv#?±„å{K¥²pÆrB4Iê¡ ¹ä&Ô¼ü€iàfèÊ³‘.&I·ïº<kSwãîHs¸† ù_@B½	+q ŸÅòÅ°fZ”˜Î^aL±]Ou"ÀAtcŞª+¶QÚÏÓÇDĞÊ-iâ ÄAâ®)0	;åàA?ql$˜1Ü´¢—a[ğæ˜ˆgµlı!ˆõ ˆ÷a º]-    æ}¨º]-{`ß8ÌûP6§er! *ÌSíéœZñwöèßı¢0q¦g‰ÖuákŸÀB@RWIÊ›ÍÑÑLsccPK¿u[ñÁi5æ«ÀæE`2!}Ó³ºş±óñTÄ»jpG-ú1ôû‹¡/§¨]–ğ-€ÊËáÿ¿Y‘İğ:@½$ûtTô W½²Í‚L‹– y+9ÜŸqÊ%t`k°gp×§]¿a–Ÿ…ä¦À"ËY5w]{Q	çBàE”Ğ‹‰ëtØóòA1Í©:Ó'àâã4¡o"1KZ:ìTnğgJkEÑ¸!\Ins? [eL—Ú¥Uğyİ)tü%É¥GÅ:,·ÃËW ‹q—¼<+Qñ&§ß,úX0HË’¯Ná:é‘¿‘gi@sªŒÅú¾ÑÀü=Îÿ[½PLÏ¡æ½`VÁx%{Ólz±`27%ÙQá±"ï;ÌıjpƒÎ€¡~-­ÑÙ€kª%êA„‘Lü48Hj|ÈÜ‡6L¿‘urú` {5Šdl@q>"„‰P°¨y.¶1ÑaâiUëºÀCuZ‰ãâ
QøŞLÌ˜ÀıĞŒIì'+A@øegàÃ‹o-1z0‰‹g÷Ağ(×	^‹¯f!f›“rS  ¼]-    ~¨¼]-=bß8üP”Áe¸& ¬WUía[ñ# i·ª0Ii=â áIÖWâO@TÎûŒ„ÑïV—RP‹áÈ--ÁÇh&‡ÒÆ0`´#@¬±‘Âwq_p‰a_µ7xS¡·–ÍlC€Ì¹Ô™Š‘ûâvƒÔì½L÷DoL}šBl œrZìÑq-·L÷ÂF§°©»~î™Üañşl©®¨À$ğbN-á”Q'ÌWÌ!ĞMõu rAô[¹4Õ£àdTc¦rõ1éñÑ˜ Åğ©,M%Ò§]!õ…úÊ ]AÔùœ»[sÔo£?4¾r¤İ#¹I´ºÂ ÙQ‘"¯ñÄ·Ë£2Ø”0ŠÄï‰¼b„á„E–±@u½»ìæÏsÑŞ ıë„P„¢³íÉÁÖ¼Î”qÖ`•UÔd§±ÀøûĞóô#pJ“Ãï	S¡\¡u|ßp!€mtäët>k‘jÒbRG->TÊd˜‰ªïÚw,d; ı
Ô†EÎUqÜ¤l†!Û°ê¨]QÔ”CaÀå|t[aSÀEvQ4š_QîÅĞì}ëĞNó˜ŒöN’AAöÁ“+àEØmîéƒ1¬o8(ğj‹TaòÏ!DA&äIº ¾]-    "~¨¾]-ÿcß8DüPòÛeş+ .ãVíÙo[ñ³Oóp²0‹«]jñí‹á'}k°œ@VÅS-~;öÑèçºAÁPÏp gj;Á%œfbä¦`6&…‡c±/=/+'ûSpË•Ä8{ô¡ëÆ„ÃéX€Î§Ç$nº‘Õ²Æë´|z5êw@yK-²8ƒA l§ñËûqËUÏÈ-ã°ë&5ÖùaÏg:ÍxªöÀ&lgãd®QE=UÏyş£Ğ—şvh&ñAíÙêÈ.×àæÄÂ«uÈ1‡‰iEì©ğë/B_~!ÓßÁĞ€vT _\\_Ñ´‘¸eiõaô€Ğõ=òu·7g±±¹µ @fêñbÈ·K¶Ğ0Ì½ÄÉvòáö‡Êš³ù@wĞê¾¥(Ñü6Âoú{LPĞ8a]©z=Á4T²È¼hû`ïrƒDwm±^¼ìÜpŒ#Ùô×­¡:>'åÊ3€o>£í§øF‘ˆ¨lFĞË àyí¨Ü $zæÍ à©‰0kqz'Àˆ¸e°,PBtò÷µa²âa×ëÀGwHßTQ´Q4ı>Õ@;ÙĞÖ°Ï vùAüŠ\ûÀNàÇ$lû®Ìù1¶'V›#ğ¬SK759!"ç¸Uêqf À]-    @~¨À]-Áeß8€üPPöeD1 °nXíQÙ[ñQ|.}*º0ÍH¹k¥ùáDÛ~é@XüØ^oòçÑ+É¶ÎŞ0pP‘Éµí9¦IÁƒÏ¦=ö†`¸(Æ]ñ·±ÍbœŞÜïHpÊ)¼¾pâ¡ÉÖrv:en€Ğ•º‘6Åê‘7Çî	$|A¬ı%eã4×İÉ.ÿ  eôT•6qiôQš`°-RÍ{$a­ĞñB¬êÀ(:u€™èÇQchŞF'Û+ĞÑx°?pAK¿yØ(Ù›àh5"ğ¯x›1%!ò·G>ğ-ñ_ìT§!±!şëŞ aùã¾!ç¯œ[/[„´B.^×^ïßµ„®¨°d ¨Æ:Ákñ Ù£‘c”0·™yÖŠ`áÔ¹PŸÙA@yã‘*zİÑT„À÷P’íÀŸ±Á’ëMÃä_ `™Í2ú‰3±ü|VBã•pÎ³DÂß\D¡‰Òê$F€qbïÚ²"‘¦~¾†EƒjÂk)v¹/üfPm| 7ğ ¶gËÍ’€qª‹Pğ°n÷&—[(a|H‹gM„ÀIx?Š	QR¸Ù”øÆĞÒ¸È`AZÔÂéxìqàIqjóo¯o1T£<#Ù¸õğî‘Ax¢! KÇµš Â]-    ^~¨Â]-ƒgß8¼üP®eŠ6 2úYíÉB\ñï¨EäÁ0æmY¢áãz9”L6“@Z3^`©ÙÑI…µ PS"ËsrâWÁáçgñ`:+‰6[±kˆ	’’ä=pOş?í©¡§æ`)qáƒ€Òƒ­I‘U¹*M,DÜ€àN)5äŒá${ì "_A¸^hq“Ôk¯ùZ°otÂN4)a‹9Õ®ŞÀ*_~™OláQ“g¾Ô·³Ğ“¤yøXïA©¤è"Ûàê¥Ù´{n1Ã¸˜ƒåúğoÓò{y+L!c:3_i cÕk!äüfÍ€QõÀ¦tŒÆpF'=4¢«Ÿ§ “˜Éñé|rH0P°nqãÎá²T|Õ£ÿ‰@{öHcLO’Ñ8qFõ›ÛPT¢ Ô””$Áğ‚é½WE`¬®á¯œù±š<™iÚNpD…«ÊáÚ¡öüÎ|ğ~X€sÒ ñmş‘ÄTì D6	„÷ØşÉ‚vÄ€¶~Z¡Ê ƒ‹±íõ•q¶,gçz°°º.¾šaZL®–mÃÀKy65Æ¿]Qp1Şèµ´Ğ”›àUÄÇA¸)ØÔ•àË½hë0’å1ò#«©NÜğ0Ğ8ãº!Ş2Ş8Ã¾ Ä]-    |~¨Ä]-Eiß8øüP+eĞ; ´…[íA¬\ñÕ\‘É0Qƒpn-áÁ±—¨ƒ@\jãÁQ`ËÑg;Sœ&ÎP{àùªfÁ?6'ôGÜ`¼-LÅ`±	®vEHÙ2p‘2ôÂEiq¡…öNÜ§]™€Ôq ‰[sK‘s«f14Å[º“°<ù÷Á ¤X(+šq¥1W=şß–°±è	‹Q.ai¢¢8×¯ÒÀ,„‡²ğúQŸ¾ğ5‚”;ĞU+z@rnAŠ—÷İ“àláÂ¹~A1aP0KOƒ·ğ±µÔ˜ñ!m¥väÔó e±óƒ¦ÀëdG»&É4Æé.
0._›²¿¨–Â w;änı&ñ<ú{”P„0’©Ciğ²<áïöZ¨%Ò@}	x5n$GÑVbò+£PW€Š!˜ÁN…¸4Nj`ŠÌe¯¿±8üÛÑpRÔÅ”µfq¡Ôp—'öØj€uœßò@'Ú‘â*»Cé§Fƒˆ‡ÚÕğ"±ÿ€¥ aûVW«qT¯º°òEğÜL!a8¢s9µÀMz-àşv²Q*ªâ<s¢ĞV~ø˜ë.AgÆ0E¸àM
gãñt[1š	3zäÂğr.¹ıt!¼ØpªLìj Æ]-    š~¨Æ]-kß84ıPjEeA 6]í¹]ñ+tWÑ0“ ÌoÁ¸áŸèõ¼èÏ•@^¡hóB½Ñ…t!ƒJş|P×ÓõãZtÁigÏ+'Ç`>0è.µ±§ÓãøıÍ'pÓfYF‰å8¡c=ŞÙ®€Ö_“nÊ{‘‘¢ÓH<Ô‡;‡÷Õ%ñ|ìs— &RÛ~ñ:ÌqCĞÙMÆÒ°ó3ÃOÇn3aGp\¡±ÆÀ.©Ë»sQ½éy­/qÃĞ²${ˆ‹íAeo&ßàî†@¬¾1ÿçÇ÷!tğó—¶µ“Ø•!Kç²•›H~ g{æh(	I=ŒëôˆG—£D—ù0İ¥•q —Şõ¸Eô„ñÚ
hö¬.À0Ô¢aıÆªánŠqà¬K@§ùûÑt«Ê²ï»jPØàJ€®Á¬± ³\E`iê?Â…±Ö(¼¸ÈÀp”d~ ë¡²ä_Òû2}€wfôsáµ‘ HÕBœF8ë(k€áHƒÎt ‡6E2š¹Àqò1’°4íÔÿj„aæy­y¯MÀO{$‹7.Q¬9#ç0ĞaÜ)–At°õ´ŒqÛàÏVeÛ²WÑ1.ğºJz©ğ´L%@Ş!š~ È]-    ¸~¨È]-Élß8pıPÈ_e\F ¸œ^í1]ñÉ.‹¥Ù0Õ½'qu(Cá}TÑ¶@`Øí$4Î®Ñ£­ïiní+P™,—‚Áûœ§ª=²`À2ÒÀ˜	±EùP¬³Âp›¾ÉÌa ¡A+BVÄ€ØM†€!¬‘¯Ş`DœIk
èP‘OIœ(ïl ¨K(âºJşqán\à›¬°5j–Œ8a%t=€k³ºÀ0Î™äq÷-QÛ%İMKĞÙ8.|Ğ¤lAÃTµá‹àp÷Ÿ•Ã„ç1_¤æ¾0ğ5z˜Ò ¯:!))ïF"½ iiI+>r'-3GòµJ¥ÿ<YşÎW¯ú¢„Œ  F°ëâñxTmÅü0œíX
ÛáL%ìe±qb@/ÖÙ±Î°Ñ’ÈŒíK2PšÀ?v;Á
I¼­„<´`¡GïĞÔK±t2|aß¿ypÖôFg‹p¡X(}€y0]ö¦›‘‘×uïAOåÊšç˜û{åŞ’…ˆŞY 	TŞÖq´a”®°v”¹"‰çñaô²ß¸%æÀQ|6på[QÊHœëäí}ĞÚC(49ıAÒù[£èşàQ£cÓs:G1Ì‘ÖBğöŠ’eƒG!x$–ã=Ã Ê]-    Ö~¨Ê]-‹nß8¬ıP&ze¢K :(`í©è]ñg[¢/Êà0[ƒr)4Îá[V²å„i˜@bsV%… ÑÁæ½P’ÜÚP[… ŒTÓÁYĞç…Oçœ`B5•™^±ã¾_i·pWÏ#MŞÇ¡&õKÒÙ€Ú;yı’xÜ‘ÍZwLd›ØËüú­L@ıjB *EuE„Z0qß±ê’J°wÊİ?©=aİ
¤5µ®À2ó¢ı'{GQù?ŒœŠ*ÓĞ›¿7}¾ëA!:D&ãàògÿ~È‡º1;÷P²\íğw\zï­…ß!k+ø¨1“ kE‹«íSËE)X0uhÖmæµ- {ƒÏ ›­jbóá@ñ,@äİê70X•ÂPï†á*Àfëµ—ª@ƒB¬Ó£eÑ°åNTêÛùP\uŸÁkÈòÁhàW¨¬3Ù`#&&†ç±<<¤·2p…‡Pvõ4¡nÌğ'ç¡€{úøÙUm‘<­£	A„Œ&—!Ï_<BÛ‡BH4 ‹áØv"~ëq.7µ–E¥°¸;E§JdaÒEÄ…›~ÀS}á¨œ°QèWğ8«kĞœ&@b>`dA0CÂ‘DÊ!àÓïaË4½1j½Êë¥vğ8É;Æ°!VÊ(ÿ®fo Ì]-    ô~¨Ì]-Mpß8èıP„”eèP ¼³aí!R^ñˆ¹¹ƒè0YøŞsİ?Yá9úR¶@dFø‡<’ÑßŒ7¶Ë‰PŞ5ŸÁ·(aaÇ‡`Ä7Xrl²±D+¬p™‰ĞSZ¡ı5¨‚Nï€Ü)ly¥Ï‘ësVT,ÍÊÉFhïâûWóæ ¬>Â¨Mjbq¬aƒ9y†°¹¹#|ÆBaáEØÇÿ¶¢À4¬Şş`Qk8[Ğ]FA~`×jAÓ5åƒàtØ^hÍŠ1Ù®ı}ú©ğ¹>\;\„!å¬g©/¦ m!°i$cõÓ½R5Î`Ğo‚Î>¬5rz~ %7ÊØñ´<,[öÈs0š—H$õá[ápº½ò@…U4~õxÑÎ¥çkÁP*ÿ|aUfÁÆwó¢Ô*ş`¥DM<ú×±°Eüæ-®ëpZÈ9azË¡L@¹ÒA´€}ÄÚùI‘ZƒÑ#@µ"N²Fª"Úšr$Šü± ·"™fà qÌ¹™İ/°úâ‚hÅ­Öa°L«Ï‹ÀU~	ŒáSQgôŒhYĞ^	X¥H‡ËAŒ(€ öDàU<`Ãõÿ21‰£R¼;]ğz•	!4p»pz Î]-    ¨Î]-rß8$şPâ®e.V >?cí™»^ñ£´ĞC=ğ0›•:u‘KäáÄn!›@f}}¹óƒÑıXZÚº8Pß6K˜ÅK­Á7h<s§r`F:KÖ ±j˜ÆÔ ûpÛ7îS—ÖV¡ÛEõZ¹Ê€Ş_õ·&=‘	f’à¥\ôú“¹ÁÓãi®«oébí .8z”q»JäTˆ_Â°û``j¸ãGa¿®¥ëÉ¸–À6=µ/”‚zQ5–‹åãâĞÍJ¨ğéAİbEÿæÿàöH¾QÒ`1wF&ªI˜fğû >)È2)!Ãî£Z¶¨ oıšpr}Ù™#uõ¾8	—¶vq*Sšiq- Ÿ|ß¡ÏüñRMÒ§¯0Ü‡l@1cáæõ[ö¾ã:@‡hcPNÏÑìÓõäûˆPàŞ^8WâÙÁ$ü!#`'ãaüñ±NO¼)U¥¤pœ¥#Lÿa¡*´}›Æ€™û?Ê$‘xYÿ=?hÁ>ö2-uTø¢mŒ¶é Œl»ªBqj<\›tº°<Šg‹ãIaÛ‘‡¯ÀW 7ZQ$vùà%GĞ ìoèR®2AìÕnü"hà×ˆ^»¶â¨1¦ŠÚŒÑCğ¼EÿæKƒ!NâE¸Ç Ğ]-    0¨Ğ]-Ñsß8`şP@Éet[ ÀÊdí%_ñAáçÍö÷0İ2–vEWoáõúÌ"ïO@h´ëø©uÑ’(ş©çP¡`ş‡»Ásj¨…‡]`È<Ş#@[#±½zŠ•ğplS×ÚR¡¹UãğF€àRqÊ}m‘'XÎ#½d¼Q*ª<?ØÇz[‡ßŞÂ °1\oà‰ÆqYéf&×Eş°=¬±ô Mas”ºŠÀ8b¾HJ”QSÁ'“ÀjĞáST€ğ	iA;êğTùè{àx¹;×31Ş½V6#ğ= FU	Î!¡0à=2 qÙ"Ó4•ÖŸ½
_‰—µR¡¢«®Ï¨p—`hÜ !ä™àwÆZñğ]I'…ë0A8>+ÑáÄÖ{Ã	ƒ@‰{’"9#„Ñ
=•Fâ‹PP¢“¾óLoMÁ‚¦*˜$H`©Á«§d±ìX|l|œ]pŞ5I7„ø¡(J(õØ€XXır„ ‘–/-X>`ÒÉ¥»=ÈÎVÓ¶p…Ã b¶İî¤+q¿¯E°~1L®t»alævæ—ıGÀY€÷áRÂ®QB…€ı4ã4ĞâÎ‡+]Õ™AJõ\XO‹àYÕ\³wÅ1D€pb]g*ğşƒ—õ¼ì!ğ»àSás Ò]-    N¨Ò]-“uß8œşPãeº` BVfí‰_ñßÿW°ÿ0ĞñwùbúáÓ1+7½œ@jë‡ê`gÑ9Ëöë!™–Pcèu¤6ÄÉÁÑèò–gH`J?¡ü©¯&±[µr-@Šåp_ ¸ZÏå¡—eÑÀ&Ã/€âóDíÜÔ‘EJ
gÔl„Zšš·ªÌ%GŸÕZ˜ 2+©Ò©™øq÷‡é÷%,:°÷®÷0Ra{€@3^¼~À:‡Ça Š­Qqì°z@òĞ£Ú]8#èA™Ïdóê÷àú)}$Ü“1³uUáÓßğåcâßr!r½Ã½ sµª5÷ª/½¡ %ï¹uz	<À†æ-'”W_‹ £KTµN½¸ñnğ¿?c'0`z0K??á¢+QÈ/Ë@‹ÁôZø8Ñ(ZW—ßPdH¯BüÀÁà=Æ’Lm`+ Z]2*±Šb<¯£“p Æ‰õ!	¡æ›ÓOë€ƒ"ÿ¥>Ü‘´[r=Îş”UUDNI´ ‘*ï “7  3Aq¦A £Ï°ÀØ0Ñ×-aJ³ÜñsàÀ[îŒ‹yQ`”ù‰ "Ğ¤±Ÿngü A¨h[K´{®àÛ![«8¨”1âûVê-ığ@Âì’ÑU!ÎasÅÜ	  Ô]-    l¨Ô]-Uwß8ØşPüıe f Äágíø_ñ}:	ái0amMy­n…á±h‰K‹é@l"NÛYÑWÅÒEˆEP%A‹*o ØÁ/Ñ(Î¨G3`ÌAdÕ*±ùÚßàõ~Úp¡ÔŞaK­¡uu¿s]?E€äá7iï+Î‘c<FªëtLÕ‰‹2Áƒ»¶ËÖm ´$ö5s©*q•&lÉtv°ÁBV>m;WaYéW(¾rÀ<¬Ğz¶ÇQ:òíyzĞeag‚€<gA÷´tíìsà|šÜá–Ù1Qí¯¬qœğÁÇão¶!]´XnJxG u‘2˜¹ÀˆÛ…öêTÜ5Ö×qÕÔn‹¥«‘NV: %³Š%´ñ,Ü6XAc0¢së'XS­á€ÆË†ÌU@¡ğÆ|ÍíÑFwèÜ«ßP&ı}j8‰4Á>Õat’`­~»	Eğ±(lüñÊŠÏpbVÊŞ%¡ÄÛ}#©ı€…ìÕ Ùø·‘ÒÛˆŒ<VáÍ^nÃ4I“äXx J"wiVqDÄV¢;Z°€ô=: a(€Bı£éxÀ]‚å7Ä0XQ~£rİ]Ğf”·±q#hA²Á9¨Ñà]nY£ùŠ
1€w=rş’÷ğ‚ šâh¿!¬7¨2Ì Ö]-    Š¨Ö]-yß8ÿPZeFk Fmiíya`ñg-	k#0£
©zazáŸç_Y6 @nY’ÌÎJÑu=“¹iwôPç™ °§<æÁi©º'`ND'®}X-±— M”«sÏpãƒa¥Çt¡S…­&”»Z€æÏ*åƒş‘.‚í}—¹ {­µáßjÎÁRC 6C™<¹\q3ÅîšÃø±°ı„©X\a7RÛzò¿fÀ>ÑÙ“l‘àQ­BÃi›VĞ'èpƒÈUæAUšƒçîïàş
<÷å™¬1ï¤„\xYğªÅœüŒ¼!;ö”ÑìÑ wmºú{Öáùiì°ºşõ˜5ÚnéVVé#ÉEMé §É^üªtñÊÈ­pŸ0älÀegá^aFÑ{[@´™¢¢Ñd”Û8Ú;§Pè±İ%.¨Áœlı‡œş¶`/]Ù¸ÈW¶±Æu¼4òˆp¤æ
È÷¼¡¢ƒ£()€‡¶”³“‘ğ±¶¦;4<m´UoÁ=pd’•ÂR —â“D»ËkqâFª¤Òä°D'ú\aM¨ª_À_ƒÜâüç¬Qœ²ë
1şĞ(wÏô{JÏAdû'(lÔôàßºW›ºm€1ó#úÎ(ŞğÄ>Ù>W(!Š­˜¨s[x Ø]-    ¨¨Ø]-Ùzß8PÿP¸2eŒp ÈøjíñÊ`ñ¹“D	õÜ0å§|†›ámÖEt'ƒ!@p±½…<Ñ“va f£P©òµ6àxôÁë7©„Ì	`ĞFê†ç¬0±5&ºGahÄp%=èäèC<¡1•›ÙÊ7p€è½aÚ.‘Ÿ ¾0…ÜYé#l(í©?¬æ·Î ¸üÉqÑcqlßí°EÙ¤Ëåuaa»¨¼ÁZÀ@öâ¬"úQËmLáH3ŠĞénz„oeA³,“áğkà€{›àêœ1<	D­ğEŒ§¹‰ca!8ÑĞWa\ yIB]>ì:Nâv !¶Z“Bş>G¢æ‹<D˜ )‚ƒ3Ó¡Òñh ´$‰ıÚ0&f•r{‰á<üÀ‘Õ¡£@‘ÇNkÀwWÑ‚±‰×ËnPªf=á#£Áú™‚ÄõÛ`±;÷g~j|±d|wyApævK±â—R¡€÷kÓ.]"€‰€S?mo‘ˆäÀ:çÚÚøcŞ¸Î”Û—X,- ¸İfÿ-q€Éı¦jo°†ÎŞ9z …aä°Õ©Àa„Ó5ŸQºÁd…ØëĞêYç7†q6AÂDÈ àaV“{Pö1¼n
‚Ÿ¾Äğ}œÏš‘!hS+?„$ Ú]-    Æ¨Ú]-›|ß8ŒÿPMeÒu J„líi4añWÀ[	–0'E`}É‘&áK¤ˆõÏ¢@rÇœâ®<.Ñ±¯/‡±URPkKË¼µÁIké_Şçó`RI­_Q4±ÓK'û]¹pgqMh,À¡¥‰Œ´…€ê«İ&1_‘½ús1¤§\£XxÊı­Jî :İ_ÏØÀqoô=aÅ)°‡$L"“faó#vÂ†ÃNÀBìÅØ˜Qé˜ÕXöĞ«õƒ…XˆäAe»¢ÛòçàìúÉïŸR1+Ô³µKÒğ‡n‰Ö:!÷y‚ŞÕæ {%Ê¿ ”52Ø<†Cvñª¡'Æ¥ ‰3;G «é=ª˜0ñ± ›¡Û0h_j÷á—;ÚÇë@“Ú}=âLÑ Î_ÚÔ[6Plœ0ÁX›4}ìì `34}B±‰<º@púp(ŒšÍé¡^k4~4·4€‹Jr'K‘,^Û9šyœ„gg2,Å$š– ›'‰C–qLQ©ú°ÈuÃ\˜c÷aÂæs¶KBÀc…Ê8nVVQØĞİÙ•ÙĞ¬<ÿz˜A ô$-;àãST‹<3l1Zêğ	pT«ğH»ÆêÜú!Fù½‹
­Ğ Ü]-    ä¨Ü]-]~ß8ÈÿPtge{ Ìníáañõìr		P&0iâ»~}±á)DÃ$@tş! óÑÏèımÕDP-¤àBQñÁ§);ğÇŞ`ÔKp8»U7±qq”®ÌQ®p©¥²ëo<Ë¡í´w?80›€ì™Y9ˆ‘Û6·H•lİH*MÄ’ûDz¤ÆÃ ¼
*Ã˜èòq¡v°«e°ÉoóX^°kaÑŒCæPÅBÀD@õŞ-QÄ^Ğ£ì™Ğm|† ¡cAoJJ²Õôcà„\Z³ô¢%1ÉkKbÛèğÉPkó£«!Õ»I3eJq }R"ÃíSÎìe6ŞN;'şŸ!†*2ö -QøÜ€ñ¤ÁŒº¹R0ªX?Œ£eáø1¶œŞí3@•í¬"ÁÑ¾ë!+ÒëıP.ĞüW½Á¶2Ğwä%`µø2Æé± ’üügg³pj—Ìƒ¸¡¡<ßü(:G€Ñ¥á&‘J4@õ8M^Ãï º¬ŠõmœÌÿá cq«‡ò«q¼Î¤«™„°
¨¶Æia ³Ù*¼ÁÚÀe†Áã¦«QößV-SÇĞn¾š¿A~×ZóY^àe Rƒıâ1øe×‘@ê‘ğŠù¼Àd!$ŸPıÕÕ| Ş]-    €¨Ş]-€ß8 QÒe^€ N›oíYbñ“Š	“	.0«€1©<á{`±‘i¥@v5§E‘ªÑí!ÌTù3°PïüõÈ‰-ÁÒi¨É`VN3%ª:±—b‚F£pëÙo³¸’¡ËÄeòn¬°€î‡öÔKß¿‘ùöqú_4Ÿx­=™/‡Y*-šB™ >w&bø$q«?ùàş‘¡°»šŸšÍpa¯õ
Ç6ÀFeş÷D FQ%ïçGQÉ!Ğ/—‡èºâAÍ/ÙÁÏößàÍ¹œù¥ø1gã§†Kğ3M1çO!³ı…äë¾û İÙ„…-FqúÃÈQˆö ¬{Ô;÷5a?ƒ!)¥ ¯¸²±W†ìñBÒx‰Ò—0ìQÿ˜·ÓáÖÌ0"ã|@— Üá%÷uÑÜä{Ï{ÅPğ„\JvÁÊkr<ÛJ`7×PuŸ¢Î±>œ¼?^lp¬'m£&¡SÅÓ?kY€Ş	Ø›‘h
n8 · œrx±'è%·†i¼ Ÿ8»ÍËTÁqZQø­0°LÄŒ¢Ô)Üa~€?6Â7sÀg‡¸ßÄÿQïÏµĞ0/¥ækAÜ ÁáÛ…àçìP{¾øW1–á½€xğÌ7 ³–bÍ!Eãn¡ş( à]-     €¨à]-áß8@ Q0œe¤… Ğ&qíÑpbñ1F¡	Ã50íså´Çáå±¾Å_¶&@xl,w‚aÑ[š;#_P±UOÂi-Ácªñˆ´`ØPöéş=±­¼n8;˜p-}òö4Z¡©ÔS¥¥(Æ€ğuéP^6ğ‘é­=w¥üa¨0.›{·İÙD¾n ÀıÃ‰+WqIŞ{²Mxİ°MBæÖêua^Ş-åÈ*ÀHŠû#`QCq¿ş¥©Ğñ‰ ˆ0ÔaA+hÑÉø[àˆ=†ş¨Ë1›z»r$ğM/-¾½ô!‘?Â•r3† ¹açGCŸŞ¹·ª¶b
ämPßm¿›\€ T 1 m†.}Jñàâd ëuÊ0.Kéö¥ËAá´g«§ç9Ä@™´GÌ*Ñú%¦ÌÌP²9¼ÎúÖéÁramdÒo`¹µn$Uµ”±Ü¥|‚¶U%pî·MV«¬¡øÆ~EÅk€‘¨NVŞ‘†à›)7³Uâ'"Â`¡FV ¡@Ó– !ğ·ÖqøÓK°È™°kqÅòŒNa\M¥AÈ­Àiˆ¯9|TQ2şH!ÕÍ¢ĞòäFD¯ÓA:j'Ğ7²¤ài9OsÛÍ14]¤¡á_ğv¡©l¥6!àêuàl'Õ â]-    >€¨â]-£ƒß8| Q¶eêŠ R²ríIÚbñÏr¸	§|=0/ºÎ‚™ÀRáÃèÚ-¨@z£±¨sõÑ)”h"APs® Õú¥;ÁÁ8êÌ%hŸ`ZS¹ÂøRA±KâÛÈí/poBâu:±!¡‡äAXÜ¤Û€òcÜÌp ‘5Ûé€­Ä#Ø³pª‰\†:D B÷íô‰qç|şƒœ^°Qé,{akÇ«Q¯ÊÀJ¯*±§yQaEú6¬‚1Ğ³ª‰xíàA‰úöàÃú×à
®xo¬1£2h>ÂÄğ÷JK”™!oşFù§ ƒ•éI
Yø­Â¯TÍv$hLeÇ¥z} ³‡'[t¨ñ~óPwT0pD¾î²ß¯á’&-ì_@›&:†i¡ßÑChÊ›TPtîŠğc]ÁĞø¢gŒÉ”`;”ŒÓ
ÈZ±z¯<ÅİLŞp0H?y0C¡Ö:V)K~€“r>º‘¤¶ÉC6fô¤³Ñ‰Ò³¤†I£ú<q £ãNTìq–VŸ²_$°ĞVèğÀa:MÎ#¤Àk‰¦äP3©QPÂ%)‹Ğ´Ç^‡¹4:A˜³¾“ŞÇàë…Mk@¾C1ÒØŠ)²«EğP´" BèŸ!¾R8P ä]-    \€¨ä]-e…ß8¸ QìĞe0 Ô=tíÁCcñmŸÏ	16E0qW*„MÌİá¡{îûO)@|Ú6ÚdÏæÑGÍ6	e½P56[3âIÁl*¨7HŠ`ÜU|›b§D±éI|£$‚p±vGù}-é¡eô/!ñ€ôQÏHƒäP‘SÍ%Ä¥µŒå7
rdsv9t|¶ Äğ]P¾'»q…UëDU°ÑœsO%€aI0yuyÌÀLÔCg+“Qpƒ®Y_¹Ğu—³ŠÀ`Açß…ğ½üSàŒØX¯q1AÊ©
`ğÑÙòfØj>!MÃ:ø› …qq¬ÌnQË¦¥ƒï6æÅ´ y¯İ{˜—z² 5ïá/Üjñ=î2B0²=“æ¿óáp ²ğ…T@9iX‹v”Ñ6`*nÇ+P6£{EæğĞÁ.>b´À¹`½rª‚ÀÚ ±¹üD—prØÎ(dµÙ¡´®ÔPy€•<ÌqÊ•‘ÂŒ÷]5“f?ã–·’¥´¦K %¹˜4˜{q4Ùò´÷®°º:/S3açpXÔ™<ÀmŠ‰êıQn;*}H~ĞvªvÊÃ[¡Aöüó¬ï
ëàmÒKc¡¹1pTq±‚A,ğ’ò£–+	!œ6›Ãy- æ]-    z€¨æ]-'‡ß8ô QJëev• VÉuí9­cñÌæ	»ïL0³ô……ØháVÙÊœª@~¼V†ØÑeğˆğkP÷_KákXÁ}ŸjƒI(u`^X?tÌûG±‡-¶/Ywpóª¬|Á©°¡C¾I€ö?ÂÄ•;‘q¿a½½T§7ºÿ„İXÑBé‹r2ï Fêª³‡7íq#º':+‘°è7º‹B…a'™F™CÎÀNù"\¯¬Q›&<AĞ7½‹ ßAEÅ ¸şÏà7B²D1ßaAÁÕı=ğ¼ÔƒeAã!+w©‘% ‡Mù„ªéŠ›àè÷¨#:—Ùµwıa ·Vœ³adñº)e4~0ô6hŞÌŒáN88õ«œ@ŸL˜*­KIÑT}ì¾Ä»ãPøWÛ Ü}DÁŒ'Ú\Ü·Ş`?QÈ1víæ±¶Â¼J,;Pp´hO:p¡’"ç~VÓ¢€—‹¤„q‘àb%x4Ì1(Ë0›óY`çÛ§n& §âVÜİqÒ[F·9°Ta.M¶¥aö³ÖcÚÕÀo‹”:Â¡RQŒ+´.ÑlĞ8Î‚ATFZ›K7àïJ[Âƒ/1ĞW9S×ğÔ0%îmr!zÜ-5Ï¡Ù è]-    ˜€¨è]-éˆß80Q¨e¼š ØTwí±dñ©øı	E©T0õ‘á†µãóá]7˜é+@€HA=G=ÊÑƒ?ÓÖ¬ßP¹¸`g¤ZfÁÛÒª^[``àZM6PK±%S#ãlp5ß &x¡!q€€ø-µ@¨’±‘±JÔÅig=ğÿHM/™£h®Ä Èã÷QGqÁX†øˆÍ°U3ß È_Ša½ĞúÀP,uÓ2ÆQ»Æ•´ÉĞù¤ÆŒP9^A£ª£² Làÿ–+µ1}ùØm¡›úğU¶ òˆ!	G³Z° ‰)qQšo‘¦N4·j…Ó¢M7•Òtôû 9¾VÙ‰XÂñX%ÜLî¹060=ÖÙúá,Ó•½ùÑä@¡_ÇüÎ şÑrš®ÂK«Pº;¼Ñ
¸Áê¾uW¯`Á/æà+ ­±TÌ|S2	pöøOû9¿¡p–¯)\-µ€™ĞI×>M‘ş8S’3ĞêVà#­Š¾%ª(z  )d,y @,qpŞ™¹&Ä°–QkaÔ€<oà…mÀqŒ‹åúX§Qª:-3%ÃYĞúo¦PØ©oA²À‰§c1àqkHSƒf¥1¬K>Á#mùğo¦ƒÄ°Û!X‚À¦šÊ… ê]-    ¶€¨ê]-«Šß8lQ e  Zàxí)€dñG%
Ïb\07/=ˆiï~á;Ä•+f6­@‚Æn8ô»Ñ¡x¡½ĞÎÉP{víÜ–tÁ9ë9mèJ`b]Å% ¤N±Ãx–ÄapwwƒH¢?¡ÿ#ú#·•1€ú¨¼ºéá‘­£ÙëÍä+—Ààz´AÛH»^*š JİDzWQq_÷Ê×÷°—~†G}aãjáà×ÑîÀRC5‰¶ßQÙñbõPĞ»+Ğ˜RİA2¬Èàpö¸ê1‘pm9·ğ—€˜½î,!çˆïz: ‹	Ô°\%S‡l´Vw,ßíl·g…•ğqëò¾ »%®`O ñö5SeÌõ0x)Îæ/há
nCş÷,@£röÎğõ²Ñ·p`¿ÛrP|ÁšwÇ—+ÁHVR,¦(`Cás±òÕ<Ğz)Âp8‰ä$D¡N
xÔa‡Ç€›š
ù(‘¬22o¬â¬ Hn¬âãÚ «9v›d¢Aqaí»½N°Ø¯ès‰|Ša²M¢zæûÀs‚3üQÈI¦7y€GĞ¼R¾“âĞÖAÙ&xTàó·FKDI1JÇ$IôàğX­'zšóD!6(Sfó1 ì]-    Ô€¨ì]-mŒß8¨Qd:eH¥ Ükzí¡édñåQ,
Yd0yÌ˜‰û	áûó?4ƒ.@„¶K )«­Ñ¿±o¤ô½xP=j‹sÓ‚Á—9+È5`ä_ˆş	ùQ±aıIz÷Up¹GÜŒ¡İ3èÖíG€ü	›8Í@‘Ë•ÑÖ¬íÆCÑõ6ë§øÒT¦o ÌÖ‘İãfƒqı•‹›&ŞD°ÙÉ-@š”aÁÓ®¢ÓâÀTh>§?:ùQ÷¨ŒÒØĞ}²Ùàk\A_uÁ.¦Dà”àUş»½1¹(Ç8×sğÙbzÚÅÑ!ÅÊ+½šîÄ á6ÖÅµC7}2y7î<VÌO½ó‘oâém =Ë‚7F~ñ”FíÉ}ª10º"çÅóCÖáè‹Èu@¥…%¡ËgÑ®Ô2±¼k:P>vú2½$ŸÁ¦í¬LTM`Åì!?—%9±ßü¢ {pzÑÍÉ3¡,~@gáÙ€dÇ=³‘:å®Æ1ånn?5%Szx·®œMµ -À½¨Wq¬ã@¾UÙ°WÍ–§ßüa†ìqÀuy;lÇPQæX<Í=5Ğ~5ÖÖì÷=An"f_¼wàuEC,‘1èBÑÄ˜Æğšë¨pp6®!Îå‰1Ş î]-    ò€¨î]-/ß8äQÂTeª ^÷{íSeñƒ~C
ãÕk0»iôŠÑ•á÷1RTĞ¯@†íĞÑbŸÑİê=‹­'PÿÂ ùM‘Áõlkğ¨ `fbK×sMU±ÿÃjı/ìJpû{AŠÏšÎ¡»CÖ‰$\€ş÷´ß—B‘é‡QŞt¯öÆÁp‹*It¨êJ"E NĞŞ@­vµq›4muÄ€°ÕÔ|·™aŸ<|(lÕÖÀVGÀõ½QH1½®`Ğ?9ã(…ÛA½ZP> ÀàQµç ¾1WÀŸsu0ğE\÷™›v!£hn!cO ½™˜Ûasø›÷°š¾Ÿà7õQ+lÙà ¿ô…W=Üñ2WÙ@–ˆm0ü¼½ XDáÆ£ND½@§˜Ts4 ÑÌñôºûP +Zî²±Á…HG|”r`GË?îL8ÿ±.é¼UÉ4p¼©·úMÊ¡
ò*m;ì€Ÿ.†pmà‘X»Üà0˜¬0úî½5¦ùØ¨ ±V· ¯ä	àìflqJf”Àìc°\ş±¹ÅBoançm‘òç6Àwpæ¤~¥Qh˜@!û"Ğ@î÷¥AÌkóT»èšà÷PC;Æ1†¾ñX•.­ğÜ)*gFy!òsxûüDŠ ğ]-    ¨ğ]-ñß8 Q oeÔ¯ à‚}í‘¼eñ!«Z
ms0ıPŒ… áÕh°hĞ1@ˆ$V‘Ñû#r<œÖPÁ¶†KŸÁS «Ë¢ˆ`èd°İ¡X±é×°åà?p=°¦–¡™SÄ<[
r€ æ€0òîr‘zW1æ<q&J²ëö§@XA ĞÉ+¤v†çq9Ó>Äª¼°]`|¹Ôa}¥IL6×ÊÀX²PÙ«A,Q3sº{j‹èĞÀìpZA@ßMš<à˜ÁÑ%Ác1õW7 Ğíğ]'>'r!N¤¨×Ù ‘™ ûZñgÿh¾å½·rø&9õ-¯HiĞ×Ë A\@,å3:ñĞgÅ·®f©0>‘µl²á¤>€Ój@©«ƒEVuÑÑê·R·‹ÉPÂß¹©¨>†ÁbäA¤‹—`É©]KÅ±Ìò|˜ğípş9R åÒ`¡èeÑÔr•ş€¡øD£'¼‘v‘
û/KKò…FFùs6ÙI³!j 1ºS1ÉqèèçÂ„î°¥–Üã¥áaL´Óœø]ÏÀyg‘İ5úQ"wEu¸Ğû]FA*µYC¾àyA3‡ñ|1$:ØàeÄ“ğh«]¼€!ĞmÈm6 ò]-    .¨ò]-³‘ß8\Q~‰eµ bí	&fñ¿×q
÷H{0?¤«9«á³Ÿ}i²@Š[Û4ıÏ‚Ñ]ÚX`‹…PƒtË¿‡­Á±Óë¦´hö`jgÑˆGö[±;Ed›Õ4pä‘V“]¡wc²ï‘†‡€Ôs¬F£‘%lÉšHî3VÍ¢fb7ğ RÃx@–q×q‘ø°Ÿ«#bõñ£a[p Ù¾ÀZ×YòaÅEQQCóhpĞÃFö‘¸·ÙAy%n]”
¸à2tº*Ä61“ïÎÌ›°©ğŸ	 1´HÀ!_àĞ.Ld “u(^Áã^„Kàw4VÒ	effÇÎz ÃÃú ¼*˜ñnx±.ÇDå0€f­€ á‚ÙúXM@«¾²xJ†Ñ,y£´‘P„”eËùÁÀ³<Ì‚¼`Kˆ{L¸]‹±jü<Û¦p@Ê’‰ĞW÷¡ÆÙ™xï€£ÂÖá—‘”g8/şé´NÏVLî”	“µÊŠD ³$u+—q†k;Åy°àL{ÿ	Ta*9¨şÓgÀ{‘^<íNQ@†ŠIÉuşĞÄİ msAˆş¿1sAáàûé?+HÔò1Âµ¾h6Zzğ`¦,Tòşé!®¿Ş“–â ô]-    L¨ô]-u“ß8˜QÜ£e`º ä™€ífñ]‰
ƒ0Aí)6á‘Öl‘l¶3@Œ’`fî†tÑ7–¨?„z4PEÍà‹÷Ã»Á,‚ÆHá`ìi”a±J_±Ù4²QÊ)pÁqš%¡Us ¢È€Âf(Ó‘C^Ş_öÌõ…P“áÍcÙ·1-–Å Ô¼Åj	¦Kqu–áaw4°áöÊ¨1©a9wä“ÊÚ²À\übI_QoÉÌjÅDøĞ…Íÿ’ ÑXA×
ıl4àœ¢Ó£/Ç	11‡fygNfğáëNAe!=Ò‚µÀî •Q°Àß»ÇTJ±8ö³÷kğœk‹ƒc¾Å) E+µÕ’!öñ‰¥ß"!0Â;¥'”á`tuŞ¶•@­Ñáé™;Ñ&I;ô±«XPFIy ”XmÁK7ôyá`Íf™ûmpQ±ı?ı^p‚ZÓr»Ü¡¤Mb*~I#€¥ŒÂ	œs‘²=f/.±ˆvıWgŸhò9Ü·„ô 5eçF¹¬q$îÇ³°"ô_" lÆaNŸ³J À}’UçN¤£Q^•N3ìĞ†À5ã”ÚAæG& Ïmà}6>#	·h1`1¥ğğ`ğ¢ä­JÈAS!Œe0P_¿ ö]-    j¨ö]-7•ß8ÔQ:¾e¦¿ f%‚íùøfñû0 
¼Š0ÃŞb¡5ÁáoË¥:µ@Éå—ß=fÑUÏv&¨iãP&ö0 ÊÁm:l]Ø(Ì`nlW:Ÿb±wZË¿pMÖ—İ‹ì¡3ƒUÿ~²€°Y¤)ô‘aPA!wş”·µÓƒ\9üÁ¥gI#› V¶ÎÒµ}q¯³°]p°#Brïm,®aà±·”Ü¦À^!l$ÎÌxQôUâr!€ĞGT	”Hê×A5ğ‹|ˆ°à34ÊÜ1Ïş%3ì"ğ#ÎãjÎõ	!Y3<5y —-8#¢2sÙ«J%ø¸`3ØÔÉ	¡`µ¼Ø Ç’oªiTñª™‰ø ]04¨üá>ğcÜİ@¯ä¼»ôïÑDfıD¯; PşØÛ‰åàÁ|â¶1q`OE·ª#ƒ±¦½`fôpÄê\¦a$¡‚Á*Õƒ£5€§V<VO‘Ğ”I-d'8)­àwòâPj%º>^ù ·:1iıïÁqÂpâÉJ°d›DE>Ï8aæ¿
À˜À“L’‡[øQ|¤|RqğÙĞH£M& »AAD‘Œ+š'àÿ‚<Ê™Ş1ş¬‹x×…Gğä"/A„¼!jÃÁ*è: ø]-    ˆ¨ø]-ù–ß8Q˜ØeìÄ è°ƒíqbgñ™]·
•u’0|¾‘UALáMD)ºP6@ kÉĞôWÑsEÌX’PÉ~˜h<ØÁËm¬8ê·`ğn…óe±€Œ~¼³pE;!´¡“|6ûÇ€L <K4‘B}d]yåVt×¤ğrap Ø¯_1œÅ¯q±M›„ÿC¬°e6ªI³aõHÛ^ŞšÀ`Fu=„P’Q«ßY şĞ	Û•WA“ÕŒ‚,à ƒ’v9Í¯1m¶•Òş‰ßğe°Å‡[Ì®!ùU•äÂ© ™	À…dHÌ÷@Ö|G¸zoÈGÀ'ˆ¾]¬³‡ Iú)@²ñHªu“ß˜0Fúä”A¼jáªjé&@±÷?İÉ¤Ñbƒ¿•¬ËçPÊ²8—rTÁÚyR,Dh+`Ñ#ÕYÙ•İ±D}£ëĞp{TE‘æº¡`5ó‰ıG€© @ o+‘îéÁc,Æú´\iˆE]®šn¼øÇÓ 9{‹AR×q`ó5Ìâ°¦B)h\2«aÄçjÊ61À”C=ÀMQš³õVÅ­ÇĞ
†ei*â¨A¢Úòü†ÆJàÏ:‹|T1œ(r ¨.ğ&a°7tÇ%!H±U3öç ú]-    ¦¨ú]-»˜ß8LQöòe2Ê j<…íéËgñ7ŠÎ
/š0G“	M×á+{‡ÎÖœ·@’7ğúÁ«IÑ‘AôïGAP‹× ¡xæÁ)¡ìüè¡`rqİëîGi±³¥ù1r¨p‡µ d„{¡ï¢j»lwİ€
Œ?œN¢d‘4¹§¥%;ÚdRå}>Çx
F Z©¬”eÕáqOìVN*è°§ØÀ|æf¸aÓ±Lÿ(àÀbk~V:Ô«QÉJhÑÍÚĞËa–ØÖAñº©›|¨à"ôñ_>Ğ‚1N-Ê'œğ§’§¤è¢S!×—Ñ•I ›åGè&^%t6œâix<Í08\¨D…ÜZ£ª6 ËaäSñæºa
)½Ô0ˆó¹ŒNĞØáúDån"(n@³
o`ÿYÑ€ æ©[¯PŒg˜RuÿÇÁ8î&l_P`Só¨£±â"=æ´â‰pH•.|kQ¡>©»*WZ€«êş!¢Ê‘Àï}+Êd¼@ò˜˜×Ë·¾²1® »åÄ­…´ìqşu‰Îy£°èé‹z•a¢´ĞÕ¬ÉÀƒ•:èøÉ¡Q¸Ân[kµĞÌh}¬4	A $Yëâòmà9L_Ê1:¤Xˆx±ğhŸ1.J
!&Wè¤Á9“ ü]-    Ä¨ü]-}šß8ˆQTexÏ ìÇ†ía5hñÕ¶å
©è¡0‰¶u”½Xbá	²åâ¤é8@”nu,³b;Ñ¯záÚ7ğPM06¤Ù´ôÁ‡Ô,ïÉŒ`ôs ÄXœl±QËfå'ıpÉé"¨ C¡Í²Xn£óò€z2aù”‘»&õê¼íıD]UÍ{ÙÛ
w† Ü¢ù÷.åqíŠ '$°é#hÃ"„½a±#óá‚Àd‡oğWÅQçuñH{·Ğè%— 6UAO 8«v$à¤dQICÓU1©åÄ+–ÅXğét‰Áuyø!µÙGĞ’ ÁÏJés~3X,bHŒ8ş*™Ñp|ã„ùWš¡å MÉ(îümñ„ËMA›0Êì„[äFáØß_ô&N¶@µ2!tÑ½C7§ëvPNøkŒ;Á–¨‰!”Vu`Õà¸D»i±€,ı(ÜÙBpŠ›Õgğç¡„Õ”±l€­´½#Õ„â‘*–˜*}~Ì»z©ëQjû Ál›ˆ =»ĞÉqœøÜĞ.°*‘ò­˜øa€6á"bÀ…–1“1öQÖÑç_m(£ĞK•ï>0wA^m¿Ù>‘à…h7B@1Ø?IGûğªİ²$ Mø!ızb? ş]-    â¨ş]-?œß8ÄQ²'e¾Ô nSˆíÙhñsãü
3¢©0ËSÑ•qdíáçèC÷r6º@–¥ú]¤-ÑÍ³¯Á7&ŸP‰K*ñÁåmÊ©w`vvcÂğo±ïğÓ˜İ‘òpk¥ë|
¡«ÂF!Úo€h%”sPÅ‘Ù1.Ôµ¿tàEHçÍ9×&¨ûñ ^œF[øôEq‹)#ùëö_°+o
_¡ÂaƒçF½ãvÀfµˆ¦ÛŞQ¡zÀ(”ŸĞOo/˜hOÔA­…Çºp à&Õ°2HÖ(1G}\Øacğ+WkŞP!“JøV£ ŸW­«‰×Q<"(®®øÀˆk…x´AU‘˜” Ï0YıÄóËñ"Ü9øYyL0æc|hø´á¶zÚy+tş@·0ÍCIÃÑ¼Úˆ¤{>PÑWÉ`¯Áô?%¼Mš`W¿.gúÍ/±6½kÑûpÌ+Ru~¡úL€š€¯~|%?¾‘HlK²)0¢@Xkº>ÌÈ+JÃ&c ¿Xòyq:{0Ó¨¸°l8×Ğ¶[a^Nœì"˜úÀ‡—(>j8KQôà`dÁåĞP.­2IWŞA¼¶%ÈšK´àµ5ûÍ$¶1v›%˜İáğì4öa!â¢ˆX‹ë