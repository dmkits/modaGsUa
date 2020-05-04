var dataModel= require(appDataModelPath), server= require('../server'), log= server.log, systemFuncs= require('../systemFuncs');

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([], errs, function(){ nextValidateModuleCallback(); });
};

module.exports.init= function(app){
    app.post("/sys/getExcelFile",function(req,res){
        systemFuncs.getExcelFile(req.body,function(status, filename, unlinkAction){
            if(status){ res.sendStatus(status); return; }
            res.sendFile(filename,{headers:{'Content-Disposition':'attachment; filename =out.xlsx'}}, function(err){
                if(err){                                                                                        log.error("send xls file err=",err);
                    res.sendStatus(500);
                }
                unlinkAction();
            })
        });
    });
};