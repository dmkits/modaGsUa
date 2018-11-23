var dataModel=require('../datamodel'), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Ven= require(appDataModelPath+"t_Ven"), t_VenA= require(appDataModelPath+"t_VenA"),
    // r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"),
    // r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Ven,t_VenA,r_Ours,r_Stocks,r_Comps,r_States,r_Prods], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.modulePageURL = "/mobile/ven";
module.exports.modulePagePath = "mobile/ven.html";
module.exports.init = function(app){
    var tVensListTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", readOnly:true, visible:false, dataSource:"t_Ven"},
        {data: "DocID", name: "Номер", width: 85, type: "text", align:"right", dataSource:"t_Ven"},
        {data: "IntDocID", name: "Вн. номер", width: 85, type: "text", align:"right", dataSource:"t_Ven"},
        {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center", dataSource:"t_Ven"},
        {data: "SDocDate", name: "Дата", width: 60, type: "test",align:"center", dataFunction:"CONVERT(varchar(10),DocDate,104)" },
        {data: "OurName", name: "Фирма", width: 150, type: "text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Ven.OurID" },
        {data: "StockName", name: "Склад", width: 150, type: "text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Ven.StockID" },
        {data: "CurrID", name: "Код валюты", width: 50, type: "text", align:"center", visible:false, dataSource:"t_Ven", sourceField:"CurrID"},
        {data: "CurrName", name: "Валюта", width: 70, type: "text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Ven.CurrID" },
        // {data: "KursMC", name: "Курс ОВ", width: 65, type: "numeric", dataSource:"t_Ven", visible:false },
        {data: "TQty", name: "Уч. кол-во", width: 75, type: "numeric",
            childDataSource:"t_VenA", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_VenA", sourceField:"TQty"} },
        {data: "TNewQty", name: "Факт кол-во", width: 75, type: "numeric",
            childDataSource:"t_VenA", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_VenA", sourceField:"TNewQty"} },
        {data: "TVenQty", name: "Инвент. кол-во", width: 75, type: "numeric",
            childDataSource:"t_VenA", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_VenA", sourceField:"TNewQty-TQty"} },
        {data: "TSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Ven" },
        {data: "TNewSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Ven" },
        {data: "StateCode", name: "StateCode", width: 50, type: "text", readOnly:true, visible:false, dataSource:"t_Ven"},
        {data: "StateName", name: "Статус", width: 250, type: "text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Ven.StateCode" }
    ];
    app.get("/mobile/ven/getDataForVensList", function(req, res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Ven."+condItem]=req.query[condItem];
        r_Stocks.getDataItems(req.dbUC,{fields:['StockID','StockName'], conditions:{"StockID>":0}, order:"StockName"},
            function(result){
                var error=(result.error)?result.error:'',listStocks=(result)?result.items:null;
                t_Ven.getDataItemsForTable(req.dbUC,{tableColumns:tVensListTableColumns, conditions:conditions,
                        order:"DocDate desc, DocID desc", top:"top 50"},
                    function(result){
                        error+=(result.error)?result.error:'';
                        var outData={listStocks:listStocks,listInventsByStockID:(result)?result.items:null};
                        if(error!='')outData.error=error;
                        res.send(outData);
                    });
            });
    });
    // app.get("/docs/rec/getRecData", function(req, res){
    //     var conditions={};
    //     for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
    //     t_Rec.getDataItemForTable(req.dbUC,{tableColumns:tVensListTableColumns,
    //             conditions:conditions},
    //         function(result){
    //             res.send(result);
    //         });
    // });

    var tVenATableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"t_VenA", identifier:true, readOnly:true, visible:false},
        {data: "TSrcPosID", name: "№ п/п", width: 45, type: "numeric", dataSource:"t_VenA", identifier:true },
        // {data: "Article1", name: "Артикул1 товара", width: 200,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
        //     dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
        // {data: "PCatName", name: "Бренд товара", width: 140,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
        //     dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        // {data: "PGrName", name: "Коллекция товара", width: 95,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
        //     dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        // {data: "PGrName2", name: "Тип товара", width: 140,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
        //     dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        // {data: "PGrName3", name: "Вид товара", width: 150,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
        //     dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        // {data: "PGrName1", name: "Линия товара", width: 70,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
        //     dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        // {data: "ColorName", name: "Цвет товара", width: 80,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForColorNameCombobox",
        //     dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
        //     linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
        // {data: "SizeName", name: "Размер товара", width: 70,
        //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForSizeNameCombobox",
        //     dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
        //     linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"t_VenA", visible:true},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_VenA", visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_VenA.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"t_VenA", sourceField:"UM"},
        {data: "TQty", name: "Уч. кол-во", width: 50, type: "numeric", dataSource:"t_VenA"},
        {data: "TNewQty", name: "Факт. кол-во", width: 50, type: "numeric", dataSource:"t_VenA"},
        // {data: "PPID", name: "Партия", width: 60, type: "numeric", visible:false},
        // {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_RecD"},
        {data: "TSumCC_wt", name: "Уч. сумма", width: 75, type: "numeric2", dataSource:"t_VenA"},
        {data: "TNewSumCC_wt", name: "Факт. сумма", width: 75, type: "numeric2", dataSource:"t_VenA"}
        // {data: "Extra", name: "% наценки", width: 55, type: "numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
        // {data: "PriceCC", name: "Цена продажи", width: 65, type: "numeric2", dataSource:"t_RecD"}
        //{data: "PRICELIST_PRICE", name: "Цена по прайс-листу", width: 75, type: "numeric2"},
    ];
    app.get("/mobile/ven/getDataForVenATable", function(req, res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_VenA.ChID="]=req.query[condItem];
            else conditions["t_VenA."+condItem]=req.query[condItem];
        t_VenA.getDataItemsForTable(req.dbUC,{tableColumns:tVenATableColumns, conditions:conditions, order:"TSrcPosID"},
            function(result){
                res.send(result);
            });
    });
};