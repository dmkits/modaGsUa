var dataModel=require(appDataModelPath);
var t_Exc= require(appDataModelPath+"t_Exc"), t_ExcD= require(appDataModelPath+"t_ExcD"),
    // r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule= function(errs,nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Exc,t_ExcD,r_Ours,r_Stocks,r_Comps,r_States,r_Prods], errs,
        function(){ nextValidateModuleCallback(); });
};

module.exports.routes=[//-- App routes --
    { path:'/pageDocExcDelivery', componentUrl:'/mobile/pageDocExcDelivery_DocsList', options:{clearPreviousHistory:true,ignoreCache:true}, define:true },
    { path:'/pageDocExcDeliveryProdsData/:excChID', componentUrl:'/mobile/pageDocExcDelivery_ProdsData', options:{ignoreCache:true} },
    { path:'/pageDocExcDeliverySettings', componentUrl:'/mobile/pageDocExcDelivery_Settings', options:{ignoreCache:true} }
];
module.exports.moduleViewURL= "/mobile/pageDocExcDelivery_DocsList";
module.exports.moduleViewPath= "mobile/pageDocExcDelivery_DocsList.html";
module.exports.init = function(app){
    app.get("/mobile/pageDocExcDelivery_Settings",function(req,res){
        res.sendFile(appViewsPath+'mobile/pageDocExcDelivery_Settings.html');
    });
    app.get("/mobile/pageDocExcDelivery_ProdsData",function(req,res){
        res.sendFile(appViewsPath+'mobile/pageDocExcDelivery_ProdsData.html');
    });
    var tExcsListTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data:"DocID", name:"Номер", width:85, type:"text", align:"right", dataSource:"t_Exc"},
        {data:"IntDocID", name:"Вн. номер", width:85, type:"text", align:"right", dataSource:"t_Exc"},
        {data:"DocDate", name:"Дата", width:60, type:"dateAsText",align:"center", dataSource:"t_Exc"},
        {data:"SDocDate", name:"Дата", width:60, type:"test",align:"center", dataFunction:"CONVERT(varchar(10),DocDate,104)" },
        {data:"OurName", name:"Фирма", width:150, type:"text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Exc.OurID" },
        {data:"StockName", name:"Склад", width:150, type:"text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data:"NewStockName", name:"На склад", width:150, type:"text",
            dataSource:"r_Stocks as st2", sourceField:"StockName", linkCondition:"st2.StockID=t_Exc.NewStockID" },
        {data:"CurrID", name:"Код валюты", width:50, type:"text", align:"center", visible:false, dataSource:"t_Exc", sourceField:"CurrID"},
        {data:"CurrName", name:"Валюта", width:70, type:"text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Exc.CurrID" },
        {data:"Qty", name:"Кол-во", width:75, type:"numeric",
            childDataSource:"t_ExcD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_ExcD", sourceField:"Qty"} },
        // {data:"TNewQty", name:"Факт кол-во", width:75, type:"numeric",
        //     childDataSource:"t_VenA", childLinkField:"ChID", parentLinkField:"ChID",
        //     dataFunction:{function:"sumIsNull", source:"t_VenA", sourceField:"TNewQty"} },
        {data:"TSumCC_wt", name:"Сумма", width:85, type:"numeric2", dataSource:"t_Exc" },
        // {data:"TNewSumCC_wt", name:"Сумма", width:85, type:"numeric2", dataSource:"t_Ven" },
        {data:"StateCode", name:"StateCode", width:50, type:"text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data:"IsStateCreated", name:"Создан", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (0,55) Then 1 Else 0 END" },
        {data:"IsStateOnConfirmation", name:"На подтверждении", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (50,56,60) Then 1 Else 0 END" },
        {data:"IsStateReturned", name:"Возвращен", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (52,58,62) Then 1 Else 0 END" },
        {data:"IsStateClosedOrConfirmed", name:"Закрыт/Подтвержден", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (145,51,57,61) Then 1 Else 0 END" },
        {data:"StateName", name:"Статус", width:250, type:"text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Exc.StateCode" },
        {data:"StateInfo", name:"Информация статуса", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode not in (50,56,60) Then 'Изменение запрещено' Else 'Изменение разрешено' END" }
    ];
    app.get("/mobile/docExcDelivery/getDataForExcList",function(req,res){
        var conditions={}, top="";
        for(var condItem in req.query){
            if(condItem=="top")top="top "+req.query[condItem];
            else if(condItem&&condItem.indexOf("StockID")==0){
                var sCond= condItem.replace("StockID","").replace("~","=")+req.query[condItem];
                sCond= sCond.replace("=-1",">0");
                conditions["(t_Exc.StockID"+sCond+" or t_Exc.NewStockID"+sCond+")"]=null;
            }else conditions["t_Exc."+condItem]=req.query[condItem];
        }
        conditions["t_Exc.StateCode in (50,56,60)"]=null;
        r_Stocks.getDataItems(req.dbUC,{fields:['StockID','StockName'], conditions:{"StockID>":0}, order:"StockName"},
            function(result){
                var error= (result.error)?result.error:'',listStocks=(result)?result.items:null;
                if(listStocks) listStocks=[{StockID:-1, StockName:'Все склады'}].concat(listStocks);
                t_Exc.getDataItemsForTable(req.dbUC,{tableColumns:tExcsListTableColumns, conditions:conditions,
                        order:"DocDate desc, DocID desc", top:top},
                    function(result){
                        error+= (result.error)?result.error:'';
                        var outData= {listStocks:listStocks,listExcsByStockID:(result)?result.items:null};
                        if(error!='') outData.error=error;
                        res.send(outData);
                    });
            });
    });
    var tExcDTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", dataSource:"t_ExcD", identifier:true, readOnly:true, visible:false},
        {data:"SrcPosID", name:"№ п/п", width:45, type:"numeric", dataSource:"t_ExcD", identifier:true },
        {data:"ProdID", name:"Код товара", width:50, type:"text", dataSource:"t_ExcD", visible:true},
        {data:"Barcode", name:"Штрихкод", width:75, type:"text", dataSource:"t_ExcD", visible:false},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID" },
        {data:"UM", name:"Ед. изм.", width:55, type:"text", align:"center", dataSource:"t_ExcD", sourceField:"UM"},
        {data:"Qty", name:"Кол-во", width:50, type:"numeric", dataSource:"t_ExcD"},
        {data:"PPID", name:"Кол-во", width:50, type:"numeric", dataSource:"t_ExcD"},
        {data:"SecID", name:"Кол-во", width:50, type:"numeric", dataSource:"t_ExcD"},
        {data:"NewSecID", name:"Кол-во", width:50, type:"numeric", dataSource:"t_ExcD"},
        {data:"NewSecName", name:"Статус товара", width:80, type:"text", readOnly:true, visible:false,
            dataSource:"r_Secs", sourceField:"SecName", linkCondition:"r_Secs.SecID=t_ExcD.NewSecID" },
        {data:"NewQty", name:"Нов кол-во", width:50, type:"numeric", dataSource:"t_ExcD"},
        {data:"PriceCC_nt", name:"Цена без НДС", width:65, type:"numeric2", dataSource:"t_ExcD"},
        {data:"Tax", name:"НДС Цены", width:65, type:"numeric2", dataSource:"t_ExcD"},
        {data:"PriceCC_wt", name:"Цена", width:65, type:"numeric2", dataSource:"t_ExcD"},
        {data:"SumCC_nt", name:"Сумма без НДС", width:75, type:"numeric2", dataSource:"t_ExcD"},
        {data:"TaxSum", name:"НДС", width:75, type:"numeric2", dataSource:"t_ExcD"},
        {data:"SumCC_wt", name:"Сумма", width:75, type:"numeric2", dataSource:"t_ExcD"},
        {data:"NewSumCC_wt", name:"Факт. сумма", width:75, type:"numeric2", dataFunction:"NewQty*PriceCC_wt"}
    ];
    app.get("/mobile/docExcDelivery/getDataForExcDTable",function(req,res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("docChID")==0) conditions["t_ExcD.ChID="]=req.query[condItem];
            else conditions["t_ExcD."+condItem]= req.query[condItem];
        t_ExcD.getDataItemsForTable(req.dbUC,{tableColumns:tExcDTableColumns, conditions:conditions, order:"SrcPosID"},
            function(result){ res.send(result); });
    });
    /**
     * excDProdData = { ProdID, UM, Barcode, NewQty }
     * if no excDProdData.NewQty - inserting NewQty=1, or updating NewQty=NewQty+1
     */
    t_ExcD.findAndStoreProdWNewQtyInExcD= function(dbUC,docChID,excDProdData,resultCallback){
        if(!("ProdID" in excDProdData)&&!("SrcPosID" in excDProdData)){
            resultCallback({error:"Failed find prod in t_ExcD!<br> No ProdID or SrcPosID!",
                errorMessage:"Не удалось найти товар в перемещении!<br> В данных нет кода товара или позиции товара!"});
            return;
        }
        var conditions= {"ChID=":docChID};
        if("ProdID" in excDProdData) conditions["ProdID="]= excDProdData["ProdID"];
        if("SrcPosID" in excDProdData) conditions["SrcPosID="]= excDProdData["SrcPosID"];
        t_ExcD.getDataItem(dbUC,{conditions:conditions,
                fields:["SrcPosID","Barcode","ProdID","UM","Qty","PPID","SecID","NewSecID","NewQty",
                    "PriceCC_nt","Tax","PriceCC_wt","SumCC_nt","TaxSum","SumCC_wt"]},
            function(result){
                if(result.error){
                    resultCallback({error:"Failed find prod in t_ExcD!<br>"+result.error,
                        errorMessage:"Не удалось найти товар в перемещении!<br>"+result.error});
                    return;
                }
                var storeData=result.item, prodNewQty=excDProdData["NewQty"];
                if(!storeData){//insert
                    storeData=excDProdData;
                    if(!("ProdID" in storeData)){
                        resultCallback({error:"Failed get prod data for insert into t_ExcD!",
                            errorMessage:"Не удалось получить данные товара для добавления в перемещение!"});
                        return;
                    }
                    storeData["Barcode"]= excDProdData["Barcode"];
                    storeData["SecID"]= excDProdData["SecID"]; storeData["NewSecID"]= excDProdData["NewSecID"];
                    storeData["Qty"]=0; storeData["NewQty"]=(prodNewQty!=null)?prodNewQty:1; storeData["PPID"]=0;
                    storeData["PriceCC_nt"]=0; storeData["Tax"]=0; storeData["PriceCC_wt"]=0;
                    storeData["SumCC_nt"]=0; storeData["TaxSum"]=0; storeData["SumCC_wt"]=0;
                }else{//update by SrcPosID
                    if(prodNewQty!=null) storeData["NewQty"]=prodNewQty; else storeData["NewQty"]++;
                }
                storeData["ChID"]=docChID;
                t_ExcD.storeTableDataItem(dbUC,{tableColumns:tExcDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
                        calcNewIDValue: function(params, callback){
                            t_ExcD.getDataItem(dbUC,{fields:["maxSrcPosID"],
                                    fieldsFunctions:{maxSrcPosID:{function:"maxPlus1",sourceField:"SrcPosID"}},conditions:{"ChID=":docChID}},
                                function(result){
                                    if(result.error){
                                        resultCallback({error:"Failed calc new SrcPosID by prod in t_ExcD!<br>"+result.error,
                                            errorMessage:"Не удалось вычислить новый номер позиции для товара в перемещении!<br>"+result.error});
                                        return;
                                    }
                                    if(!result.item)params.storeTableData["SrcPosID"]=1;else params.storeTableData["SrcPosID"]= result.item["maxSrcPosID"];
                                    callback(params);
                                });
                        }},
                    function(result){
                        if(result.error){
                            if(result.error.indexOf("Cannot insert duplicate key row in object 'dbo.t_ExcD' with unique index 'NoDuplicate'")>=0)
                                result.errorMessage="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером.";
                            else
                                result.errorMessage="Не удалось сохранить товар в перемещение!<br>"+result.error;
                        }
                        resultCallback(result);
                    });
            });
    };
    app.post("/mobile/docExcDelivery/storeProdDataByCRUniInput",function(req,res){
        var storingData= req.body, value= (storingData)?storingData["value"]:null, docChID= storingData["docChID"];
        r_Prods.findProdByCRUniInput(req.dbUC,value,function(resultFindProd){
            if(resultFindProd.error){
                res.send({error:{error:resultFindProd.error,userMessage:resultFindProd.errorMessage}});
                return;
            }
            var prodDataForStoreToExcD= {"ProdID":resultFindProd.prodData["ProdID"],"UM":resultFindProd.prodData["UM"],
                "Barcode":resultFindProd.prodData["Barcode"],
                "SecID":req.dbUserParams["t_SecID"],"NewSecID":req.dbUserParams["t_SecID"]
            };
            t_ExcD.findAndStoreProdWNewQtyInExcD(req.dbUC,docChID,prodDataForStoreToExcD,function(result){ res.send(result); })
        });
    });
    app.post("/mobile/docExcDelivery/storeNewQtyData",function(req,res){
        var storingData= req.body, docChID= storingData["docChID"],
            prodDataForStoreToExcD={SrcPosID:storingData["SrcPosID"],"NewQty":storingData["NewQty"]};
        t_ExcD.findAndStoreProdWNewQtyInExcD(req.dbUC,docChID,prodDataForStoreToExcD,function(result){ res.send(result); });
    });
    app.get("/mobile/docExcDelivery/findProdDataByBarcode",function(req,res){
        var barcode= req.query["Barcode~"], docChID= req.query["docChID~"];
        r_Prods.findProdByCondition(req.dbUC,{"Barcode=":barcode},function(resultFindProd){
            if(!resultFindProd||resultFindProd.error){
                var sErr="Failed find r_Prods prod data by Barcode=\""+barcode+"\"!",
                    sErrMsg="Не удалось найти товар по штрихкоду \""+barcode+"\"!";
                sErr+="\n"+resultFindProd.error; sErrMsg+="\n"+resultFindProd.errorMessage;
                res.send({error:sErr,errorMessage:sErrMsg});
                return;
            }else if(!resultFindProd.prodData){
                var sErr="Cannot find r_Prods prod data by Barcode=\""+barcode+"\"!",
                    sErrMsg="Товар по штрихкоду \""+barcode+"\" не найден!";
                res.send({error:sErr,errorMessage:sErrMsg});
                return;
            }
            var prodData= resultFindProd.prodData;
            t_ExcD.getDataItems(req.dbUC,{conditions:{"ChID=":docChID, "Barcode=":barcode},
                    fields:["SrcPosID","Barcode","ProdID","UM","Qty","PPID","SecID","NewSecID","NewQty",
                        "PriceCC_nt","Tax","PriceCC_wt","SumCC_nt","TaxSum","SumCC_wt"],
                    order:"SrcPosID desc" },
                function(resultFindProdInExcD){
                    if(resultFindProdInExcD.error){
                        res.send({error:"Failed find prod in t_ExcD!<br>"+resultFindProdInExcD.error.error,
                            errorMessage:"Не удалось найти товар в перемещении!<br>"+resultFindProdInExcD.error.message});
                        return;
                    }
                    if(resultFindProdInExcD.items&&resultFindProdInExcD.items.length>0){
                        var findedExcDData= resultFindProdInExcD.items[0];
                        prodData["SrcPosID"]= findedExcDData["SrcPosID"];
                        prodData["Qty"]= findedExcDData["Qty"]; prodData["NewQty"]= findedExcDData["NewQty"];
                    }
                    res.send({item:prodData});
                });
        });
    });
    app.post("/mobile/docExcDelivery/storeProdBarcodeWithNewQty",function(req,res){
        var storingData= req.body||{}, docChID= storingData["docChID"], barcode= storingData["Barcode"];
        r_Prods.findProdByCondition(req.dbUC,{"Barcode=":barcode},function(resultFindProd){
            if(!resultFindProd||resultFindProd.error){
                var sErr="Failed find r_Prods prod data by Barcode=\""+barcode+"\"!",
                    sErrMsg="Не удалось найти товар по штрихкоду \""+barcode+"\"!";
                sErr+="\n"+resultFindProd.error; sErrMsg+="\n"+resultFindProd.errorMessage;
                res.send({error:sErr,errorMessage:sErrMsg});
                return;
            }else if(!resultFindProd.prodData){
                var sErr="Cannot find r_Prods prod data by Barcode=\""+barcode+"\"!",
                    sErrMsg="Товар по штрихкоду \""+barcode+"\" не найден!";
                res.send({error:sErr,errorMessage:sErrMsg});
                return;
            }
            var prodData= resultFindProd.prodData,
                prodDataForStoreToExcD= {"ProdID":prodData["ProdID"],"UM":prodData["UM"], "Barcode":barcode,
                    "NewQty":storingData["NewQty"], "SecID":req.dbUserParams["t_SecID"],"NewSecID":req.dbUserParams["t_SecID"]
                };
            t_ExcD.findAndStoreProdWNewQtyInExcD(req.dbUC,docChID,prodDataForStoreToExcD,function(result){ res.send(result); })
        });
    });
};