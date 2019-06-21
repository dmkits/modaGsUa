var server= require("../server"), log= server.log, appParams= server.getAppStartupParams(), getAppConfig= server.getAppConfig;
var database= require("../databaseMSSQL");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    nextValidateModuleCallback();
};

function setUserRoleMenu(outData, userRole, usersRolesConfig, appMenu){
    var userMenu=[], userRoleItems=usersRolesConfig[userRole];
    if(!userRoleItems&&userRole=="sysadmin"){
        outData.menuBar= appMenu; return;
    }
    if(!userRoleItems) userRoleItems={menu:["menuBarItemHelpAbout","menuBarItemClose"]};
    var userRoleMenu=userRoleItems.menu;
    for(var i in userRoleMenu){
        var userRoleMenuItemName = userRoleMenu[i];
        for(var j in appMenu){
            var appMenuItem = appMenu[j];
            if(userRoleMenuItemName == appMenuItem.menuItemName){
                var userItem = {};
                for(var item in appMenuItem) userItem[item]=appMenuItem[item];
                if(userItem.popupMenu) userItem.popupMenu=null;
                userMenu.push(userItem);
                break;
            }
            var mainPopupMenu = appMenuItem.popupMenu;
            if(!mainPopupMenu) continue;
            for(var k in mainPopupMenu){
                var popupMenuItem = mainPopupMenu[k];
                if(userRoleMenuItemName == popupMenuItem.menuItemName){
                    for(var l in userMenu){
                        var userMenuItem = userMenu[l];
                        if(userMenuItem.menuItemName == appMenuItem.menuItemName){
                            if(!userMenuItem.popupMenu) userMenuItem.popupMenu= [];
                            userMenuItem.popupMenu.push(popupMenuItem);
                        }
                    }
                }
            }
        }
    }
    outData.menuBar= userMenu;
    outData.autorun= userRoleItems.autorun;
}

module.exports.modulePageURL = "/";
module.exports.modulePagePath = "main.html";
module.exports.init= function(app){
    app.get("/getMainData", function(req,res){
        var outData= {mode:appParams.mode, modeStr:appParams.mode};
        outData.dbUserName=(req.dbUserName)?req.dbUserName:"unknown";
        outData.EmpName=(req.dbUserParams&&req.dbUserParams["EmpName"])?req.dbUserParams["EmpName"]:"unknown";
        var appConfig=getAppConfig(); outData.appConfig=appConfig;
        if(!appConfig||appConfig.error){
            outData.error= "Failed load application configuration!"+(appConfig&&appConfig.error)?" Reason:"+appConfig.error:"";
            res.send(outData);
            return;
        }
        outData.title=appConfig.title;
        outData.icon32x32=appConfig.icon32x32;
        outData.imageSmall=appConfig.imageSmall;
        outData.imageMain=appConfig.imageMain;
        setUserRoleMenu(outData, req.dbEmpRole, appConfig.usersRoles, appConfig.appMenu);
        var dbSysConnErr=database.getSystemConnectionErr();
        if(dbSysConnErr){
            outData.dbSysConnErr= dbSysConnErr;
            res.send(outData);
            return;
        }
        res.send(outData);
    });
    app.post("/exit", function(req,res){
        var outData={}, cookiesArr=Object.keys(req.cookies);
        for(var i in cookiesArr) res.clearCookie(cookiesArr[i]);
        outData.actionResult="successful";
        res.send(outData);
    });
 };