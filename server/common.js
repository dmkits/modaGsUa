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
            startupParams.mode = arg;
        }else if(arg.indexOf(sParamName='-log:')==0){
            var logParam = arg.replace(sParamName,"");
            if(logParam.toLowerCase()=="console") startupParams.logToConsole= true;
            else if(logParam.toLowerCase()=="debug") startupParams.logDebug= true;
        }
    }
    if(!startupParams.port)startupParams.port= 8080;
    if(!startupParams.mode)startupParams.mode= 'production';
    return startupParams;
};

module.exports.loadConfig= function(fileName){
    var stringConfig = fs.readFileSync(sysConfigPath+fileName);
    return JSON.parse(stringConfig);
};
module.exports.saveConfig= function(fileName,dbConfig,callback){
    fs.writeFile(sysConfigPath+fileName, JSON.stringify(dbConfig), function(err,success){
        callback(err,success);
    })
};

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

module.exports.getUIDNumber=function (){
    var str= uid.time();
    var len = str.length;
    var num = BigNumber(0);
    for (var i = (len - 1); i >= 0; i--)
        num.plus(BigNumber(256).pow(i).mult(str.charCodeAt(i)));
    return num.toString();
};

var getControlBarcodeFigure=function(valueForBarcode){
    var barcodeStr=valueForBarcode.toString();
    if(barcodeStr.length!=12) return null;
    var splittedBarcode=barcodeStr.split('');
    var oddSum=0, evenSum=0;
    for(var i in splittedBarcode){
        var fig=parseInt(splittedBarcode[i]);
        if(i%2==0)oddSum = oddSum+fig;
        else evenSum = evenSum+fig;
    }
    var controlFigure;
    if(((evenSum*3)+oddSum)%10==0)controlFigure=0;
    else controlFigure =10-((evenSum*3)+oddSum)%10;
    return controlFigure;
};
module.exports.getEAN13Barcode=function(code, prefix){
    var valueForBarcode=Math.pow(10,10)*prefix+code;
    var barcodeControl=getControlBarcodeFigure(valueForBarcode);
    return valueForBarcode.toString()+barcodeControl.toString();
};

module.exports.sortArray=function(arr){
    function compareBychangeDatetime(a, b) {
        if (new Date(a.changeDatetime) > new Date(b.changeDatetime)) return 1; else return -1;
    }
    arr.sort(compareBychangeDatetime);
    return arr;
};
