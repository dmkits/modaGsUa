/**
 * Created by dmkits on 30.12.16.
 */
define(["app/app", "dijit/ConfirmDialog","dojox/widget/DialogSimple", "dijit/form/Button", "dijit/form/TextBox", "dojo/domReady!"],
    function(APP, ConfirmDialog,DialogSimple, Button, TextBox) {
        return {
            /**
             * DMKITS 2016-02-25
             * @param params
             * params = {title, content, style, btnOkLabel, btnCancelLabel}
             * @param onExecute
             * @param onCancel
             * calls onCancel(Dialog) or onExecute(Dialog)
             */
            doDialogMsg: function(params, onExecute, onCancel) {
                var dialogStyle="";
                var myDialog = APP.instance("ConfirmDialog", ConfirmDialog, {});
                if(params.width)dialogStyle=dialogStyle+'width:'+params.width+'; ';
                if (params.title) myDialog.set("title", params.title); else myDialog.set("title", "");
                if (params.content) myDialog.set("content", params.content); else myDialog.set("content", "");
                if (params.style) myDialog.set("style", dialogStyle+params.style); else myDialog.set("style", dialogStyle);
                if (params.btnOkLabel) myDialog.set("buttonOk", params.btnOkLabel);
                if (params.btnCancelLabel) myDialog.set("buttonCancel", params.btnCancelLabel);
                if (onCancel != null) myDialog.onCancel = function () {
                    onCancel(myDialog);
                };
                if (onExecute != null) myDialog.onExecute = function () {
                    onExecute(myDialog);
                };
                myDialog.show();
                myDialog.startup();
            },
            /**
             * IANAGEZ 20.10.2017
             * @param params = {title, content, btnOkLabel, style, width, dialogID}
             */
            doSimpleDialog: function(params) {
                if(!params) params={};
                if(!params.dialogID) params.dialogID="DialogSimple";
                var dialogStyle="text-align:center; ";
                var myDialog = APP.instance(params.dialogID, DialogSimple, {});
                if(params.width)dialogStyle=dialogStyle+'width:'+params.width+'px; ';
                if (!params.title) params.title="";
                myDialog.set("title", params.title);
                if (!params.content) params.content="";
                myDialog.set("content", params.content+"<br>");
                if (params.style) myDialog.set("style", dialogStyle+params.style); else myDialog.set("style", dialogStyle);
                var okBtn=new Button({"label":"Ok", style:"margin-top:10px;", onClick:function(){myDialog.hide(); }});
                okBtn.startup();
                myDialog.addChild(okBtn);
                if (params.btnOkLabel)okBtn.set("label",params.btnOkLabel );
                myDialog.startup();
                myDialog.show();
            },
            doRequestFailDialog: function(params) {
                if(!params) params={};
                params.dialogID="requestFailDialog";
                params.width=350;
                params.btnOkLabel="Закрыть";
                var instance= APP.getInstanceByID(params.dialogID);
                if(instance&&instance.open){
                    return;
                }
                this.doSimpleDialog(params);
            },
            mainAboutDialog: function (){
                this.doDialogMsg({title:"О программе",
                    content:"Система учета <b>MODA.GS.UA</b>. <br>Разработчики: dmkits, ianagez<br> 2017-2018",
                    btnOkLabel:"OK", btnCancelLabel:"Закрыть"});
            },
            printTagsDialog: function(callback) {
                this.doDialogMsg({title:"Напечать все ценники?",content:"<div align='center'>Вы хотите напечатать<br>более 100 ценников?</div>",
                    btnOkLabel:"Да", btnCancelLabel:"Нет",width:"220px"},function(dialog){
                    callback();
                    dialog.hide();
                    });
            },
            impossibleToPrintTagsDialog: function() {
                this.doSimpleDialog({title:"Превышение количества!", width:"220px;", content:"<div align='center'>Максимальное количество -<br>1000шт. </div>"});
            },

            //doDialog1: function (title, content, style, onExecute, onCancel) {
            //    require(["dijit/Dialog", "dijit/form/Button", "dojo/domReady!"], function(Dialog,Button){
            //    var myDialog = new Dialog({title: title, content: content, style: style});
            //    myDialog.onCancel = function() { onCancel(); }
            //    myDialog.onExecute = function() { onExecute(); }
            //    myDialog.addChild(new Button({type:"submit",title:"OK",label:"OK",onClick:function(){ myDialog.execute(); }}));
            //    myDialog.show()
            //    });
            //}
            /**
             * DMKITS 2016.02.29 v.1.1
             * @param params = {title, style, btnOkLabel, btnCancelLabel, content}
             * content = [{type:textbox ,label, width, disabled, value},{...},}, {...}, {...}, ...]
             *  or content = {item1:{type:textbox ,label, width, disabled, value}, item2:{...}, item3:{...}, ...}
             * on execute (click OK button) call onExecute(Dialog, content), content parameter contains value: content = {item1:{...,value}, ...}
             * @param onExecute
             * @param onCancel
             */
            doDialogSimpleTextBox: function(params, onExecute, onCancel) {
                var myDialog = APP.instance("DialogSimpleTextBox", ConfirmDialog, {});
                if (params.title) myDialog.set("title", params.title);
                if (params.style) myDialog.set("style", params.style);
                if (params.btnOkLabel) myDialog.set("buttonOk", params.btnOkLabel);
                if (params.btnCancelLabel) myDialog.set("buttonCancel", params.btnCancelLabel);
                var content = params.content;
                var dlgСontent = "<table>";
                for (var item in content) {
                    dlgСontent = dlgСontent + "<tr><td>";
                    if (content[item].type == "textbox") {
                        var contentname = "DialogSimpleTextBox_textbox" + item;
                        content[item].name = contentname;
                        dlgСontent = dlgСontent + "<label for=\"" + contentname + "\">" + content[item].label + "</label>";
                    }
                    dlgСontent = dlgСontent + "</td><td>";
                    if (content[item].type == "textbox") {
                        var contentname = content[item].name;
                        dlgСontent = dlgСontent + "<input type=\"text\" id=\"" + contentname + "\"/>";
                    }
                    dlgСontent = dlgСontent + "</td></tr>";
                }
                dlgСontent = dlgСontent + "</table>";
                myDialog.set("content", dlgСontent);
                for (var item in content) {
                    if (content[item].type == "textbox") {

                        var dialogtextbox = APP.instanceForID(content[item].name, content[item].name, TextBox, {type: "text"});
                        if (content[item].value) dialogtextbox.set("value", content[item].value);
                        if (content[item].disabled) dialogtextbox.set("disabled", true); else dialogtextbox.set("disabled", false);
                        var width = content[item].width;
                        if (width) dialogtextbox.set("style", "width:" + width+"px;");
                        content[item].textbox = dialogtextbox;
                    }
                }
                if (onCancel != null) myDialog.onCancel = function () {
                    onCancel(myDialog);
                };
                if (onExecute != null) myDialog.onExecute = function () {
                    var content = params.content;
                    for (var item in content) {
                        if (content[item].type == "textbox") {
                            content[item].value = content[item].textbox.value;
                        }
                    }
                    onExecute(myDialog, content);
                };
                myDialog.show()
            },

            /**
             * DMKITS 20160229
             * select value from tree
             * params = { title, style, btnOkLabel, btnCancelLabel, label, treedataurl, treestyle }
             * on execute (click OK button) call onExecute(Dialog, content), content parameter contains selected item data object
             * @param params
             * @param onExecute
             * @param onCancel
             */
            doDialogSimpleTree: function (params, onExecute, onCancel) {
                //require(["dijit/registry", "dijit/ConfirmDialog", "dojo/data/ItemFileReadStore", "dijit/tree/ObjectStoreModel", "dojo/store/DataStore",
                //    "dijit/layout/ContentPane", "dijit/layout/BorderContainer", "dijit/Tree", "dojo/domReady!"],
                //function (registry, ConfirmDialog, ItemFileReadStore, ObjectStoreModel, DataStore, ContentPane, BorderContainer, Tree) {
                //    var myDialog = initElem(registry, "DialogSimpleTree", null, ConfirmDialog, {});
                //
                //    if (params.title) myDialog.set("title", params.title);
                //    //myDialog.set("content", dlgСontent);
                //    if (params.style) myDialog.set("style", params.style);
                //    if (params.btnOkLabel) myDialog.set("buttonOk", params.btnOkLabel);
                //    if (params.btnCancelLabel) myDialog.set("buttonCancel", params.btnCancelLabel);
                //
                //    var treestore = myDialog.treestore;
                //    if (treestore==null) {
                //        treestore = new ItemFileReadStore({clearOnClose:true });
                //        myDialog.treestore = treestore;
                //    }
                //    treestore._jsonFileUrl = params.treedataurl;
                //    treestore.close();
                //    treestore.fetch();
                //    var datastore = myDialog.datastore;
                //    if (datastore==null) {
                //        datastore = new DataStore({ store:treestore, getChildren: function(object){ return this.query({parent: object.id}); } });
                //        myDialog.datastore = datastore;
                //    }
                //    var treemodel = myDialog.treemodel;
                //    if (treemodel==null) {
                //        treemodel = new ObjectStoreModel({ store: datastore, query: {id: 'root'} });
                //        myDialog.treemodel = treemodel;
                //    }
                //    var dlgTreeLabel = initChild(registry, "DialogSimpleTree_treelabel", myDialog, ContentPane, {style:"margin:0;padding:0;padding-bottom:5px"});
                //    dlgTreeLabel.set("content",params.label);
                //    var dlgTreePane = initChild(registry, "DialogSimpleTree_treepane", myDialog, BorderContainer, {style:params.treestyle});
                //    var dlgTree = initChild(registry, "DialogSimpleTree_tree", dlgTreePane, Tree, {region:"center", model:treemodel, autoExpand: true});
                //
                //    if (onCancel != null) myDialog.onCancel = function () {
                //        onCancel(myDialog);
                //    };
                //    if (onExecute != null) myDialog.onExecute = function () {
                //        var treeItem = dlgTree.get("selectedItem");
                //        onExecute(myDialog, treeItem);
                //    };
                //    myDialog.show()
                //});
            },

            /**
             * DMKITS 20161121
             * select value from list
             * params = { title, style, btnOkLabel, btnCancelLabel, label, , treestyle }
             * on execute (click OK button) call onExecute(Dialog, content), content parameter contains selected item data object
             * @param params
             * @param onExecute
             * @param onCancel
             */
            doDialogSimpleList: function (params, onInit, onExecute, onCancel) {
                //require(["dijit/registry", "dijit/ConfirmDialog",
                //    "dijit/layout/ContentPane", "dijit/layout/BorderContainer", "dojo/domReady!"],
                //function (registry, ConfirmDialog, ContentPane, BorderContainer) {
                //    var simpleListDialog = initElem(registry, "DialogSimpleList", null, ConfirmDialog, {});
                //
                //    if (params.title) simpleListDialog.set("title", params.title);
                //    //myDialog.set("content", dlgСontent);
                //    if (params.style) simpleListDialog.set("style", params.style);
                //    if (params.btnOkLabel) simpleListDialog.set("buttonOk", params.btnOkLabel);
                //    if (params.btnCancelLabel) simpleListDialog.set("buttonCancel", params.btnCancelLabel);
                //
                //    //var dlgMainContentPane = initChild(registry, "DialogSimpleList_MainContentPane", simpleListDialog, BorderContainer, {}); //style:params.liststyle
                //    //dlgMainContentPane.set("content","XCCDKLM<>VM><MLMFNLFNLDSMKLMDMFKM");
                //
                //
                //    var dlgMainContentTopPane =
                //        initChild(registry, "DialogSimpleList_MainContentTopPane", simpleListDialog,
                //            ContentPane, {region:'top', style:"height:100px;margin:0;padding:0;padding-bottom:5px"});
                //    simpleListDialog.mainContentPane = dlgMainContentTopPane;
                //
                //    //dlgMainContentTopPane.set("content","sdkfl;jsadcmksrjltmijerjhmtgkwcdnfg");
                //    //dlgMainContentTopPane.set("content",params.label);
                //
                //    var dlgHTable; //= initChild(registry, "DialogSimpleList_HTable", dlgMainContentPane,
                //    //    HTable, {region:'center', readOnly:true, useFilters:false, allowFillHandle:false,htaddRows:0, postChanges:true, enableComments:false});
                //    if (onInit) onInit(simpleListDialog);
                //    if (onCancel) simpleListDialog.onCancel = function () {
                //        onCancel(simpleListDialog);
                //    };
                //    if (onExecute) simpleListDialog.onExecute = function () {
                //        onExecute(simpleListDialog, dlgHTable);
                //    };
                //    simpleListDialog.show()
                //});
            }
        };
    });