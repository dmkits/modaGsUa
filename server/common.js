var database= require("./databaseMSSQL");
var path=require('path');
var fs=require('fs');
var uid = require('uniqid');
var BigNumber = require('big-number');

//module.exports.tryLoadConfiguration=function (app){                                         //console.log('tryLoadConfiguration...', new Date().getTime() - startTime);
//    try {
//        database.loadConfig();
//        app.ConfigurationError=null;
//    } catch (e) {                    console.log('ConfigurationError=', app.ConfigurationError);
//        app.ConfigurationError= "Failed to load configuration! Reason:"+e;
//    }
//};
//module.exports.getConfigDirectoryName=function (){
//    var dirName=(database.getDBConfig()["reports.config"])?database.getDBConfig()["reports.config"]:"reportsConfig";
//    return dirName;
//};

module.exports.getJSONWithoutComments= function (text){
    var target = "/*";
    var pos = 0;
    while (true) {
        var foundPos = text.indexOf(target, pos);
        if (foundPos < 0)break;
        var comment = text.substring(foundPos, text.indexOf("*/", foundPos)+2);
        text=text.replace(comment,"");
        pos = foundPos + 1;
    }
    return text;
};

//module.exports.tryDBConnect=function (app,postaction) {
//   tryToConnectToDBRecursively(0,app,postaction);
//};
//function tryToConnectToDBRecursively(index,app,postaction){
//    database.setDatabaseConnection(function (err) {
//        if (err) {
//            if(index==3) {
//                app.DBConnectError = "Failed to connect to database! Reason:" + err;
//            }
//            else if(index<3){
//                setTimeout(function () {
//                    tryToConnectToDBRecursively(index+1,app,postaction)
//                },10000);
//                return;
//            }
//            if (postaction)postaction(err);
//            return;
//        }
//        app.DBConnectError = null;
//        if (postaction)postaction(err);
//    });
//}

module.exports.getSysAdminConnArr=function (){
    try{
        var sysAdminsLPID=JSON.parse(fs.readFileSync(path.join(__dirname,"../sysAdmins.json")));
    }catch(e){
        if(e.code=='ENOENT'){
           var sysAdminsLPID=[];
           try{
               fs.writeFileSync(path.join(__dirname,"../sysAdmins.json"), JSON.stringify(sysAdminsLPID),{flag:"w"});
               return sysAdminsLPID;
           }catch(e2){
               console.log("FAILED to get sysadmin LPID. Reason: ",e2);
               return;
           }
        }
        console.log("FAILED to get sysadmin LPID. Reason: ",e);
        return;
    }
    return sysAdminsLPID;
};

module.exports.getSysAdminLoginDataArr=function (){
    try{
        var sysAdminsPswrd=JSON.parse(fs.readFileSync(path.join(__dirname,"../config.json")));
    }catch(e){
        console.log("FAILED to get sysadmin LPID. Reason: ",e);
        return;
    }
    return sysAdminsPswrd["sysAdmins"];
};
module.exports.writeSysAdminLPIDObj=function (sysAdminLPIDObj){
    fs.writeFile(path.join(__dirname,"../sysAdmins.json"), JSON.stringify(sysAdminLPIDObj),{flag:"w"}, function(err){
        if(err){
            console.log("err=",err);
        }
    })
};

module.exports.getUIDNumber=function (){
    var str= uid.time();
    var len = str.length;
    var num = BigNumber(0);
    for (var i = (len - 1); i >= 0; i--)
        num.plus(BigNumber(256).pow(i).mult(str.charCodeAt(i)));
    return num.toString();
};




