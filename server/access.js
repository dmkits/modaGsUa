var path=require('path'), fs=require('fs');
var log=require("./server").log,
    server=require("./server"), getStartupConfig=server.getStartupConfig,getAppConfig=server.getAppConfig,
    database=require("./databaseMSSQL"),
    common=require("./common");

var sysadminsList={};

module.exports= function(app) {
    var isReqJSON = function (method,headers) {
        return (headers && (
            (headers["x-requested-with"] && headers["x-requested-with"] == "application/json; charset=utf-8")
                || (headers["x-requested-with"] && headers["x-requested-with"].indexOf("application/json; charset=utf-8")>=0))
        )
    };
    var isReqInternalPage = function (method,headers) {
        return (headers && headers["x-requested-with"] == "XMLHttpRequest" && headers["content-type"] == "application/x-www-form-urlencoded");
    };
    var renderToLogin= function (res,loginMsg){
        var appConfig=getAppConfig();
        res.render(path.join(__dirname, "../pages/login.ejs"), {
            title: (appConfig&&appConfig.title)?appConfig.title:"",
            loginMsg: loginMsg
        });
    };
    var renderToDbFailed= function (res,msg){
        var appConfig=getAppConfig();
        res.render(path.join(__dirname, "../pages/dbFailed.ejs"), {
            title: (appConfig&&appConfig.title)?appConfig.title:"",
            bigImg: "imgs/girls_big.jpg",
            icon: "icons/profits32x32.jpg",
            errorReason: msg
        });
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
    app.use(function (req, res, next) {                                                         log.info("ACCESS CONTROLLER:",req.method,req.path,"params=",req.query,{});//log.info("ACCESS CONTROLLER: req.headers=",req.headers,"req.cookies=",req.cookies,{});
        if(req.originalUrl.indexOf("/login")==0){
            next();
            return;
        }                                                                                       //log.info("ACCESS CONTROLLER: req.headers=",req.headers," req.cookies=",req.cookies,{});
        var uuid=req.cookies.uuid;
        if(uuid===undefined)uuid=req.headers['uuid'];
        res.header("Access-Control-Allow-Headers","Content-Type,Content-Length, Accept, X-Requested-With, uuid");
        if(uuid===undefined||uuid===null){
            if(isReqJSON(req.method,req.headers) || isReqInternalPage(req.method,req.headers)){
                res.send({
                    error: "Failed to get data! Reason: user is not authorized!",
                    userErrorMsg: "Не удалось получить данные. Пользователь не авторизирован."
                });
                return;
            }
            renderToLogin(res,"");
            return;
        }
        var userConnectionData=database.getUserConnectionData(uuid);
        var sysadminName=getSysadminNameByUUID(uuid);
        if(sysadminName)req.dbSysadminName=sysadminName;
        if(sysadminName&&(req.originalUrl=="/sysadmin"||req.originalUrl.indexOf("/sysadmin/")==0)){
            req.dbUC = (userConnectionData)?userConnectionData.connection:null;
            getDBUserData(req.dbUC, function(errMsg,dbUserParameters){
                req.dbUserParams=dbUserParameters;
                if(errMsg) req.dbUserName=sysadminName; else req.dbUserName=dbUserParameters.dbUserName;    //log.info('ACCESS CONTROLLER: dbUserName:',req.dbUserName,'dbUserParams:',req.dbUserParams);
                next();
            });
            return;
        }
        if(database.getSystemConnectionErr()){
            var msg="Нет системного подключения к базе данных! <br>Обратитесь к системному администратору.";
            if (isReqJSON(req.method,req.headers) || isReqInternalPage(req.method,req.headers)) {
                res.send({
                    error: "Failed to get data! Reason: failed get system connection to database!",
                    userErrorMsg: msg
                });
                return;
            }
            if(sysadminName&&req.originalUrl!=="/sysadmin") {
                res.redirect('/sysadmin');
                return;
            }
            renderToDbFailed(res,msg);
            return;
        }
        if(!userConnectionData||!userConnectionData.connection){
            if (isReqJSON(req.method,req.headers) || isReqInternalPage(req.method,req.headers)) {
                res.send({
                    error: "Failed to get data! Reason:the session has expired!",
                    userErrorMsg: "Не удалось получить данные. Время сессии истекло. Необходима авторизация."
                });
                return;
            }
            renderToLogin(res,"<div>Время сессии истекло.<br> Необходима авторизация.</div>");
            return;
        }
        if(!sysadminName&&(req.originalUrl=="/sysadmin"||req.originalUrl.indexOf("/sysadmin/")==0)){
            var errMsg="Невозможно получить данные! Пользователь не авторизироват как сисадмин!";
            if (isReqJSON(req.method,req.headers) || isReqInternalPage(req.method,req.headers)) {
                res.send({
                    error: "Failed to get data! Reason: login user is not sysadmin!",
                    userErrorMsg: errMsg
                });
                return;
            }
            renderToDbFailed(res,errMsg);
            return;
        }
        req.dbUC = userConnectionData.connection;
        getDBUserData(userConnectionData.connection, function(errMsg,dbUserParameters){
            if(errMsg){
                if (isReqJSON(req.method,req.headers) || isReqInternalPage(req.method,req.headers)) {
                    res.send({
                        error: "Failed to get data! Reason: failed to get login user data from database!",
                        userErrorMsg: errMsg
                    });
                    return;
                }
                renderToDbFailed(res,errMsg);
                return;
            }
            req.dbUserParams=dbUserParameters;
            req.dbUserName=dbUserParameters.dbUserName;                                             log.info('ACCESS CONTROLLER: dbUserName=',req.dbUserName,'dbUserParams=',req.dbUserParams);
            next();
        });
    });

    app.get("/login", function (req, res) {                                                         log.info("ACCESS CONTROLLER: get /login");
        renderToLogin(res,"");
    });
    /**
     * sysadminData = { uuid, userName }
     */
    var storeSysadminUUID= function(sysadminData, callback){
        sysadminsList[sysadminData.uuid]=sysadminData.userName;
        fs.writeFile(path.join(__dirname,"../sysAdmins.json"), JSON.stringify(sysadminsList),{flag:"w"}, function(err){
            if(err){                                                                                log.error("storeSysadminUUID: Failed store sysadmins data! Reason:",err);
            }
            if(callback)callback();
        });
    };
    app.post("/login", function (req, res) {                                                        log.info("ACCESS CONTROLLER: post /login user=",req.body.user,'pswrd=',req.body.pswrd);
        var userName=req.body.user, userPswrd=req.body.pswrd;
        if(!userName ||!userPswrd ){
            res.send({error:"Authorisation failed! No login or password!", userErrorMsg:"Пожалуйста введите имя и пароль."});
            return;
        }
        var uuid = common.getUIDNumber();
        database.createNewUserDBConnection({uuid:uuid,login:userName,password:userPswrd}, function(err,result){
            var  isSysadmin=false, serverConfig=getStartupConfig();
            if(serverConfig && userName==serverConfig.user && userPswrd==serverConfig.password) isSysadmin=true;
            if(err){
                if(isSysadmin){
                    storeSysadminUUID({uuid:uuid,userName:userName},function(){
                        res.cookie("uuid", uuid);
                        res.send({"uuid":uuid});
                    });
                    return;
                }
                res.send({error:err.error,userErrorMsg:err.userErrorMsg});
                return;
            }
            if(isSysadmin) storeSysadminUUID({uuid:uuid,userName:userName});
            res.cookie("uuid", uuid);
            res.send({"uuid":uuid});
        });
    });
};