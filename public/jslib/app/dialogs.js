/**
 * Created by dmkits on 30.12.16.
 */
define(["app/base", "dijit/Dialog", "dijit/form/Button", "dijit/ProgressBar", "dojox/layout/ContentPane", "dijit/form/TextBox"],
    function(base, Dialog, Button, ProgressBar, ContentPane, TextBox) {
        return {
            /**
             * IANAGEZ 20.10.2017
             * @param params = {title, content, btnOkLabel, style, width, height, id, actionBarTemplate}
             */
            _doSimpleDialog: function(params){
                if(!params) params={};
                if(!params.id) params.id="DialogSimple";
                var dialogStyle="text-align:center;",
                    btnOKID=params.id+"_btnOK",
                    actionBarTemplate=params.actionBarTemplate||'<div class="dijitDialogPaneActionBar" style="text-align:center"><button id="'+btnOKID+'"></button></div>';
                var dlg = base.instance(params.id, Dialog, {actionBarTemplate:actionBarTemplate});
                if(params.width)dialogStyle=dialogStyle+'width:'+params.width+'px; ';
                if(params.height)dialogStyle=dialogStyle+'height:'+params.height+'px; ';
                if(params.style) dlg.set("style", dialogStyle+params.style); else dlg.set("style", dialogStyle);
                if(!params.title) params.title="";
                dlg.set("title", params.title);
                if(params.content)dlg.set("content", params.content);
                if(!dlg.btnOK){
                    dlg.btnOK=new Button({"label":"Ok", style:"margin:5px;margin-right:10px;", onClick:function(){ dlg.hide(); } },btnOKID);
                    dlg.btnOK.focusNode.style.width="80px";
                    dlg.btnOK.startup();
                }
                if(params.btnOkLabel)dlg.btnOK.set("label",params.btnOkLabel);
                dlg.startup();
                return dlg;
            },
            showSimple: function(params){
                if(!params) params={};
                if(!params.content) params.content="";
                var dlg=this._doSimpleDialog(params); dlg.show();
                return dlg;
            },
            /**
             * @param params = {title, content, btnOkLabel, style, width, contentHeight, id, progressMaximum, btnStop,btnStopLabel, onlyCreate}
             * default: onlyCreate!=true
             * if params.onlyCreate = true, dialog dont show
             */
            showProgress: function(params){
                if(!params)params={};
                if(!params.id)params.id="progressDialog";
                params.height=null;
                var dlg=this._doSimpleDialog(params);
                if(!params.btnOkLabel)params.btnOkLabel="Close";
                dlg.btnOK.set("label",params.btnOkLabel);dlg.btnOK.set("disabled",true);
                if((params.btnStop||params.btnStopLabel)&&!dlg.btnStop){
                    dlg.btnStop=new Button({"label":"Stop", style:"margin:5px;margin-left:10px;",
                        onClick:function(){ dlg.progress(false); } });
                    dlg.btnStop.focusNode.style.width="80px";
                    dlg.btnOK.domNode.parentNode.appendChild(dlg.btnStop.domNode);
                    dlg.btnStop.startup();
                }
                if(params.btnStopLabel)dlg.btnStop.set("label",params.btnStopLabel);
                if(dlg.btnStop)dlg.btnStop.set("disabled",false);
                if(!dlg.progressBarForDialog){
                    dlg.progressBarForDialog= new ProgressBar({id:dlg.id+"_progressBar",style:"width: 100%"});
                    dlg.addChild(dlg.progressBarForDialog);
                }
                dlg.progressBarForDialog.set("maximum", params.progressMaximum);dlg.progressBarForDialog.set("value",0);
                if(!dlg.messagesContent){
                    dlg.messagesContent= new ContentPane({id:dlg.id+"_messagesContent",style:"padding:0;width:100%;text-align:left"});
                    dlg.addChild(dlg.messagesContent);
                }
                if(!dlg.setContentHeight) dlg.setContentHeight=function(contentHeight){
                    if(contentHeight!==undefined)this.messagesContent.domNode.style.height=contentHeight+"px";
                };
                dlg.setContentHeight(params.contentHeight);
                dlg.messagesContent.set("content","");
                dlg.progressStopped=false;dlg.progressFinished=false;
                if(!dlg.progress) dlg.progress=function(process){
                    if(!this.open)this.show();
                    if(process!==undefined)this.progressStopped=process===false;
                    dlg.btnOK.set("disabled",!(this.progressStopped||this.progressFinished));
                    if(dlg.btnStop)dlg.btnStop.set("disabled",this.progressStopped||this.progressFinished);
                };
                if(!dlg.setFinished) dlg.setFinished=function(){
                    this.progressFinished=true;
                    this.progress();
                };
                /**
                 * params = { title, contentHeight, progressMaximum, message }
                 */
                if(!dlg.start) dlg.start=function(params){
                    this.progressStopped=false;this.progressFinished=false;
                    if(params.title)this.set("title", params.title);
                    this.setContentHeight(params.contentHeight);
                    if(params.progressMaximum>=0)this.progressBarForDialog.set("maximum", params.progressMaximum);
                    this.progressBarForDialog.set("value",0);
                    if(params.message){ this.addMsgLine(params.message);return; }
                    this.progress();
                };
                if(!dlg.addMsgLine) dlg.addMsgLine=function(msg,params){
                    if(params&&params.contentHeight) this.setContentHeight(params.contentHeight);
                    this.progress();
                    this.messagesContent.domNode.appendChild(this.lastMessage=document.createElement("div"));
                    if(params&&params.textStyle)
                        this.lastMessage.innerHTML='<span style="'+params.textStyle+'">'+msg+'</span>';
                    else
                        this.lastMessage.innerHTML=msg;
                    this.lastMessage.scrollIntoView(false);
                };
                if(!dlg.addMsg) dlg.addMsg=function(msg,params){
                    this.progress();
                    if(params&&params.textStyle)
                        this.lastMessage.innerHTML+='<span style="'+params.textStyle+'">'+msg+'</span>';
                    else
                        this.lastMessage.innerHTML+=msg;
                    this.lastMessage.scrollIntoView(false);
                };
                if(!dlg.setMsg) dlg.setMsg=function(msg,params){
                    this.progress();
                    if(!this.lastMessage)this.messagesContent.domNode.appendChild(this.lastMessage=document.createElement("div"));
                    if(params&&params.textStyle)
                        this.lastMessage.innerHTML='<span style="'+params.textStyle+'">'+msg+'</span>';
                    else
                        this.lastMessage.innerHTML=msg;
                    this.lastMessage.scrollIntoView(false);
                };
                if(!dlg.setProgress) dlg.setProgress=function(progress,msgLine){
                    this.progress();
                    if(progress>=0)this.progressBarForDialog.set("value",progress);
                    if(msgLine)this.addMsgLine(msgLine);
                };
                if(params.onlyCreate!==true)dlg.show();
                return dlg;
            }
        };
    });