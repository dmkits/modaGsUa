var fs = require('fs'),
    server= require("../server"), log= server.log;
var loadedModules= {}, validateError= null;
module.exports.loadedModules= function(){ return loadedModules; };
module.exports.getValidateError= function(){ return validateError; };

var dataModel= require(appDataModelPath);
/**
 * resultCallback = function(errs, errMessage), errs - object of validate errors
 */
module.exports.validateModules= function(resultCallback){
    var modules= server.getConfigModules();
    if(!modules) return;
    var validateModuleCallback= function(modules, index, errs){
        var moduleName= modules[index];
        if(!moduleName){
            var errMsg;
            for(var errItem in errs){
                if(errMsg){ errMsg+=" ... (see more info)"; break; }
                errMsg=errs[errItem];
            }
            resultCallback(errs,errMsg);
            validateError=errMsg;
            return;
        }
        var module;                                                                                         log.info('ValidateModule: module:'+moduleName+"...");//test
        try{
            module=require("./"+moduleName);
        }catch(e){                                                                                          log.error('FAILED validate module:'+moduleName+"! Reason:",e.message);//test
            errs[moduleName+"_validateError"]="Failed validate module:"+moduleName+"! Reason:"+e.message;
            validateModuleCallback(modules, index + 1, errs);
            return;
        }
        var validateModule=module.validateModule;
        if(!validateModule){                                                                                log.warn('ValidateModule PASSED for Module:'+moduleName+"! Reason: no validate function.");//test
            errs[moduleName+"_validateError"]="Failed validate module:"+moduleName+"! Reason: no validate function!";
            validateModuleCallback(modules, index + 1, errs);
            return;
        }
        module.validateModule(errs, function(){
            validateModuleCallback(modules, index + 1, errs);
        });
    };
    dataModel.resetModelChanges();
    dataModel.resetValidatedDataModels();
    validateModuleCallback(modules, 0, {});
};

module.exports.init= function(app,errs){
    var modules= server.getConfigModules();
    if(!modules) return;
    for(var i=0; i<modules.length; i++){
        var moduleName=modules[i], module;                                                                  log.info('Initing module '+moduleName+"...");//test
        try{
            module=require("./"+moduleName);
        }catch(e){                                                                                          log.error('FAILED loaded module '+moduleName+"! Reason:", e.message);//test
            errs[moduleName+"_loadError"]="Failed load module:"+moduleName+"! Reason:"+ e.message;
            continue;
        }
        var modulePageViewURL=null, modulePageViewFullPath= null;
        if(module.modulePageURL&&module.modulePagePath){
            modulePageViewURL= module.modulePageURL;
            modulePageViewFullPath= appPagesPath+module.modulePagePath;
            var sErrMsg;
            if(!fs.existsSync(modulePageViewFullPath)){                                                     log.error(sErrMsg='For module '+moduleName+" not exists page path! Path:",modulePageViewFullPath);
                errs[moduleName+"_pagePathError"]=sErrMsg+modulePageViewFullPath;
            }
        }else if(module.moduleViewURL&&module.moduleViewPath){
            modulePageViewURL= module.moduleViewURL;
            modulePageViewFullPath= appViewsPath+module.moduleViewPath;
            if(!fs.existsSync(modulePageViewFullPath)){                                                     log.error(sErrMsg='For module '+moduleName+" not exists page view path! Path:",modulePageViewFullPath);
                errs[moduleName+"_pageViewPathError"]=sErrMsg+modulePageViewFullPath;
            }
        }
        if(modulePageViewURL&&modulePageViewFullPath){
            (function(){
                var modulePageViewFileFullPath= modulePageViewFullPath;
                app.get(modulePageViewURL, function(req,res){
                    res.sendFile(modulePageViewFileFullPath);
                });
            })();
        }
        try{
            module.init(app);
        }catch(e){                                                                                          log.error('FAILED inited module '+moduleName+"! Reason:", e.message);//test
            errs[moduleName+"_initError"]="Failed init module:"+moduleName+"! Reason:"+ e.message;
            continue;
        }
        loadedModules[moduleName]= module;
    }
    fillMainMenuModuleData(server.getConfigAppMenu());
};

function fillMainMenuItemModuleData(menuItem){
    if(!menuItem.module) return;
    var moduleName=menuItem.module;
    var loadedModuleInstance= loadedModules[moduleName];
    if(!loadedModuleInstance) return;
    menuItem.pageId= moduleName;
    menuItem.action= "open";
    menuItem.contentHref = loadedModuleInstance.modulePageURL||loadedModuleInstance.moduleViewURL;
}
function fillMainMenuModuleData(appMenu){
    for(var mainMenuItemIndex in appMenu) {
        var mainMenuItem= appMenu[mainMenuItemIndex];
        fillMainMenuItemModuleData(mainMenuItem);
        if(mainMenuItem.popupMenu){
            for(var popupMenuItemIndex in mainMenuItem.popupMenu) {
                var popupMenuItem= mainMenuItem.popupMenu[popupMenuItemIndex];
                fillMainMenuItemModuleData(popupMenuItem)
            }
        }
    }
}
