var dataModel=require(appDataModelPath);
var r_Ours= require(appDataModelPath+"r_Ours"), r_CRs= require(appDataModelPath+"r_CRs"),
    r_Prods=require(appDataModelPath+"r_Prods"),
    t_Sale=require(appDataModelPath+"t_Sale"),t_SaleD=require(appDataModelPath+"t_SaleD"),
    querySalesCRRets=require(appDataModelPath+"querySalesCRRets"),
    r_Stocks= require(appDataModelPath+"r_Stocks"),
    t_Rem= require(appDataModelPath+"t_Rem"),
    z_Docs=require(appDataModelPath+"z_Docs"),
    queryProdMove=require(appDataModelPath+"queryProdMove");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Ours,r_CRs,r_Prods,t_Sale,t_SaleD,querySalesCRRets,r_Stocks,t_Rem,z_Docs,queryProdMove], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.moduleViewURL = "/reports/products";
module.exports.moduleViewPath = "reports/r_products.html";
module.exports.init = function(app){
    r_CRs.getDirCRsForReportsSalesSelect= function(dbUC,dbUserParams,dbEmpRole,isMobile,callback){
        var empID= dbUserParams["EmpID"];
        r_CRs.getDataItemsForSelect(dbUC,
            {valueField:"CRID",labelField:"CRName",
                joinedSources:{
                    "r_OperCRs":"r_OperCRs.CRID=r_CRs.CRID",
                    "r_Opers":"r_Opers.OperID=r_OperCRs.OperID"
                },
                groupedFields:["r_CRs.CRID","r_CRs.CRName"],
                conditions:{"r_CRs.CRID>":0,"r_Opers.EmpID=":empID},
                order:"CRName"},
            function(result){
                if(dbEmpRole=="cashier"||isMobile){ res.send(result);return; }
                if(result.items)result.items=[{value:-1, label:'Все кассы'}].concat(result.items);
                callback(result);
            });
    };
    app.get("/reports/products/getDirCRsForSelect",function(req,res){
        r_CRs.getDirCRsForReportsSalesSelect(req.dbUC,req.dbUserParams,req.dbEmpRole,req.isMobile,function(result){ res.send(result); });
    });
    var tProdsSalesTableColumns=[
        {data: "ChID", name: "ChID", width: 50, type: "text", visible:false, dataSource:"t_SaleD"},
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false,
            dataSource:"t_Sale", sourceField:"DocID", linkCondition:"t_Sale.ChID=t_SaleD.ChID"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"t_Sale"},
        {data: "CRID", name: "CRID", width: 50, type: "text", visible:false, dataSource:"t_Sale"},
        {data: "CRName", name: "Касса", width: 250, type: "text", visible:false,
            dataSource:"r_CRs", sourceField:"CRName", linkCondition:"r_CRs.CRID=t_Sale.CRID"},
        {data: "DocID", name: "Номер чека", width: 70, type: "text", align:"center", visible:false, dataSource:"t_Sale"},
        {data: "DocDate", name: "Дата чека", width: 55, type: "dateAsText", visible:true, dataSource:"t_Sale"},
        {data: "DocTime", name: "Дата время чека", width: 55, type: "datetimeAsText", visible:true, dataSource:"t_Sale"},
        {data: "SrcPosID", name: "Позиция", width: 50, type: "numeric", align:"right", visible:false, dataSource:"t_SaleD"},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", align:"center", visible:false, dataSource:"t_SaleD"},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", align:"center", visible:true, dataSource:"t_SaleD"},
        // {data: "Article1", name: "Артикул1 товара", width: 200, type: "text",
        //     dataSource:"r_Prods", sourceField:"Article1"},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_SaleD.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"t_SaleD" },
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric",source:"t_SaleD" },
        {data: "PurPriceCC_wt", name: "Цена без скидки", width: 65, type: "numeric2",source:"t_SaleD" },
        {data: "DiscountP", name: "Скидка", width: 65, type: "numeric",dataFunction:"(1-RealPrice/PurPriceCC_wt)*100" },
        {data: "RealPrice", name: "Цена", width: 65, type: "numeric2",source:"t_SaleD" },
        {data: "RealSum", name: "Сумма", width: 75, type: "numeric2",source:"t_SaleD" },
        {data: "DiscountSum", name: "Сумма скидки", width: 65, type: "numeric2",dataFunction:"(PurPriceCC_wt-RealPrice)*Qty" }
    ];
    app.get("/reports/products/getProductsSales",function(req,res){
        var conditions={}, allItems=false;//
        for(var condItem in req.query) {
            var val=req.query[condItem];
            if(condItem.indexOf("DiscountP")==0) conditions[condItem.replace("DiscountP","(PurPriceCC_wt-RealPrice)")]=val;
            else if(condItem.indexOf("CRID")==0&&val=="-1"&&req.dbEmpRole!=="cashier"&&!req.isMobile){//ALL
                conditions["1=1"]=null; allItems=true;
            }else{
                var newCondItem=condItem;
                for(var cInd in tProdsSalesTableColumns){
                    var colData=tProdsSalesTableColumns[cInd];
                    if(colData&&colData.data&&condItem.indexOf(colData.data)==0&&colData.dataSource){
                        newCondItem=colData.dataSource+"."+condItem; break;
                    }
                }
                conditions[newCondItem]=val;
            }
        }
        for(var i=0; i<tProdsSalesTableColumns.length; i++){
            var tColData=tProdsSalesTableColumns[i];
            if(tColData.data=="CRName"){ tColData.visible=allItems; break; }
        }
        t_SaleD.getDataForTable(req.dbUC,{tableColumns:tProdsSalesTableColumns, identifier:tProdsSalesTableColumns[0].data,
                conditions:conditions, order:"OurID, StockID, SrcPosID"},
            function(result){
                res.send(result);
            });
    });
    var tProdsSalesCRRetsTableColumns=[
        {data: "ChID", name: "ChID", width: 50, type: "text", visible:false, dataSource:"querySalesCRRets"},
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false, dataSource:"querySalesCRRets"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"querySalesCRRets"},
        {data: "CRID", name: "CRID", width: 50, type: "text", visible:false, dataSource:"querySalesCRRets"},
        {data: "CRName", name: "Касса", width: 250, type: "text", visible:false,
            dataSource:"r_CRs", sourceField:"CRName", linkCondition:"r_CRs.CRID=querySalesCRRets.CRID"},
        {data: "DocID", name: "Номер чека", width: 70, type: "text", align:"center", visible:false, dataSource:"querySalesCRRets"},
        {data: "DocDate", name: "Дата чека", width: 55, type: "dateAsText", visible:true, dataSource:"querySalesCRRets"},
        {data: "DocTime", name: "Дата время чека", width: 55, type: "datetimeAsText", visible:true, dataSource:"querySalesCRRets"},
        {data: "SrcPosID", name: "Позиция", width: 50, type: "numeric", align:"right", visible:false, dataSource:"querySalesCRRets"},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", align:"center", visible:false, dataSource:"querySalesCRRets"},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", align:"center", visible:true, dataSource:"querySalesCRRets"},
        // {data: "Article1", name: "Артикул1 товара", width: 200, type: "text",
        //     dataSource:"r_Prods", sourceField:"Article1"},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=querySalesCRRets.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"querySalesCRRets" },
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric",source:"querySalesCRRets" },
        {data: "PurPriceCC_wt", name: "Цена без скидки", width: 65, type: "numeric2",source:"querySalesCRRets" },
        {data: "DiscountP", name: "Скидка", width: 65, type: "numeric",dataFunction:"(1-RealPrice/PurPriceCC_wt)*100" },
        {data: "RealPrice", name: "Цена", width: 65, type: "numeric2",source:"querySalesCRRets" },
        {data: "RealSum", name: "Сумма", width: 75, type: "numeric2",source:"querySalesCRRets" },
        {data: "DiscountSum", name: "Сумма скидки", width: 65, type: "numeric2",dataFunction:"(PurPriceCC_wt-RealPrice)*Qty" }
    ];
    querySalesCRRets.getProductsSalesCRRets= function(dbUC,reqParams,dbEmpRole,isMobile,callback){
        var conditions={}, allItems=false, queryParams={};
        for(var condItem in reqParams) {
            var val= reqParams[condItem];
            if(condItem.indexOf("@")==0) queryParams[condItem]= reqParams[condItem];
            else if(condItem.indexOf("DiscountP")==0) conditions[condItem.replace("DiscountP","(PurPriceCC_wt-RealPrice)")]=val;
            else if(condItem.indexOf("CRID")==0&&val=="-1"&&dbEmpRole!=="cashier"&&!isMobile) {//ALL
                conditions["1=1"]=null; allItems=true;
            }else{
                var newCondItem=condItem;
                for(var cInd in tProdsSalesCRRetsTableColumns){
                    var colData=tProdsSalesCRRetsTableColumns[cInd];
                    if(colData&&colData.data&&condItem.indexOf(colData.data)==0&&colData.dataSource){
                        newCondItem=colData.dataSource+"."+condItem; break;
                    }
                }
                conditions[newCondItem]=val;
            }
        }
        for(var i=0; i<tProdsSalesCRRetsTableColumns.length; i++){
            var tColData=tProdsSalesCRRetsTableColumns[i];
            if(tColData.data=="CRName"){
                tColData.visible=allItems; break;
            }
        }
        querySalesCRRets.getDataForTable(dbUC,
            {tableColumns:tProdsSalesCRRetsTableColumns, identifier:tProdsSalesCRRetsTableColumns[0].data,
                sourceParams:queryParams, conditions:conditions,
                order:"OurID, StockID, CRID, DocDate, DocTime, DocCode desc, DocID, SrcPosID"},
            function(result){ callback(result); });
    };
    app.get("/reports/products/getProductsSalesCRRets",function(req,res){
        querySalesCRRets.getProductsSalesCRRets(req.dbUC,req.query,req.dbEmpRole,req.isMobile,function(result){ res.send(result); });
    });

    r_Stocks.getDirStocksForReportsProductsSelect= function(dbUC,dbUserParams,callback){
        var empID= dbUserParams["EmpID"];
        r_Stocks.getDataItemsForSelect(dbUC,
            {valueField:"StockID",labelField:"StockName",
                joinedSources: {
                    "r_CRs": "r_CRs.StockID=r_Stocks.StockID",
                    "r_OperCRs": "r_OperCRs.CRID=r_CRs.CRID",
                    "r_Opers": "r_Opers.OperID=r_OperCRs.OperID"
                },
                groupedFields:["r_Stocks.StockID","r_Stocks.StockName"],
                conditions:{"r_Stocks.StockID>=":0,"r_Opers.EmpID=":empID},
                order:"StockName" },
            function(result){ callback(result); });
    };
    app.get("/reports/products/getDirStocksForSelect",function(req,res){
        r_Stocks.getDirStocksForReportsProductsSelect(req.dbUC,req.dbUserParams,function(result){ res.send(result); });
    });
    var tProdsRemsTableColumns=[
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false, dataSource:"t_Rem"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"t_Rem"},
        {data: "PLID", name: "PLID", width: 50, type: "text", visible:false,
            dataSource:"r_Stocks", sourceField:"PLID", linkCondition:"r_Stocks.StockID=t_Rem.StockID"},
        {data: "ProdChID", name: "ProdChID", width: 50, type: "text", visible:false,
            dataSource:"r_Prods", sourceField:"ChID", linkCondition:"r_Prods.ProdID=t_Rem.ProdID"},
        {data: "Article1", name: "Артикул1 товара", width: 200, type: "text",
            dataSource:"r_Prods", sourceField:"Article1"},
        {data: "PCatName", name: "Категория товара", width: 140, type: "text", visible:true,
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        // {data: "PGrName", name: "Группа товара", width: 95, type: "text", visible:false,
        //     dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        // {data: "PGrName1", name: "Подгруппа 1 товара", width: 70, type: "text", visible:false,
        //     dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        // {data: "PGrName2", name: "Подгруппа 2 товара", width: 140, type: "text", visible:false,
        //     dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        // {data: "PGrName3", name: "Подгруппа 3 товара", width: 150, type: "text", visible:false,
        //     dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        //{data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_Rem", visible:false},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", align:"center", visible:true, dataSource:"t_Rem"},
        {data: "ProdName", name: "Наименование товара", width: 400, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", visible:false, dataSource:"r_Prods", sourceField:"UM"},
        {data: "TQty", name: "Кол-во", width: 50, type: "numeric",
            dataFunction:{function:"sumIsNull", source:"t_Rem", sourceField:"Qty"}}
    ];
    t_Rem.getProductsRems= function(dbUC,reqParams,callback){
        var conditions={};
        for(var condItem in reqParams){
            if(condItem.indexOf("SUM(")<0) conditions["t_Rem."+condItem]= reqParams[condItem];
            else conditions[condItem]= reqParams[condItem];
        }
        t_Rem.getDataForTable(dbUC,
            {tableColumns:tProdsRemsTableColumns, identifier:tProdsRemsTableColumns[0].data,
                conditions:conditions, order:"OurID, StockID, ProdName"},
            function(result){ callback(result); });
    };
    app.get("/reports/products/getProductsRems",function(req,res){
        t_Rem.getProductsRems(req.dbUC,req.query,function(result){ res.send(result); });
    });

    var tProdsRemsTableColumnsWSPrice=[
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false, dataSource:"t_Rem"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"t_Rem"},
        {data: "PLID", name: "PLID", width: 50, type: "text", visible:false,
            dataSource:"r_Stocks", sourceField:"PLID", linkCondition:"r_Stocks.StockID=t_Rem.StockID"},
        {data: "ProdChID", name: "ProdChID", width: 50, type: "text", visible:false,
            dataSource:"r_Prods", sourceField:"ChID", linkCondition:"r_Prods.ProdID=t_Rem.ProdID"},
        {data: "Article1", name: "Артикул1 товара", width: 200, type: "text",
            dataSource:"r_Prods", sourceField:"Article1"},
        {data: "PCatName", name: "Категория товара", width: 140, type: "text", visible:true,
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        // {data: "PGrName", name: "Группа товара", width: 95, type: "text", visible:false,
        //     dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        // {data: "PGrName1", name: "Подгруппа 1 товара", width: 70, type: "text", visible:false,
        //     dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        // {data: "PGrName2", name: "Подгруппа 2 товара", width: 140, type: "text", visible:false,
        //     dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        // {data: "PGrName3", name: "Подгруппа 3 товара", width: 150, type: "text", visible:false,
        //     dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        //{data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_Rem", visible:false},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", align:"center", visible:true, dataSource:"t_Rem"},
        {data: "ProdName", name: "Наименование товара", width: 400, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", visible:false, dataSource:"r_Prods", sourceField:"UM"},
        {data: "TQty", name: "Кол-во", width: 50, type: "numeric",
            dataFunction:{function:"sumIsNull", source:"t_Rem", sourceField:"Qty"}},
        {data: "PriceMC", name: "Цена", width: 65, type: "numeric2", visible:true,
            dataSource:"r_ProdMP", sourceField:"PriceMC", linkCondition:"r_ProdMP.ProdID=t_Rem.ProdID and r_ProdMP.PLID=r_Stocks.PLID"},
        {data: "TSumMC", name: "Стоимость в ЦП", width: 85, type: "numeric2", visible:true,
            dataFunction:"Sum(ISNULL(Qty,0))*PriceMC"}
    ];
    t_Rem.getProductsRemsWithSalePrice= function(dbUC,reqParams,callback){
        var conditions={};
        for(var condItem in reqParams){
            if(condItem.indexOf("SUM(")<0) conditions["t_Rem."+condItem]= reqParams[condItem];
            else conditions[condItem]= reqParams[condItem];
        }
        t_Rem.getDataForTable(dbUC,{tableColumns:tProdsRemsTableColumnsWSPrice, identifier:tProdsRemsTableColumnsWSPrice[0].data,
                conditions:conditions, order:"OurID, StockID, ProdName"},
            function(result){ callback(result); });
    };
    app.get("/reports/products/getProductsRemsWSPrice",function(req,res){
        t_Rem.getProductsRemsWithSalePrice(req.dbUC,req.query,function(result){ res.send(result); });
    });

    var tProdsMovesTableColumns=[
        {data: "OurID", name: "OurID", width: 50, type: "text", visible:false, dataSource:"queryProdMove"},
        {data: "StockID", name: "StockID", width: 50, type: "text", visible:false, dataSource:"queryProdMove"},
        {data: "ProdChID", name: "ProdChID", width: 50, type: "text", visible:false,
            dataSource:"r_Prods", sourceField:"ChID", linkCondition:"r_Prods.ProdID=queryProdMove.ProdID"},
        //{data: "PCatName", name: "Категория товара", width: 140, type: "text",
        //    dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        // {data: "PGrName", name: "Группа товара", width: 95, type: "text", visible:false,
        //     dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        // {data: "PGrName1", name: "Подгруппа 1 товара", width: 70, type: "text", visible:false,
        //     dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        // {data: "PGrName2", name: "Подгруппа 2 товара", width: 140, type: "text", visible:false,
        //     dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        // {data: "PGrName3", name: "Подгруппа 3 товара", width: 150, type: "text", visible:false,
        //     dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
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
    queryProdMove.getProductsMoves= function(dbUC,reqParams,callback){
        var conditions={}, params={};
        for(var condItem in reqParams){
            if(condItem.indexOf("@")==0) params[condItem]= reqParams[condItem];
            else if(condItem.indexOf("SUM(")==0) conditions[condItem]= reqParams[condItem];
            else conditions["queryProdMove."+condItem]= reqParams[condItem];
        }
        queryProdMove.getDataForTable(dbUC,
            {tableColumns:tProdsMovesTableColumns, identifier:tProdsMovesTableColumns[0].data, sourceParams:params, conditions:conditions,
                order:"ProdID, OurID, StockID, "+
                "CASE When BQty is Not NULL Then 0 When Qty is Not NULL Then 1 Else 2 END, "+
                "DocDate,OperType desc,OperSNum,DocCode"},
            function(result){ callback(result); });
    };
    app.get("/reports/products/getProductsMoves",function(req,res){
        queryProdMove.getProductsMoves(req.dbUC,req.query,function(result){ res.send(result); });
    });
};