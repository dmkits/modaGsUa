define(["dojo/_base/declare","dijit/layout/BorderContainer","app/innerComponentFunctions","app/tagParser","app/InnerPage", "app/base"],
        function(declare,BorderContainer,InnerComponentFunctions,tagParser,InnerPage, Base){
            return declare("Page",BorderContainer,{
                constructor: function(args){
                    this.parseOnLoad=false;
                    this.$page={$parent:this,
                        dialogs:window.$$.dialogs,request:window.$$.request,
                        $dialogs:window.$$.dialogs,$request:window.$$.request
                    };
                    this.$= new InnerComponentFunctions(this,this.$page);
                    this.$page.$= this.$;
                    Base._exportFunctionsTo(this.$page);
                    var domNode=document.getElementById(args.id);
                    if(domNode)tagParser.parseNodeAttributes(args,domNode,["design"]);
                    declare.safeMixin(this,args);
                },
                postCreate:function(){
                    var createInnerPageTags= function(node){
                        var tagClass=null;
                        if(node.tagName=="INNERPAGE"){
                            tagClass=InnerPage;
                            if(!tagClass)console.error("Module for tag "+node.tagName+" cannot loaded!");
                        }
                        if(!tagClass)return;
                        var params={tagName:node.tagName};
                            tagParser.parseNodeAttributes(params,node,["class","style","region","design","gutters","title","iconClass","href"]);
                        var d=new tagClass(params,node);                                                    log('Page.postCreate createInnerPageTags: d=',d);
                        d.domNode.setAttribute("tagName",node.tagName);
                        return d;
                    };
                    tagParser.parseCFunctions.push(createInnerPageTags);
                    this.$page[this.id]=this;
                    tagParser.parseThis(this.containerNode,this.$page);
                }
            });
        });