var dataModel= require(appDataModelPath);
var t_Rec= require(appDataModelPath+"t_Rec"), t_RecD= require(appDataModelPath+"t_RecD"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"), r_States= require(appDataModelPath+"r_States"),
    r_Prods= require(appDataModelPath+"r_Prods"),
    r_ProdC= require(appDataModelPath+"r_ProdC"), r_ProdG= require(appDataModelPath+"r_ProdG"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"), r_ProdG3= require(appDataModelPath+"r_ProdG3"),
    ir_ProdColors= require(appDataModelPath+"ir_ProdColors"), ir_ProdSizes= require(appDataModelPath+"ir_ProdSizes");

module.exports.validateModule= function(errs,nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Rec,t_RecD,r_Ours,r_Stocks,r_Comps,r_States,
            r_Prods,r_ProdC,r_ProdG,r_ProdG1,r_ProdG2,r_ProdG3,ir_ProdColors,ir_ProdSizes], errs,
        function(){ nextValidateModuleCallback(); });
};

module.exports.routes=[//-- App routes --
    { path:'/pageDocRec', componentUrl:'/mobile/pageDocRec_DocsList', options:{clearPreviousHistory:true,ignoreCache:true}, define:true },
    { path:'/pageDocRecProdsData/:recChID', componentUrl:'/mobile/pageDocRec_ProdsData', options:{ignoreCache:true} },
    { path:'/pageDocRecProdSrcData/:recChID/:action/:srcPosID', componentUrl:'/mobile/pageDocRec_ProdSrcData', options:{ignoreCache:true} },
    { path:'/pageDocRecSettings', componentUrl:'/mobile/pageDocRec_Settings', options:{ignoreCache:true} }
];
module.exports.moduleViewURL= "/mobile/pageDocRec_DocsList";
module.exports.moduleViewPath= "mobile/pageDocRec_DocsList.html";
module.exports.init = function(app){
    app.get("/mobile/pageDocRec_Settings", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageDocRec_Settings.html');
    });
    app.get("/mobile/pageDocRec_ProdsData", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageDocRec_ProdsData.html');
    });
    app.get("/mobile/pageDocRec_ProdSrcData", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageDocRec_ProdSrcData.html');
    });
    var tRecsListTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"DocID", name:"Номер", width:85, type:"text", align:"right", dataSource:"t_Rec"},
        {data:"IntDocID", name:"Вн. номер", width:85, type:"text", align:"right", dataSource:"t_Rec"},
        {data:"DocDate", name:"Дата", width:60, type:"dateAsText",align:"center", dataSource:"t_Rec"},
        {data:"SDocDate", name:"Дата", width:60, type:"test",align:"center", dataFunction:"CONVERT(varchar(10),DocDate,104)" },
        {data:"OurName", name:"Фирма", width:150, type:"text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Rec.OurID" },
        {data:"StockName", name:"Склад", width:150, type:"text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Rec.StockID" },
        {data:"CurrID", name:"Код валюты", width:50, type:"text", align:"center", visible:false, dataSource:"t_Rec", sourceField:"CurrID"},
        {data:"CurrName", name:"Валюта", width:70, type:"text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Rec.CurrID" },
        // {data:"KursMC", name:"Курс ОВ", width:65, type:"numeric", dataSource:"t_Ven", visible:false },
        {data:"Qty", name:"Кол-во", width:75, type:"numeric",
            childDataSource:"t_RecD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_RecD", sourceField:"Qty"} },
        {data:"TSumCC_wt", name:"Сумма", width:85, type:"numeric2", dataSource:"t_Rec" },
        {data:"StateCode", name:"StateCode", width:50, type:"text", readOnly:true, visible:false, dataSource:"t_Rec"},
        {data:"IsStateCreated", name:"В работе", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Rec.StateCode=0 Then 1 Else 0 END" },
        {data:"IsStateOnConfirmation", name:"На подтверждении", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Rec.StateCode in (50,56,60) Then 1 Else 0 END" },
        {data:"IsStateReturned", name:"Возвращен", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Rec.StateCode in (52,58,62) Then 1 Else 0 END" },
        {data:"IsStateClosedOrConfirmed", name:"Закрыт/Подтвержден", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Rec.StateCode in (145,51,57,61) Then 1 Else 0 END" },
        {data:"StateName", name:"Статус", width:250, type:"text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Rec.StateCode" },
        {data:"StateInfo", name:"Информация статуса", width:50, type:"text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Rec.StateCode not in (0,52,58,62) Then 'Изменение запрещено' Else 'Изменение разрешено' END" }
    ];
    app.get("/mobile/docRec/getDataForRecsList",function(req,res){
        var conditions={}, top="";
        for(var condItem in req.query){
            var condVal=req.query[condItem];
            if(condItem=="top") top="top "+condVal;
            else if(condVal=="-1") conditions["t_Rec."+condItem.replace("~",">")+"0"]=null;
            else conditions["t_Rec."+condItem]=condVal;
        }
        conditions["t_Rec.StateCode in (0, 50,56,60, 52,58,62)"]=null;
        r_Stocks.getDataItems(req.dbUC,{fields:['StockID','StockName'], conditions:{"StockID>":0}, order:"StockName"},
            function(result){
                var error= (result.error)?result.error:'',listStocks=(result)?result.items:null;
                if(listStocks) listStocks=[{StockID:-1,StockName:'Все склады'}].concat(listStocks);
                t_Rec.getDataItemsForTable(req.dbUC,{tableColumns:tRecsListTableColumns, conditions:conditions,
                        order:"DocDate desc, DocID desc", top:top},
                    function(result){
                        error+= (result.error)?result.error:'';
                        var outData= {listStocks:listStocks,listRecsByStockID:(result)?result.items:null};
                        if(error!='') outData.error=error;
                        res.send(outData);
                    });
            });
    });
    var tRecDTableColumns=[
        {data:"ChID", name:"ChID", width:85, type:"text", dataSource:"t_RecD", identifier:true, readOnly:true, visible:false},
        {data:"SrcPosID", name:"№ п/п", width:45, type:"numeric", dataSource:"t_RecD", identifier:true },
         {data:"Article1", name:"Артикул1 товара", width:200,
             dataSource:"r_Prods", sourceField:"Article1", linkCondition:"r_Prods.ProdID=t_RecD.ProdID"},
         {data:"PCatName", name:"Бренд товара", width:140,
             dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
         {data:"PGrName", name:"Коллекция товара", width:95,
             dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
         {data:"PGrName2", name:"Тип товара", width:140,
             dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
         {data:"PGrName3", name:"Вид товара", width:150,
             dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
         {data:"PGrName1", name:"Линия товара", width:70,
             dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
         {data:"ColorName", name:"Цвет товара", width:80,
             dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
             linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
         {data:"SizeName", name:"Размер товара", width:70,
             dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
             linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"},
        {data:"ProdID", name:"Код товара", width:50, type:"text", dataSource:"t_RecD", visible:true},
        {data:"Barcode", name:"Штрихкод", width:75, type:"text", dataSource:"t_RecD", visible:false},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_RecD.ProdID" },
        {data:"UM", name:"Ед. изм.", width:55, type:"text", align:"center", dataSource:"t_RecD", sourceField:"UM"},
        {data:"Qty", name:"Кол-во", width:50, type:"numeric", dataSource:"t_RecD"},
        {data:"PPID", name:"Партия", width:60, type:"numeric", visible:false},
        {data:"PriceCC_wt", name:"Цена", width:65, type:"numeric2", dataSource:"t_RecD"},
        {data:"SecID", name:"Секция", width:50, type:"numeric", dataSource:"t_RecD"},
        {data:"SecName", name:"Статус товара", width:80, type:"text", readOnly:true, visible:false,
            dataSource:"r_Secs", sourceField:"SecName", linkCondition:"r_Secs.SecID=t_RecD.SecID" },
        {data:"SumCC_wt", name:"Сумма", width:75, type:"numeric2", dataSource:"t_RecD"},
        {data:"Extra", name:"% наценки", width:55, type:"numeric", format:"#,###,###,##0.00", dataSource:"t_RecD"},
        {data:"PriceCC", name:"Цена продажи", width:65, type:"numeric2", dataSource:"t_RecD"}
        //{data:"PRICELIST_PRICE", name:"Цена по прайс-листу", width:75, type:"numeric2"},
    ];
    app.get("/mobile/docRec/getDataForRecDTable",function(req,res){
        var conditions={};
        for(var condItem in req.query){
            var value= req.query[condItem];
            if(condItem.indexOf("docChID")==0) conditions["t_RecD.ChID="]= value;
            else if(value!="null") conditions["t_RecD."+condItem]= value;
            else conditions["t_RecD."+condItem.replace("~"," is null")]= null;
        }
        t_RecD.getDataItemsForTable(req.dbUC,{tableColumns:tRecDTableColumns,conditions:conditions,order:"SrcPosID"},
            function(result){ res.send(result); });
    });
    r_Prods.getAllAttrs= function(dbUC,callback){
        var data={};
        r_Prods.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"Article1":"Article1"}, order:"Article1"},
            function(result){
                data["Article1"]= result.items;
                r_ProdC.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"PCatName":"PCatName"}, order:"PCatName"},
                    function(result){
                        data["PCatName"]= result.items;
                        r_ProdG.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"PGrName":"PGrName"}, order:"PGrName"},
                            function(result){
                                data["PGrName"]= result.items;
                                r_ProdG1.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"PGrName1":"PGrName1"}, order:"PGrName1"},
                                    function(result){
                                        data["PGrName1"]= result.items;
                                        r_ProdG2.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"PGrName2":"PGrName2"}, order:"PGrName2"},
                                            function(result){
                                                data["PGrName2"]= result.items;
                                                r_ProdG3.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"PGrName3":"PGrName3"}, order:"PGrName3"},
                                                    function(result){
                                                        data["PGrName3"]= result.items;
                                                        ir_ProdColors.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"ColorName":"ColorName"}, order:"ColorName"},
                                                            function(result){
                                                                data["ColorName"]= result.items;
                                                                ir_ProdSizes.getDataItemsForTableCombobox(dbUC,{comboboxFields:{"SizeName":"SizeName"}, order:"SizeName"},
                                                                    function(result){
                                                                        data["SizeName"]= result.items;
                                                                        callback(data);
                                                                    });
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    };
    app.get("/mobile/docRec/getDataForRecDSrcPos",function(req,res){
        var conditions={};
        for(var condItem in req.query){
            var value= req.query[condItem];
            if(condItem.indexOf("docChID")==0) conditions["t_RecD.ChID="]= value;
            else if(value!="null") conditions["t_RecD."+condItem]= value;
            else conditions["t_RecD."+condItem.replace("~"," is null")]= null;
        }
        r_Prods.getAllAttrs(req.dbUC,function(data){
            t_RecD.getDataItemForTable(req.dbUC,{tableColumns:tRecDTableColumns,conditions:conditions,order:"SrcPosID"},
                function(result){ result.itemsProdAttrs= data; res.send(result); });
        });
    });
    if(!t_RecD.checkStoreProdAndCheckStoreRecD) throw new Error('NO t_RecD.checkStoreProdAndCheckStoreRecD!');//commonDocsProdsRec
    app.post("/mobile/docRec/storeProdDataToRecD",function(req,res){
        var storeData=req.body["prodData"]; storeData=storeData||{};
        storeData["ChID"]=req.body["docChID"];
        t_RecD.checkStoreProdAndCheckStoreRecD(req.dbUC,storeData,req.dbUserParams,tRecDTableColumns,function(result){ res.send(result); })
    });
    app.post("/mobile/docRec/delProdDataFromRecD",function(req,res){
        var delData=req.body["prodData"]; delData=delData||{};
        delData["ChID"]=req.body["docChID"];
        t_RecD.delTableDataItem(req.dbUC,{tableColumns:tRecDTableColumns, idFields:["ChID","SrcPosID"],delTableData:delData},
            function(result){ res.send(result); })
    });
};