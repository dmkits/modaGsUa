console.log("Starting...");
var startTime = new Date().getTime();
function startupParams() {
    if (process.argv.length == 0) {
        app.mode = 'production';
        app.port = 8080;
        return;
    }
    for (var i = 2; i < process.argv.length; i++) {
        if (process.argv[i].indexOf('-p:') == 0) {
            var port = process.argv[i].replace("-p:", "");
            if (port > 0 && port < 65536) {
                app.port = port;
            }
        } else if (process.argv[i].charAt(0).toUpperCase() > 'A' && process.argv[i].charAt(0).toUpperCase() < 'Z') {
            app.mode = process.argv[i];
        } else if (process.argv[i].indexOf('-log:') == 0) {
            var logParam = process.argv[i].replace("-log:", "");
            if (logParam.toLowerCase() == "console") {
                app.logToConsole = true;
            }
        }
    }
    if (!app.port)app.port = 8080;
    if (!app.mode)app.mode = 'production';
}
var express = require('express');                   console.log("module  express",new Date().getTime() - startTime);
var app = express();
startupParams();
var log=require('./logger.js')(app.logToConsole);
module.exports.startupMode = app.mode;

var cookieParser = require('cookie-parser');        console.log("module  cookie-parser",new Date().getTime() - startTime);
var fs = require('fs');                             console.log("module  fs",new Date().getTime() - startTime);
var port=app.port;
var path=require ('path');                          console.log("module  path",new Date().getTime() - startTime);
var bodyParser = require('body-parser');            console.log("module body-parser",new Date().getTime() - startTime);
var XLSX = require('xlsx');                         console.log("xlsx",new Date().getTime() - startTime);
var favicon = require('serve-favicon');             console.log("serve-favicon",new Date().getTime() - startTime);



app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.text({limit: '50mb'}));
app.use('/',express.static('public'));
app.use(favicon(path.join(__dirname, '../public/icons', 'profits16x16.ico')));

var database = require('./databaseMSSQL');               console.log("module ./databaseMSSQL",new Date().getTime() - startTime);
app.ConfigurationError;
app.DBConnectError="No connection";

require('./access')(app);
var common=require('./common');

process.on('uncaughtException', function(err) {
    log.error('Server process failed! Reason:', err);
    console.log('Server process failed! Reason:', err);
});

common.tryLoadConfiguration(app);

//if (!app.ConfigurationError) common.tryDBConnect(app);
var tempExcelRepDir=path.join(__dirname, '../temp/');
try {
    if (!fs.existsSync(tempExcelRepDir)) {
        fs.mkdirSync(tempExcelRepDir);
    }
}catch (e){                                                                                         log.warn('Failed create XLSX_temp directory! Reason:'+e);
    tempExcelRepDir=null;
}
app.get("/login", function (req, res) {                        log.info("app.get /login");
    res.sendFile(path.join(__dirname, '../pages', 'login.html'));
});
app.post("/login", function (req, res) {                        log.info("app.post /login",req.body.user, 'userPswrd=',req.body.pswrd);
    var userName=req.body.user, userPswrd=req.body.pswrd;
    if(!userName ||!userPswrd ){
        res.send({error:"Authorisation failed! No login or password!", userErrorMsg:"Пожалуйста введите имя и пароль."});
        return;
    }
    database.connectWithPool({login:userName,password:userPswrd}, function(err,recordset){
        if(err){
            app.DBConnectError=err;
            //var sysAdminLoginDataArr=common.getSysAdminLoginDataArr();
            var rootUser=database.getDBConfig().user;
            var rootPassword=database.getDBConfig().password;
            if(userName==rootUser && userPswrd==rootPassword){
                var newUUID = common.getUIDNumber();
                var sysadminsArray=common.getSysAdminConnArr();
                var newSysAdminConn={};
                newSysAdminConn[newUUID]=userName;
                sysadminsArray.push(newSysAdminConn);
                common.writeSysAdminLPIDObj(sysadminsArray);
                res.cookie("uuid", newUUID);
                res.cookie("sysadmin", true);
                res.send({result: "success"});
                return;
            }else{
                res.send({error:err});
                return;
            }
        }
        app.DBConnectError=null;
        res.cookie("uuid", recordset.uuid);
        res.send({result: "success"});
    });
});

require('./sysadmin')(app);
//require('./reports')(app);
var appModules=require("./modules");
var loadInitModulesErrorMsg=null;
module.exports.getLoadInitModulesError= function(){ return loadInitModulesErrorMsg; };


appModules.validateModules(function(errs, errMessage){
    if (errMessage){                                                                                log.error("FAILED validate! Reason: ",errMessage);
    }
    require("./access")(server);//check user access

    appModules.init(server,errs);
    if(errs&&!errMessage){
        var eCount=0;
        for(var errItem in errs){
            if (!loadInitModulesErrorMsg) loadInitModulesErrorMsg=""; else loadInitModulesErrorMsg+="<br>";
            loadInitModulesErrorMsg+=errs[errItem];
            eCount++;
            if(eCount>3) break;
        }
    }
    server.listen(appStartupParams.port, function (err) {
        if(err){
            console.log("listen port err= ", err);
            return;
        }
        console.log("server runs on port " + appStartupParams.port+" on "+(new Date().getTime()-startTime));
        log.info("server runs on port " + appStartupParams.port+" on "+(new Date().getTime()-startTime));
    });                                                                                             log.info("server inited.");
});

app.get("/", function(req, res){                                                                     log.info("app.get /");
    res.sendFile(path.join(__dirname, '../pages', 'main.html'));
});
app.post("/", function(req, res){                                                                   log.info("app.post /  req.body=",req.body);
    var outData={};
    if(req.body["action"] && req.body["action"]=="exit"){
        var cookiesArr=Object.keys(req.cookies);
        for(var i in cookiesArr){
            res.clearCookie(cookiesArr[i]);
        }
        outData.actionResult="successfull";
        res.send(outData);
        return;
    }
    outData.error="Не удалось завершить сессию.";
    res.send(outData);
});

app.get("/get_main_data", function(req, res){                                                        log.info("app.get /get_main_data");
    var outData = {};//main data
    var menuBar= [];//menu bar list
    outData.title= "REPORTS";
    outData.mode=app.mode;
    outData.modeName= app.mode.toUpperCase();

    //outData.loginEmpName=req.loginEmpName;
    //if (app.ConfigurationError) {
    //    outData.error=app.ConfigurationError;                                                         log.error("req.ConfigurationError=",app.ConfigurationError);
    //}
    //var configDirectoryName=common.getConfigDirectoryName();
    //var pagesConfig;
    //try{
    //    pagesConfig=JSON.parse(common.getJSONWithoutComments(fs.readFileSync(path.join(__dirname,'../'+configDirectoryName+'/pagesConfig.json'),'utf8')));
    //}catch(e){
    //    log.error("Failed to get reports list file. Reason:"+e);
    //    outData.error= "Failed to get reports list file. Reason:"+e;
    //    res.send(outData);
    //    return;
    //}
    //var pages=pagesConfig.pages;
    //var userPages=[];
    //var autorunPagesArr= [];
    //if(req.userRoleCode=="sysadmin"){
    //    userPages=pages;
    //    autorunPagesArr.push(userPages[0]['id']);  // TODO default autorun
    //}else{
    //    var userConfigPagesObject=pagesConfig.rolesCodes[req.userRoleCode];
    //    var userConfigPagesList=Object.keys(userConfigPagesObject);
    //    for(var userPage in userConfigPagesList){
    //        for(var i in pages){
    //            var page=pages[i];
    //            if(page.id==userConfigPagesList[userPage]){
    //                userPages.push(page);
    //                if(userConfigPagesObject[userConfigPagesList[userPage]]==true){
    //                    autorunPagesArr.push(userConfigPagesList[userPage]);
    //                }
    //            }
    //        }
    //    }
    //}
    //for(var k in userPages){
    //    var pageData=userPages[k];
    //    menuBar.push({itemname:pageData.id,itemtitle:pageData.title,
    //        action:"open",content:"/"+pageData.type+"/"+pageData.id, id:pageData.id,title:pageData.title, closable:true});
    //}
    menuBar.push({itemname:"menuBarClose",itemtitle:"Выход",action:"close"});
    menuBar.push({itemname:"menuBarAbout",itemtitle:"О программе",action:"help_about"});
    outData.menuBar= menuBar;
   // outData.autorun= [];
  //  outData.autorun.push({menuitem: autorunPagesArr, runaction:1});
    res.send(outData);
});

app.get("/print/printSimpleDocument", function(req, res){                                                           log.info("app.get /print/printSimpleDocument");
    res.sendFile(path.join(__dirname, '../pages/print', 'printSimpleDocument.html'));
});
app.post("/sys/getExcelFile", function(req, res){
    try {
        var body = JSON.parse(req.body), columns=body.columns, rows=body.rows;
    }catch(e){
        res.sendStatus(500);                                                    log.error("Impossible to parse data! Reason:"+e);
        return;
    }
    if(!columns) {
        res.sendStatus(500);                                                    log.error("Error: No columns data to create excel file.");
        return;
    }
    if(!rows) {
        res.sendStatus(500);                                                    log.error("Error: No table data to create excel file.");
        return;
    }
    var uniqueFileName = common.getUIDNumber();
    var fname = path.join(tempExcelRepDir, uniqueFileName + '.xlsx');
    try {fs.writeFileSync(fname);
    } catch (e) {                                                               log.error("Impossible to write file! Reason:",e);
        res.sendStatus(500);
        return;
    }
    try {
        var wb = XLSX.readFileSync(fname);
    }catch(e){                                                                  log.error("Impossible to create workbook! Reason:",e);
        res.sendStatus(500);
        return;
    }
    wb.SheetNames = [];
    wb.SheetNames.push('Sheet1');

    fillTable(wb,columns,rows);

    XLSX.writeFileAsync(fname, wb, {bookType: "xlsx", /*cellStyles: true,*/ cellDates:true}, function(err){
        if (err) {
            res.sendStatus(500);                                                 log.error("send xls file err=", err);
            return;
        }
        var options = {headers: {'Content-Disposition': 'attachment; filename =out.xlsx'}};
        res.sendFile(fname, options, function (err) {
            if (err) {
                res.sendStatus(500);                                             log.error("send xls file err=", err);
            }
            fs.unlinkSync(fname);
        })
    });
});
function fillTable(wb,columns,rows){
    fillHeaders(wb,columns);
    var lineNum=1;
    for (var i in rows){
        fillRowData(wb,rows[i],columns,lineNum);
        lineNum++;
    }
}
function fillHeaders(wb,columns){
    var worksheetColumns = [];
    wb.Sheets['Sheet1'] = {
        '!cols': worksheetColumns
    };
    for (var j = 0; j < columns.length; j++) {
        worksheetColumns.push({wpx: columns[j].width});
        var currentHeader = XLSX.utils.encode_cell({c: j, r: 0});
        wb.Sheets['Sheet1'][currentHeader] = {t: "s", v: columns[j].name, s: {font: {bold: true}}};
    }
}

function fillRowData(wb,rowData,columns, lineNum){
    var lastCellInRaw;
    for (var i = 0; i < columns.length; i++) {
        var column=columns[i];
        if(!column) continue;
        var columnDataID = column.data;

        var cellType=getCellType(column);
        var displayValue =  rowData[columnDataID] || "";
        var currentCell = XLSX.utils.encode_cell({c: i, r: lineNum});

        lastCellInRaw=currentCell;
        wb.Sheets['Sheet1'][currentCell]={};
        var wbCell=wb.Sheets['Sheet1'][currentCell];
        wbCell.t=cellType;
        wbCell.v=displayValue;
        if(wbCell.t=="d"){
            wbCell.z=column.datetimeFormat || "DD.MM.YYYY";
        }
        if(wbCell.t=="n"){
            if(!column.format) continue;
            if(column.format.indexOf("0.00")>0 )wbCell.z= '#,###,##0.00';
            if(column.format.indexOf("0.[")>0 )wbCell.z= '#,###,##0';
        }
        wb.Sheets['Sheet1']['!ref']='A1:'+lastCellInRaw;
    }
}

function getCellType(columnData){
    if(!columnData.type) return's';
    if(columnData.type=="numeric") return'n';
    if(columnData.type=="text" && columnData.datetimeFormat) return'd';
    else return's';
}

app.listen(app.port, function (err) {
    if (err) {
        log.error(err);
        console.log(err);
        return;
    }
    console.log("app runs on port " + port, new Date().getTime() - startTime);
    log.info("app runs on port " + port);
});



