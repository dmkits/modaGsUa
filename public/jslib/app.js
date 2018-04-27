/**
 * Created by dmkits on 18.12.16.
 */
define(["dijit/registry", "dojo/dom-style"],
    function(registry, domStyle) {
        return {
            getInstanceByID: function(id){
                return registry.byId(id);
            },
            instance: function(htmlElemID, Class, params) {
                var instance = registry.byId(htmlElemID);
                if (!instance) {
                    if (!params) params={};
                    params.id = htmlElemID;
                    instance = new Class(params);
                }
                return instance;
            },
            instanceFor: function(htmlElem, Class, params) {
                var id = htmlElem.getAttribute("id"), instance;
                if (id!=undefined) instance = registry.byId(id);
                if (!instance) {
                    if (!params) params={};
                    params.id = id;
                    instance = new Class(params, htmlElem);
                }
                return instance;
            },
            instanceForID: function(htmlElemID, Class, params, style) {
                var instance = registry.byId(htmlElemID);
                if (!instance) {
                    if (!params) params={};
                    params.id = htmlElemID;
                    instance = new Class(params, htmlElemID);
                    if(style)
                        for (var styleAttrName in style)
                            domStyle.set(htmlElemID, styleAttrName, style[styleAttrName]);
                }
                return instance;
            },
            childFor: function(parent, ID, Class, params) {
                var instance = registry.byId(ID);
                if (!instance) {
                    if (!params) params={};
                    params.id = ID;
                    instance = new Class(params);
                    if (parent!=null) parent.addChild(instance);
                }
                return instance;
            },
            today: function(){
                return moment().toDate();
            },
            curMonthBDate: function(){
                return moment().startOf('month').toDate();
            },
            curMonthEDate: function(){
                return moment().endOf('month').toDate();
            },
            yesterday:function(){
                return moment().subtract(1,'day').toDate();
            }
        }
    });
