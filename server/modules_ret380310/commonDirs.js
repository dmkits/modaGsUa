var dataModel= require(appDataModelPath), database= require("../databaseMSSQL");
var r_DBIs= require(appDataModelPath+"r_DBIs");
module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_DBIs], errs, function(){ nextValidateModuleCallback(); });
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
    /**
     * callback = function(refID, err)
     */
    r_DBIs.getNewRefID= function(dbUC,TableName,fieldName,callback){
        var query=
            "SELECT ISNULL(MAX(t."+fieldName+")+1,dbs.RefID_Start) as NewRefID " +
            "FROM r_DBIs dbs "+
            "LEFT JOIN "+TableName+" t ON t."+fieldName+" between dbs.RefID_Start and dbs.RefID_End "+
            "WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') "+
            "GROUP BY dbs.RefID_Start, dbs.RefID_End";
        database.selectQuery(dbUC,query,
            function(err, recordset){
                var refID=null;
                if(recordset&&recordset.length>0) refID=recordset[0]["NewRefID"];
                callback(refID,err);
            });
    };
    /**
     * callback = function(docID, err)
     */
    r_DBIs.getNewDocID= function(dbUC,TableName,callback){
        var query=
            "SELECT ISNULL(MAX(t.DocID)+1,dbs.DocID_Start) as NewDocID " +
            "FROM r_DBIs dbs "+
            "LEFT JOIN "+TableName+" t ON t.DocID between dbs.DocID_Start and dbs.DocID_End "+
            "WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') "+
            "GROUP BY dbs.DocID_Start, dbs.DocID_End";
        database.selectQuery(dbUC,query,
            function(err, recordset){
                var docID=null;
                if(recordset&&recordset.length>0) docID=recordset[0]["NewDocID"];
                callback(docID,err);
            });
    };
    /**
     * callback = function(ppID, err)
     */
    r_DBIs.getNewPPID= function(dbUC,prodID,callback){
        var query=
            "SELECT ISNULL(MAX(pip.PPID)+1,dbs.PPID_Start) as NewPPID " +
            "FROM r_DBIs dbs "+
            "LEFT JOIN t_PInP pip ON pip.PPID between dbs.PPID_Start and dbs.PPID_End AND pip.ProdID=@p0 "+
            "WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') "+
            "GROUP BY dbs.PPID_Start, dbs.PPID_End";
        database.selectParamsQuery(dbUC,query,[prodID],
            function(err, recordset){
                var ppID=0;
                if(recordset&&recordset.length>0) ppID=recordset[0]["NewPPID"];
                callback(ppID,err);
            });
    };
};
