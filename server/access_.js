var server= require("./server"), log= server.log, config= server.getConfig(),
    getDBConnectError= require("./database").getDBConnectError, modules= require("./modules");

module.exports= function(app){                                                              log.info("Initing ACCESS CONTROLLER...");

    var reqIsAJAX= function(headers){
        return (headers&&headers["content-type"]=="application/x-www-form-urlencoded"&&headers["x-requested-with"]=="XMLHttpRequest");
    };
    var reqIsJSON= function(headers){
        return (headers&&headers["content-type"]=="application/json;charset=UTF-8"&&headers["Accept"]=="application/json");
    };

    app.use(function (req, res, next) {
        if(!server.logDebug)log.info("ACCESS CONTROLLER for check user access:"," params:",req.query);
        else if(server.logDebug&&req.method=="GET")log.debug("ACCESS CONTROLLER for check user access:"," params:",req.query,{});
        else if(server.logDebug&&req.method=="POST")log.debug("ACCESS CONTROLLER for check user access:"," params:",req.query,"\n body:",req.body,{});
        if(req.originalUrl=="/login" && req.method=="POST"){
            var userName=req.body.user, userPswrd=req.body.pswrd;
            res.cookie("mduUser", userName);
            res.cookie("mduPswrd", userPswrd);
            res.send({result:"success"});
            return;
        }
        var syncServiceRequest= (req.originalUrl=="/syncService" && req.method=="POST");
        var user= req.cookies.mduUser, pswrd = req.cookies.mduPswrd;
        var userAccess= false, sysadminAccess= false, configUser=null;
        if (!syncServiceRequest && config && config.users && user && pswrd){
            var configUsers= config.users;
            for(var i in configUsers){
                configUser=configUsers[i];
                if(user==configUser.userLogin && pswrd==configUser.pswrd){
                    userAccess= true;
                    if(configUser.userRole &&
                        (configUser.userRole=="sysAdmin"||configUser.userRole.indexOf("sysAdminDev")>=0)) sysadminAccess=true;
                    break;
                }
            }
        }
        if(!syncServiceRequest&&!userAccess){
            res.sendFile(appViewsPath +'login.html');
            return;
        }
        req.mduUser=user;
        req.mduUserRole= (configUser)?configUser.userRole:null;
        var dbConnectError=getDBConnectError(), validateError= modules.getValidateError();
        if ( (dbConnectError||validateError) && sysadminAccess && req.originalUrl.indexOf("/sysadmin")==0){
            next();
            return;
        } else if (dbConnectError&&sysadminAccess && req.originalUrl.indexOf("/sysadmin")!=0){
            if (reqIsAJAX(req.headers)||reqIsJSON(req.headers)){
                res.send({ error:"Failed database connection!" });
                return;
            }
            res.redirect("/sysadmin");
            return;
        } else if (validateError&&sysadminAccess && req.originalUrl.indexOf("/sysadmin")!=0){
            if (reqIsAJAX(req.headers)||reqIsJSON(req.headers)){
                res.send({ error:"Failed validate database!" });
                return;
            }
            res.redirect("/sysadmin");
            return;
        } else if ( (dbConnectError||validateError) && !sysadminAccess){
            if (reqIsAJAX(req.headers)||reqIsJSON(req.headers)){
                if (dbConnectError) res.send({ error:"Failed database connection!" }); else res.send({ error:"Failed validate database!" });
                return;
            }
            var img= config['imageMain'] || "/imgs/modaua_big.jpg";
            var title= config['title'] ||  "UNKNOWN";
            var icon32x32= config['icon32x32'] || "/icons/modaua32x32.ico";
            if (dbConnectError){
                res.render(appViewsPath+'dbFailed.ejs',{title:title, bigImg:img,icon:icon32x32, errorReason:"Не удалось подключиться к базе данных!"});
                return;
            }
            else {
                res.render(appViewsPath+'dbFailed.ejs',{title:title, bigImg:img,icon:icon32x32, errorReason:"База данных не прошла проверку!"});
                return;
            }
        }
        if(req.originalUrl.indexOf("/sysadmin")>-1 && sysadminAccess!=true){
            res.redirect("/");
            return;
        }
        next();
    });
};