var dataModel=require('../datamodel'),database= require("../databaseMSSQL");
var r_DBIs= require(appDataModelPath+"r_DBIs");
module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_DBIs], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init= function(app){
    /**
     * callback = function(chID, err)
     */
    r_DBIs.getNewChID= function(dbUC, tableName, callback){
        var query=
            "SELECT ISNULL(MAX(t.ChID)+1,dbs.ChID_Start) as NewChID " +
            "FROM r_DBIs dbs "+
            "LEFT JOIN "+tableName+" t ON t.ChID between dbs.ChID_Start and dbs.ChID_End "+
            "WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') "+
            "GROUP BY dbs.ChID_Start, dbs.ChID_End";
        database.selectQuery(dbUC,query,
            function(err, recordset){
                var chID=null;
                if(recordset&&recordset.length>0) chID=recordset[0]["NewChID"];
                callback(chID,err);
            });
    };
};
