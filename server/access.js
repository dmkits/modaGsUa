
var database=require("./databaseMSSQL");
var common=require("./common");
var path=require('path');
var fs=require('fs');
//var logger=require('./logger')();
var logger=require("./server").log;

module.exports= function(app) {
    var reqIsJSON = function (headers) {
        return (headers && headers["x-requested-with"] && headers["x-requested-with"] == "application/json; charset=utf-8")
    };
    var reqIsAJAX = function (headers) {
        return (headers && headers["content-type"] == "application/x-www-form-urlencoded" && headers["x-requested-with"] == "XMLHttpRequest");
    };
    app.use(function (req, res, next) {                     logger.info("ACCESS CONTROLLER  req.path=", req.path, " params:",req.query,{});
        if (req.originalUrl.indexOf("/login") >= 0) { console.log('if req.originalUrl.indexOf("/login")');
            next();
            return;
        }
        if (req.cookies.uuid) {                                 console.log('req.cookies.uuid');
            var uuid=req.cookies.uuid;
            var connData=database.getConnData();
            if(connData && connData[uuid] && connData[uuid].connection
                && connData[uuid].user) {
             //   req.dbConnection = connData[uuid].connection;
                req.uuid = uuid;
                req.connUserName=connData[uuid].user;
                next();
                return;
            }
            if(req.cookies.sysadmin){                           console.log('req.cookies.sysadmin');
                var sysAdminUUIDArr = common.getSysAdminConnArr();
                for (var i in sysAdminUUIDArr) {
                    if (sysAdminUUIDArr[i][req.cookies.uuid]) {
                        req.connUserName=sysAdminUUIDArr[i][req.cookies.uuid];
                       if(req.originalUrl.indexOf("/sysadmin") < 0) res.redirect('/sysadmin');    //TODO redirect exit sysadmin error
                        next();
                        return;
                    }
                }
            }
            if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {          console.log('reqIsJSON(req.headers) || reqIsAJAX(req.headers)');
                console.log("(reqIsJSON(req.headers) || reqIsAJAX(req.headers 180");
                res.send({
                    error: "Failed to get data! Reason:the session has expired!",
                    userErrorMsg: "Не удалось плучить данные. Время сессии истекло."
                });
                return;
            }
            res.render(path.join(__dirname, '../pages/login.ejs'), {
                loginMsg: "<div>Время сессии истекло.<br> Необходима авторизация.</div>"
            });
            return;

            //}
            //if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {  console.log("reqIsJSON(req.headers) || reqIsAJAX(req.headers)=");
            //    res.send({
            //        error: "Failed to connect to database!",
            //        userErrorMsg: "Не удалось подключиться к базе данных."
            //    });
            //    return;
            //}

            //var img = "imgs/girls_big.jpg";
            //var title = "REPORTS";
            //var icon32x32 = "icons/profits32x32.jpg";
            //res.render(path.join(__dirname, "../pages/dbFailed.ejs"), {
            //    title: title,
            //    bigImg: img,
            //    icon: icon32x32,
            //    errorReason: "Не удалось обратиться к базе данных!"
            //});
            //return;
        }
                //var sysAdminAccess = false;
                //var sysAdminLogin = null;
                //var sysAdminUUIDArr = common.getSysAdminConnArr();
                //var properties = Object.keys(sysAdminUUIDArr);
                //for (var i in properties) {
                //    if (sysAdminUUIDArr[properties[i]] == req.cookies.uuid) {
                //        sysAdminAccess = true;
                //        sysAdminLogin = properties[i];
                //    }
                //}
                //}

            //if(!connData || !connData[uuid] || !connData[uuid].connection){
            //    res.sendFile(path.join(__dirname, '../pages', 'login.html'));
            //    return;
            //}

            //var sysAdminAccess = false;
            //var sysAdminLogin = null;
            //var sysAdminUUIDArr = common.getSysAdminConnArr();
            //var properties = Object.keys(sysAdminUUIDArr);
            //for (var i in properties) {
            //    if (sysAdminUUIDArr[properties[i]] == req.cookies.lpid) {
            //        sysAdminAccess = true;
            //        sysAdminLogin = properties[i];
            //    }
            //}
            //if (sysAdminAccess) {
            //    req.isSysadmin= true;
            //    req.userRoleCode="sysadmin";
            //    req.loginEmpName="sysadmin ("+sysAdminLogin+")";
            //    next();
            //    return;
            //}
            //if (login=="sa") {
            //    req.isSysadmin= true;
            //  //  req.userRoleCode="sysadmin";
            //    req.loginEmpName="sysadmin ("+login+")";
            //    next();
            //    return;
            //}
            //if (req.originalUrl.indexOf("/sysadmin") >= 0) {
            //    if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {
            //        res.send({
            //            error: "Failed to go to sysadmin page! No sysadmin permission was given to the user!",
            //            userErrorMsg: "Отказано в доступе на страничку системного администратора. Причина: у пользователя нет полномочий."
            //        });
            //        return;
            //    }
            //    res.redirect('/');
            //    return;
            //}
            //if (app.DBConnectError) {
            //    console.log('IF app.DBConnectError 89!!!!!!!!!!!!!!!!!!!!!');
            //    if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {
            //        res.send({
            //            error: "Failed to connect to database!",
            //            userErrorMsg: "Не удалось подключиться к базе данных."
            //        });
            //        return;
            //    }
            //    var img = "imgs/girls_big.jpg";
            //    var title = "REPORTS";
            //    var icon32x32 = "icons/profits32x32.jpg";
            //    res.render(path.join(__dirname, "../pages/dbFailed.ejs"), {
            //        title: title,
            //        bigImg: img,
            //        icon: icon32x32,
            //        errorReason: "Не удалось обратиться к базе данных!"
            //    });
            //    return;
            //}
            //database.selectParamsMSSQLQuery("select Login, EmpName, ShiftPostID, EmpID  from r_Emps where LPID=@LPID",
            //    {LPID:req.cookies.lpid}, function (err, result) {
            //    if (err) {
            //        res.send({error: err});
            //        logger.error(err);
            //        return;
            //    }
            //    var result=result[0];
            //    if (!result || !result.Login) {
            //        if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {
            //            res.send({error: "Failed to get data! Reason: unknown user!", userErrorMsg: "Неизвестный пользователь."});
            //            return;
            //        }
            //        res.sendFile(path.join(__dirname, '../pages', 'login.html'));
            //        return;
            //    }
            //    req.userRoleCode=result.ShiftPostID;
            //    req.userID=result.EmpID;
            //    req.loginEmpName=result.EmpName;
            //    if(result.ShiftPostID==1) req.isAdminUser= true;
            //    else req.isAdminUser= false;
             //   next();
            //});
            //database.connectWithPool({login:"", password:""}, function(){
            //
            //});
            //return;
       // }
        //if (app.DBConnectError) {
        //    if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {
        //        res.send({
        //            error: "Failed to connect to database!",
        //            userErrorMsg: "Не удалось подключиться к базе данных."
        //        });
        //        return;
        //    }
        //    var img = "imgs/girls_big.jpg";
        //    var title = "REPORTS";
        //    var icon32x32 = "icons/profits32x32.jpg";
        //    res.render(path.join(__dirname, "../pages/dbFailed.ejs"), {
        //        title: title,
        //        bigImg: img,
        //        icon: icon32x32,
        //        errorReason: "Не удалось обратиться к базе данных!"
        //    });
        //    return;
        //}
        if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {   console.log("(reqIsJSON(req.headers) || reqIsAJAX(req.headers 180");
            res.send({
                error: "Failed to get data! Reason: user is not authorized!",
                userErrorMsg: "Не удалось плучить данные. Пользователь не авторизирован."
            });
            return;
        }
        console.log("access sendFile");
        res.render(path.join(__dirname, '../pages/login.ejs'), {
            loginMsg: ""
        });
    });
};