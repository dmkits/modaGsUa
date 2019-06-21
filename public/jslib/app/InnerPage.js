define(["dojo/_base/declare","dijit/layout/ContentPane","app/tagParser","app/scriptsParser", "app/innerComponentFunctions","app/base"],
        function(declare,ContentPane,tagParser,scriptsParser, InnerComponentFunctions, Base){
            return declare("InnerPage",ContentPane,{
                constructor: function(args){
                    this.parseOnLoad=false;
                    this.$innerPage={$parent:this,
                        dialogs:window.$$.dialogs,request:window.$$.request,
                        $dialogs:window.$$.dialogs,$request:window.$$.request
                    };
                    this.$= new InnerComponentFunctions(this,this.$innerPage);
                    this.$innerPage.$=this.$;
                    Base._exportFunctionsTo(this.$innerPage);
                    declare.safeMixin(this,args);
                },
                onLoad: function(){                                                                         log('InnerPage.onLoad',this.containerNode);
                    tagParser.parseThis(this.containerNode,this.$innerPage);
                    this.startup();
                    this._layout();
                    scriptsParser.parseScripts(this.containerNode);
                }
            });
        });