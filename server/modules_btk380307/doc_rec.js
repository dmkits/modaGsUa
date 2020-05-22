var dataModel= require(appDataModelPath),
    dateFormat= require('dateformat');
var t_Rec= require(appDataModelPath+"t_Rec"), t_RecD= require(appDataModelPath+"t_RecD");
var r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods= require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Rec,t_RecD,r_DBIs,r_Ours,r_Stocks,r_Comps,r_Currs,r_States,r_Prods], errs,
        function(){ nextValidateModuleCallback(); });
};

module.exports.moduleViewURL = "/docs/rec";
module.exports.moduleViewPath = "docs/doc_rec.html";
module.exports.init = function(app){
    var tRecsListTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "DocID", name: "Номер", width: 85, type: "text", align:"right", dataSource:"t_Rec"},
        {data: "IntDocID", name: "Вн. номер", width: 85, type: "text", align:"right", dataSource:"t_Rec"},
        {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center", dataSource:"t_Rec"},
        {data: "OurName", name: "Фирма", width: 150, type: "text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Rec.OurID" },
        {data: "StockName", name: "Склад", width: 150, type: "text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Rec.StockID" },
        {data: "CompName", name: "Предприятие", width: 150, type: "text",
            dataSource:"r_Comps", sourceField:"CompName", linkCondition:"r_Comps.CompID=t_Rec.CompID" },
        {data: "CurrID", name: "Код валюты", width: 50, type: "text", align:"center", visible:false, dataSource:"t_Rec", sourceField:"CurrID"},
        {data: "CurrName", name: "Валюта", width: 70, type: "text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Rec.CurrID" },
        {data: "KursCC", name: "Курс ВС", width: 65, type: "numeric", dataSource:"t_Rec", visible:false },
        {data: "TQty", name: "Кол-во", width: 75, type: "numeric",
            childDataSource:"t_RecD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_RecD", sourceField:"Qty"} },
        {data: "TSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Rec" },
        {data: "StateCode", name: "StateCode", width: 50, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "StateName", name: "Статус", width: 250, type: "text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Rec.StateCode" },
        {data: "CodeID1", name: "Признак 1", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID2", name: "Признак 2", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID3", name: "Признак 3", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID4", name: "Признак 4", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data: "CodeID5", name: "Признак 5", width: 60, type: "text", readOnly:true, visible:false, dataSource:"t_Rec"}
    ];
    app.get("/docs/rec/getDataForRecsListTable",function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
        t_Rec.getDataForTable(req.dbUC,{tableColumns:tRecsListTableColumns, identifier:tRecsListTableColumns[0].data,
                conditions:conditions, order:"DocDate, DocID"},
            function(result){ res.send(result); });
    });
    app.get("/docs/rec/getRecData",function(req,res){
        var conditions={};
        for(var condItem in req.query) conditions["t_Rec."+condItem]=req.query[condItem];
        t_Rec.getDataItemForTable(req.dbUC,{tableColumns:tRecsListTableColumns, conditions:conditions},
            function(result){ res.send(result); });
    });
    if(!r_DBIs.getNewDocID) throw new Error('NO r_DBIs.getNewDocID!');//commonDirs
    app.get("/docs/rec/getNewRecData",function(req,res){
        r_DBIs.getNewDocID(req.dbUC,"t_Rec",function(newDocID){
            var newDocDate=dateFormat(new Date(),"yyyy-mm-dd");
            r_Ours.getDataItem(req.dbUC,{fields:["OurName"],conditions:{"OurID=":"1"}}, function(result){
                var ourName=(result&&result.item)?result.item["OurName"]:"";
                r_Stocks.getDataItem(req.dbUC,{fields:["StockName"],conditions:{"StockID=":"1"}}, function(result){
                    var stockName=(result&&result.item)?result.item["StockName"]:"";
                    r_Currs.getDataItem(req.dbUC,{fields:["CurrName"], conditions:{"CurrID=":"1"} },
                        function(result){
                            var currName=(result&&result.item)?result.item["CurrName"]:"";
                            r_Comps.getDataItem(req.dbUC,{fields:["CompName"], conditions:{"CompID=":"1"} },
                                function(result){
                                    var compName=(result&&result.item)?result.item["CompName"]:"";
                                    r_States.getDataItem(req.dbUC,{fields:["StateName"],conditions:{"StateCode=":"0"}}, function(result){
                                        var stateName=(result&&result.item)?result.item["StateName"]:"";
                                        t_Rec.setDataItem({
                                                fields:["DocID","DocDate","OurName","StockName","CurrName","KursCC","KursMC","CompName",
                                                    "TQty","TSumCC_wt", "StateName"],
                                                values:[newDocID,newDocDate,ourName,stockName,currName,1,1,compName,
                                                    0,0, stateName]},
                                            function(result){ res.send(result); });
                                    });
                                });
                        });
                });
            });
        });
    });
    if(!r_DBIs.getNewChID) throw new Error('NO r_DBIs.getNewChID!');//commonDirs
    app.post("/docs/rec/storeRecData",function(req,res){
        var storeData=req.body;
        r_Ours.getDataItem(req.dbUC,{fields:["OurID"],conditions:{"OurName=":storeData["OurName"]}}, function(result){
            if(!result.item){ res.send({ error:"Cannot finded Our by OurName!"}); return; }
            storeData["OurID"]=result.item["OurID"];
            r_Stocks.getDataItem(req.dbUC,{fields:["StockID"],conditions:{"StockName=":storeData["StockName"]}}, function(result){
                if(!result.item){ res.send({ error:"Cannot finded Stock by StockName!"}); return; }
                storeData["StockID"]=result.item["StockID"];
                r_Currs.getDataItem(req.dbUC,{fields:["CurrID","RateCC","RateMC"],
                        fieldsFunctions:{"RateCC":"dbo.zf_GetRateCC(CurrID)","RateMC":"dbo.zf_GetRateMC(CurrID)"},
                        conditions:{"CurrName=":storeData["CurrName"]}},
                    function(result){
                        if(!result.item){ res.send({ error:"Cannot finded Curr by CurrName!"}); return; }
                        storeData["CurrID"]=result.item["CurrID"];  storeData["KursCC"]=result.item["RateCC"];  storeData["KursMC"]=result.item["RateMC"];
                        r_Comps.getDataItem(req.dbUC,{fields:["CompID"],conditions:{"CompName=":storeData["CompName"]}}, function(result){
                            storeData["CompID"]=result.item["CompID"];
                            var stateCode=0;
                            r_States.getDataItem(req.dbUC,{fields:["StateCode"],conditions:{"StateName=":storeData["StateName"]}}, function(result){
                                if(result.item) stateCode=result.item["StateCode"];
                                storeData["StateCode"]=stateCode;
                                storeData["CodeID1"]=0;storeData["CodeID2"]=0;storeData["CodeID3"]=0;storeData["CodeID4"]=0;storeData["CodeID5"]=0;
                                storeData["Discount"]=0;storeData["PayDelay"]=0;
                                storeData["TSumCC_nt"]=0;storeData["TTaxSum"]=0;
                                storeData["TSpendSumCC"]=0;storeData["TRouteSumCC"]=0;
                                storeData["EmpID"]=0;
                                t_Rec.storeTableDataItem(req.dbUC,{tableColumns:tRecsListTableColumns, idFieldName:"ChID", storeTableData:storeData,
                                        calcNewIDValue: function(params, callback){
                                            r_DBIs.getNewChID(req.dbUC,"t_Rec",function(chID){
                                                params.storeTableData[params.idFieldName]=chID;
                                                callback(params);
                                            });
                                        }},
                                    function(result){ res.send(result); });
                            });
                    });
                });
            });
        });
    });
    app.post("/docs/rec/deleteRecData",function(req,res){
        var delData=req.body;
        t_Rec.delTableDataItem(req.dbUC,{idFieldName:"ChID", delTableData:delData}, function(result){ res.send(result); });
    });

    var tRecDTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"t_RecD", identifier:true, readOnly:true, visible:false},
        {data: "SrcPosID", name: "№ п/п", width: 45, type: "numeric", dataSource:"t_RecD", identifier:true },
        {data: "Article1", name: "Артикул1 товара", width: 200,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
            dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
        {data: "PCatName", name: "Бренд товара", width: 140,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data: "PGrName", name: "Коллекция товара", width: 95,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data: "PGrName2", name: "Тип товара", width: 140,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data: "PGrName3", name: "Вид товара", width: 150,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        {data: "PGrName1", name: "Линия товара", width: 70,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data: "ColorName", name: "Цвет товара", width: 80,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForColorNameCombobox",
            dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
            linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
        {data: "SizeName", name: "Размер товара", width: 70,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForSizeNameCombobox",
            dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
            linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"},
        {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"t_RecD", visible:true},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_RecD", visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_RecD.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"t_RecD", sourceField:"UM"},
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_RecD"},
        {data: "PPID", name: "Партия", width: 60, type: "numeric", visible:false},
        {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_RecD"},
        {data: "SumCC_wt", name: "Сумма", width: 75, type: "numeric2", dataSource:"t_RecD"},
        {data: "Extra", name: "% наценки", width: 55, type: "numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
        {data: "PriceCC", name: "Цена продажи", width: 65, type: "numeric2", dataSource:"t_RecD"}
        //{data: "PRICELIST_PRICE", name: "Цена по прайс-листу", width: 75, type: "numeric2"},
    ];
    app.get("/docs/rec/getDataForRecDTable",function(req,res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_RecD.ChID="]=req.query[condItem];
            else conditions["t_RecD."+condItem]=req.query[condItem];
        t_RecD.getDataForDocTable(req.dbUC,{tableColumns:tRecDTableColumns, identifier:tRecDTableColumns[0].data,
                conditions:conditions, order:"SrcPosID"},
            function(result){ res.send(result); });
    });
    if(!t_RecD.checkStoreProdAndCheckStoreRecD) throw new Error('NO t_RecD.checkStoreProdAndCheckStoreRecD!');//commonDocsProdsRec
    app.post("/docs/rec/storeRecDTableData",function(req,res){
        t_RecD.checkStoreProdAndCheckStoreRecD(req.dbUC,req.body,req.dbUserParams,tRecDTableColumns,function(result){ res.send(result); })
    });
    app.post("/docs/rec/deleteRecDTableData",function(req,res){
        t_RecD.delTableDataItem(req.dbUC,{idFields:["ChID","SrcPosID"],delTableData:req.body}, function(result){ res.send(result); });
    });
};