
/**
 * Created by ianagez on 06.10.2017
 * params = { title, height, width, url, minSearchStrLength }
 */

define([ "dijit/Dialog", "dijit/registry", "dijit/form/Button", "app/hTableSimple","app/request", "dojo/domReady!"],
    function (Dialog, registry, Button, HTableSimple, Request) {
        return {
            showDialogProdBalance: function (params, callback) {
                if (!params.url) {
                    console.log("No url to get table data!");
                    return;
                }
                Request.getJSONData({url: params.url},
                    function (tableData) {
                        if (!tableData) return;
                        buildDialog(params, tableData, callback);
                    });
            }
        };

        function buildDialog(params,tableData, dialogCallback){
            var myDialog = registry.byId("dialogWithTable");
            var styleStr="";
            if(!myDialog){
                myDialog = new Dialog({"id":"dialogWithTable","content":document.createElement('div') });
                myDialog.minSearchStrLength=params.minSearchStrLength||5;
                myDialog.tableSimple=new HTableSimple();
                myDialog.tableSimple.startup();
                var input=document.createElement('input');
                input.setAttribute("type", "search");
                input.setAttribute("id", "dialog_ht_input_for_search");
                var searchBtn=new Button({label:"Найти",id:"dialog_ht_search_btn"});
                searchBtn.startup();
                searchBtn.onClick=function(){
                    var targetStr= document.getElementById("dialog_ht_input_for_search").value.trim();
                    if(targetStr.length<myDialog.minSearchStrLength)return;
                    var condition={};
                    condition["STR_TARGET"] = targetStr;
                    Request.getJSONData({url: params.url, condition: condition},
                        function (tableData) {
                            if(!tableData)return;
                                buildDialog(params,tableData);
                        });
                };
                input.onkeypress=function(event){
                    if(event.key==="Enter") {
                        searchBtn.onClick();
                    }
                };
                var label = document.createElement('label');
                label.htmlFor = 'dialog_ht_input_for_search';
                label.innerText = "Поиск: (мин. "+myDialog.minSearchStrLength+ " симв.) ";
                myDialog.content.appendChild(label);
                myDialog.content.appendChild(input);
                myDialog.content.appendChild(searchBtn.domNode);
                myDialog.content.appendChild(myDialog.tableSimple.domNode);
                myDialog.tableSimple.domNode.setAttribute("style","border:solid #b5bcc7 1px;padding:0px; margin-bottom:5px;margin-top:5px; min-height:200px;");
                myDialog.onShow=function(){
                    document.getElementById("dialog_ht_input_for_search").value="";
                };
                myDialog.cancelBtn = new Button ({id:"dialog_ht_cancel_btn","label": "Закрыть", onClick: function() {myDialog.hide()}});
                myDialog.addBtn = new Button({"label": "Добавить", onClick: function () { dialogCallback(myDialog.tableSimple.getSelectedRows(), myDialog)}});
                myDialog.addChild(myDialog.addBtn);
                myDialog.addChild(myDialog.cancelBtn);
            }
            myDialog.show();
            myDialog.startup();

            if (params.title) myDialog.set("title", params.title); else myDialog.set("title", "");
            if(params.height){
                styleStr=styleStr+"height:"+params.height;
                if(styleStr.charAt(styleStr.length-1)!=";")styleStr=styleStr+";";
            }
            if(params.width){
                styleStr=styleStr+'width:'+params.width;
                if(styleStr.charAt(styleStr.length-1)!=";")styleStr=styleStr+";";
            }
            if(params.style) styleStr=styleStr+params.style;
            if(styleStr.length>0){
                myDialog.set("style", styleStr);
            }else myDialog.set("style", "");
            myDialog.tableSimple.setContent(tableData);
        }
    });