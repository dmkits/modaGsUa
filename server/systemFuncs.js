var path= require('path'), fs= require('fs'),
    uid= require('uniqid'), BigNumber= require('big-number');

module.exports.getStartupParams= function(){
    var startupParams= {};
    if(process.argv.length==0){
        startupParams.mode= 'production';
        startupParams.port= 8080;
        return startupParams;
    }
    for(var i=2; i<process.argv.length; i++){
        var arg=process.argv[i], sParamName;
        if(arg.indexOf(sParamName='-p:')==0){
            var port= arg.replace(sParamName,"");
            if(port>0 && port<65536) startupParams.port= port;
        }else if(arg.charAt(0).toUpperCase()>'A' && arg.charAt(0).toUpperCase()<'Z'){
            startupParams.mode= arg;
        }else if(arg.indexOf(sParamName='-log:')==0){
            var logParam = arg.replace(sParamName,"");
            if(logParam.toLowerCase()=="console") startupParams.logToConsole= true;
            else if(logParam.toLowerCase()=="debug") startupParams.logDebug= true;
        }
    }
    if(!startupParams.port) startupParams.port= 8080;
    if(!startupParams.mode) startupParams.mode= 'production';
    return startupParams;
};

module.exports.loadConfig= function(fileName){
    var stringConfig= fs.readFileSync(sysConfigPath+fileName);
    return JSON.parse(stringConfig);
};
module.exports.saveConfig= function(fileName,dbConfig,callback){
    fs.writeFile(sysConfigPath+fileName, JSON.stringify(dbConfig), function(err,success){
        callback(err,success);
    })
};

module.exports.getJSONWithoutComments= function(text){
    var target= "/*", pos= 0;
    while(true){
        var foundPos= text.indexOf(target,pos);
        if(foundPos<0)break;
        var comment= text.substring(foundPos,text.indexOf("*/",foundPos)+2);
        text= text.replace(comment,"");
        pos= foundPos + 1;
    }
    return text;
};

var getUIDNumber= function(){
    var str= uid.time(), len= str.length, num= BigNumber(0);
    for(var i=(len-1); i>=0; i--)
        num.plus(BigNumber(256).pow(i).mult(str.charCodeAt(i)));
    return num.toString();
};
module.exports.getUIDNumber= getUIDNumber;

var getControlBarcodeFigure= function(valueForBarcode){
    var barcodeStr=valueForBarcode.toString();
    if(barcodeStr.length!=12) return null;
    var splittedBarcode=barcodeStr.split(''), oddSum=0, evenSum=0;
    for(var i in splittedBarcode){
        var fig=parseInt(splittedBarcode[i]);
        if(i%2==0) oddSum+= fig; else evenSum+= fig;
    }
    var controlFigure;
    if(((evenSum*3)+oddSum)%10==0) controlFigure=0; else controlFigure= 10-((evenSum*3)+oddSum)%10;
    return controlFigure;
};
module.exports.getEAN13Barcode= function(code,prefix){
    var valueForBarcode= Math.pow(10,10)*prefix+code,
        barcodeControl= getControlBarcodeFigure(valueForBarcode);
    return valueForBarcode.toString()+barcodeControl.toString();
};

module.exports.sortArray= function(arr){
    function compareBychangeDatetime(a,b){
        if(new Date(a.changeDatetime) > new Date(b.changeDatetime)) return 1; else return -1;
    }
    arr.sort(compareBychangeDatetime);
    return arr;
};

var server= require('./server'), log= server.log;
var XLSX= require('xlsx');
/**
 * sExcelData = { columns, rows }
 * callback= function(status, filename, unlinkAction)
 *      unlinkAction = function()
 * if error return callback(<status>)
 * else return callback(0,<filename>,unlinkAction)
 */
module.exports.getExcelFile= function(sExcelData,callback){
    try {
        var body= JSON.parse(sExcelData), columns= body.columns, rows= body.rows;
    }catch(e){                                                                                                  log.error("Impossible to parse data! Reason:",e);
        callback(500); return;
    }
    if(!columns){                                                                                               log.error("Error: No columns data to create excel file.");
        callback(500); return;
    }
    if(!rows){                                                                                                  log.error("Error: No table data to create excel file.");
        callback(500); return;
    }
    var uniqueFileName= getUIDNumber(), fname= path.join(server.getTempExcelRepDir(),uniqueFileName+'.xlsx');
    try{
        fs.writeFileSync(fname);
    }catch(e){                                                                                                  log.error("Impossible to write file! Reason:",e);
        callback(500); return;
    }
    try{
        var wb= XLSX.readFileSync(fname);
    }catch(e){                                                                                                  log.error("Impossible to create workbook! Reason:",e);
        callback(500); return;
    }
    wb.SheetNames= []; wb.SheetNames.push('Sheet1');
    fillTable(wb,columns,rows);
    XLSX.writeFileAsync(fname, wb, {bookType:"xlsx", /*cellStyles:true,*/ cellDates:true}, function(err){
        if(err){                                                                                                log.error("send xls file err=",err);
            callback(500); return;
        }
        callback(0,fname, function(err){
            fs.unlink(fname,function(errUnlink){
                if(errUnlink){                                                                                  log.error("unlink xls file err=",err);
                }
            });
        })
    });
};
function fillTable(wb,columns,rows){
    fillHeaders(wb,columns);
    var lineNum=1;
    for(var i in rows){
        fillRowData(wb,rows[i],columns,lineNum);
        lineNum++;
    }
}
function fillHeaders(wb,columns){
    var worksheetColumns= [];
    wb.Sheets['Sheet1']= { '!cols': worksheetColumns };
    for (var j=0; j<columns.length; j++) {
        worksheetColumns.push({wpx: columns[j].width});
        var currentHeader= XLSX.utils.encode_cell({c:j,r:0});
        wb.Sheets['Sheet1'][currentHeader] = {t:"s", v:columns[j].name, s:{font:{bold:true}}};
    }
}
function fillRowData(wb,rowData,columns, lineNum){
    var lastCellInRaw;
    for(var i=0; i<columns.length; i++){
        var column= columns[i], columnDataID= column.data, cellType= getCellType(column),
            displayValue= rowData[columnDataID];
        displayValue= (displayValue===undefined||displayValue===null)?"":displayValue;
        var currentCell= XLSX.utils.encode_cell({c:i,r:lineNum});
        lastCellInRaw= currentCell;
        wb.Sheets['Sheet1'][currentCell]={};
        var wbCell= wb.Sheets['Sheet1'][currentCell];
        wbCell.t= cellType; wbCell.v= displayValue;
        if(wbCell.t=="d"){
            wbCell.z= column.datetimeFormat || "DD.MM.YYYY";
        }else if(wbCell.t=="n"){
            if(column.format.indexOf("0.00")>0 ) wbCell.z= '#,###,##0.00';
            if(column.format.indexOf("0.[")>0 ) wbCell.z= '#,###,##0';
        }
        wb.Sheets['Sheet1']['!ref']= 'A1:'+lastCellInRaw;
    }
}
function getCellType(columnData){
    if(!columnData.type) return's';
    if(columnData.type=="numeric") return'n';
    if(columnData.type=="text" && columnData.datetimeFormat) return'd';
    else return's';
}