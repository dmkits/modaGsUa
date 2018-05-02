
var server= require("../server"), log= server.log, database= require("../databaseMSSQL");
var loadedModules= {};
var validateError= null;
module.exports.getValidateError= function(){ return validateError; };

var dataModel= require("../datamodel");
/**
 * resultCallback = function(errs, errMessage), errs - object of validate errors
 */
module.exports.validateModules= function(uuid,resultCallback){
    var modules= server.getConfigModules();
    if (!modules) return;
    var errs={};
    var validateModuleCallback= function(uuid,modules, index, errs){
        var moduleName= modules[index];
        if (!moduleName) {
            var errMsg;
            for(var errItem in errs) {
                if (errMsg) {
                    errMsg+=" ... (see more info)";
                    break;
                }
                errMsg=errs[errItem];
            }
            resultCallback(errs,errMsg,uuid);
            validateError=errMsg;
            return;
        }
        var module;                                                                                         log.info('ValidateModule: module:'+moduleName+"...");//test
        try{
            module=require("./"+moduleName);
        }catch(e){                                                                                          log.error('FAILED validate module:'+moduleName+"! Reason:",e.message);//test
            errs[moduleName+"_validateError"]="Failed validate module:"+moduleName+"! Reason:"+e.message;
            validateModuleCallback(uuid,modules, index + 1, errs);
            return;
        }
        var validateModule=module.validateModule;
        if(!validateModule){                                                                                log.warn('ValidateModule PASSED for Module:'+moduleName+"! Reason: no validate function.");//test
            errs[moduleName+"_validateError"]="Failed validate module:"+moduleName+"! Reason: no validate function!";
            validateModuleCallback(uuid,modules, index + 1, errs);
            return;
        }
        module.validateModule(uuid,errs, function () {
            validateModuleCallback(uuid,modules, index + 1, errs);
        });
    };
    dataModel.resetModelChanges();
    dataModel.resetValidatedDataModels();
    validateModuleCallback(uuid, modules, 0, errs);
};

module.exports.init = function(uuid,app,errs){
    var modules= server.getConfigModules();
    if (!modules) return;
    for(var i=0; i<modules.length; i++){
        var moduleName=modules[i], module;                                                                  log.info('Initing module '+moduleName+"...");//test
        try{
            module=require("./"+moduleName);
        }catch(e){                                                                                          log.error('FAILED loaded module '+moduleName+"! Reason:", e.message);//test
            errs[moduleName+"_loadError"]="Failed load module:"+moduleName+"! Reason:"+ e.message;
            continue;
        }
        if (module.modulePageURL&&module.modulePagePath) {
            (function(){
                var modulePagePath=module.modulePagePath;
                app.get(module.modulePageURL, function (req, res) {

                    res.sendFile(appViewsPath+modulePagePath);
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
    if (!menuItem.module) return;
    var moduleName=menuItem.module;
    if (!loadedModules[moduleName]) return;
    menuItem.pageId= moduleName;
    menuItem.action= "open";
    menuItem.contentHref = loadedModules[moduleName].modulePageURL;
}
function fillMainMenuModuleData(appMenu){
    for(var mainMenuItemIndex in appMenu) {
        var mainMenuItem= appMenu[mainMenuItemIndex];
        fillMainMenuItemModuleData(mainMenuItem);
        if (mainMenuItem.popupMenu){
            for(var popupMenuItemIndex in mainMenuItem.popupMenu) {
                var popupMenuItem= mainMenuItem.popupMenu[popupMenuItemIndex];
                fillMainMenuItemModuleData(popupMenuItem)
            }
        }
    }
}
