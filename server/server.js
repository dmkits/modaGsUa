var startDateTime=new Date(), startTime=startDateTime.getTime();                                    console.log('STARTING at ',startDateTime );//test
try{
    var ENV=process.env.NODE_ENV;                                                                   if(ENV=="development") console.log("START IN DEVELOPMENT MODE");
    var common=require('./common'), appStartupParams = common.getStartupParams();                         console.log('Started with startup params:',appStartupParams);//test
    var logDebug = (ENV=='development' || (appStartupParams && appStartupParams.logDebug));         if(logDebug) console.log("DEBUG LOG ON");
    module.exports.logDebug = logDebug;
    var path = require('path'), fs = require('fs'), dateformat =require('dateformat'),
        log = require('winston');
} catch(e){                                                                                         console.log("FAILED START! Reason: ", e.message);
    return;
}

module.exports.getAppStartupParams = function(){
    return appStartupParams;
};                                                                                                  console.log('Started with startup params:',appStartupParams);//test

if (appStartupParams.logToConsole) {
    log.configure({
        transports: [
            new (log.transports.Console)({ colorize: true,level:(logDebug)?'silly':'info', timestamp: function() {
                return dateformat(Date.now(), "yyyy-mm-dd HH:MM:ss.l");
            } })
        ]
    });
} else {
    var logDir= path.join(__dirname, '/../logs/');
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
    }catch (e){                                                                                     console.log("FAILED START! Reason: Failed create log directory! Reason:"+ e.message);
        return;
    }
    var transports  = [];
    transports.push(new (require('winston-daily-rotate-file'))({
        name: 'file',
        datePattern: '.yyyy-MM-dd',
        filename: path.join(logDir, "log_file.log")
    }));
    log = new log.Logger({transports: transports,level:(logDebug)?'silly':'info', timestamp: function() {
        return dateformat(Date.now(), "yyyy-mm-dd HH:MM:ss.l");
    }});
}                                                                                                   log.info('STARTING at', startDateTime );//test
module.exports.log=log;                                                                             log.info('Modules path, fs, dateformat, winston, util loaded' );//test

var common=require('./common');
var tempExcelRepDir=path.join(__dirname, '/../temp/');
try {
    if (!fs.existsSync(tempExcelRepDir)) {
        fs.mkdirSync(tempExcelRepDir);
    }
}catch (e){                                                                                         log.warn('Failed create XLSX_temp directory! Reason:'+e);
    tempExcelRepDir=null;
}
module.exports.tempExcelRepDir=tempExcelRepDir;

var express = require('express');                                                                   log.info('express loaded on ', new Date().getTime()-startTime );//test
var server = express();
var bodyParser = require('body-parser');                                                            log.info('body-parser loaded on ', new Date().getTime()-startTime );//test
var cookieParser = require('cookie-parser');                                                        log.info('cookie-parser loaded on ', new Date().getTime()-startTime );//test

module.exports.getApp=function(){
    return server;
};

var serverConfig=null;
global.serverConfigPath= path.join(__dirname,'/../','');
function loadServerConfiguration(){
    try {
        serverConfig= common.loadConfig(appStartupParams.mode + '.cfg');
    } catch (e) {
        log.error("Failed to load configuration! Reason:" + e);
        serverConfig= null;
    }
}
loadServerConfiguration();                                                                          log.info('load server configuration loaded on ', new Date().getTime()-startTime);//test
module.exports.loadServerConfiguration= loadServerConfiguration;                                    log.info('startup mode:'+appStartupParams.mode,' server configuration:', serverConfig);//test
module.exports.getServerConfig= function(){ return serverConfig };
module.exports.setAppConfig= function(newAppConfig){ serverConfig=newAppConfig; };

var database = require('./databaseMSSQL');                                                          log.info('dataBase loaded on ', new Date().getTime()-startTime);//test

var configFileName=(serverConfig&&serverConfig.configName)?serverConfig.configName:'config.json';
var config=JSON.parse(common.getJSONWithoutComments(fs.readFileSync('./'+configFileName,'utf-8')));
module.exports.getConfig=function(){ return config; };
module.exports.getConfigAppMenu=function(){ return (config&&config.appMenu)?config.appMenu:null; };
module.exports.getConfigModules=function(){ return (config&&config.modules)?config.modules:null; };

server.use(function (req, res, next) {
    next();
});
server.use(cookieParser());
server.use(bodyParser.urlencoded({extended: true,limit: '5mb'}));
server.use(bodyParser.json({limit: '5mb'}));
server.use(bodyParser.text({limit: '5mb'}));
server.use('/', express.static('public'));
server.set('view engine','ejs');

global.appViewsPath= path.join(__dirname,'/../pages/','');
global.appModulesPath= path.join(__dirname,'/modules/','');
global.appDataModelPath= path.join(__dirname,'/datamodel/','');

var appModules=require("./modules");
var loadInitModulesErrorMsg=null;
module.exports.getLoadInitModulesError= function(){ return loadInitModulesErrorMsg; };

require('./access')(server);

var startServer= function(){
    server.listen(appStartupParams.port, function (err) {
        if(err){
            console.log("listen port err= ", err);
            return;
        }
        console.log("server runs on port " + appStartupParams.port+" on "+(new Date().getTime()-startTime));
        log.info("server runs on port " + appStartupParams.port+" on "+(new Date().getTime()-startTime));
    });                                                                                             log.info("server inited.");
};

database.setDBSystemConnection(serverConfig, function(err,result){
    if(err) log.error("FAILED to set system connection! Reason: ",err);
    appModules.validateModules(function(errs, errMessage){
        if (errMessage){                                                                            log.error("FAILED validate! Reason: ",errMessage);
        }
        appModules.init(server,errs);
        if(errs&&!errMessage){
            var eCount=0;
            for(var errItem in errs){
                if (!loadInitModulesErrorMsg) loadInitModulesErrorMsg=""; else loadInitModulesErrorMsg+="<br>";
                loadInitModulesErrorMsg+=errs[errItem];
                eCount++;
                if(eCount>3) break;
            }
        }   console.log("startServer");
        startServer();
    });
});

process.on("uncaughtException", function(err){
    log.error(err);
    console.log("uncaughtException=",err);
});

