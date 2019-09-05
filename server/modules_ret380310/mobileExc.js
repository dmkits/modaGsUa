var dataModel=require(appDataModelPath), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Exc= require(appDataModelPath+"t_Exc"), t_ExcD= require(appDataModelPath+"t_ExcD"),
    // r_DBIs= require(appDataModelPath+"r_DBIs"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    r_Comps= require(appDataModelPath+"r_Comps"),
    // r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Exc,t_ExcD,r_Ours,r_Stocks,r_Comps,r_States,r_Prods], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.moduleViewURL = "/mobile/pageListExcs";
module.exports.moduleViewPath = "mobile/pageListExcs.html";
module.exports.routes=[//-- App routes --
    { path: '/pageListExcs', componentUrl: '/mobile/pageListExcs', options:{clearPreviousHistory:true,ignoreCache:true}, define:true },
    { path: '/pageExcData/:excChID', componentUrl: '/mobile/pageExcData', options:{ignoreCache:true} },
    { path: '/pageSettingsExcs', componentUrl: '/mobile/pageSettingsExcs', options:{ignoreCache:true} }
];
module.exports.init = function(app){
    app.get("/mobile/pageSettingsExcs", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageSettingsExcs.html');
    });
    app.get("/mobile/pageExcData", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageExcData.html');
    });
    var tExcsListTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "DocID", name: "Номер", width: 85, type: "text", align:"right", dataSource:"t_Exc"},
        {data: "IntDocID", name: "Вн. номер", width: 85, type: "text", align:"right", dataSource:"t_Exc"},
        {data: "DocDate", name: "Дата", width: 60, type: "dateAsText",align:"center", dataSource:"t_Exc"},
        {data: "SDocDate", name: "Дата", width: 60, type: "test",align:"center", dataFunction:"CONVERT(varchar(10),DocDate,104)" },
        {data: "OurName", name: "Фирма", width: 150, type: "text",
            dataSource:"r_Ours", sourceField:"OurName", linkCondition:"r_Ours.OurID=t_Exc.OurID" },
        {data: "StockName", name: "Склад", width: 150, type: "text",
            dataSource:"r_Stocks", sourceField:"StockName", linkCondition:"r_Stocks.StockID=t_Exc.StockID" },
        {data: "NewStockName", name: "На склад", width: 150, type: "text",
            dataSource:"r_Stocks as st2", sourceField:"StockName", linkCondition:"st2.StockID=t_Exc.NewStockID" },
        {data: "CurrID", name: "Код валюты", width: 50, type: "text", align:"center", visible:false, dataSource:"t_Exc", sourceField:"CurrID"},
        {data: "CurrName", name: "Валюта", width: 70, type: "text", align:"center", visible:false,
            dataSource:"r_Currs", sourceField:"CurrName", linkCondition:"r_Currs.CurrID=t_Exc.CurrID" },
        {data: "Qty", name: "Кол-во", width: 75, type: "numeric",
            childDataSource:"t_ExcD", childLinkField:"ChID", parentLinkField:"ChID",
            dataFunction:{function:"sumIsNull", source:"t_ExcD", sourceField:"Qty"} },
        // {data: "TNewQty", name: "Факт кол-во", width: 75, type: "numeric",
        //     childDataSource:"t_VenA", childLinkField:"ChID", parentLinkField:"ChID",
        //     dataFunction:{function:"sumIsNull", source:"t_VenA", sourceField:"TNewQty"} },
        // {data: "TVenQty", name: "Инвент. кол-во", width: 75, type: "numeric",
        //     childDataSource:"t_VenA", childLinkField:"ChID", parentLinkField:"ChID",
        //     dataFunction:{function:"sumIsNull", source:"t_VenA", sourceField:"TNewQty-TQty"} },
        {data: "TSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Exc" },
        // {data: "TNewSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Ven" },
        {data: "StateCode", name: "StateCode", width: 50, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "IsStateCreated", name: "Создан", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (0,55) Then 1 Else 0 END" },
        {data: "IsStateOnConfirmation", name: "На подтверждении", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (50,56,60) Then 1 Else 0 END" },
        {data: "IsStateReturned", name: "Возвращен", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (52,58,62) Then 1 Else 0 END" },
        {data: "IsStateClosedOrConfirmed", name: "Закрыт/Подтвержден", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (145,51,57,61) Then 1 Else 0 END" },
        {data: "StateName", name: "Статус", width: 250, type: "text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Exc.StateCode" },
        {data: "StateInfo", name: "Информация статуса", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode not in (50,56,60) Then 'Изменение запрещено' Else 'Изменение разрешено' END" }
    ];
    app.get("/mobile/exc/getDataForExcsList", function(req,res){
        var conditions={}, top="";
        for(var condItem in req.query){
            if(condItem=="top")top="top "+req.query[condItem];
            else if(condItem&&condItem.indexOf("StockID")==0){
                var sCond=condItem.replace("StockID","").replace("~","=")+req.query[condItem];
                sCond=sCond.replace("=-1",">0");
                conditions["(t_Exc.StockID"+sCond+" or t_Exc.NewStockID"+sCond+")"]=null;
            }else conditions["t_Exc."+condItem]=req.query[condItem];
        }
        conditions["t_Exc.StateCode in (50,56,60)"]=null;
        r_Stocks.getDataItems(req.dbUC,{fields:['StockID','StockName'], conditions:{"StockID>":0}, order:"StockName"},
            function(result){
                var error=(result.error)?result.error:'',listStocks=(result)?result.items:null;
                if(listStocks)listStocks=[{StockID:-1, StockName:'Все склады'}].concat(listStocks);
                t_Exc.getDataItemsForTable(req.dbUC,{tableColumns:tExcsListTableColumns, conditions:conditions,
                        order:"DocDate desc, DocID desc", top:top},
                    function(result){
                        error+=(result.error)?result.error:'';
                        var outData={listStocks:listStocks,listExcsByStockID:(result)?result.items:null};
                        if(error!='')outData.error=error;
                        res.send(outData);
                    });
            });
    });
    var tExcDTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"t_ExcD", identifier:true, readOnly:true, visible:false},
        {data: "SrcPosID", name: "№ п/п", width: 45, type: "numeric", dataSource:"t_ExcD", identifier:true },
        {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"t_ExcD", visible:true},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_ExcD", visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"t_ExcD", sourceField:"UM"},
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "PPID", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "SecID", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "NewSecID", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "NewQty", name: "Нов кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "PriceCC_nt", name: "Цена без НДС", width: 65, type: "numeric2", dataSource:"t_ExcD"},
        {data: "Tax", name: "НДС Цены", width: 65, type: "numeric2", dataSource:"t_ExcD"},
        {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_ExcD"},
        {data: "SumCC_nt", name: "Сумма без НДС", width: 75, type: "numeric2", dataSource:"t_ExcD"},
        {data: "TaxSum", name: "НДС", width: 75, type: "numeric2", dataSource:"t_ExcD"},
        {data: "SumCC_wt", name: "Сумма", width: 75, type: "numeric2", dataSource:"t_ExcD"},
        {data: "NewSumCC_wt", name: "Факт. сумма", width: 75, type: "numeric2", dataFunction:"NewQty*PriceCC_wt"}
        //{data: "Extra", name: "% наценки", width: 55, type: "numeric", format:"#,###,###,##0.00", dataSource:"t_ExcD"},
        //{data: "PriceCC", name: "Цена продажи", width: 65, type: "numeric2", dataSource:"t_ExcD"}
        //{data: "PRICELIST_PRICE", name: "Цена по прайс-листу", width: 75, type: "numeric2"},
    ];
    app.get("/mobile/exc/getDataForExcDTable", function(req,res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_ExcD.ChID="]=req.query[condItem];
            else conditions["t_ExcD."+condItem]=req.query[condItem];
        t_ExcD.getDataItemsForTable(req.dbUC,{tableColumns:tExcDTableColumns, conditions:conditions, order:"SrcPosID"},
            function(result){
                res.send(result);
            });
    });
     /**
      * prodData = { ProdID, UM, Barcode, TNewQty }
      */
     t_ExcD.storeExcDProdData= function(dbUC,parentChID,excDProdData,newQty,resultCallback){
         if(!("ProdID" in excDProdData)&&!("SrcPosID" in excDProdData)){
             resultCallback({error:"Failed find prod in t_ExcD!<br> No ProdID or SrcPosID!",
                 userMessage:"Не удалось найти товар в перемещении!<br> В данных нет кода товара или позиции товара!"});
             return;
         }
         var conditions={"ChID=":parentChID};
         if("ProdID" in excDProdData)conditions["ProdID="]=excDProdData["ProdID"];
         if("SrcPosID" in excDProdData)conditions["SrcPosID="]=excDProdData["SrcPosID"];
         t_ExcD.getDataItem(dbUC,{conditions:conditions,
                 fields:["SrcPosID","Barcode","ProdID","UM","Qty","PPID","SecID","NewSecID","NewQty",
                     "PriceCC_nt","Tax","PriceCC_wt","SumCC_nt","TaxSum","SumCC_wt"]},
             function(result){
                 if(result.error){
                     resultCallback({error:"Failed find prod in t_ExcD!<br>"+result.error,
                         userMessage:"Не удалось найти товар в перемещении!<br>"+result.error});
                     return;
                 }
                 var storeData=result.item;
                 if(!storeData){//insert
                     storeData=excDProdData;
                     if(!("ProdID" in storeData)){
                         resultCallback({error:"Failed get prod data for insert into t_ExcD!",
                             userMessage:"Не удалось получить данные товара для добавления в перемещение!"});
                         return;
                     }
                     storeData["Barcode"]=excDProdData["Barcode"];
                     storeData["SecID"]=excDProdData["SecID"];storeData["NewSecID"]=excDProdData["NewSecID"];
                     storeData["Qty"]=0;storeData["NewQty"]=1;storeData["PPID"]=0;
                     storeData["PriceCC_nt"]=0;storeData["Tax"]=0;storeData["PriceCC_wt"]=0;
                     storeData["SumCC_nt"]=0;storeData["TaxSum"]=0;storeData["SumCC_wt"]=0;
                     //storeData["TNewSumCC_nt"]=0;storeData["TNewTaxSum"]=0;storeData["TNewSumCC_wt"]=0;
                     //storeData["Norma1"]=0;storeData["HandCorrected"]=0;
                 }else{//update by TSrcPosID
                     if(newQty===undefined)storeData["NewQty"]++; else storeData["NewQty"]=newQty;
                 }
                 storeData["ChID"]=parentChID;
                 t_ExcD.storeTableDataItem(dbUC,{tableColumns:tExcDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
                         calcNewIDValue: function(params, callback){
                             t_ExcD.getDataItem(dbUC,{fields:["maxSrcPosID"],
                                     fieldsFunctions:{maxSrcPosID:{function:"maxPlus1",sourceField:"SrcPosID"}},conditions:{"ChID=":parentChID}},
                                 function(result){
                                     if(result.error){
                                         resultCallback({error:"Failed calc new SrcPosID by prod in t_ExcD!<br>"+result.error,
                                             userMessage:"Не удалось вычислить новый номер позиции для товара в перемещении!<br>"+result.error});
                                         return;
                                     }
                                     if(!result.item)params.storeTableData["SrcPosID"]=1;else params.storeTableData["SrcPosID"]=result.item["maxSrcPosID"];
                                     callback(params);
                                 });

                         }},
                     function(result){
                         if(result.error){
                             if(result.error.indexOf("Cannot insert duplicate key row in object 'dbo.t_ExcD' with unique index 'NoDuplicate'")>=0)
                                 result.userMessage="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером.";
                             else
                                 result.userMessage="Ну удалось сохранить товар в перемещение!<br>"+result.error;
                         }
                         resultCallback(result);
                     });
         });

         //resultCallback(result);
     };
     app.post("/mobile/exc/storeProdDataByCRUniInput", function(req,res){
         var storingData=req.body, value=(storingData)?storingData["value"]:null, parentChID=storingData["parentChID"];  console.log('/mobile/exc/storeProdDataByCRUniInput req.body',req.body);
         r_Prods.findProdByCRUniInput(req.dbUC,value,function(resultFindProd){
             if(resultFindProd.error){
                 res.send({error:{error:resultFindProd.error,userMessage:resultFindProd.errorMessage}});
                 return;
             }
             resultFindProd.prodData["SecID"]=req.dbUserParams["t_SecID"];resultFindProd.prodData["NewSecID"]=req.dbUserParams["t_SecID"];
             t_ExcD.storeExcDProdData(req.dbUC,parentChID,resultFindProd.prodData,storingData["NewQty"],function (result){
                 res.send(result);
             })
         });
     });
     app.post("/mobile/exc/storeNewQtyData", function(req,res){
         var storingData=req.body, parentChID=storingData["parentChID"],excDData={SrcPosID:storingData["SrcPosID"]};   console.log('/mobile/exc/storeNewQtyData req.body',req.body);
         t_ExcD.storeExcDProdData(req.dbUC,parentChID,excDData,storingData["NewQty"],function (result){
             res.send(result);
         });
     });
};