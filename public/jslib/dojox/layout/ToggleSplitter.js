//>>built
define("dojox/layout/ToggleSplitter",["dojo","dijit","dijit/layout/BorderContainer"],function(b,h){b.experimental("dojox.layout.ToggleSplitter");var k=b.declare("dojox.layout.ToggleSplitter",h.layout._Splitter,{container:null,child:null,region:null,state:"full",_closedSize:"0",baseClass:"dojoxToggleSplitter",templateString:'\x3cdiv class\x3d"dijitSplitter dojoxToggleSplitter" dojoAttachEvent\x3d"onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse"\x3e\x3cdiv dojoAttachPoint\x3d"toggleNode" class\x3d"dijitSplitterThumb dojoxToggleSplitterIcon" tabIndex\x3d"0" role\x3d"separator" dojoAttachEvent\x3d"onmousedown:_onToggleNodeMouseDown,onclick:_toggle,onmouseenter:_onToggleNodeMouseMove,onmouseleave:_onToggleNodeMouseMove,onfocus:_onToggleNodeMouseMove,onblur:_onToggleNodeMouseMove"\x3e\x3cspan class\x3d"dojoxToggleSplitterA11y" dojoAttachPoint\x3d"a11yText"\x3e\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e',
postCreate:function(){this.inherited(arguments);var a=this.region;b.addClass(this.domNode,this.baseClass+a.charAt(0).toUpperCase()+a.substring(1))},startup:function(){this.inherited(arguments);var a=this.child.domNode,d=b.style(a,this.horizontal?"height":"width");this.domNode.setAttribute("aria-controls",a.id);b.forEach(["toggleSplitterState","toggleSplitterFullSize","toggleSplitterCollapsedSize"],function(a){var b=a.substring(14),b=b.charAt(0).toLowerCase()+b.substring(1);a in this.child&&(this[b]=
this.child[a])},this);this.fullSize||(this.fullSize="full"==this.state?d+"px":"75px");this._openStyleProps=this._getStyleProps(a,"full");this._started=!0;this.set("state",this.state);return this},_onKeyPress:function(a){"full"==this.state&&this.inherited(arguments);if(a.charCode==b.keys.SPACE||a.keyCode==b.keys.ENTER)this._toggle(a),b.stopEvent(a)},_onToggleNodeMouseDown:function(a){b.stopEvent(a);this.toggleNode.focus()},_startDrag:function(a){"full"==this.state&&this.inherited(arguments)},_stopDrag:function(a){this.inherited(arguments);
this.toggleNode.blur()},_toggle:function(a){switch(this.state){case "full":a=this.collapsedSize?"collapsed":"closed";break;case "collapsed":a="closed";break;default:a="full"}this.set("state",a)},_onToggleNodeMouseMove:function(a){var d=this.baseClass,c=this.toggleNode,f="full"==this.state||"collapsed"==this.state;a="mouseout"==a.type||"blur"==a.type;b.toggleClass(c,d+"IconOpen",a&&f);b.toggleClass(c,d+"IconOpenHover",!a&&f);b.toggleClass(c,d+"IconClosed",a&&!f);b.toggleClass(c,d+"IconClosedHover",
!a&&!f)},_handleOnChange:function(a){a=this.child.domNode;var d,c,f=this.horizontal?"height":"width";"full"==this.state?(c=b.mixin({display:"block",overflow:"auto",visibility:"visible"},this._openStyleProps),c[f]=this._openStyleProps&&this._openStyleProps[f]?this._openStyleProps[f]:this.fullSize,b.style(this.domNode,"cursor",""),b.style(a,c)):"collapsed"==this.state?(c=b.getComputedStyle(a),this._openStyleProps=d=this._getStyleProps(a,"full",c),b.style(this.domNode,"cursor","auto"),b.style(a,f,this.collapsedSize)):
(this.collapsedSize||(c=b.getComputedStyle(a),this._openStyleProps=d=this._getStyleProps(a,"full",c)),c=this._getStyleProps(a,"closed",c),b.style(this.domNode,"cursor","auto"),b.style(a,c));this._setStateClass();this.container._started&&this.container._layoutChildren(this.region)},_getStyleProps:function(a,d,c){c||(c=b.getComputedStyle(a));var f={},e=this.horizontal?"height":"width";f.overflow="closed"!=d?c.overflow:"hidden";f.visibility="closed"!=d?c.visibility:"hidden";f[e]="closed"!=d?a.style[e]||
c[e]:this._closedSize;var g=["Top","Right","Bottom","Left"];b.forEach(["padding","margin","border"],function(a){for(var b=0;b<g.length;b++){var e=a+g[b];"border"==a&&(e+="Width");void 0!==c[e]&&(f[e]="closed"!=d?c[e]:0)}});return f},_setStateClass:function(){var a="\x26#9652",d=this.region.toLowerCase(),c=this.baseClass,f=this.toggleNode,e="full"==this.state||"collapsed"==this.state,g=this.focused;b.toggleClass(f,c+"IconOpen",e&&!g);b.toggleClass(f,c+"IconClosed",!e&&!g);b.toggleClass(f,c+"IconOpenHover",
e&&g);b.toggleClass(f,c+"IconClosedHover",!e&&g);if("top"==d&&e||"bottom"==d&&!e)a="\x26#9650";else if("top"==d&&!e||"bottom"==d&&e)a="\x26#9660";else if("right"==d&&e||"left"==d&&!e)a="\x26#9654";else if("right"==d&&!e||"left"==d&&e)a="\x26#9664";this.a11yText.innerHTML=a},_setStateAttr:function(a){if(this._started){var b=this.state;this.state=a;this._handleOnChange(b);switch(a){case "full":this.domNode.setAttribute("aria-expanded",!0);a="onOpen";break;case "collapsed":this.domNode.setAttribute("aria-expanded",
!0);a="onCollapsed";break;default:this.domNode.setAttribute("aria-expanded",!1),a="onClosed"}this[a](this.child)}},onOpen:function(a){},onCollapsed:function(a){},onClosed:function(a){}});b.extend(h._Widget,{toggleSplitterState:"full",toggleSplitterFullSize:"",toggleSplitterCollapsedSize:""});return k});
//# sourceMappingURL=ToggleSplitter.js.map