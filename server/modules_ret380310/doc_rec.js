var dataModel= require(appDataModelPath), database= require("../databaseMSSQL"),
    dateFormat= require('dateformat');
var t_Rec= require(appDataModelPath+"t_Rec"), t_RecD= require(appDataModelPath+"t_RecD");
var r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods= require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Rec,t_RecD,r_DBIs,r_Ours,r_Stocks,r_Comps,r_Currs,r_States,r_Prods], errs,
        function(){ nextValidateModuleCallback(); });
};

module.exports.moduleViewURL = "/docs/rec";
module.exports.moduleViewPath = "docs/doc_rec.html";
module.exports.init = function(app){
    var tRecsListTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"DocID", name:"Номер", width:85, type:"text", align:"right", dataSource:"t_Rec"},
        {data:"IntDocID", name:"Вн. номер", width:85, type:"text", align:"right", dataSource:"t_Rec"},
        {data:"DocDate", name:"Дата", width:60, type:"dateAsText",align:"center", dataSource:"t_Rec"},
        {data:"OurName", name:"Фирма", width:150, type:"text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Rec.OurID" },
        {data:"StockName", name:"Склад", width:150, type:"text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Rec.StockID" },
        {data:"CompName", name:"Предприятие", width:150, type:"text",
            dataSource:"r_Comps", sourceField:"CompName", linkCondition:"r_Comps.CompID=t_Rec.CompID" },
        {data:"CurrID", name:"Код валюты", width:50, type:"text", align:"center", visible:false, dataSource:"t_Rec", sourceField:"CurrID"},
        {data:"CurrName", name:"Валюта", width:70, type:"text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Rec.CurrID" },
        {data:"TQty", name:"Кол-во", width:75, type:"numeric",
            childDataSource:"t_RecD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_RecD", sourceField:"Qty"} },
        {data:"TSumCC_wt", name:"Сумма", width:85, type:"numeric2", dataSource:"t_Rec" },
        {data:"CodeID1", name:"Признак 1", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"CodeID2", name:"Признак 2", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"CodeID3", name:"Признак 3", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"CodeID4", name:"Признак 4", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"CodeID5", name:"Признак 5", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"StateCode", name:"StateCode", width:50, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"StateName", name:"Статус", width:250, type:"text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Rec.StateCode" },
        {data:"CanChangeDoc", name:"CanChangeDoc", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"dbo.zf_CanChangeDoc(11002,t_Rec.ChID,t_Rec.StateCode)"},
        {data:"StateCodeToConfirmCashier", name:"StateCodeToConfirmCashier", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE t_Rec.StateCode When 0 Then 50 When 52 Then 50 Else NULL END"},
        {data:"StateCodeToConfirmStockManager", name:"StateCodeToConfirmStockManager", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE t_Rec.StateCode When 0 Then 60 When 62 Then 60 Else NULL END"}
    ];
    app.get("/docs/rec/getDataForRecsListTable",function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
        t_Rec.getDataForTable(req.dbUC,{tableColumns:tRecsListTableColumns, identifier:tRecsListTableColumns[0].data,
                conditions:conditions, order:"DocDate, DocID"},
            function(result){
                res.send(result);
            });
    });
    app.get("/docs/rec/getRecData",function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
        t_Rec.getDataItemForTable(req.dbUC,{tableColumns:tRecsListTableColumns,
                conditions:conditions},
            function(result){
                res.send(result);
            });
    });
    app.get("/docs/rec/getNewRecData",function(req,res){
        r_DBIs.getNewDocID(req.dbUC,"t_Rec",function(newDocID){
            var newDocDate=dateFormat(new Date(),"yyyy-mm-dd");
            r_Ours.getDataItem(req.dbUC,{fields:["OurName"],conditions:{"OurID=":"1"}}, function(result){
                var ourName=(result&&result.item)?result.item["OurName"]:"";
                r_Stocks.getDataItem(req.dbUC,{fields:["StockName"],conditions:{"StockID=":"1"}}, function(result){
                    var stockName=(result&&result.item)?result.item["StockName"]:"";
                    r_Currs.getDataItem(req.dbUC,{fields:["CurrName"], conditions:{"CurrID=":"980"}},
                        function(result){
                            var currName=(result&&result.item)?result.item["CurrName"]:"";
                            r_Comps.getDataItem(req.dbUC,{fields:["CompName"], conditions:{"CompID=":"1"} },
                                function(result){
                                    var compName=(result&&result.item)?result.item["CompName"]:"";
                                    r_States.getDataItem(req.dbUC,{fields:["StateName"],conditions:{"StateCode=":"0"}}, function(result){
                                        var stateName=(result&&result.item)?result.item["StateName"]:"";
                                        t_Rec.setDataItem({
                                                fields:["DocID","DocDate","OurName","StockName","CurrName","KursCC","KursMC","CompName",
                                                    "TQty","TSumCC_wt", "StateCode","StateName"],
                                                values:[newDocID,newDocDate,ourName,stockName,currName,1,1,compName,
                                                    0,0, 0,stateName]},
                                            function(result){
                                                res.send(result);
                                            });
                                    });
                                });
                        });
                });
            });
        });
    });
    app.post("/docs/rec/storeRecData",function(req,res){
        var storeData=req.body;
        r_Ours.getDataItem(req.dbUC,{fields:["OurID"],conditions:{"OurName=":storeData["OurName"]}}, function(result){
            if(!result.item){
                res.send({ error:"Cannot finded Our by OurName!"});
                return;
            }
            storeData["OurID"]=result.item["OurID"];
            r_Stocks.getDataItem(req.dbUC,{fields:["StockID"],conditions:{"StockName=":storeData["StockName"]}}, function(result){
                if(!result.item){
                    res.send({ error:"Cannot finded Stock by StockName!"});
                    return;
                }
                storeData["StockID"]=result.item["StockID"];
                r_Currs.getDataItem(req.dbUC,{fields:["CurrID","RateCC","RateMC"],
                        fieldsFunctions:{"RateCC":"dbo.zf_GetRateCC(CurrID)","RateMC":"dbo.zf_GetRateMC(CurrID)"},
                        conditions:{"CurrName=":storeData["CurrName"]}},
                    function(result){
                        if(!result.item){
                            res.send({ error:"Cannot finded Curr by CurrName!"});
                            return;
                        }
                        storeData["CurrID"]=result.item["CurrID"];  storeData["KursCC"]=result.item["RateCC"];  storeData["KursMC"]=result.item["RateMC"];
                        r_Comps.getDataItem(req.dbUC,{fields:["CompID"],conditions:{"CompName=":storeData["CompName"]}}, function(result){
                            storeData["CompID"]=result.item["CompID"];
                            var stateCode=0;
                            r_States.getDataItem(req.dbUC,{fields:["StateCode"],conditions:{"StateName=":storeData["StateName"]}}, function(result){
                                if(result.item) stateCode=result.item["StateCode"];
                                storeData["StateCode"]=stateCode;
                                storeData["CodeID1"]=0;storeData["CodeID2"]=0;storeData["CodeID3"]=0;storeData["CodeID4"]=0;storeData["CodeID5"]=0;
                                storeData["Discount"]=0;storeData["PayDelay"]=0;
                                storeData["TSumCC_nt"]=0;storeData["TTaxSum"]=0;
                                storeData["TSpendSumCC"]=0;storeData["TRouteSumCC"]=0;
                                storeData["EmpID"]=0;
                                t_Rec.storeTableDataItem(req.dbUC,{tableColumns:tRecsListTableColumns, idFieldName:"ChID", storeTableData:storeData,
                                        calcNewIDValue: function(params, callback){
                                            r_DBIs.getNewChID(req.dbUC,"t_Rec",function(chID){
                                                params.storeTableData[params.idFieldName]=chID;
                                                callback(params);
                                            });
                                        }},
                                    function(result){
                                        res.send(result);
                                    });
                            });
                    });
                });
            });
        });
    });
    app.post("/docs/rec/deleteRecData",function(req,res){
        var delData=req.body;
        t_Rec.delTableDataItem(req.dbUC,{idFieldName:"ChID", delTableData:delData},
            function(result){
                res.send(result);
            });
    });
    app.post("/docs/rec/updRecDataState",function(req,res){
        var storeData=req.body, chID=storeData["ChID"];
        if(!chID){
            res.send({error:"Non correct ChID!",errorMessage:"Не корректные данные сохраняемого документа (код регистрации)!"});
            return;
        }
        t_Rec.updTableDataItem(req.dbUC,{tableColumns:tRecsListTableColumns, idFieldName:"ChID",
                updFields:["StateCode"], updTableData:{"ChID":chID,"StateCode":storeData["StateCode"]}},
            function(result){
                res.send(result);
            });
    });

    var tRecDTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", dataSource:"t_RecD", identifier:true, readOnly:true, visible:false},
        {data:"SrcPosID", name:"№ п/п", width:45, type:"numeric", dataSource:"t_RecD", identifier:true },
        {data:"ProdID", name:"Код товара", width:50, type:"text", dataSource:"t_RecD", visible:true},
        {data:"Barcode", name:"Штрихкод", width:90, type:"text", align:"center", dataSource:"t_RecD", visible:true},
        {data:"Article1", name:"Артикул1 товара", width:200,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
            dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_RecD.ProdID" },
        {data:"UM", name:"Ед. изм.", width:55, type:"text", align:"center", dataSource:"t_RecD", sourceField:"UM"},
        {data:"BCUM", name:"Ед. изм. ШК", width:55, type:"text", align:"center", visible:false,
            childDataSource:"r_ProdMQ", sourceField:"UM", childLinkCondition:"r_ProdMQ.ProdID=t_RecD.ProdID and r_ProdMQ.Barcode=t_RecD.Barcode"},
        {data:"Qty", name:"Кол-во", width:50, type:"numeric", dataSource:"t_RecD"},
        {data:"PPID", name:"Партия", width:60, type:"numeric", visible:false},
        {data:"PriceCC_wt", name:"Цена", width:65, type:"numeric2", dataSource:"t_RecD"},
        {data:"SumCC_wt", name:"Сумма", width:75, type:"numeric2", dataSource:"t_RecD"},
        {data:"Extra", name:"% наценки", width:55, type:"numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
        {data:"PriceCC", name:"Цена продажи", width:65, type:"numeric2", dataSource:"t_RecD"},
        {data:"PCatName", name:"Категория товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data:"PGrName", name:"Группа товара", width:95,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"}
        //{data:"PGrName1", name:"Подгруппа1 товара", width:70,
        //    type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
        //    dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        //{data:"PGrName2", name:"Подгруппа2 товара", width:140,
        //    type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
        //    dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        //{data:"PGrName3", name:"Подгруппа3 товара", width:150,
        //    type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
        //    dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        //{data:"PRICELIST_PRICE", name:"Цена по прайс-листу", width:75, type:"numeric2"},
    ];
    app.get("/docs/rec/getDataForRecDTable",function(req,res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_RecD.ChID="]=req.query[condItem];
            else conditions["t_RecD."+condItem]=req.query[condItem];
        t_RecD.getDataForDocTable(req.dbUC,{tableColumns:tRecDTableColumns, identifier:tRecDTableColumns[0].data,
                conditions:conditions, order:"SrcPosID"},
            function(result){
                res.send(result);
            });
    });
    t_RecD.setRecDTaxPriceCCnt=function(dbUC,prodID,recChID,recDData,callback){
        database.selectParamsQuery(dbUC,
            "select tax=dbo.zf_GetProdRecTax(@p0,OurID,CompID,DocDate) from t_Rec where ChID=@p1",[prodID,recChID],
            function(result){/* Возвращает ставку НДС для товара в зависимости от поставщика */
                var tax=(result&&result.length>0)?result[0]["tax"]:0;
                recDData["Tax"]=tax; recDData["PriceCC_nt"]=recDData["PriceCC_wt"]-tax;
                var qty=recDData["Qty"];
                recDData["TaxSum"]=tax*qty; recDData["SumCC_nt"]=recDData["SumCC_wt"]-tax*qty;
                callback(recDData);
            });
    };
    /**
     * callback = function(result), result= { resultItem, error, userMessage }
     */
    t_RecD.storeNewProdPP=function(dbUC,prodID,recChID,recDData,callback){
        t_Rec.getDataItem(dbUC,{fields:["DocDate","CurrID","CompID"],conditions:{"ChID=":recChID}},
            function(result){
                if(result.error||!result.item){
                    callback({error:"Failed get rec data for create prod PP!"});
                    return;
                }
                var recData=result.item, priceCC_wt=recDData["PriceCC_wt"];
                r_Prods.addProdPP(dbUC,
                    {"ProdID":prodID,"ProdDate":recData["DocDate"],"CompID":recData["CompID"],"Article":"",
                        "PriceCC_In":priceCC_wt,"CostCC":priceCC_wt,"PriceMC":priceCC_wt,
                        "CurrID":recData["CurrID"], "PriceMC_In":priceCC_wt,"CostAC":priceCC_wt},
                    function(result){
                        callback(result);
                    });
            });
    };
    /**
     * callback = function(result), result = { resultItem, error,errorMessage }
     */
    t_RecD.storeRecD=function(dbUC,prodID,storeData,dbUserParams,callback){
        var parentChID=storeData["ParentChID"]||storeData["ChID"];
        t_RecD.storeNewProdPP(dbUC,prodID,parentChID,storeData,function(resultStorePP){
            if(resultStorePP.error){
                r_Prods.delete(dbUC,prodID);
                callback({error:resultStorePP.error});
                return;
            }
            storeData["PPID"]=resultStorePP.resultItem["PPID"];
            storeData["SecID"]=dbUserParams["t_SecID"];
            t_RecD.setRecDTaxPriceCCnt(dbUC,prodID,parentChID,storeData,function(storeData){
                storeData["CostCC"]=storeData["PriceCC_wt"]; storeData["CostSum"]=storeData["SumCC_wt"];
                storeData["SupplyPriceCC_nt"]=storeData["SupplyPriceCC_nt"]||storeData["PriceCC_nt"]||0.0;
                t_RecD.storeTableDataItem(dbUC,{tableColumns:tRecDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
                        calcNewIDValue: function(params,callback){
                            params.storeTableData["ChID"]=params.storeTableData["ParentChID"];
                            callback(params);
                        }},
                    function(result){
                        if(result.error){
                            r_Prods.delete(dbUC,prodID);
                            result.errorMessage= "Не удалось сохранить строку в документ \"Приход товара\"!";
                            if(result.error.indexOf("Violation of PRIMARY KEY constraint '_pk_t_RecD'")>=0)
                                result.errorMessage= "Некорректный номер позиции в документе \"Приход товара\"!\n В документе уже есть позиция с таким номером."
                        }
                        callback(result);
                    });
            });
        });
    };
    if(!r_Prods.checkStoreProdWithBarcodeInDocRec) throw new Error('NO r_Prods.checkStoreProdWithBarcodeInDocRec!');
    app.post("/docs/rec/storeRecDTableData",function(req,res){
        var storeData=req.body,
            prodData={"ProdID":storeData["ProdID"], "ProdName":storeData["ProdName"], "UM":storeData["UM"], "InRems":1,
                "Article1":storeData["Article1"],
                "Country":storeData["Country"], "Notes":storeData["ProdName"],
                "PCatName":storeData["PCatName"], "PGrName":storeData["PGrName"],
                "PGrName1":storeData["PGrName1"],"PGrName2":storeData["PGrName2"],"PGrName3":storeData["PGrName3"],
                "Barcode":storeData["Barcode"], "BCUM":storeData["BCUM"]};
        r_Prods.checkStoreProdWithBarcodeInDocRec(req.dbUC,prodData,req.dbUserParams,function(result){
            if(result&&result.error){
                res.send({error:{error:result.error,userMessage:result.errorMessage||result.error}});
                return;
            }
            var prodID= result.resultItem["ProdID"], iProdID=parseInt(prodID);
            storeData["ProdID"]= prodID;
            storeData["ProdName"]= result.resultItem["ProdName"];
            storeData["Barcode"]= result.resultItem["Barcode"];
            var sUM= result.resultItem["BCUM"];
            //if(sUM==null) sUM=result.resultItem["UM"];
            storeData["UM"]= sUM;
            if(isNaN(iProdID)){
                res.send({error:"Non correct ProdID!",errorMessage:"Не корректный код товара!"});
                return;
            }
            t_RecD.storeRecD(req.dbUC,prodID,storeData,req.dbUserParams,function(result){
                res.send(result);
            });
        });
    });
    app.post("/docs/rec/deleteRecDTableData",function(req,res){
        t_RecD.delTableDataItem(req.dbUC,{idFields:["ChID","SrcPosID"],delTableData:req.body},
            function(result){
                res.send(result);
            });
    });
};