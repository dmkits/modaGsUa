var loadedModules=require(appModulesPath).loadedModules, dataModel=require(appDataModelPath),
    server= require("../server"),appConfig= server.getAppConfig();

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    nextValidateModuleCallback();
    // dataModel.initValidateDataModels([], errs,
    //     function(){
    //         nextValidateModuleCallback();
    //     });
};

module.exports.moduleViewURL = "/mobile";
module.exports.moduleViewPath = "mobile/index.html";
module.exports.routes=[//-- App routes --
    { path: '/home', pageName: 'home', options:{clearPreviousHistory:true,ignoreCache:true} },
    { path: '/pageSettingsCommon', componentUrl: '/mobile/pageSettingsCommon'},
    { path: '(.*)', url: './mobile/actionError' }// Default route (404 page). MUST BE THE LAST
];
module.exports.init = function(app){
    app.get("/mobile/pageSettingsCommon", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageSettingsCommonWeb.html');
    });
    app.get("/mobile/getUserRoutes", function(req,res){
        if(!req.dbEmpRole){
            res.send({error:"Failed get routes! Reason: no database employee role!"});return;
        }
        if(req.dbEmpRole=="sysadmin"){
            var modules=loadedModules(), saRoutes=[], lastRoute;
            for (var moduleName in modules) {
                var moduleRoutes=modules[moduleName].routes;
                if(!moduleRoutes)continue;
                for (var j = 0; j < moduleRoutes.length; j++){
                    var route=new function(){ return moduleRoutes[j]; };
                    if(route&&route.path=="(.*)") lastRoute=route; else saRoutes.push(route);
                }
            }
            if(lastRoute)saRoutes.push(lastRoute);
            res.send(saRoutes);
            return;
        }
        if(!appConfig||!appConfig.usersRoles){
            res.send({error:"Failed get routes! Reason: no app config users roles!"});return;
        }
        var userRoleConfig=appConfig.usersRoles[req.dbEmpRole], userRoleMobileConf=(userRoleConfig)?userRoleConfig.mobile:null;
        if(!userRoleMobileConf||userRoleMobileConf.length===undefined){
            res.send({error:"Failed get routes! Reason: no app user role config for mobile!"});return;
        }
        var modules=loadedModules(), userRoutes=[];
        for (var i = 0; i < userRoleMobileConf.length; i++) {
            var mModuleName=userRoleMobileConf[i],mModuleRoutes=modules[mModuleName].routes;
            if(!mModuleRoutes)continue;
            userRoutes=userRoutes.concat(mModuleRoutes);
        }
        userRoutes=userRoutes.concat(module.exports.routes);
        res.send(userRoutes);
    });

    app.get("/mobile/actionError", function(req,res){
        res.sendFile(appViewsPath+'mobile/actionError.html');
    });
};