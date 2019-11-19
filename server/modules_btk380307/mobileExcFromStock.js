var dataModel=require(appDataModelPath), database= require("../databaseMSSQL"), common= require("../common"),
    dateFormat = require('dateformat');
var t_Exc= require(appDataModelPath+"t_Exc"), t_ExcD= require(appDataModelPath+"t_ExcD"),
    r_Ours= require(appDataModelPath+"r_Ours"), r_Stocks= require(appDataModelPath+"r_Stocks"),
    ir_EmpStockForExc= require(appDataModelPath+"ir_EmpStockForExc"),
    r_Comps= require(appDataModelPath+"r_Comps"),
    r_Currs= require(appDataModelPath+"r_Currs"),
    r_States= require(appDataModelPath+"r_States"),
    r_Prods=require(appDataModelPath+"r_Prods");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([t_Exc,t_ExcD,r_Ours,r_Stocks,ir_EmpStockForExc,r_Comps,r_Currs,r_States,r_Prods], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.routes=[//-- App routes --
    { path: '/pageExcFromStock', componentUrl: '/mobile/pageExcFromStockList', options:{clearPreviousHistory:true,ignoreCache:true}, define:true },
    { path: '/pageExcFromStockProducts/:excChID', componentUrl: '/mobile/pageExcFromStockProducts', options:{ignoreCache:true} },
    { path: '/pageExcFromStockSettings', componentUrl: '/mobile/pageExcFromStockSettings', options:{ignoreCache:true} }
];
module.exports.moduleViewURL = "/mobile/pageExcFromStockList";
module.exports.moduleViewPath = "mobile/pageExcFromStockList.html";
module.exports.init = function(app){
    app.get("/mobile/pageExcFromStockSettings", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageExcFromStockSettings.html');
    });
    app.get("/mobile/pageExcFromStockProducts", function(req,res){
        res.sendFile(appViewsPath+'mobile/pageExcFromStockProducts.html');
    });
    var tExcFromStockListTableColumns=[
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
        {data: "TSumCC_wt", name: "Сумма", width: 85, type: "numeric2", dataSource:"t_Exc" },
        {data: "StockEmpID", name: "StockEmpID", width: 80, type: "text",
            dataSource:"ir_EmpStockForExc", sourceField:"EmpID", linkCondition:"ir_EmpStockForExc.StockID=t_Exc.StockID" },
        {data: "StateCode", name: "StateCode", width: 50, type: "text", readOnly:true, visible:false, dataSource:"t_Exc"},
        {data: "IsStateCreated", name: "Создан", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (0) Then 1 Else 0 END" },
        {data: "IsStateOnConfirmation", name: "На подтверждении", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (50,60) Then 1 Else 0 END" },
        {data: "IsStateReturned", name: "Возвращен", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (52,62) Then 1 Else 0 END" },
        {data: "IsStateClosedOrConfirmed", name: "Закрыт/Подтвержден", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode in (145,51,61) Then 1 Else 0 END" },
        {data: "StateName", name: "Статус", width: 250, type: "text",
            dataSource:"r_States", sourceField:"StateName", linkCondition:"r_States.StateCode=t_Exc.StateCode" },
        {data: "StateInfo", name: "Информация статуса", width: 50, type: "text", readOnly:true, visible:false,
            dataFunction:"CASE When t_Exc.StateCode not in (0,52,60,62) Then 'Изменение запрещено' Else 'Изменение разрешено' END" }
    ];
    app.get("/mobile/excFromStock/getDataForExcList", function(req,res){
        var conditions={}, top="";
        for(var condItem in req.query){
            if(condItem=="top")top="top "+req.query[condItem];
            else if(condItem&&condItem.indexOf("StockID")==0){
                var sCond=condItem.replace("StockID","").replace("~","=")+req.query[condItem];
                sCond=sCond.replace("=-1",">0");
                conditions["(t_Exc.StockID"+sCond+" or t_Exc.NewStockID"+sCond+")"]=null;
            }else conditions["t_Exc."+condItem]=req.query[condItem];
        }
        conditions["ir_EmpStockForExc.EmpID="]=req.dbUserParams["EmpID"];
        conditions["t_Exc.StateCode in (0,50,52,60,62)"]=null;
        r_Stocks.getDataItems(req.dbUC,{fields:['StockID','StockName'], conditions:{"StockID>":0}, order:"StockName"},
            function(result){
                var error=(result.error)?result.error:'',listStocks=(result)?result.items:null;
                if(listStocks)listStocks=[{StockID:-1, StockName:'Все склады'}].concat(listStocks);
                t_Exc.getDataItemsForTable(req.dbUC,{tableColumns:tExcFromStockListTableColumns, conditions:conditions,
                        order:"DocDate desc, DocID desc", top:top},
                    function(result){
                        error+=(result.error)?result.error:'';
                        var outData={listStocks:listStocks,listExcsByStockID:(result)?result.items:null};
                        if(error!='')outData.error=error;
                        res.send(outData);
                    });
            });
    });
    var tExcFromStockProductsTableColumns=[
        {data: "ChID", name: "ChID", width: 85, type: "text", dataSource:"t_ExcD", identifier:true, readOnly:true, visible:false},
        {data: "SrcPosID", name: "№ п/п", width: 45, type: "numeric", dataSource:"t_ExcD", identifier:true },
        {data: "ProdID", name: "Код товара", width: 50, type: "text", dataSource:"t_ExcD", visible:true},
        {data: "Barcode", name: "Штрихкод", width: 75, type: "text", dataSource:"t_ExcD", visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text",
            dataSource:"r_Prods", sourceField:"ProdName", linkCondition:"r_Prods.ProdID=t_ExcD.ProdID" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center", dataSource:"t_ExcD", sourceField:"UM"},
        {data: "Qty", name: "Кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "PPID", name: "Партия", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "SecID", name: "Секция", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "NewSecID", name: "Нов.секция", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "NewSecName", name: "Статус товара", width: 80, type: "text", readOnly:true, visible:false,
            dataSource:"r_Secs", sourceField:"SecName", linkCondition:"r_Secs.SecID=t_ExcD.NewSecID" },
        {data: "NewQty", name: "Нов кол-во", width: 50, type: "numeric", dataSource:"t_ExcD"},
        {data: "PriceCC_nt", name: "Цена без НДС", width: 65, type: "numeric2", dataSource:"t_ExcD"},
        {data: "Tax", name: "НДС Цены", width: 65, type: "numeric2", dataSource:"t_ExcD"},
        {data: "PriceCC_wt", name: "Цена", width: 65, type: "numeric2", dataSource:"t_ExcD"},
        {data: "SumCC_nt", name: "Сумма без НДС", width: 75, type: "numeric2", dataSource:"t_ExcD"},
        {data: "TaxSum", name: "НДС", width: 75, type: "numeric2", dataSource:"t_ExcD"},
        {data: "SumCC_wt", name: "Сумма", width: 75, type: "numeric2", dataSource:"t_ExcD"}
    ];
    app.get("/mobile/excFromStock/getDataForExcDTable", function(req,res){
        var conditions={};
        for(var condItem in req.query)
            if(condItem.indexOf("ParentChID")==0) conditions["t_ExcD.ChID="]=req.query[condItem];
            else conditions["t_ExcD."+condItem]=req.query[condItem];
        t_ExcD.getDataItemsForTable(req.dbUC,{tableColumns:tExcFromStockProductsTableColumns, conditions:conditions, order:"SrcPosID"},
            function(result){
                res.send(result);
            });
    });

    /**
     * resultCallback = function(result), result.resultItem= { "OurID","StockID","KursMC","CurrID","DocDate", "PLID" }
     */
    t_ExcD.getExcData= function(dbUC,excChID,resultCallback){
        t_Exc.getDataItem(dbUC,{fields:["OurID","StockID","KursMC","CurrID","DocDate"],conditions:{"ChID=":excChID}},
            function(result){
                if(result.error||!result.item){
                    resultCallback({error:"Failed get exc data! Reason: "+(result.error||"No data!"),
                        errorMessage:"Не удалось получить данные из заголовка перемещения (Склад, Курс ОВ, Валюта)!"});
                    return;
                }
                var excData=result.item;
                r_Stocks.getDataItem(dbUC,{fields:["PLID"],conditions:{"StockID=":excData["StockID"]}},
                    function(resultStockData){
                        if(resultStockData.error||!resultStockData.item){
                            resultCallback({error:"Failed get stock data! Reason: "+(resultStockData.error||"No data!"),
                                errorMessage:"Не удалось получить данные из склада (Прайс-лист)!"});
                            return;
                        }
                        excData["PLID"]= resultStockData.item["PLID"];
                        resultCallback({resultItem:excData});
                    })
            })
    };
    /**
     * params = { DocCode, OurID, StockID, SecD, ProdID }
     * resultCallback = function(result), result.resultItem= { MaxPPQty, MaxQty, PPID, AutoPPProdID, PPField, QtyField, SetQty, Msg }
     */
    t_ExcD.getProdRemPPData= function(dbUC,params,resultCallback){
        /* exec dbo.t_GetProdDetail @DocCode, @OurID, @StockID, @SecD, @ProdID, @IgnorePPList,
            @MaxPPQty output,@MaxQty output,@PPID output,@AutoPPProdID output,@PPField output,@QtyField output,@SetQty output,@Msg output */
        /*set @PPID=0
         --exec dbo.t_GetProdDetail 11021, :OurID, :StockID, 1, @ProdID,'', @MaxPPQty output,@MaxQty output,@PPID output,@AutoPPProdID output,@PPField output,@QtyField output,@SetQty output,@Msg output
         --select MaxPPQty=@MaxPPQty, MaxQty=@MaxQty, PPID=@PPID, AutoPPProdID=@AutoPPProdID, PPField=@PPField, QtyField=@QtyField, SetQty=@SetQty, Msg=@Msg
         if(@MaxPPQty>0) and (@Qty>@MaxPPQty) begin
            set @InsPPQty=@MaxPPQty
            set @InsFactQty=@MaxPPQty
         end else begin
            set @InsPPQty=@Qty
            set @InsFactQty=@FactQty
         end*/
        var qParams=[];
        qParams.push(params["DocCode"]); qParams.push(params["OurID"]); qParams.push(params["StockID"]); qParams.push(params["SecD"]);
        qParams.push(params["ProdID"]);
        database.selectParamsQuery(dbUC,
            "declare @MaxPPQty numeric(21, 9), @MaxQty numeric(21, 9), @PPID int, @AutoPPProdID int,\n"+
            "   @PPField int, @QtyField numeric (21, 9), @SetQty bit, @Msg varchar(200)\n"+
            "exec dbo.t_GetProdDetail @p0, @p1, @p2, @p3, @p4, '0', \n"+/*IgnorePPList='0'*/
            "   @MaxPPQty output,@MaxQty output,@PPID output,@AutoPPProdID output,@PPField output,@QtyField output,@SetQty output,@Msg output\n"+
            "select MaxPPQty=@MaxPPQty, MaxQty=@MaxQty, PPID=@PPID, AutoPPProdID=@AutoPPProdID, PPField=@PPField, QtyField=@QtyField, SetQty=@SetQty, Msg=@Msg",
            qParams,
            function(err,rs){
                if(err){
                    resultCallback({error:err.message, errorMessage:"Не удалось получить данные парии для списания товара!"});
                    return;
                }
                if(!rs||rs.length==0||rs[0]["PPID"]==null){
                    resultCallback({error:"No data result by call t_GetProdDetail!", errorMessage:"Нет данных парии для списания товара!"});
                    return;
                }
                resultCallback({resultItem:rs[0]});
            });
    };
    /**
     * params = { DocCode, ChID, ProdID, PPID, RateMC, Discount, PLID }
     * callback = function(result), result.resultItem= { "PriceCC" }
     */
    t_ExcD.getExcDPrice=function(dbUC,params,callback){
        /*--Возвращает цену для указанного документа--
         ALTER PROCEDURE [dbo].[t_GetPriceCC] @DocCode int, @ChID int, @ProdID int, @PPID int, @RateMC numeric(21,9), @Discount numeric(21,9), @PLID int, @Result numeric(21,9) OUTPUT */
        var qParams=[];
        qParams.push(params["DocCode"]); qParams.push(params["ChID"]); qParams.push(params["ProdID"]);
        qParams.push(params["PPID"]); qParams.push(params["RateMC"]); qParams.push(params["Discount"]); qParams.push(params["PLID"]);
        database.selectParamsQuery(dbUC,
            "declare @Result numeric(21,9)\n"+
            "exec dbo.t_GetPriceCC @p0, @p1, @p2, @p3, @p4, @p5, @p6, @Result OUTPUT\n"+
            "select PriceCC=@Result",qParams,
            function(err,rs){
                if(err){
                    callback({error:err.message, errorMessage:"Не удалось получить цену товара для документа!"});
                    return;
                }
                if(!rs||rs.length==0){
                    callback({error:"No data result by call t_GetPriceCC!", errorMessage:"Нет данных цены товара для документа!"});
                    return;
                }
                callback({resultItem:rs[0]});
            });
    };
    /**
     * params = { Price, ProdID, DocDate }
     * callback = function(result), result.resultItem= { "Tax" }
     */
    t_ExcD.calcProdTaxByPriceCCwt=function(dbUC,docDProdData,params,resultCallback){
        /*--Возвращает НДС цены для товара (от суммы с НДС)--
         ALTER FUNCTION dbo.zf_GetProdPrice_wtTax(@Price numeric(19, 9), @ProdID int, @DocDate smalldatetime)*/
        if(!params) params={};
        var priceCCwt= docDProdData["PriceCC_wt"], prodID= docDProdData["ProdID"];
        if(priceCCwt!=null) params["Price"]= priceCCwt;
        if(prodID!=null) params["ProdID"]= prodID;
        var qParams=[];
        qParams.push(params["Price"]); qParams.push(params["ProdID"]); qParams.push(params["DocDate"]);
        database.selectParamsQuery(dbUC, "select Tax=dbo.zf_GetProdPrice_wtTax(@p0,@p1,@p2)",qParams, function(err,rs){
            if(err){
                resultCallback({error:err.message, errorMessage:"Не удалось получить данные налога для документа!"});
                return;
            }
            if(!rs||rs.length==0){
                resultCallback({error:"No data result by call zf_GetProdPrice_wtTax!", errorMessage:"Нет данных налога для документа!"});
                return;
            }
            var tax= rs[0]["Tax"];
            if(tax!=null&&priceCCwt!=null){
                docDProdData["Tax"]= tax; docDProdData["PriceCC_nt"]= priceCCwt-tax;
                var qty= docDProdData["Qty"], sumCCwt= docDProdData["SumCC_wt"];
                if(qty!=null&&sumCCwt!=null){
                    docDProdData["TaxSum"]= tax*qty; docDProdData["SumCC_nt"]= sumCCwt-tax*qty;
                }
            }
            resultCallback({resultItem:{"Tax":tax}});
        });
    };
    /**
     * excDProdData = { SrcPosID, ProdID, UM, Barcode, Qty },
     * params = { KursMC,PLID,DocDate }
     * resultCallback(result={ updateCount, resultItem, error={...} }), resultItem=<storeTableDataItem>
     */
    t_ExcD.storeExcDProdData= function(dbUC,excChID,excDProdData,params,resultCallback){
        var getExcDPriceParams={"DocCode":11021, "ChID":excChID, "ProdID":excDProdData["ProdID"],
            "PPID":excDProdData["PPID"], "RateMC":params["KursMC"], "Discount":0.0, "PLID":params["PLID"] };
        t_ExcD.getExcDPrice(dbUC,getExcDPriceParams,function(resultGetExcDPrice){
            if(resultGetExcDPrice.error){
                resultCallback({error:"Failed get PriceCC for new position! Reason:"+resultGetExcDPrice.error,
                    errorMessage:"Не удалось получить цену для новой позиции!"});
                return;
            }
            var priceCC= resultGetExcDPrice.resultItem["PriceCC"];
            excDProdData["PriceCC_wt"]= priceCC; excDProdData["SumCC_wt"]= excDProdData["Qty"]*priceCC;
            t_ExcD.calcProdTaxByPriceCCwt(dbUC,excDProdData,params,function(resultCalcProdTaxByPriceCCwt){
                if(resultCalcProdTaxByPriceCCwt.error){
                    resultCallback({error:"Failed get Tax for new position! Reason:"+resultCalcProdTaxByPriceCCwt.error,
                        errorMessage:"Не удалось получить налог для новой позиции!"});
                    return;
                }
                excDProdData["ChID"]=excChID;
                t_ExcD.storeTableDataItem(dbUC,{tableColumns:tExcFromStockProductsTableColumns, idFields:["ChID","SrcPosID"],storeTableData:excDProdData,
                        calcNewIDValue: function(params, callback){
                            t_ExcD.getDataItem(dbUC,{fields:["maxSrcPosID"],
                                    fieldsFunctions:{maxSrcPosID:{function:"maxPlus1",sourceField:"SrcPosID"}},conditions:{"ChID=":excChID}},
                                function(result){
                                    if(result.error){
                                        resultCallback({error:"Failed calc new SrcPosID by prod in t_ExcD!<br>"+result.error,
                                            errorMessage:"Не удалось вычислить новый номер позиции для товара в перемещении!<br>"+result.error});
                                        return;
                                    }
                                    if(!result.item)params.storeTableData["SrcPosID"]=1;else params.storeTableData["SrcPosID"]=result.item["maxSrcPosID"];
                                    callback(params);
                                });
                        }},
                    function(result){
                        if(result.error){
                            if(result.error.error&&result.error.error.indexOf("Cannot insert duplicate key row in object 'dbo.t_ExcD' with unique index 'NoDuplicate'")>=0)
                                result.errorMessage="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером.";
                            else
                                result.errorMessage="Не удалось сохранить товар в перемещение!<br>"+result.error.message;
                        }
                        resultCallback(result);
                    });
            });
        });
    };
    /**
      * excDProdData = { ProdID, UM, Barcode, Qty }
      */
     t_ExcD.findAndStoreProdInExcD= function(dbUC,excChID,excDProdData,qty,resultCallback){
         if(!("ProdID" in excDProdData)&&!("SrcPosID" in excDProdData)){
             resultCallback({error:"Failed find prod in t_ExcD!<br> No ProdID or SrcPosID!",
                 errorMessage:"Не удалось найти товар в перемещении!<br> В данных нет кода товара или позиции товара!"});
             return;
         }
         var conditions={"ChID=":excChID}, prodID= excDProdData["ProdID"];
         if("ProdID" in excDProdData)conditions["ProdID="]=prodID;
         if("SrcPosID" in excDProdData)conditions["SrcPosID="]=excDProdData["SrcPosID"];
         t_ExcD.getDataItems(dbUC,{conditions:conditions,
                 fields:["SrcPosID","Barcode","ProdID","UM","Qty","PPID","SecID","NewSecID","NewQty",
                     "PriceCC_nt","Tax","PriceCC_wt","SumCC_nt","TaxSum","SumCC_wt"],
                 order:"SrcPosID desc" },
             function(result){
                 if(result.error){
                     resultCallback({error:"Failed find prod in t_ExcD!<br>"+result.error.error,
                         errorMessage:"Не удалось найти товар в перемещении!<br>"+result.error.message});
                     return;
                 }
                 t_ExcD.getExcData(dbUC,excChID,function(resultGetExcData){
                     if(resultGetExcData.error){
                         resultCallback({error:"Failed store new position in ExcD! Reason: "+resultGetExcData.error,
                             errorMessage:"Не удалось добавить новую позицию в перемещение! Причина: "+resultGetExcData.errorMessage});
                         return;
                     }
                     var storeExcDProdDataParams= {
                         "KursMC":resultGetExcData.resultItem["KursMC"], "PLID":resultGetExcData.resultItem["PLID"],
                         "DocDate":resultGetExcData.resultItem["DocDate"]
                     };
                     var storeData=result.items[0];
                     if(!storeData){//insert
                         storeData=excDProdData;
                         if(!("ProdID" in storeData)){
                             resultCallback({error:"Failed get prod data for insert into t_ExcD!",
                                 errorMessage:"Не удалось получить данные товара для добавления в перемещение!"});
                             return;
                         }
                         storeData["Qty"]=1; storeData["NewQty"]=0; storeData["PPID"]=0;
                         storeData["PriceCC_nt"]=0; storeData["Tax"]=0; storeData["PriceCC_wt"]=0;
                         storeData["SumCC_nt"]=0; storeData["TaxSum"]=0; storeData["SumCC_wt"]=0;
                         var getProdRemPPDataParams= { "DocCode":11021,
                             "OurID":resultGetExcData.resultItem["OurID"], "StockID":resultGetExcData.resultItem["StockID"],
                             "SecD":excDProdData["SecID"], "ProdID":prodID };
                         t_ExcD.getProdRemPPData(dbUC,getProdRemPPDataParams,function(resultGetProdRemPPData){
                             if(resultGetProdRemPPData.error){
                                 resultCallback({error:"Failed store new position in ExcD! Reason: "+resultGetProdRemPPData.error,
                                     errorMessage:"Не удалось добавить новую позицию в перемещение! Причина: "+resultGetProdRemPPData.errorMessage});
                                 return;
                             }
                             excDProdData["PPID"]= resultGetProdRemPPData.resultItem["PPID"];
                             t_ExcD.storeExcDProdData(dbUC,excChID,excDProdData,storeExcDProdDataParams, function(resultStoreExcDProdData){
                                 resultCallback(resultStoreExcDProdData);
                             });
                         });
                         return;
                     }
                     //update exists position Qty by SrcPosID
                     if(qty===undefined)storeData["Qty"]++; else storeData["Qty"]=qty;
                     t_ExcD.storeExcDProdData(dbUC,excChID,storeData, storeExcDProdDataParams, function(resultStoreExcDProdData){
                         resultCallback(resultStoreExcDProdData);
                     });
                 });
         });
     };
     app.post("/mobile/excFromStock/storeProdDataByCRUniInput", function(req,res){
         var storingData=req.body, value=(storingData)?storingData["value"]:null, parentChID=storingData["parentChID"];
         r_Prods.findProdByCRUniInput(req.dbUC,value,function(resultFindProd){
             if(resultFindProd.error){
                 res.send({error:{error:resultFindProd.error,userMessage:resultFindProd.errorMessage}});
                 return;
             }
             resultFindProd.prodData["SecID"]=req.dbUserParams["t_SecID"];resultFindProd.prodData["NewSecID"]=req.dbUserParams["t_SecID"];
             t_ExcD.findAndStoreProdInExcD(req.dbUC,parentChID,resultFindProd.prodData,storingData["Qty"],function (result){
                 res.send(result);
             })
         });
     });
     app.post("/mobile/excFromStock/storeQtyData", function(req,res){
         var storingData=req.body, parentChID=storingData["parentChID"],excDData={SrcPosID:storingData["SrcPosID"]};   console.log('/mobile/exc/storeNewQtyData req.body',req.body);
         t_ExcD.findAndStoreProdInExcD(req.dbUC,parentChID,excDData,storingData["Qty"],function (result){
             res.send(result);
         });
     });
};