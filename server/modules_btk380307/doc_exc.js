var dataModel= require(appDataModelPath), database= require("../databaseMSSQL"),
    dateFormat= require('dateformat');
var t_Exc= require(appDataModelPath+"t_Exc"), t_ExcD= require(appDataModelPath+"t_ExcD");
var r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods= require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Exc,t_ExcD,r_DBIs,r_Ours,r_Stocks,r_Comps,r_Currs,r_States,r_Prods], errs,
        function(){ nextValidateModuleCallback(); });
};

module.exports.moduleViewURL = "/docs/exc";
module.exports.moduleViewPath = "docs/doc_exc.html";
module.exports.init = function(app){
    var tRecsListTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "DocID", name: "Номер", width: 85, type: "text", align:"right", dataSource:"t_Exc"},
        {data: "IntDocID", name: "Вн. номер", width: 85, type: "text", align:"right", dataSource:"t_Exc"},
        {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center", dataSource:"t_Exc"},
        {data: "OurName", name: "Фирма", width: 150, type: "text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Exc.OurID" },
        {data: "StockName", name: "Склад", width: 150, type: "text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data: "NewStockName", name: "На склад", width: 150, type: "text",
            dataSource:"r_Stocks as st2", sourceField:"StockName", linkCondition:"st2.StockID=t_Exc.NewStockID" },
        {data: "CurrID", name: "Код валюты", width: 50, type: "text", align:"center", visible:false, dataSource:"t_Exc", sourceField:"CurrID"},
        {data: "CurrName", name: "Валюта", width: 70, type: "text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Exc.CurrID" },
        {data: "TQty", name: "Кол-во", width: 75, type: "numeric",
            childDataSource:"t_ExcD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_ExcD", sourceField:"Qty"} },
        {data: "TNewQty", name: "Факт. кол-во", width: 75, type: "numeric",
            childDataSource:"t_ExcD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_ExcD", sourceField:"NewQty"} },
        {data: "TSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Exc" },
        {data: "StateCode", name: "StateCode", width: 50, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "StateName", name: "Статус", width: 250, type: "text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Exc.StateCode" },
        {data: "CodeID1", name: "Признак 1", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "CodeID2", name: "Признак 2", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "CodeID3", name: "Признак 3", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "CodeID4", name: "Признак 4", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "CodeID5", name: "Признак 5", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"}
    ];
    app.get("/docs/exc/getDataForExcsListTable", function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Exc."+condItem]=req.query[condItem];
        t_Exc.getDataForTable(req.dbUC,{tableColumns:tRecsListTableColumns, identifier:tRecsListTableColumns[0].data,
                conditions:conditions, order:"DocDate, DocID"},
            function(result){
                res.send(result);
            });
    });
    app.get("/docs/exc/getExcData", function(req, res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Exc."+condItem]=req.query[condItem];
        t_Exc.getDataItemForTable(req.dbUC,{tableColumns:tRecsListTableColumns,
                conditions:conditions},
            function(result){
                res.send(result);
            });
    });
    app.get("/docs/exc/getNewRecData", function(req, res){
        r_DBIs.getNewDocID(req.dbUC,"t_Exc",function(newDocID){
            var newDocDate=dateFormat(new Date(),"yyyy-mm-dd");
            r_Ours.getDataItem(req.dbUC,{fields:["OurName"],conditions:{"OurID=":"1"}}, function(result){
                var ourName=(result&&result.item)?result.item["OurName"]:"";
                r_Stocks.getDataItem(req.dbUC,{fields:["StockName"],conditions:{"StockID=":"1"}}, function(result){
                    var stockName=(result&&result.item)?result.item["StockName"]:"";
                    r_Currs.getDataItem(req.dbUC,{fields:["CurrName"], conditions:{"CurrID=":"1"} },
                        function(result){
                            var currName=(result&&result.item)?result.item["CurrName"]:"";
                            r_Comps.getDataItem(req.dbUC,{fields:["CompName"], conditions:{"CompID=":"1"} },
                                function(result){
                                    var compName=(result&&result.item)?result.item["CompName"]:"";
                                    r_States.getDataItem(req.dbUC,{fields:["StateName"],conditions:{"StateCode=":"0"}}, function(result){
                                        var stateName=(result&&result.item)?result.item["StateName"]:"";
                                        t_Exc.setDataItem({
                                                fields:["DocID","DocDate","OurName","StockName","CurrName","KursCC","KursMC","CompName",
                                                    "TQty","TSumCC_wt", "StateName"],
                                                values:[newDocID,newDocDate,ourName,stockName,currName,1,1,compName,
                                                    0,0, stateName]},
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
    app.post("/docs/exc/storeExcData", function(req, res){
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
                                t_Exc.storeTableDataItem(req.dbUC,{tableColumns:tRecsListTableColumns, idFieldName:"ChID", storeTableData:storeData,
                                        calcNewIDValue: function(params, callback){
                                            r_DBIs.getNewChID(req.dbUC,"t_Exc",function(chID){
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
    app.post("/docs/exc/deleteExcData", function(req, res){
        var delData=req.body;
        t_Exc.delTableDataItem(req.dbUC,{idFieldName:"ChID", delTableData:delData},
            function(result){
                res.send(result);
            });
    });

    var tRecDTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"t_ExcD", identifier:true, readOnly:true, visible:false},
        {data: "SrcPosID", name: "№ п/п", width: 45, type: "numeric", dataSource:"t_ExcD", identifier:true, readOnly:true },
        {data: "Article1", name: "Артикул1 товара", width: 200, readOnly:true,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
            dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID"},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"t_ExcD", visible:true, readOnly:true},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_ExcD", visible:false, readOnly:true},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text", readOnly:true,
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 50, type: "text", align:"center", dataSource:"t_ExcD", sourceField:"UM", readOnly:true},
        {data: "Qty", name: "Кол-во", width: 55, type: "numeric", dataSource:"t_ExcD", readOnly:true},
        {data: "NewQty", name: "Факт кол-во", width: 55, type: "numeric", dataSource:"t_ExcD", readOnly:true},
        {data: "PPID", name: "Партия", width: 60, type: "numeric", visible:false, readOnly:true},
        {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_ExcD", readOnly:true},
        {data: "SumCC_wt", name: "Сумма", width: 75, type: "numeric2", dataSource:"t_ExcD", readOnly:true},
        {data: "ExcChID", name: "ExcChID", width: 0, type: "text", visible:false, readOnly:true,
            dataSource:"t_Exc", sourceField:"ChID", linkCondition:"t_Exc.ChID=t_ExcD.ChID" },
        {data: "StockID", name: "StockID", width: 0, type: "text", visible:false, readOnly:true,
            dataSource:"r_Stocks", sourceField:"StockID", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data: "PLID", name: "PLID", width: 50, type: "text", visible:false, readOnly:true,
            dataSource:"r_PLs", sourceField:"PLID", linkCondition:"r_PLs.PLID=r_Stocks.PLID" },
        //{data: "Extra", name: "% наценки", width: 55, type: "numeric", format:"#,###,###,##0.00", dataSource:"t_ExcD"},
        //{data: "PriceCC", name: "Цена продажи", width: 65, type: "numeric2", dataSource:"t_ExcD"}
        {data: "PriceCC", name: "Цена по прайс-листу", width: 75, type: "numeric2",
            dataSource:"r_ProdMP", sourceField:"PriceMC", linkCondition:"r_ProdMP.PLID=r_PLs.PLID and r_ProdMP.ProdID=t_ExcD.ProdID" }
    ];
    app.get("/docs/exc/getDataForExcDTable", function(req, res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_ExcD.ChID="]=req.query[condItem];
            else conditions["t_ExcD."+condItem]=req.query[condItem];
        t_ExcD.getDataForDocTable(req.dbUC,{tableColumns:tRecDTableColumns, identifier:tRecDTableColumns[0].data,
                conditions:conditions, order:"SrcPosID"},
            function(result){
                res.send(result);
            });
    });
    t_ExcD.setRecDTaxPriceCCnt=function(connection,prodID,recChID,recDData,callback){
        database.selectParamsQuery(connection,
            "select tax=dbo.zf_GetProdRecTax(@p0,OurID,CompID,DocDate) from t_Exc where ChID=@p1",[prodID,recChID],
            function (result) {/* Возвращает ставку НДС для товара в зависимости от поставщика */
                var tax=(result&&result.length>0)?result[0]["tax"]:0;
                recDData["Tax"]=tax; recDData["PriceCC_nt"]=recDData["PriceCC_wt"]-tax;
                var qty=recDData["Qty"];
                recDData["TaxSum"]=tax*qty; recDData["SumCC_nt"]=recDData["SumCC_wt"]-tax*qty;
                callback(recDData);
            });
    };
    /**
     * callback = function(result), result= { resultItem, error, errorMessage }
     */
    t_ExcD.storeNewProdPP=function(connection,prodID,recChID,recDData,callback){
        t_Exc.getDataItem(connection,{fields:["DocDate","CurrID","CompID"],conditions:{"ChID=":recChID}},
            function(result){
                if(result.error||!result.item){
                    callback({error:"Failed get rec data for create prod PP!"});
                    return;
                }
                var recData=result.item, priceCC_wt=recDData["PriceCC_wt"];
                r_Prods.storeProdPP(connection,
                    {"ProdID":prodID,"ProdDate":recData["DocDate"],"CompID":recData["CompID"],"Article":"",
                        "PriceCC_In":priceCC_wt,"CostCC":priceCC_wt,"PriceMC":priceCC_wt,
                        "CurrID":recData["CurrID"], "PriceMC_In":priceCC_wt,"CostAC":priceCC_wt},
                    function(result){
                        callback(result);
                    });
            });
    };
    /**
     * callback = function(result), result = { resultItem, error, errorMessage }
     */
    t_ExcD.storeExcD=function(connection,prodID,storeData,dbUserParams,callback){
        var parentChID=storeData["ParentChID"]||storeData["ChID"];
        t_ExcD.storeNewProdPP(connection,prodID,parentChID,storeData,function(resultStorePP){
            if(resultStorePP.error){
                r_Prods.delete(connection,prodID);
                callback({error:resultStorePP.error});
                return;
            }
            storeData["PPID"]=resultStorePP.resultItem["PPID"];
            storeData["SecID"]=dbUserParams["t_SecID"];
            t_ExcD.setRecDTaxPriceCCnt(connection,prodID,parentChID,storeData,function(storeData){
                storeData["CostCC"]=storeData["PriceCC_wt"]; storeData["CostSum"]=storeData["SumCC_wt"];
                t_ExcD.storeTableDataItem(connection,{tableColumns:tRecDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
                        calcNewIDValue: function(params, callback){
                            params.storeTableData["ChID"]=params.storeTableData["ParentChID"];
                            callback(params);
                        }},
                    function(result){
                        if(result.error) {
                            r_Prods.delete(connection,prodID);
                            if(result.error.indexOf("Violation of PRIMARY KEY constraint '_pk_t_ExcD'"))
                            result.errorMessage="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером."
                        }
                        callback(result);
                    });
            });
        });
    };
    app.post("/docs/exc/storeExcDTableData", function(req, res){
        var storeData=req.body, prodID=storeData["ProdID"];
        var iProdID=parseInt(prodID);
        if(prodID===undefined||prodID===null||isNaN(iProdID)){
            res.send({error:"Non correct ProdID!",errorMessage:"Не корректный код товара!"});
            return;
        }
        t_ExcD.storeExcD(req.dbUC,prodID,storeData,req.dbUserParams,function(result){
            res.send(result);
        });
    });
    app.post("/docs/exc/deleteExcDTableData", function(req, res){
        t_ExcD.delTableDataItem(req.dbUC,{idFields:["ChID","SrcPosID"],delTableData:req.body},
            function(result){
                res.send(result);
            });
    });
};