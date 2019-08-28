var dataModel=require(appDataModelPath), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Exc= require(appDataModelPath+"t_Exc"), t_ExcD= require(appDataModelPath+"t_ExcD");
    r_Prods=require(appDataModelPath+"r_Prods");
var r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_StateDocs= require(appDataModelPath+"r_StateDocs"), r_StateDocsChange= require(appDataModelPath+"r_StateDocsChange"),
    zf_CanChangeDoc= require(appDataModelPath+"zf_CanChangeDoc");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Exc,t_ExcD,r_DBIs,r_Ours,r_Stocks,r_Comps,r_Currs,r_States,r_StateDocs,r_StateDocsChange,zf_CanChangeDoc,r_Prods], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.moduleViewURL = "/docs/excCashier";
module.exports.moduleViewPath = "docs/exc-cashier.html";
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
        {data:"TSumCC", name:"Сумма", width:85, type:"numeric", dataSource:"t_Exc",sourceField:"TSumCC_wt"},
        {data:"TNewSumCC", name:"Факт. сумма", width:85, type:"numeric",
            dataFunction:{function:"sumIsNull", sourceField:"t_ExcD.NewQty*t_ExcD.PriceCC_wt"} },
        {data:"StateCode", name:"StateCode", width:50, type:"text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data:"StateName", name:"Статус", width:250, type:"text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Exc.StateCode" },
        {data:"CanChangeDoc", name:"CanChangeDoc", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"dbo.zf_CanChangeDoc(11021,t_Exc.ChID,t_Exc.StateCode)"},
        {data:"StateCodeCashierConfirm", name:"StateCodeConfirm", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE t_Exc.StateCode When 50 Then 51 When 56 Then 57 Else NULL END"},
        {data:"StateCodeCashierRetrieve", name:"StateCodeRetrieve", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE t_Exc.StateCode When 50 Then 52 When 56 Then 58 Else NULL END"}
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
            var aconditions= {"t_Exc.StateCode in (50,56)":null};
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
    app.post("/docs/excCashier/updExcDataState", function(req, res){
        var storeData=req.body, chID=storeData["ChID"];
        if(!chID){
            res.send({error:"Non correct ChID!",userErrorMsg:"Не корректные данные сохраняемого документа (код регистрации)!"});
            return;
        }
        t_Exc.updTableDataItem(req.dbUC,{tableColumns:tExcsListTableColumns, idFieldName:"ChID",
                updFileds:["StateCode"], updTableData:{"ChID":chID,"StateCode":storeData["StateCode"]}},
            function(result){
                res.send(result);
            });
    });

    var tExcDTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", align:"center", dataSource:"t_ExcD", identifier:true, readOnly:true, visible:false},
        {data:"SrcPosID", name:"№ п/п", width:45, type:"numeric", align:"center", dataSource:"t_ExcD", identifier:true, readOnly:true },
        //{data: "Article1", name:"Артикул1 товара", width:200, readOnly:true,
        //    dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID"},
        {data:"ProdID", name:"Код товара", width:50, type:"text", align:"center", dataSource:"t_ExcD", visible:true, readOnly:true},
        {data:"Barcode", name:"Штрихкод", width:75, type:"text", align:"center", dataSource:"t_ExcD", visible:false, readOnly:true},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text", readOnly:true,
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID" },
        {data:"UM", name:"Ед. изм.", width:50, type:"text", align:"center", dataSource:"t_ExcD", sourceField:"UM", readOnly:true},
        {data:"Qty", name:"Кол-во", width:55, type:"numeric", align:"center", dataSource:"t_ExcD", readOnly:true},
        {data:"PPID", name:"Партия", width:60, type:"numeric", align:"center", visible:false, readOnly:true},
        {data:"NewQty", name:"Факт кол-во", width:55, type:"numeric", align:"center", dataSource:"t_ExcD", readOnly:false},
        {data:"PriceCC", name:"Цена", width:75, type:"numeric2", readOnly:true, dataSource:"t_ExcD",sourceField:"PriceCC_wt"},
        {data:"ExcChID", name:"ExcChID", width:0, type:"text", visible:false, readOnly:true,
            dataSource:"t_Exc", sourceField:"ChID", linkCondition:"t_Exc.ChID=t_ExcD.ChID" },
        {data:"StockID", name:"StockID", width:0, type:"text", visible:false, readOnly:true,
            dataSource:"r_Stocks", sourceField:"StockID", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data:"PLID", name:"PLID", width:50, type:"text", visible:false, readOnly:true,
            dataSource:"r_PLs", sourceField:"PLID", linkCondition:"r_PLs.PLID=r_Stocks.PLID" },
        {data:"PLPriceCC", name:"Цена по прайс-листу", width:75, type:"numeric2", visible:false, readOnly:true,
            dataSource:"r_ProdMP", sourceField:"PriceMC", linkCondition:"r_ProdMP.PLID=r_PLs.PLID and r_ProdMP.ProdID=t_ExcD.ProdID" },
        {data:"SumCC", name:"Сумма", width:75, type:"numeric2", dataSource:"t_ExcD",sourceField:"SumCC_wt", readOnly:true},
        {data:"NewSumCC", name:"Факт. сумма", width:75, type:"numeric2", dataFunction:"t_ExcD.NewQty*t_ExcD.PriceCC_wt", readOnly:true}
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
    app.post("/docs/excCashier/storeExcDTableData", function(req,res){
        var storeData=req.body, chID=storeData["ChID"], srcPosID=storeData["SrcPosID"];
        if(!chID||!srcPosID){
            res.send({error:"Non correct ChID/SrcPosID!",userErrorMsg:"Не корректные данные по сохраняемой позиции в документе (код регистрации/позиция)!"});
            return;
        }
        t_ExcD.updTableDataItem(req.dbUC,{tableColumns:tExcDTableColumns, idFields:["ChID","SrcPosID"],
                updFileds:["NewQty"], updTableData:{"ChID":chID,"SrcPosID":srcPosID,"NewQty":storeData["NewQty"]}},
            function(result){
                res.send(result);
            });
    });
};