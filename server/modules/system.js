var path=require('path'), XLSX=require('xlsx'),fs=require('fs');
var dataModel=require('../datamodel'), common=require('../common');
var server=require('../server'), log=server.log, tempExcelRepDir=server.tempExcelRepDir;
// var database = require('../databaseMSSQL');

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init = function(app) {
    app.post("/sys/getExcelFile", function(req, res){
        try {
            var body = JSON.parse(req.body), columns=body.columns, rows=body.rows;
        }catch(e){                                                                                  log.error("Impossible to parse data! Reason:"+e);
            res.sendStatus(500); return;
        }
        if(!columns){                                                                               log.error("Error: No columns data to create excel file.");
            res.sendStatus(500); return;
        }
        if(!rows){                                                                                  log.error("Error: No table data to create excel file.");
            res.sendStatus(500); return;
        }
        var uniqueFileName = common.getUIDNumber();
        var fname = path.join(tempExcelRepDir, uniqueFileName + '.xlsx');
        try {fs.writeFileSync(fname);
        }catch(e){                                                                                  log.error("Impossible to write file! Reason:",e);
            res.sendStatus(500); return;
        }
        try {
            var wb = XLSX.readFileSync(fname);
        }catch(e){                                                                                  log.error("Impossible to create workbook! Reason:",e);
            res.sendStatus(500); return;
        }
        wb.SheetNames = []; wb.SheetNames.push('Sheet1');
        fillTable(wb,columns,rows);
        XLSX.writeFileAsync(fname, wb, {bookType: "xlsx", /*cellStyles: true,*/ cellDates:true}, function(err){
            if(err){                                                                                log.error("send xls file err=", err);
                res.sendStatus(500); return;
            }
            var options = {headers: {'Content-Disposition': 'attachment; filename =out.xlsx'}};
            res.sendFile(fname, options, function (err) {
                if(err){                                                                            log.error("send xls file err=", err);
                    res.sendStatus(500);
                }
                fs.unlink(fname,function(errUnlink){
                    if(errUnlink){                                                                  log.error("unlink xls file err=", err);
                        //res.sendStatus(500);
                    }
                });
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
        wb.Sheets['Sheet1'] = { '!cols': worksheetColumns };
        for (var j = 0; j < columns.length; j++) {
            worksheetColumns.push({wpx: columns[j].width});
            var currentHeader = XLSX.utils.encode_cell({c: j, r: 0});
            wb.Sheets['Sheet1'][currentHeader] = {t: "s", v: columns[j].name, s: {font: {bold: true}}};
        }
    }
    function fillRowData(wb,rowData,columns, lineNum){
        var lastCellInRaw;
        for (var i = 0; i < columns.length; i++) {
            var column=columns[i],columnDataID = column.data, cellType=getCellType(column);
            var displayValue =  rowData[columnDataID];displayValue=(displayValue===undefined||displayValue===null)?"":displayValue;
            var currentCell = XLSX.utils.encode_cell({c: i, r: lineNum});
            lastCellInRaw=currentCell;
            wb.Sheets['Sheet1'][currentCell]={};
            var wbCell=wb.Sheets['Sheet1'][currentCell];
            wbCell.t=cellType; wbCell.v=displayValue;
            if(wbCell.t=="d"){
                wbCell.z=column.datetimeFormat || "DD.MM.YYYY";
            } else if(wbCell.t=="n"){
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
};