define(["dijit/layout/BorderContainer", "dijit/layout/LayoutContainer", "dojox/layout/ContentPane",
        "dijit/layout/TabContainer", "dijit/layout/StackContainer","dijit/layout/StackController",
        "dijit/MenuBar", "dijit/MenuBarItem", "dijit/PopupMenuBarItem", "dijit/Menu", "dijit/MenuItem", "dijit/MenuSeparator",
        "dijit/form/Button","dijit/form/ToggleButton", "dijit/form/TextBox","dijit/form/DateTextBox"],
    function(){
        var $ComponentFunctions= function($c,$page){
            this.cid= function(name){
                var cid=null;
                if(window.dijit&&window.dijit.registry){
                    cid=window.dijit.registry.byId(name);
                }else{
                    console.error("dijit/registry NOT INITIALIZED!!!"); return;
                }
                return cid;
                //if(i)return i;//i.$=new $$Functions(i),i;
                //var domNode=this.domNode;
                //if(!domNode)domNode=document.body;
                //var els=domNode.getElementsByTagName("*");
                //for(var ind=0;ind<els.length;ind++){
                //    var el=els[ind];
                //    if("#"+el.id==args)return el;
                //}
            };
            this.val= function(val){
                if(val===undefined)return $c.get("value");
                $c.set("value",val);
                return $c;
            };
            this.show=function(value){
                if(value!=false)$c.domNode.style["display"]="";else $c.domNode.style["display"]="none";
                return $c;
            };
            this.style=function(name,value){
                $c.domNode.style[name]=value;
                return $c;
            };
            this.click=function(handler){
                $c.onClick=handler;
                return $c;
            };
            this.addNew= function(Class, params){
                if(!params) params={};
                var newInstance=new Class(params);
                if($page&&newInstance.id){
                    $page[newInstance.id]=newInstance;
                    if($page.$cItems)$page.$cItems[newInstance.id]=newInstance;
                }
                newInstance.$=new $ComponentFunctions(newInstance);
                return newInstance;
            };
            this.addChildTo= function(o, Class, params) {
                if(!o||!Class) {
                    console.error("$ComponentFunctions addChildTo FAIL! Reason:no instance or no Class");
                    return;
                }
                if(!params) params={};
                var child= o.$.addNew(Class, params);
                o.addChild(child);
                return child;
            };
            this.addInnerPage=function(params,callback){
                var innerPage=this.addChildTo($c, window.InnerPage,params);
                if(callback)callback(innerPage);
                return $c;
            };
            this.setActionFor=function(owner,actionName,actionHandler){
                if(!owner||!actionName||!actionHandler)return $c;
                owner.set(actionName,function(e){
                    actionHandler(owner,e);
                });
            };
            this.setHandlers=function(actionHandlers){
                for (var actionName in actionHandlers) {
                    var actionHandler=actionHandlers[actionName];
                    if(actionName=="click")this.setActionFor($c,"onClick",actionHandler);
                }
                return $c;
            };
            this.addMenu=function(menuClassName,params,addCallback){
                var menuClass=window.dijit[menuClassName];
                if(!menuClass){
                    console.error("CALL addMenu: dijit/"+menuClassName+" NOT INITIALIZED!!!");
                    return $c;
                }
                if(menuClassName=="PopupMenuBarItem"){
                    var popupMenuClass=window.dijit["Menu"];
                    if(!popupMenuClass){
                        console.error("CALL addMenu: dijit/"+popupMenuClass+" NOT INITIALIZED!!!");
                        return $c;
                    }
                    var newMenu= this.addNew(menuClass,params), newPopupMenu= this.addNew(popupMenuClass,{id:params.id+"_menu"});
                    newMenu.set("popup",newPopupMenu);
                    $c.addChild(newMenu);
                    newPopupMenu.$.setHandlers(params);
                    if(addCallback)addCallback(newPopupMenu);
                    return $c;
                }
                var child= this.addChildTo($c,menuClass,params);
                child.$.setHandlers(params);
                if(addCallback)addCallback(child);
                return $c;
            };
            this.addChildToNode= function(node, Class, params) {
                if(!node||!Class) {
                    console.error("$ComponentFunctions addChildTo FAIL! Reason:no node or no Class");
                    return;
                }
                if(!params) params={};
                var child= this.addNew(Class, params);
                node.appendChild(child.domNode);
                return child;
            };
            /**
             * params = { ... }
             * params.fStyle set style for focus node
             */
            this.addWigetTo=function(node,wClassName,params,addCallback){
                var wigetClass=window.dijit[wClassName];
                if(!wigetClass)wigetClass=window.dijit.layout[wClassName];
                if(!wigetClass)wigetClass=window.dijit.form[wClassName];
                if(!wigetClass){
                    console.error("CALL addDijit: dijit/"+wClassName+" NOT INITIALIZED!!!");
                    return $c;
                }
                var child= this.addChildToNode(node,wigetClass,params);
                if(params.fStyle&&child.focusNode) child.focusNode.setAttribute("style",params.fStyle);
                child.$.setHandlers(params);
                if(addCallback)addCallback(child);
                return $c;
            };
            this.addAppComponent=function(acClassName,params,addCallback){
                var appCompClass=window[acClassName];
                if(!appCompClass){
                    console.error("CALL addAppComponent: "+acClassName+" NOT INITIALIZED!!!");
                    return $c;
                }
                var cInctance= this.addChildTo($c,appCompClass,params);
                if(addCallback)addCallback(cInctance);
                return $c;
            };
        };
        return $ComponentFunctions;
    });