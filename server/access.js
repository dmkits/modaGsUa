var path=require('path'), fs=require('fs');
var log=require("./server").log,
    server=require("./server"),
    appStartupParams=server.getAppStartupParams(), getSysConfig=server.getSysConfig, getAppConfig=server.getAppConfig,
    database=require("./databaseMSSQL"),
    appModules=require("./modules"),
    common=require("./common");

var sysadminsList={};

module.exports= function(app){
    var isReqJSON = function(method,headers){
        return (headers && (
            (headers["x-requested-with"] && headers["x-requested-with"] == "application/json; charset=utf-8")
                || (headers["x-requested-with"] && headers["x-requested-with"].indexOf("application/json; charset=utf-8")>=0) )
        )
    };
    var isReqInternalPage = function(method,headers){
        return (headers && headers["x-requested-with"] == "XMLHttpRequest" && headers["content-type"] == "application/x-www-form-urlencoded");
    };
    var setAccessControlAllowOriginForMapp= function(req,res){
        if(isMobileReq(req)&&req.method=="OPTIONS"&&req.headers["origin"]=="file://"&&req.path=="/login"&&req.headers["access-control-request-method"]=="POST"){
            res.header("Access-Control-Allow-Method","POST");
            res.header("Access-Control-Allow-Origin","file://");
        }else if(isMobileReq(req)&&req.method=="OPTIONS"&&req.headers["origin"]=="file://"&&req.headers["access-control-request-headers"]
                &&req.headers["access-control-request-headers"].indexOf("x-requested-with")>=0
                &&req.headers["access-control-request-headers"].indexOf("uuid")>=0){
            res.header("Access-Control-Allow-Origin","file://");
        }else if(isMobileReq(req)&&req.method!=="OPTIONS"&&req.headers["origin"]=="file://"&&isReqJSON(req.method,req.headers)){
            res.header("Access-Control-Allow-Origin","file://");
        }
    };
    var renderToLogin= function(res,loginMsg){
        var appConfig=getAppConfig();
        res.render(path.join(__dirname, "../pages/login.ejs"), {
            title: (appConfig&&appConfig.title)?appConfig.title:"",
            loginMsg: loginMsg
        });
    };
    var isMobileReq= function(req){
        var userAgent=req.headers["user-agent"];
        if(!userAgent) return false;
        return (userAgent.indexOf("Android")>=0||userAgent.indexOf("Mobile")>=0);
    };
    var renderIsMobile= function (req,res,next){
        if(req.originalUrl.indexOf("/mobile")==0){ req.isMobile=true; next(); return true; }
        if(isMobileReq(req)){
            if(isReqJSON(req.method,req.headers) || isReqInternalPage(req.method,req.headers)){
                req.isMobile=true; next(); return true;
            }
            req.isMobile=true; res.redirect('/mobile');
            return true;
        }
        return false;
    };
    var renderToAccessFailed= function (req,res,msg){
        if(isReqInternalPage(req.method,req.headers)){
            res.render(path.join(__dirname, "../pages/accessFailedInternal.ejs"), {
                errorReason: msg
            });
            return;
        }
        var appConfig=getAppConfig();
        res.render(path.join(__dirname, "../pages/accessFailed.ejs"), {
            title: (appConfig&&appConfig.title)?appConfig.title:"",
            bigImg: "imgs/girls_big.jpg",
            icon: "icons/profits32x32.jpg",
            errorReason: msg
        });
    };
    /**
     *
     * failResult = { error, userErrorMsg, pageMsg}
     */
    var accessFail= function (req,res,next,failResult) {
        if(!failResult)failResult={error:"Access FAIL!", userErrorMsg:"Доступ не удался!", pageMsg:"Доступ не удался!"};
        if(isReqJSON(req.method,req.headers)){
            res.send({error:{error:failResult.error,userMessage:failResult.userErrorMsg}}); return;
        }
        if(renderIsMobile(req,res,next))return;
        if(isReqInternalPage(req.method,req.headers))renderToAccessFailed(req,res,failResult.pageMsg);
        renderToLogin(res,failResult.pageMsg);
    };
    var readSysadminsUUIDList=function (){
        try{
            var readSysadminsList=JSON.parse(fs.readFileSync(path.join(__dirname,"../sysAdmins.json")));
            sysadminsList=readSysadminsList;
        }catch(e){
            if(e.code=='ENOENT'){
                var readSysadminsList={};
                try{
                    fs.writeFileSync(path.join(__dirname,"../sysAdmins.json"), JSON.stringify(readSysadminsList),{flag:"w"});
                    sysadminsList=readSysadminsList;
                }catch(e2){
                }
            }
        }
    };
    var getSysadminNameByUUID=function(uuid){
        if(!sysadminsList) return;
        for(var saUUID in sysadminsList)
            if (saUUID==uuid) return sysadminsList[saUUID];
    };
    /**
     * callback = function(<error message>,{<database user parameters>})
     */
    var getDBUserData= function(connection,callback){
        database.selectQuery(connection,
            "select SUSER_NAME() as dbUserName,"+
            "GMS_DBVersion=dbo.zf_Var('GMS_DBVersion'),OT_DBiID=dbo.zf_Var('OT_DBiID'),"+
            "t_OurID=dbo.zf_Var('t_OurID'),t_OneOur=dbo.zf_Var('t_OneOur'),OT_MainOurID=dbo.zf_Var('OT_MainOurID'),"+
            "z_CurrMC=dbo.zf_Var('z_CurrMC'),z_CurrCC=dbo.zf_Var('z_CurrCC'),"+
            "t_StockID=dbo.zf_Var('t_StockID'),t_OneStock=dbo.zf_Var('t_OneStock'),it_MainStockID=dbo.zf_Var('it_MainStockID'),"+
            "t_SecID=dbo.zf_Var('t_SecID'),DefaultUM=dbo.zf_Var('DefaultUM'), "+
            "EmpID=(select EmpID from r_Users where UserName=SUSER_NAME()), "+
            "EmpName=(select EmpName from r_Users u, r_Emps e where e.EmpID=u.EmpID and u.UserName=SUSER_NAME()),"+
            "EmpRole=(select un.Notes from r_Users u, r_Emps e,r_Uni un where e.EmpID=u.EmpID and u.UserName=SUSER_NAME() and un.RefTypeID=10606 and un.RefID=e.ShiftPostID)",
            function(err, recordset){
                if(err||(recordset&&recordset.length==0)){
                    callback("Не удалось получить данные пользователя из базы даных! Обратитесь к системному администратору.");
                    return;
                }
                callback(null,recordset[0]);
            });
    };
    app.use(function (req, res, next){                                                                          log.info("ACCESS CONTROLLER:",req.method,req.path,"params=",req.query,{});//log.info("ACCESS CONTROLLER: req.headers=",req.headers,"req.cookies=",req.cookies,{});
        res.header("Access-Control-Allow-Headers","origin, Content-Type,Content-Length, Accept, X-Requested-With, uuid");
        setAccessControlAllowOriginForMapp(req,res);
        if(req.originalUrl.indexOf("/login")==0){ next(); return; }                                             //log.info("ACCESS CONTROLLER: req.headers=",req.headers," req.cookies=",req.cookies,{});
        var uuid=('uuid' in req.cookies)?req.cookies.uuid:req.headers['uuid'];
        if(uuid===undefined||uuid===null){
            accessFail(req,res,next,{
                error: "Failed to get data! Reason: user is not authorized!",
                userErrorMsg: "Не удалось получить данные. Пользователь не авторизирован."
            });
            return;
        }
        var userConnectionData=database.getUserConnectionData(uuid);
        var sysadminName=getSysadminNameByUUID(uuid);
        if(sysadminName)req.dbSysadminName=sysadminName;
        if(sysadminName&&(req.originalUrl=="/sysadmin"||req.originalUrl.indexOf("/sysadmin/")==0)){
            req.dbUC = (userConnectionData)?userConnectionData.connection:null;
            getDBUserData(req.dbUC, function(errMsg,dbUserParameters){
                req.dbUserParams=dbUserParameters;
                if(errMsg){
                    req.dbUserName=sysadminName;req.dbEmpRole="sysadmin";req.dbUserError=errMsg;
                }else{
                    req.dbUserName=dbUserParameters.dbUserName;req.dbEmpRole=dbUserParameters["EmpRole"];
                }                                                                                               //log.info('ACCESS CONTROLLER: dbUserName:',req.dbUserName,'dbUserParams:',req.dbUserParams);
                next();
            });
            return;
        }
        if(database.getSystemConnectionErr()){
            var msg="Нет системного подключения к базе данных! <br>Обратитесь к системному администратору.";
            if (isReqJSON(req.method,req.headers)) {
                res.send({ error:{error:"Failed to get data! Reason: failed get system connection to database!",userMessage:msg} });
                return;
            }
            if(sysadminName&&req.originalUrl!=="/sysadmin") {
                res.redirect('/sysadmin');return;
            }
            if(renderIsMobile(req,res,next))return;
            renderToAccessFailed(req,res,msg);
            return;
        }
        if(!userConnectionData||!userConnectionData.connection){
            accessFail(req,res,next,{
                error: "Failed to get data! Reason: user is not authorized!",
                userErrorMsg: "Не удалось получить данные. Пользователь не авторизирован.",
                pageMsg: "<div>Время сессии истекло.<br> Необходима авторизация.</div>"
            });
            return;
        }
        if(!sysadminName&&(req.originalUrl=="/sysadmin"||req.originalUrl.indexOf("/sysadmin/")==0)){
            var errMsg="Невозможно получить данные! Пользователь не авторизирован как сисадмин!";
            if (isReqJSON(req.method,req.headers)) {
                res.send({ error:{error:"Failed to get data! Reason: login user is not sysadmin!",userMessage:errMsg} });
                return;
            }
            renderToAccessFailed(req,res,errMsg);
            return;
        }
        req.dbUC = userConnectionData.connection;
        getDBUserData(userConnectionData.connection, function(errMsg,dbUserParameters){
            if(errMsg){
                accessFail(req,res,next,{
                    error: "ailed to get data! Reason: failed to get login user data from database!",
                    userErrorMsg: errMsg,
                    pageMsg:'<div><p><span style="color:red">Вход невозможен!<br>Не удалось получить данные пользователя из базы данных!<br>Обратитесь к системному администратору!</span></p></div>'
                });
                return;
            }
            req.dbUserParams=dbUserParameters;
            req.dbUserName=dbUserParameters.dbUserName;                                                         log.info('ACCESS CONTROLLER: dbUserName=',req.dbUserName,'dbUserParams=',req.dbUserParams);
            req.dbEmpRole=(dbUserParameters)?dbUserParameters["EmpRole"]:null;
            var validateError=appModules.getValidateError();
            if(validateError){
                accessFail(req,res,next,{
                    error: "Failed to get data! Reason: database not valid!",
                    userErrorMsg: "Невозможно получить данные! База данных не прошла проверку! Обратитесь к системному администратору!",
                    pageMsg:'<div><p><span style="color:red">Вход невозможен!<br>Проверка базы данных завершилась неудачно!<br>Обратитесь к системному администратору!</span></p></div>'
                });
                return;
            }
            if(renderIsMobile(req,res,next))return;
            next();
        });
    });

    app.get("/login", function (req, res) {                                                                     log.info("ACCESS CONTROLLER: get /login");
        renderToLogin(res,"");
    });
    /**
     * sysadminData = { uuid, userName }
     */
    var storeSysadminUUID= function(sysadminData, callback){
        sysadminsList[sysadminData.uuid]=sysadminData.userName;
        fs.writeFile(path.join(__dirname,"../sysAdmins.json"), JSON.stringify(sysadminsList),{flag:"w"}, function(err){
            if(err){                                                                                            log.error("storeSysadminUUID: Failed store sysadmins data! Reason:",err);
            }
            if(callback)callback();
        });
    };
    app.post("/login", function (req, res) {                                                                    log.info("ACCESS CONTROLLER: post /login user=",req.body.user,'pswrd=',req.body.pswrd);
        var userName=req.body.user, userPswrd=req.body.pswrd;
        if(!userName ||!userPswrd){
            res.send({ error:{error:"Authorisation failed! No login or password!",userMessage:"Пожалуйста введите имя и пароль."} });
            return;
        }
        var uuid = common.getUIDNumber();
        database.createNewUserDBConnection({uuid:uuid,login:userName,password:userPswrd}, function(err,result){
            var isSysadmin=false, sysConfig=getSysConfig(),
                appMode=(appStartupParams)?appStartupParams.mode:null,
                appModeIsDebug=!appMode
                    ||(appMode.toLocaleLowerCase().indexOf("debug")>=0)
                    ||(appMode.toLocaleLowerCase().indexOf("test")>=0);
            var outData={"uuid":uuid, mode:appMode, modeIsDebug:appModeIsDebug, dbName:sysConfig.dbName};
            if(sysConfig && userName==sysConfig.dbUser && userPswrd==sysConfig.dbUserPass) isSysadmin=true;
            if(err){
                if(isSysadmin){
                    storeSysadminUUID({uuid:uuid,userName:userName},function(){
                        res.cookie("uuid", uuid);
                        res.send(outData);
                    });
                    return;
                }
                outData.error= {error:err.error,userMessage:err.userMessage};
                res.send(outData);
                return;
            }
            if(isSysadmin) storeSysadminUUID({uuid:uuid,userName:userName});
            res.cookie("uuid", uuid);
            getDBUserData(result.dbUC, function(errMsg,dbUserParameters){
                if(errMsg) outData.dbUserError= errMsg;
                if(dbUserParameters){
                    outData.dbUserName= dbUserParameters.dbUserName;
                    outData.dbEmpRole= dbUserParameters["EmpRole"];
                }
                res.send(outData);
            });
        });
    });
};