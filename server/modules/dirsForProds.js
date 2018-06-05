/**
 * Created by Dmitrk on 13.05.2018.
 */
var dataModel=require('../datamodel');
var r_Prods= require(appDataModelPath+"r_Prods"), r_ProdC= require(appDataModelPath+"r_ProdC"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Prods,r_ProdC,r_ProdG1,r_ProdG1,r_ProdG3], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init= function(app){
    app.get("/dirsProds/getDirOursForSelect", function(req, res){
        r_Ours.getDataItemsForSelect({uuid:req.uuid,
                valueField:"OurName",labelField:"OurName", conditions:{"OurID>":0}, order: "OurName" },
            function (result) {
                res.send(result);
            });
    });
    app.get("/dirsProds/getDirStocksForSelect", function(req, res){
        r_Stocks.getDataItemsForSelect({uuid:req.uuid,
                valueField:"StockName",labelField:"StockName", conditions:{"StockID>":0}, order: "StockName" },
            function (result) {
                res.send(result);
            });
    });
    app.get("/dirsProds/getDirCompsForSelect", function(req, res){
        r_Comps.getDataItemsForSelect({uuid:req.uuid,
                valueField:"CompName",labelField:"CompName", conditions:{"1=":1}, order: "CompName" },
            function (result) {
                res.send(result);
            });
    });
    app.get("/dirsProds/getDirCurrsForSelect", function(req, res){
        r_Currs.getDataItemsForSelect({uuid:req.uuid,
                valueField:"CurrName",labelField:"CurrName", conditions:{"1=":1}, order: "CurrName" },
            function (result) {
                res.send(result);
            });
    });
};
