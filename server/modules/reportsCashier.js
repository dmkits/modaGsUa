var dataModel=require('../datamodel');
var t_Rem= require(appDataModelPath+"t_Rem");
var r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Prods=require(appDataModelPath+"r_Prods"), z_Docs=require(appDataModelPath+"z_Docs"),
    queryProdMove=require(appDataModelPath+"queryProdMove");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Rem,r_Ours,r_Stocks,r_Prods,queryProdMove,z_Docs], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.modulePageURL = "/reports/cashier";
module.exports.modulePagePath = "reports/cashier.html";
module.exports.init = function(app){
    app.get("/reports/cashier/getDirStocksForSelect", function(req, res){
        var empID=req.dbUserParams["EmpID"];
        r_Stocks.getDataItemsForSelect(req.dbUC,
            {valueField:"StockID",labelField:"StockName",
                joinedSources: {
                    "r_CRs": "r_CRs.StockID=r_Stocks.StockID",
                    "r_OperCRs": "r_OperCRs.CRID=r_CRs.CRID",
                    "r_Opers": "r_Opers.OperID=r_OperCRs.OperID"
                },
                groupedFields:["r_Stocks.StockID","r_Stocks.StockName"],
                conditions:{"r_Stocks.StockID>":0,"r_Opers.EmpID=":empID},
                order: "StockName" },
            function (result) {
                res.send(result);
            });
    });
    var tProdsRemsTableColumns=[
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false, dataSource:"t_Rem"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"t_Rem"},
        {data: "ProdChID", name: "ProdChID", width: 50, type: "text", visible:false,
            dataSource:"r_Prods", sourceField:"ChID", linkCondition:"r_Prods.ProdID=t_Rem.ProdID"},
        {data: "PCatName", name: "Бренд товара", width: 140, type: "text",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data: "PGrName", name: "Коллекция товара", width: 95, type: "text",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data: "PGrName2", name: "Тип товара", width: 140, type: "text",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data: "PGrName3", name: "Вид товара", width: 150, type: "text",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        {data: "PGrName1", name: "Линия товара", width: 70, type: "text",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        //{data: "ColorName", name: "Цвет товара", width: 80, type: "text",
        //    dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
        //    linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
        //{data: "SizeName", name: "Размер товара", width: 70, type: "text",
        //    dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
        //    linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"},
        {data: "Article1", name: "Артикул1 товара", width: 200, type: "text",
            dataSource:"r_Prods", sourceField:"Article1"},
        //{data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_Rem", visible:false},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", align:"center", visible:true, dataSource:"t_Rem"},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"r_Prods", sourceField:"UM"},
        {data: "TQty", name: "Кол-во", width: 50, type: "numeric",
            dataFunction:{function:"sumIsNull", source:"t_Rem", sourceField:"Qty"}}
    ];
    app.get("/reports/prodsRems/getProductsRems", function(req, res){
        var conditions={};
        for(var condItem in req.query) {
            if(condItem.indexOf("SUM(")<0) conditions["t_Rem."+condItem]=req.query[condItem];
            else conditions[condItem]=req.query[condItem];
        }
        t_Rem.getDataForTable(req.dbUC,{tableColumns:tProdsRemsTableColumns, identifier:tProdsRemsTableColumns[0].data,
                conditions:conditions, order:"OurID, StockID, ProdName"},
            function(result){
                res.send(result);
            });
    });
    var tProdsMovesTableColumns=[
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false, dataSource:"queryProdMove"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"queryProdMove"},
        {data: "ProdChID", name: "ProdChID", width: 50, type: "text", visible:false,
            dataSource:"r_Prods", sourceField:"ChID", linkCondition:"r_Prods.ProdID=queryProdMove.ProdID"},
        //{data: "PCatName", name: "Бренд товара", width: 140, type: "text",
        //    dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        //{data: "PGrName", name: "Коллекция товара", width: 95, type: "text",
        //    dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        //{data: "PGrName2", name: "Тип товара", width: 140, type: "text",
        //    dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        //{data: "PGrName3", name: "Вид товара", width: 150, type: "text",
        //    dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        //{data: "PGrName1", name: "Линия товара", width: 70, type: "text",
        //    dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        //{data: "ColorName", name: "Цвет товара", width: 80, type: "text",
        //    dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
        //    linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
        //{data: "SizeName", name: "Размер товара", width: 70, type: "text",
        //    dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
        //    linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"},
        {data: "Article1", name: "Артикул1 товара", width: 200, type: "text",
            dataSource:"r_Prods", sourceField:"Article1"},
        //{data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_Rem", visible:false},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", align:"center", visible:true, dataSource:"queryProdMove"},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"r_Prods", sourceField:"UM"},
        {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center"},
        {data: "DocCode", name: "DocCode", width: 50, type: "text", visible:false,
            dataSource:"z_Docs", sourceField:"DocCode", linkCondition:"z_Docs.DocCode=queryProdMove.DocCode"},
        {data: "DocName", name: "Документ", width: 170, type: "text",
            dataSource:"z_Docs", dataFunction:"CASE When queryProdMove.DocCode=0 Then '' Else DocName END"},
        {data: "BQty", name: "Нач. ост.", width: 50, type: "numeric"},
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric"},
        {data: "TQty", name: "Кон. ост.", width: 50, type: "numeric"}
    ];
    app.get("/reports/prodsRems/getProductsMoves", function(req, res){
        var conditions={}, params={};
        for(var condItem in req.query) {
            if(condItem.indexOf("SUM(")<0) {
                if(condItem.indexOf("@")!=0)
                    conditions["queryProdMove."+condItem]=req.query[condItem];
                else
                    params[condItem]=req.query[condItem];
            } else
                conditions[condItem]=req.query[condItem];
        }
        queryProdMove.getDataForTable(req.dbUC,
            {tableColumns:tProdsMovesTableColumns, identifier:tProdsMovesTableColumns[0].data,
                sourceParams:params, conditions:conditions,
                order:"ProdID, OurID, StockID, "+
                    "CASE When BQty is Not NULL Then 0 When Qty is Not NULL Then 1 Else 2 END, "+
                    "DocDate,OperType desc,OperSNum,DocCode"},
            function(result){
                res.send(result);
            });
    });
};