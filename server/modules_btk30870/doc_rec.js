var dataModel=require(appDataModelPath), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Rec= require(appDataModelPath+"t_Rec"), t_RecD= require(appDataModelPath+"t_RecD");
var z_Sys= require(appDataModelPath+"z_Sys"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_Secs= require(appDataModelPath+"r_Secs"),
    //r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Rec,t_RecD,z_Sys,r_Ours,r_Stocks,r_Comps,r_Currs,r_Secs,/*r_States,*/r_Prods], errs,
        function(){ nextValidateModuleCallback(); }
    );
};

module.exports.moduleViewURL = "/docs/rec";
module.exports.moduleViewPath = "docs/doc_rec.html";
module.exports.init = function(app){
    var tRecsListTableColumns=[
        {data: "ChID", name:"ChID", width:85, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "DocID", name:"Номер", width:85, type:"text", align:"right", dataSource:"t_Rec"},
        {data: "IntDocID", name:"Вн. номер", width:85, type:"text", align:"right", dataSource:"t_Rec"},
        {data: "DocDate", name:"Дата", width:60, type:"dateAsText",align:"center", dataSource:"t_Rec"},
        {data: "OurName", name:"Фирма", width:150, type:"text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Rec.OurID" },
        {data: "StockName", name:"Склад", width:150, type:"text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Rec.StockID" },
        {data: "CompName", name:"Предприятие", width:150, type:"text",
            dataSource:"r_Comps", sourceField:"CompName", linkCondition:"r_Comps.CompID=t_Rec.CompID" },
        {data: "KursMC", name:"Курс валюты", width:65, type:"numeric", dataSource:"t_Rec", visible:false },
        {data: "TQty", name:"Кол-во", width:75, type:"numeric",
            childDataSource:"t_RecD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_RecD", sourceField:"Qty"} },
        {data: "TSumCC_wt", name:"Сумма", width:85, type:"numeric2",
            childDataSource:"t_RecD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_RecD", sourceField:"SumCC_wt"} },
        //{data: "StateCode", name:"StateCode", width:50, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        //{data: "StateName", name:"Статус", width:250, type:"text",
        //    dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Rec.StateCode" },
        {data: "CodeID1", name:"Признак 1", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID2", name:"Признак 2", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID3", name:"Признак 3", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID4", name:"Признак 4", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID5", name:"Признак 5", width:60, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"}
    ];
    app.get("/docs/rec/getDataForRecsListTable", function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
        t_Rec.getDataForTable(req.dbUC,{tableColumns:tRecsListTableColumns, identifier:tRecsListTableColumns[0].data,
                conditions:conditions, order:"DocDate, DocID"},
            function(result){
                res.send(result);
            });
    });
    app.get("/docs/rec/getRecData", function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
        t_Rec.getDataItemForTable(req.dbUC,{tableColumns:tRecsListTableColumns, conditions:conditions},
            function(result){ res.send(result); }
        );
    });
    if(!z_Sys.getNewDocID) throw new Error('NO z_Sys.getNewDocID!');
    app.get("/docs/rec/getNewRecData", function(req,res){
        z_Sys.getNewDocID(req.dbUC,"t_Rec",function(newDocID){
            var newDocDate=dateFormat(new Date(),"yyyy-mm-dd");
            r_Ours.getDataItem(req.dbUC,{fields:["OurName"],conditions:{"OurID=":"1"}}, function(result){
                var ourName=(result&&result.item)?result.item["OurName"]:"";
                r_Stocks.getDataItem(req.dbUC,{fields:["StockName"],conditions:{"StockID=":"1"}}, function(result){
                    var stockName=(result&&result.item)?result.item["StockName"]:"";
                    r_Comps.getDataItem(req.dbUC,{fields:["CompName"], conditions:{"CompID=":"0"} },
                        function(result){
                            var compName=(result&&result.item)?result.item["CompName"]:"";
                            //r_States.getDataItem(req.dbUC,{fields:["StateName"],conditions:{"StateCode=":"0"}}, function(result){
                            //    var stateName=(result&&result.item)?result.item["StateName"]:"";
                            //
                            //});
                            t_Rec.setDataItem({
                                    fields:["DocID","DocDate","OurName","StockName","KursMC","CompName","TQty","TSumCC_wt"],
                                    values:[newDocID,newDocDate,ourName,stockName,1,compName,0,0]},
                                function(result){ res.send(result); }
                            );
                        });
                });
            });
        });
    });
    if(!z_Sys.getNewChID) throw new Error('NO z_Sys.getNewChID!');
    app.post("/docs/rec/storeRecData",function(req,res){
        var storeData= req.body;
        r_Ours.getDataItem(req.dbUC,{fields:["OurID"],conditions:{"OurName=":storeData["OurName"]}}, function(result){
            if(!result.item){ res.send({ error:"Cannot finded Our by OurName!"}); return;}
            if(result.item) storeData["OurID"]= result.item["OurID"];
            r_Stocks.getDataItem(req.dbUC,{fields:["StockID"],conditions:{"StockName=":storeData["StockName"]}}, function(result){
                if(!result.item){ res.send({ error:"Cannot finded Stock by StockName!"}); return; }
                if(result.item) storeData["StockID"]= result.item["StockID"];
                r_Comps.getDataItem(req.dbUC,{fields:["CompID"],conditions:{"CompName=":storeData["CompName"]}}, function(result){
                    if(result.item) storeData["CompID"]= result.item["CompID"];
                    //var stateCode=0;
                    //r_States.getDataItem(req.dbUC,{fields:["StateCode"],conditions:{"StateName=":storeData["StateName"]}}, function(result){
                    //    if(result.item) stateCode=result.item["StateCode"];
                    //    storeData["StateCode"]=stateCode;
                    //
                    //});
                    storeData["GrndID"]=0;
                    storeData["CodeID1"]=0; storeData["CodeID2"]=0; storeData["CodeID3"]=0; storeData["CodeID4"]=0; storeData["CodeID5"]=0;
                    storeData["Discount"]=0; storeData["PayDelay"]=0;
                    storeData["DocStatID"]=0; storeData["TranCC"]=0; storeData["MoreCC"]=0;
                    storeData["TaxDocID"]=0; storeData["TaxDocDate"]= storeData["DocDate"];
                    storeData["EmpID"]=0;
                    t_Rec.storeTableDataItem(req.dbUC,{tableColumns:tRecsListTableColumns, idFieldName:"ChID", storeTableData:storeData,
                            calcNewIDValue: function(params, callback){
                                z_Sys.getNewChID(req.dbUC,"t_Rec",function(chID){
                                    params.storeTableData[params.idFieldName]=chID;
                                    callback(params);
                                });
                            }},
                        function(result){ res.send(result); });
                });
            });
        });
    });
    app.post("/docs/rec/deleteRecData",function(req,res){
        var delData=req.body;
        t_Rec.delTableDataItem(req.dbUC,{idFieldName:"ChID", delTableData:delData}, function(result){ res.send(result); });
    });

    var tRecDTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", dataSource:"t_RecD", identifier:true, readOnly:true, visible:false},
        {data:"SrcPosID", name:"№ п/п", width:45, type:"numeric", dataSource:"t_RecD", identifier:true },
        {data:"Country", name:"Страна товара", width:80,
            //type:"comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
            dataSource:"r_Prods", sourceField:"Country", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
        {data:"PGrName", name:"Бренд товара", width:180,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data:"PCatName", name:"Коллекция товара", width:100,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data:"PGrName1", name:"Линия товара", width:100,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data:"PGrName2", name:"Вид товара", width:130,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data:"PGrName3", name:"Состав товара", width:170,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        {data:"ColorName", name:"Цвет товара", width:80,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForColorNameCombobox",
            dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
            linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"
            /*dataFunction:"''"*/},
        {data:"SizeName", name:"Размер товара", width:70,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForSizeNameCombobox",
            dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>0 Then ir_ProdSizes.SizeName Else '' END",
            linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"
            /*dataFunction:"''"*/},
        {data:"Article1", name:"Артикул1 товара", width:90, align:"center",
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
            dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
        {data:"ProdID", name:"Код товара", width:50, type:"text",align:"center", dataSource:"t_RecD", visible:true},
        {data:"Barcode", name:"Штрихкод", width:75, type:"text", dataSource:"t_RecD", visible:false},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_RecD.ProdID" },
        {data:"UM", name:"Ед. изм.", width:45, type:"text", align:"center", dataSource:"t_RecD", sourceField:"UM"},
        {data:"Qty", name:"Кол-во", width:50, type:"numeric", dataSource:"t_RecD"},
        {data:"PPID", name:"Партия", width:60, type:"numeric", visible:false},
        {data:"PriceCC_wt", name:"Цена", width:65, type:"numeric2", dataSource:"t_RecD"},
        {data:"SumCC_wt", name:"Сумма", width:75, type:"numeric2", dataSource:"t_RecD"},
        {data:"Extra", name:"% наценки", width:55, type:"numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
        {data:"PriceCC", name:"Цена продажи", width:65, type:"numeric2", dataSource:"t_RecD"}
        //{data:"PRICELIST_PRICE", name:"Цена по прайс-листу", width:75, type:"numeric2"},
    ];
    app.get("/docs/rec/getDataForRecDTable",function(req,res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("docChID")==0) conditions["t_RecD.ChID="]=req.query[condItem];
            else conditions["t_RecD."+condItem]=req.query[condItem];
        t_RecD.getDataForDocTable(req.dbUC,{tableColumns:tRecDTableColumns, identifier:tRecDTableColumns[0].data,
                conditions:conditions, order:"SrcPosID"},
            function(result){ res.send(result); }
        );
    });
    t_RecD.setRecDTaxPriceCCnt=function(dbUC,prodID,recChID,recDData,callback){
        database.selectParamsQuery(dbUC,
            "select tax=dbo.zf_GetProdRecTax(@p0,OurID,CompID,DocDate) from t_Rec where ChID=@p1",[prodID,recChID],
            function(result){/* Возвращает ставку НДС для товара в зависимости от поставщика */
                var tax= (result&&result.length>0)?result[0]["tax"]:0;
                recDData["Tax"]=tax; recDData["PriceCC_nt"]=recDData["PriceCC_wt"]-tax;
                var qty=recDData["Qty"];
                recDData["TaxSum"]=tax*qty; recDData["SumCC_nt"]=recDData["SumCC_wt"]-tax*qty;
                callback(recDData);
            });
    };
    /**
     * callback = function(result), result= { resultItem, error, errorMessage }
     */
    t_RecD.storeNewProdPP=function(dbUC,prodID,recChID,recDData,dbUserParams,callback){
        t_Rec.getDataItem(dbUC,{fields:["DocDate","CompID"],conditions:{"ChID=":recChID}},
            function(result){
                if(result.error||!result.item){
                    callback({error:"Failed get rec data for create prod PP!",
                        errorMessage:"Не удалось получить данные документа для создания новой партии для прихода товара!"+
                        " "+((result.error)?"Не удалось получить данные документа Приход товара.":"Нет данных документа Приход товара.")});
                    return;
                }
                var recData= result.item, priceCC_wt= recDData["PriceCC_wt"], currID= recDData["CurrID"];
                if(currID==null) currID= (dbUserParams)?dbUserParams["CurrCC"]:0;
                r_Prods.addProdPP(dbUC,
                    {"ProdID":prodID,"ProdDate":recData["DocDate"],"CompID":recData["CompID"],"Article":"",
                        "PriceCC_In":priceCC_wt,"CostCC":priceCC_wt,"PriceMC":priceCC_wt,
                        "CurrID":currID, "PriceMC_In":priceCC_wt,"CostAC":priceCC_wt},
                    function(result){ callback(result); }
                );
            });
    };
    /**
     * callback = function(result), result = { resultItem, error, errorMessage }
     */
    t_RecD.storeRecD=function(dbUC,prodID,storeData,dbUserParams,callback){
        var docChID= storeData["docChID"]||storeData["ChID"];
        t_RecD.storeNewProdPP(dbUC,prodID,docChID,storeData,dbUserParams,function(resultStorePP){
            if(resultStorePP.error){ r_Prods.delete(dbUC,prodID); callback(resultStorePP); return; }
            storeData["PPID"]= resultStorePP.resultItem["PPID"];
            var secID= dbUserParams["t_SecID"], conditionsGetSec= (secID!=null)?{"SecID=":secID}:{"SecID>":0};
            r_Secs.getDataItem(dbUC,{fields:["SecID","SecName"],conditions:conditionsGetSec, top:"TOP 1", order:"SecID"},function(resultGetSecID){
                if(resultGetSecID.error||!resultGetSecID.item){
                    callback({error:"Failed get Sec for create rec position! Reason:"+(resultGetSecID.error||"NO Sec in Secs dir."),
                        errorMessage:"Не удалось получить секцию для добавления позиции в приход товара!"+
                        " "+((resultGetSecID.error)?"Не удалось найти секцию для новой позиции.":"Нет секции в справочнике секций.")});
                    return;
                }
                storeData["SecID"]= resultGetSecID.item["SecID"];
                t_RecD.setRecDTaxPriceCCnt(dbUC,prodID,docChID,storeData,function(storeData){
                    storeData["CostCC"]=storeData["PriceCC_wt"]; storeData["CostSum"]=storeData["SumCC_wt"];
                    t_RecD.storeTableDataItem(dbUC,{tableColumns:tRecDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
                            calcNewIDValue: function(params, callback){
                                params.storeTableData["ChID"]=params.storeTableData["docChID"];
                                callback(params);
                            }},
                        function(result){
                            if(result.error){
                                r_Prods.delete(dbUC,prodID);
                                result.errorMessage= result.errorMessage||"Не удалось добавить позицию в документ!";
                                if(result.error.indexOf("Violation of PRIMARY KEY constraint '_pk_t_RecD'")>0)
                                    result.errorMessage+= " Некорректный номер позиции!<br> В документе уже есть позиция с таким номером.";
                            }
                            callback(result);
                        });
                });
            });
        });
    };
    app.post("/docs/rec/storeRecDTableData", function(req,res){
        var storeData=req.body, prodID=storeData["ProdID"];
        if(prodID===undefined||prodID===null){
            var prodData={"ProdName":storeData["ProdName"], "UM":storeData["UM"], "Article1":storeData["Article1"],
                "Country":storeData["Country"], "Notes":storeData["ProdName"],
                "PCatName":storeData["PCatName"], "PGrName":storeData["PGrName"],
                "PGrName1":storeData["PGrName1"],"PGrName2":storeData["PGrName2"],"PGrName3":storeData["PGrName3"],
                "ColorName":storeData["ColorName"],"SizeName":storeData["SizeName"],
                "InRems":1};

            r_Prods.addProdWithProdMQandProdPP0(req.dbUC,prodData,req.dbUserParams,function(resultAddProdWithProdMQandPP0){
                if(!resultAddProdWithProdMQandPP0.resultItem||resultAddProdWithProdMQandPP0.error){ res.send(resultAddProdWithProdMQandPP0); return; }
                prodID=resultAddProdWithProdMQandPP0.resultItem["ProdID"];
                storeData["ProdID"]= prodID; storeData["Barcode"]= resultAddProdWithProdMQandPP0.resultItem["Barcode"];
                t_RecD.storeRecD(req.dbUC,prodID,storeData,req.dbUserParams,function(result){ res.send(result); });
            });
            return;
        }
        var iProdID=parseInt(prodID);
        if(isNaN(iProdID)){ res.send({error:"Non correct ProdID!",errorMessage:"Не корректный код товара!"}); return; }
        t_RecD.storeRecD(req.dbUC,prodID,storeData,req.dbUserParams,function(result){ res.send(result); });
    });
    app.post("/docs/rec/deleteRecDTableData", function(req,res){
        t_RecD.delTableDataItem(req.dbUC,{idFields:["ChID","SrcPosID"],delTableData:req.body},
            function(result){ res.send(result); }
        );
    });
};