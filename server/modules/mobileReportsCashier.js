var dataModel=require('../datamodel'), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Sale= require(appDataModelPath+"t_Sale"), t_SaleD= require(appDataModelPath+"t_SaleD"),
    querySalesCRRets=require(appDataModelPath+"querySalesCRRets"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"),
    // r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Sale,t_SaleD,querySalesCRRets,r_Ours,r_Stocks,r_Comps,r_States,r_Prods], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.modulePageURL = "/mobile/reports/pageReportsCashier";
module.exports.modulePagePath = "mobile/pageReportsCashier.html";
module.exports.routes=[//-- App routes --
    { path: '/pageReportsCashier', componentUrl: '/mobile/reports/pageReportsCashier', options:{clearPreviousHistory:true,ignoreCache:true}, define:true }
];
module.exports.init = function(app){
    // app.get("/mobile/Invent/settingsInventory", function (req, res) {
    //     res.sendFile(appViewsPath+'mobile/pageSettingsInvents.html');
    // });
    // app.get("/mobile/invent/pageInventory", function (req, res) {
    //     res.sendFile(appViewsPath+'mobile/pageInventory.html');
    // });

    //var tSalesForCashierTableColumns=[
    //    {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"t_Sale", identifier:true, readOnly:true, visible:false},
    //    {data: "DocID", name: "Номер", width: 85, type: "text", align:"right", dataSource:"t_Sale"},
    //    {data: "IntDocID", name: "Вн. номер", width: 85, type: "text", align:"right", dataSource:"t_Sale"},
    //    {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center", dataSource:"t_Sale"},
    //    {data: "DocTime", name: "Дата время", width: 60, type: "datetimeAsText",align:"center", dataSource:"t_Sale"},
    //    {data: "SDocDate", name: "Дата", width: 60, type: "test",align:"center", dataFunction:"CONVERT(varchar(10),DocDate,104)" },
    //    {data: "SDocTime", name: "Дата времяЯ", width: 60, type: "test",align:"center",
    //        dataFunction:"CONVERT(varchar(10),DocTime,104)+' '+CONVERT(varchar(10),DocTime,108)" },
    //    {data: "SrcPosID", name: "№ п/п", width: 45, type: "numeric", identifier:true,
    //        dataSource:"t_SaleD", sourceField:"SrcPosID", linkCondition:"t_SaleD.ChID=t_Sale.ChID" },
    //    // {data: "Article1", name: "Артикул1 товара", width: 200,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
    //    //     dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
    //    // {data: "PCatName", name: "Бренд товара", width: 140,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
    //    //     dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
    //    // {data: "PGrName", name: "Коллекция товара", width: 95,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
    //    //     dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
    //    // {data: "PGrName2", name: "Тип товара", width: 140,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
    //    //     dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
    //    // {data: "PGrName3", name: "Вид товара", width: 150,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
    //    //     dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
    //    // {data: "PGrName1", name: "Линия товара", width: 70,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
    //    //     dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
    //    // {data: "ColorName", name: "Цвет товара", width: 80,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForColorNameCombobox",
    //    //     dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
    //    //     linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
    //    // {data: "SizeName", name: "Размер товара", width: 70,
    //    //     type: "comboboxWN", sourceURL:"/dirsProds/getDataForSizeNameCombobox",
    //    //     dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
    //    //     linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"},
    //    {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"t_SaleD", visible:true},
    //    {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_SaleD", visible:false},
    //    {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
    //        dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_SaleD.ProdID" },
    //    {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"t_SaleD", sourceField:"UM"},
    //    {data: "Qty", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_SaleD"},
    //    {data: "RealPrice", name: "Факт. кол-во", width: 50, type: "numeric2", dataSource:"t_SaleD"},
    //    // {data: "PPID", name: "Партия", width: 60, type: "numeric", visible:false},
    //    // {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_RecD"},
    //    {data: "RealSum", name: "Сумма", width: 75, type: "numeric2", dataSource:"t_SaleD"},
    //    {data: "DiscountP", name: "Скидка", width: 65, type: "numeric",dataFunction:"Round((1-RealPrice/PurPriceCC_wt)*100,0)" }
    //    // {data: "TNewSumCC_wt", name: "Факт. сумма", width: 75, type: "numeric2", dataSource:"t_VenA"}
    //    // {data: "Extra", name: "% наценки", width: 55, type: "numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
    //    // {data: "PriceCC", name: "Цена продажи", width: 65, type: "numeric2", dataSource:"t_RecD"}
    //    //{data: "PRICELIST_PRICE", name: "Цена по прайс-листу", width: 75, type: "numeric2"},
    //];
    //app.get("/mobile/reports/getSalesForCashier", function(req, res){
    //    var conditions=req.query;
    //    t_Sale.getDataItemsForTable(req.dbUC,{tableColumns:tSalesForCashierTableColumns, conditions:conditions, order:"DocID,SrcPosID"},
    //        function(result){
    //            res.send(result);
    //        });
    //});
    var tSalesCRRetsForCashierTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"querySalesCRRets", identifier:true, readOnly:true, visible:false},
        {data: "DocID", name: "Номер", width: 85, type: "text", align:"right", dataSource:"querySalesCRRets"},
        {data: "IntDocID", name: "Вн. номер", width: 85, type: "text", align:"right", dataSource:"querySalesCRRets"},
        {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center", dataSource:"querySalesCRRets"},
        {data: "DocTime", name: "Дата время", width: 60, type: "datetimeAsText",align:"center", dataSource:"querySalesCRRets"},
        {data: "SDocDate", name: "Дата", width: 60, type: "test",align:"center", dataFunction:"CONVERT(varchar(10),DocDate,104)" },
        {data: "SDocTime", name: "Дата времяЯ", width: 60, type: "test",align:"center",
            dataFunction:"CONVERT(varchar(10),DocTime,104)+' '+CONVERT(varchar(10),DocTime,108)" },
        {data: "SrcPosID", name: "№ п/п", width: 45, type: "numeric", identifier:true, dataSource:"querySalesCRRets"},
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
        {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"querySalesCRRets", visible:true},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"querySalesCRRets", visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=querySalesCRRets.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"querySalesCRRets", sourceField:"UM"},
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric", dataSource:"querySalesCRRets"},
        {data: "RealPrice", name: "Факт. кол-во", width: 50, type: "numeric2", dataSource:"querySalesCRRets"},
        // {data: "PPID", name: "Партия", width: 60, type: "numeric", visible:false},
        // {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_RecD"},
        {data: "RealSum", name: "Сумма", width: 75, type: "numeric2", dataSource:"querySalesCRRets"},
        {data: "DiscountP", name: "Скидка", width: 65, type: "numeric",dataFunction:"Round((1-RealPrice/PurPriceCC_wt)*100,0)" }
        // {data: "TNewSumCC_wt", name: "Факт. сумма", width: 75, type: "numeric2", dataSource:"t_VenA"}
        // {data: "Extra", name: "% наценки", width: 55, type: "numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
        // {data: "PriceCC", name: "Цена продажи", width: 65, type: "numeric2", dataSource:"t_RecD"}
        //{data: "PRICELIST_PRICE", name: "Цена по прайс-листу", width: 75, type: "numeric2"},
    ];
    app.get("/mobile/reports/getSalesCRRetsForCashier", function(req, res){
        var conditions={}, queryParams={};
        for(var condItem in req.query){
            if(condItem.indexOf("@")==0)
                queryParams[condItem]=req.query[condItem];
            else
                conditions["querySalesCRRets."+condItem]=req.query[condItem];
        }
        querySalesCRRets.getDataItemsForTable(req.dbUC,{tableColumns:tSalesCRRetsForCashierTableColumns, sourceParams:queryParams, conditions:conditions,
                order:"CRID, OurID, StockID, DocDate, DocTime, DocCode desc, DocID, SrcPosID"},
            function(result){
                res.send(result);
            });
    });
};