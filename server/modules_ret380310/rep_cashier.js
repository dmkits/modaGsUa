var dataModel=require(appDataModelPath);
var r_CRs= require(appDataModelPath+"r_CRs"),
    querySalesCRRets=require(appDataModelPath+"querySalesCRRets"),
    r_Stocks= require(appDataModelPath+"r_Stocks"),
    t_Rem= require(appDataModelPath+"t_Rem"), queryProdMove=require(appDataModelPath+"queryProdMove");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_CRs,querySalesCRRets,r_Stocks,t_Rem,queryProdMove], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.moduleViewURL = "/reports/cashier";
module.exports.moduleViewPath = "reports/rep_cashier.html";
module.exports.init = function(app){
    if(!r_CRs.getDirCRsForReportsSalesSelect) throw new Error('NO r_CRs.getDirCRsForReportsSalesSelect!');
    app.get("/reports/cashier/getDirCRsForSelect",function(req,res){
        r_CRs.getDirCRsForReportsSalesSelect(req.dbUC,req.dbUserParams,req.dbEmpRole,req.isMobile,function(result){ res.send(result); });
    });
    if(!querySalesCRRets.getProductsSalesCRRets) throw new Error('NO querySalesCRRets.getProductsSalesCRRets!');
    app.get("/reports/cashier/getProductsSalesCRRets",function(req,res){
        querySalesCRRets.getProductsSalesCRRets(req.dbUC,req.query,req.dbEmpRole,req.isMobile,function(result){ res.send(result); });
    });

    if(!r_Stocks.getDirStocksForReportsProductsSelect) throw new Error('NO r_Stocks.getDirStocksForReportsProductsSelect!');
    app.get("/reports/cashier/getDirStocksForSelect", function(req, res){
        r_Stocks.getDirStocksForReportsProductsSelect(req.dbUC,req.dbUserParams,function(result){ res.send(result); });
    });
    if(!t_Rem.getProductsRemsWithSalePrice) throw new Error('NO t_Rem.getProductsRemsWithSalePrice!');
    app.get("/reports/cashier/getProductsRemsWSPrice",function(req,res){
        t_Rem.getProductsRemsWithSalePrice(req.dbUC,req.query,function(result){ res.send(result); });
    });
    if(!queryProdMove.getProductsMoves) throw new Error('NO queryProdMove.getProductsMoves!');
    app.get("/reports/cashier/getProductsMoves",function(req,res){
        queryProdMove.getProductsMoves(req.dbUC,req.query,function(result){ res.send(result); });
    });
};