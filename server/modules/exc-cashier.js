var dataModel=require('../datamodel'), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Exc= require(appDataModelPath+"t_Exc"), t_ExcD= require(appDataModelPath+"t_ExcD");
var r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Exc,t_ExcD,r_DBIs,r_Ours,r_Stocks,r_Comps,r_Currs,r_States,r_Prods], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.modulePageURL = "/docs/excCashier";
module.exports.modulePagePath = "docs/exc-cashier.html";
module.exports.init = function(app){
    var tExcsListTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data:"DocID", name:"Номер", width:85, type:"text", align:"right", dataSource:"t_Exc"},
        {data:"IntDocID", name:"Вн. номер", width:85, type:"text", align:"right", visible:false, dataSource:"t_Exc"},
        {data:"DocDate", name:"Дата", width:60, type:"dateAsText",align:"center", dataSource:"t_Exc"},
        {data:"OurName", name:"Фирма", width:150, type:"text", visible:false,
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Exc.OurID" },
        {data:"StockName", name:"Склад", width:150, type:"text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data:"NewStockName", name:"На склад", width:150, type:"text",
            dataSource:"r_Stocks as st2", sourceField:"StockName", linkCondition:"st2.StockID=t_Exc.NewStockID" },
        {data:"CurrID", name:"Код валюты", width:50, type:"text", align:"center", visible:false, dataSource:"t_Exc", sourceField:"CurrID"},
        {data:"CurrName", name:"Валюта", width:70, type:"text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Exc.CurrID" },
        {data:"TQty", name:"Кол-во", width:75, type:"numeric",
            childDataSource:"t_ExcD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_ExcD", sourceField:"Qty"} },
        {data:"TNewQty", name:"Факт. кол-во", width:75, type:"numeric",
            dataFunction:{function:"sumIsNull", source:"t_ExcD", sourceField:"NewQty"} },
        {data:"TSumCC", name:"Сумма в ЦП", width:85, type:"numeric",
            childDataSource:"r_ProdMP", childLinkCondition:"r_ProdMP.ProdID=t_ExcD.ProdID and r_ProdMP.PLID=r_Stocks.PLID",
            dataFunction:{function:"sumIsNull", sourceField:"t_ExcD.Qty*r_ProdMP.PriceMC"} },
        {data:"TNewSumCC", name:"Факт. сумма в ЦП", width:85, type:"numeric",
            dataFunction:{function:"sumIsNull", sourceField:"t_ExcD.NewQty*r_ProdMP.PriceMC"} },
        {data:"StateCode", name:"StateCode", width:50, type:"text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data:"StateName", name:"Статус", width:250, type:"text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Exc.StateCode" }
    ];
    r_Stocks.getEmpOperStocksList= function(dbUC,empID,calback){
        r_Stocks.getDataItems(dbUC,
            { fields: ["r_Stocks.StockID"],
                joinedSources: {
                    "r_CRs": "r_CRs.StockID=r_Stocks.StockID",
                    "r_OperCRs": "r_OperCRs.CRID=r_CRs.CRID",
                    "r_Opers": "r_Opers.OperID=r_OperCRs.OperID"
                },
                groupedFields:["r_Stocks.StockID"],
                conditions:{"r_Stocks.StockID>":0,"r_Opers.EmpID=":empID},
                order: "r_Stocks.StockID" },
            function(result){
                if(!result||!result.items){ calback(null); return; }
                var empOperStocksLists=null;
                for(var i=0;i<result.items.length;i++){
                    empOperStocksLists= (!empOperStocksLists)?"":empOperStocksLists+",";
                    empOperStocksLists+= result.items[i]["StockID"];
                }
                calback(empOperStocksLists);
            });
    };
    app.get("/docs/excCashier/getDataForExcsListTable", function(req,res){
        var conditions= {};
        for(var condItem in req.query) conditions["t_Exc."+condItem]=req.query[condItem];
        r_Stocks.getEmpOperStocksList(req.dbUC,req.dbUserParams["EmpID"],function(empOperStocksLists){
            var aconditions= {"t_Exc.StateCode in (50,56,60)":null};
            if(empOperStocksLists) aconditions["t_Exc.NewStockID in ("+empOperStocksLists+")"]=null; else aconditions["t_Exc.NewStockID is null"]=null;
            t_Exc.getDataForTable(req.dbUC,{tableColumns:tExcsListTableColumns, identifier:tExcsListTableColumns[0].data,
                    conditions:conditions, aconditions:aconditions, order:"DocDate, DocID"},
                function(result){
                    res.send(result);
                });
        });
    });
    app.get("/docs/excCashier/getExcData", function(req, res){
        var conditions= {};
        for(var condItem in req.query) conditions["t_Exc."+condItem]=req.query[condItem];
        t_Exc.getDataItemForTable(req.dbUC,{tableColumns:tExcsListTableColumns,
                conditions:conditions},
            function(result){
                res.send(result);
            });
    });

    var tExcDTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", dataSource:"t_ExcD", identifier:true, readOnly:true, visible:false},
        {data:"SrcPosID", name:"№ п/п", width:45, type:"numeric", dataSource:"t_ExcD", identifier:true, readOnly:true },
        //{data: "Article1", name:"Артикул1 товара", width:200, readOnly:true,
        //    dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID"},
        {data:"ProdID", name:"Код товара", width:50, type:"text", dataSource:"t_ExcD", visible:true, readOnly:true},
        {data:"Barcode", name:"Штрихкод", width:75, type:"text", dataSource:"t_ExcD", visible:false, readOnly:true},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text", readOnly:true,
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID" },
        {data:"UM", name:"Ед. изм.", width:50, type:"text", align:"center", dataSource:"t_ExcD", sourceField:"UM", readOnly:true},
        {data:"Qty", name:"Кол-во", width:55, type:"numeric", dataSource:"t_ExcD", readOnly:true},
        {data:"PPID", name:"Партия", width:60, type:"numeric", visible:false, readOnly:true},
        {data:"NewQty", name:"Факт кол-во", width:55, type:"numeric", dataSource:"t_ExcD", readOnly:false},
        {data:"ExcChID", name:"ExcChID", width:0, type:"text", visible:false, readOnly:true,
            dataSource:"t_Exc", sourceField:"ChID", linkCondition:"t_Exc.ChID=t_ExcD.ChID" },
        {data:"StockID", name:"StockID", width:0, type:"text", visible:false, readOnly:true,
            dataSource:"r_Stocks", sourceField:"StockID", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data:"PLID", name:"PLID", width:50, type:"text", visible:false, readOnly:true,
            dataSource:"r_PLs", sourceField:"PLID", linkCondition:"r_PLs.PLID=r_Stocks.PLID" },
        {data:"PriceCC", name:"Цена по прайс-листу", width:75, type:"numeric2", readOnly:true,
            dataSource:"r_ProdMP", sourceField:"PriceMC", linkCondition:"r_ProdMP.PLID=r_PLs.PLID and r_ProdMP.ProdID=t_ExcD.ProdID" },
        {data:"SumCC", name:"Сумма в ЦП", width:75, type:"numeric2", dataFunction:"t_ExcD.Qty*r_ProdMP.PriceMC", readOnly:true},
        {data:"NewSumCC", name:"Факт. сумма в ЦП", width:75, type:"numeric2", dataFunction:"t_ExcD.NewQty*r_ProdMP.PriceMC", readOnly:true}
    ];
    app.get("/docs/excCashier/getDataForExcDTable", function(req, res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_ExcD.ChID="]=req.query[condItem];
            else conditions["t_ExcD."+condItem]=req.query[condItem];
        t_ExcD.getDataForDocTable(req.dbUC,{tableColumns:tExcDTableColumns, identifier:tExcDTableColumns[0].data,
                conditions:conditions, order:"SrcPosID"},
            function(result){
                res.send(result);
            });
    });

    //t_ExcD.setRecDTaxPriceCCnt=function(connection,prodID,recChID,recDData,callback){
    //    database.selectParamsQuery(connection,
    //        "select tax=dbo.zf_GetProdRecTax(@p0,OurID,CompID,DocDate) from t_Exc where ChID=@p1",[prodID,recChID],
    //        function (result) {/* Возвращает ставку НДС для товара в зависимости от поставщика */
    //            var tax=(result&&result.length>0)?result[0]["tax"]:0;
    //            recDData["Tax"]=tax; recDData["PriceCC_nt"]=recDData["PriceCC_wt"]-tax;
    //            var qty=recDData["Qty"];
    //            recDData["TaxSum"]=tax*qty; recDData["SumCC_nt"]=recDData["SumCC_wt"]-tax*qty;
    //            callback(recDData);
    //        });
    //};
    /**
     * callback = function(result), result= { resultItem, error, userErrorMsg }
     */
    //t_ExcD.storeNewProdPP=function(connection,prodID,recChID,recDData,callback){
    //    t_Exc.getDataItem(connection,{fields:["DocDate","CurrID","CompID"],conditions:{"ChID=":recChID}},
    //        function(result){
    //            if(result.error||!result.item){
    //                callback({error:"Failed get rec data for create prod PP!"});
    //                return;
    //            }
    //            var recData=result.item, priceCC_wt=recDData["PriceCC_wt"];
    //            r_Prods.storeProdPP(connection,
    //                {"ProdID":prodID,"ProdDate":recData["DocDate"],"CompID":recData["CompID"],"Article":"",
    //                    "PriceCC_In":priceCC_wt,"CostCC":priceCC_wt,"PriceMC":priceCC_wt,
    //                    "CurrID":recData["CurrID"], "PriceMC_In":priceCC_wt,"CostAC":priceCC_wt},
    //                function(result){
    //                    callback(result);
    //                });
    //        });
    //};
    /**
     * callback = function(result), result = { resultItem, error, userErrorMsg }
     */
    //t_ExcD.storeRecD=function(connection,prodID,storeData,dbUserParams,callback){
    //    var parentChID=storeData["ParentChID"]||storeData["ChID"];
    //    t_ExcD.storeNewProdPP(connection,prodID,parentChID,storeData,function(resultStorePP){
    //        if(resultStorePP.error){
    //            r_Prods.delete(connection,prodID);
    //            callback({error:resultStorePP.error});
    //            return;
    //        }
    //        storeData["PPID"]=resultStorePP.resultItem["PPID"];
    //        storeData["SecID"]=dbUserParams["t_SecID"];
    //        t_ExcD.setRecDTaxPriceCCnt(connection,prodID,parentChID,storeData,function(storeData){
    //            storeData["CostCC"]=storeData["PriceCC_wt"]; storeData["CostSum"]=storeData["SumCC_wt"];
    //            t_ExcD.storeTableDataItem(connection,{tableColumns:tExcDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
    //                    calcNewIDValue: function(params, callback){
    //                        params.storeTableData["ChID"]=params.storeTableData["ParentChID"];
    //                        callback(params);
    //                    }},
    //                function(result){
    //                    if(result.error) {
    //                        r_Prods.delete(connection,prodID);
    //                        if(result.error.indexOf("Violation of PRIMARY KEY constraint '_pk_t_ExcD'"))
    //                        result.userErrorMsg="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером."
    //                    }
    //                    callback(result);
    //                });
    //        });
    //    });
    //};
    app.post("/docs/excCashier/storeExcDTableData", function(req,res){
        var storeData=req.body, chID=storeData["ChID"], srcPosID=storeData["SrcPosID"];                         //console.log("storeExcDTableData storeData",storeData);
        //if(prodID===undefined||prodID===null){
        //    var prodData={"ProdName":storeData["ProdName"], "UM":storeData["UM"], "Article1":storeData["Article1"],
        //        "Country":storeData["Country"], "Notes":storeData["ProdName"],
        //        "PCatName":storeData["PCatName"], "PGrName":storeData["PGrName"],
        //        "PGrName1":storeData["PGrName1"],"PGrName2":storeData["PGrName2"],"PGrName3":storeData["PGrName3"],
        //        "ColorName":storeData["ColorName"],"SizeName":storeData["SizeName"],
        //        "InRems":1};
        //    r_Prods.storeNewProd(req.dbUC,prodData,req.dbUserParams,function(result){
        //        if(!result.resultItem||result.error){
        //            res.send({error:"Failed crate new product! Reason:"+result.error,userErrorMsg:result.userErrorMsg});
        //            return;
        //        }
        //        prodID=result.resultItem["ProdID"];
        //        storeData["ProdID"]=prodID; storeData["Barcode"]=result.resultItem["Barcode"];
        //        t_ExcD.storeRecD(req.dbUC,prodID,storeData,req.dbUserParams,function(result){
        //            res.send(result);
        //        });
        //    });
        //    return;
        //}
        //var iProdID=parseInt(prodID);
        //if(isNaN(iProdID)){
        //    res.send({error:"Non correct ProdID!",userErrorMsg:"Не корректный код товара!"});
        //    return;
        //}
        //t_ExcD.storeRecD(req.dbUC,prodID,storeData,req.dbUserParams,function(result){
        //    res.send(result);
        //});

        if(!chID||!srcPosID){
            res.send({error:"Non correct ChID/SrcPosID!",userErrorMsg:"Не корректные данные по сохраняемой позиции в документе (код регистрации/позиция)!"});
            return;
        }
        //var storingData= ;
        t_ExcD.updTableDataItem(req.dbUC,{tableColumns:tExcDTableColumns, idFields:["ChID","SrcPosID"],
                updFileds:["NewQty"], updTableData:{"ChID":chID,"SrcPosID":srcPosID,"NewQty":storeData["NewQty"]}},
            function(result){                                                                                   console.log("storeExcDTableData result",result);
                //if(result.error){
                //    if(result.error.indexOf("Violation of PRIMARY KEY constraint '_pk_t_ExcD'"))
                //        result.userErrorMsg="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером."
                //}
                res.send(result);
            });
    });
    //app.post("/docs/excCashier/deleteExcDTableData", function(req, res){
    //    t_ExcD.delTableDataItem(req.dbUC,{idFields:["ChID","SrcPosID"],delTableData:req.body},
    //        function(result){
    //            res.send(result);
    //        });
    //});
};