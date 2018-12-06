var loadedModules=require('../modules').loadedModules, dataModel=require('../datamodel'),
    server= require("../server"),appConfig= server.getAppConfig();

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    nextValidateModuleCallback();
    // dataModel.initValidateDataModels([], errs,
    //     function(){
    //         nextValidateModuleCallback();
    //     });
};

module.exports.modulePageURL = "/mobile";
module.exports.modulePagePath = "mobile/index.html";
module.exports.routes=[//-- App routes --
    { path: '/home', pageName: 'home', options:{clearPreviousHistory:true,ignoreCache:true} },
    { path: '(.*)', url: './mobile/actionError' }// Default route (404 page). MUST BE THE LAST
];
module.exports.init = function(app){
    app.get("/mobile/getUserRoutes", function (req, res) {
        if(!req.dbEmpRole){
            res.send({error:"Failed get routes! Reason: no database employee role!"});return;
        }
        if(req.dbEmpRole=="sysadmin"){
            var modules=loadedModules(), saRoutes=[];
            for (var moduleName in modules) {
                var moduleRoutes=modules[moduleName].routes;
                if(!moduleRoutes)continue;
                for (var j = 0; j < moduleRoutes.length; j++) saRoutes.unshift(new function(){ return moduleRoutes[j]; });
            }
            res.send(saRoutes);                                                                                 console.log("saRoutes",saRoutes);
            return;
        }
        if(!appConfig||!appConfig.usersRoles){
            res.send({error:"Failed get routes! Reason: no app config users roles!"});return;
        }
        var userRoleConfig=appConfig.usersRoles[req.dbEmpRole], userRoleMobileConf=(userRoleConfig)?userRoleConfig.mobile:null;
        if(!userRoleMobileConf||userRoleMobileConf.length===undefined){
            res.send({error:"Failed get routes! Reason: no app user role config for mobile!"});return;
        }
        userRoleMobileConf.push("mobile");
        var modules=loadedModules(), userRoutes=[];
        for (var i = 0; i < userRoleMobileConf.length; i++) {
            var mModuleName=userRoleMobileConf[i],mModuleRoutes=modules[mModuleName].routes;
            if(!mModuleRoutes)continue;
            for (var j = 0; j < mModuleRoutes.length; j++) userRoutes.push(mModuleRoutes[j]);
        }

        // var routes=[//-- App routes --
        //     { path: '/home', pageName: 'home', options:{clearPreviousHistory:true,ignoreCache:true} },
        //     // { path: '/settingsServerURI', componentUrl: './settingsServerURI.html' },
        //     { path: '/settingsInvents', componentUrl: '/mobile/Invent/settingsInventory', options:{ignoreCache:true} },
        //     { path: '/viewListInvents', componentUrl: '/mobile/Invent/viewListInvents', options:{clearPreviousHistory:true,ignoreCache:true}, define:true},
        //     { path: '/viewInvent/:inventChID', componentUrl: '/mobile/Invent/viewInvent', options:{ignoreCache:true} },
        //     { path: '/viewListRecs', componentUrl: '/mobile/Rec/viewListRecs', options:{clearPreviousHistory:true,ignoreCache:true} },
        //     { path: '/viewCashierReports', componentUrl: '/mobile/reports/viewCashierReports', options:{clearPreviousHistory:true,ignoreCache:true} },
        //     { path: '(.*)', url: './mobile/actionError' }// Default route (404 page). MUST BE THE LAST
        // ], userRoutes;
        res.send(userRoutes);
    });

    app.get("/mobile/actionError", function (req, res) {
        res.sendFile(appViewsPath+'mobile/actionError.html');
    });
};