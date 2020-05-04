var dataModel=require(appDataModelPath);
var r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Ours,r_Stocks,r_Comps,r_Currs,r_States], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init= function(app){
    app.get("/dirsDocs/getDirOursForSelect", function(req,res){
        r_Ours.getDataItemsForSelect(req.dbUC,{valueField:"OurName",labelField:"OurName", conditions:{"OurID>":0}, order: "OurName" },
            function(result) {
                res.send(result);
            });
    });
    app.get("/dirsDocs/getDirStocksForSelect", function(req,res){
        r_Stocks.getDataItemsForSelect(req.dbUC,{valueField:"StockName",labelField:"StockName", conditions:{"StockID>":0}, order: "StockName" },
            function(result) {
                res.send(result);
            });
    });
    app.get("/dirsDocs/getDirCompsForSelect", function(req,res){
        r_Comps.getDataItemsForSelect(req.dbUC,{valueField:"CompName",labelField:"CompName", conditions:{"1=":1}, order: "CompName" },
            function(result) {
                res.send(result);
            });
    });
    app.get("/dirsDocs/getDirCurrsForSelect", function(req,res){
        r_Currs.getDataItemsForSelect(req.dbUC,{valueField:"CurrName",labelField:"CurrName", conditions:{"1=":1}, order: "CurrName" },
            function(result) {
                res.send(result);
            });
    });

    //module.exports.getOurData=function(connection,ourID,callback){
    //    r_Ours.getDataItem(connection,{fields:["TaxPayer","SysTaxType","FixTaxPercent"], conditions:{"OurID=":ourID}},
    //        function (result) {
    //            callback((result)?result.item:null);
    //        });
    //};
    app.get("/dirsDocs/getDirStateData", function(req,res){
        r_States.getDataItem(req.dbUC,{fields:["StateCode","StateName"], conditions:{"StateCode=":req.query["StateCode"]}},
            function(result) {
                res.send(result);
            });
    });
};
