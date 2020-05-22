var dataModel=require(appDataModelPath), appDatabase= dataModel.appDatabase;
var z_Sys= require(appDataModelPath+"z_Sys");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([z_Sys], errs, function(){ nextValidateModuleCallback(); });
};

module.exports.init= function(app){
    /**
     * callback = function(chID, err)
     */
    z_Sys.getNewChID= function(dbUC, tableName, callback){
        var query= "SELECT ISNULL(MAX(t.ChID)+1,1) as NewChID FROM "+tableName+" t";
        appDatabase.selectQuery(dbUC,query,
            function(err, recordset){
                var chID=null;
                if(recordset&&recordset.length>0) chID=recordset[0]["NewChID"];
                callback(chID,err);
            });
    };
    /**
     * callback = function(refID, err)
     */
    z_Sys.getNewRefID= function(dbUC,TableName,fieldName,callback){
        var query= "SELECT ISNULL(MAX(t."+fieldName+")+1,1) as NewRefID FROM "+TableName+" t";
        appDatabase.selectQuery(dbUC,query,
            function(err, recordset){
                var refID=null;
                if(recordset&&recordset.length>0) refID=recordset[0]["NewRefID"];
                callback(refID,err);
            });
    };
    /**
     * callback = function(docID, err)
     */
    z_Sys.getNewDocID= function(dbUC,TableName,callback){
        var query= "SELECT ISNULL(MAX(t.DocID)+1,1) as NewDocID FROM "+TableName+" t";
        appDatabase.selectQuery(dbUC,query,
            function(err, recordset){
                var docID=null;
                if(recordset&&recordset.length>0) docID=recordset[0]["NewDocID"];
                callback(docID,err);
            });
    };
    /**
     * callback = function(ppID, err)
     */
    z_Sys.getNewPPID= function(dbUC,prodID,callback){
        var query= "SELECT ISNULL(MAX(pip.PPID)+1,1) as NewPPID FROM t_PInP pip WHERE pip.ProdID=@p0";
        appDatabase.selectParamsQuery(dbUC,query,[prodID],
            function(err, recordset){
                var ppID=0;
                if(recordset&&recordset.length>0) ppID=recordset[0]["NewPPID"];
                callback(ppID,err);
            });
    };
};
