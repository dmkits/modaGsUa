
var database=require("./databaseMSSQL");
var common=require("./common");
var path=require('path');
var fs=require('fs');
//var log=require('./log')();
var log=require("./server").log;

module.exports= function(app) {
    var reqIsJSON = function (headers) {
        return (headers && headers["x-requested-with"] && headers["x-requested-with"] == "application/json; charset=utf-8")
    };
    var reqIsAJAX = function (headers) {
        return (headers && headers["content-type"] == "application/x-www-form-urlencoded" && headers["x-requested-with"] == "XMLHttpRequest");
    };
    app.use(function (req, res, next) {                     log.info("ACCESS CONTROLLER  req.path=", req.path, " params:",req.query,{});
        if (req.originalUrl.indexOf("/login") >= 0) { console.log('if req.originalUrl.indexOf("/login")');
            next();
            return;
        }
        if (req.cookies.uuid) {                                 console.log('req.cookies.uuid');
            var uuid=req.cookies.uuid;
            var connData=database.getConnData();                console.log('connData=',connData);
            if(connData && connData[uuid] && connData[uuid].connection
                && connData[uuid].user) {
             // req.dbConnection = connData[uuid].connection;
                database.executeQuery(uuid,"select SUSER_NAME();",function(err, recordset){
                    if(err){
                        log.error('Failed to get current DB user. Reason: '+err);
                        return;
                    }
                    log.info('Current DB user: '+recordset);

                    req.uuid = uuid;
                    req.connUserName=connData[uuid].user;
                    next();
                });
                return;
            }
            if(req.cookies.sysadmin){                                //console.log('req.cookies.sysadmin');
                var sysAdminUUIDArr = common.getSysAdminConnArr();  // console.log('sysAdminUUIDArr=',sysAdminUUIDArr);
                for (var i in sysAdminUUIDArr) {
                    if (sysAdminUUIDArr[i][req.cookies.uuid]) {  console.log('inside if sysAdminUUIDArr');
                        req.connUserName = sysAdminUUIDArr[i][req.cookies.uuid];

                 //   }
                        //check systemconn
                        //create new conn for sysadmin
                        //else without DB conn
                        console.log('database.getSystemConnectionErr()=', database.getSystemConnectionErr());
                        if(database.getSystemConnectionErr()){  console.log('database.getSystemConnectionErr()=');
                            if(req.originalUrl.indexOf("/sysadmin") < 0) res.redirect('/sysadmin');    //TODO redirect exit sysadmin error
                            next();
                            return;
                        }
                        if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {
                            log.info("DB connection config was changed or connections were cleared. New authorisation is needed.");
                            res.send({
                                error: "DB connection config was changed or connections were cleared. New authorisation is needed.",
                                userErrorMsg: "Необходимо повторно авторизироваться."
                            });
                            return;
                        }
                        log.info("DB connection config was changed or connections were cleared. New authorisation is needed.");
                        res.render(path.join(__dirname, '../pages/login.ejs'), {
                            loginMsg: "<div>Необходимо повторно авторизироваться.</div>"
                        });
                        return;
                    }
                }
            }
            if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {          console.log('reqIsJSON(req.headers) || reqIsAJAX(req.headers)');
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
        }
        if (reqIsJSON(req.headers) || reqIsAJAX(req.headers)) {   console.log("(reqIsJSON(req.headers) || reqIsAJAX(req.headers 180");
            res.send({
                error: "Failed to get data! Reason: user is not authorized!",
                userErrorMsg: "Не удалось плучить данные. Пользователь не авторизирован."
            });
            return;
        }
        res.render(path.join(__dirname, '../pages/login.ejs'), {
            loginMsg: ""
        });
    });
};