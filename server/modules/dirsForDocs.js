/**
 * Created by Dmitrk on 13.05.2018.
 */
var dataModel=require('../datamodel');
var r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States");

module.exports.validateModule = function(uuid,errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels(uuid,[r_Ours,r_Stocks,r_Comps,r_Currs,r_States], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init= function(app){
    app.get("/dirsDocs/getDirOursForSelect", function(req, res){
        r_Ours.getDataItemsForSelect({uuid:req.uuid,
                valueField:"OurName",labelField:"OurName", conditions:{"OurID>":0}, order: "OurName" },
            function (result) {
                res.send(result);
            });
    });
    app.get("/dirsDocs/getDirStocksForSelect", function(req, res){
        r_Stocks.getDataItemsForSelect({uuid:req.uuid,
                valueField:"StockName",labelField:"StockName", conditions:{"StockID>":0}, order: "StockName" },
            function (result) {
                res.send(result);
            });
    });
    app.get("/dirsDocs/getDirCompsForSelect", function(req, res){
        r_Comps.getDataItemsForSelect({uuid:req.uuid,
                valueField:"CompName",labelField:"CompName", conditions:{"1=":1}, order: "CompName" },
            function (result) {
                res.send(result);
            });
    });
    app.get("/dirsDocs/getDirCurrsForSelect", function(req, res){
        r_Currs.getDataItemsForSelect({uuid:req.uuid,
                valueField:"CurrName",labelField:"CurrName", conditions:{"1=":1}, order: "CurrName" },
            function (result) {
                res.send(result);
            });
    });
};
