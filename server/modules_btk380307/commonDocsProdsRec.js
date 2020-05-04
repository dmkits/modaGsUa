var dataModel= require(appDataModelPath), database= require("../databaseMSSQL");
var t_RecD= require(appDataModelPath+"t_RecD");
module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_RecD], errs, function(){ nextValidateModuleCallback(); });
};

module.exports.init= function(app){
    t_RecD.setRecDTaxPriceCCnt=function(dbUC,prodID,recChID,recDData,callback){
        database.selectParamsQuery(dbUC,
            "select tax=dbo.zf_GetProdRecTax(@p0,OurID,CompID,DocDate) from t_Rec where ChID=@p1",[prodID,recChID],
            function(result){/* Возвращает ставку НДС для товара в зависимости от поставщика */
                var tax=(result&&result.length>0)?result[0]["tax"]:0;
                recDData["Tax"]=tax; recDData["PriceCC_nt"]=recDData["PriceCC_wt"]-tax;
                var qty= recDData["Qty"];
                recDData["TaxSum"]=tax*qty; recDData["SumCC_nt"]=recDData["SumCC_wt"]-tax*qty;
                callback(recDData);
            });
    };
};