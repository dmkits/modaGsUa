var dataModel= require(appDataModelPath), database= require("../databaseMSSQL");
var r_Prods= require(appDataModelPath+"r_Prods"),
    r_ProdC= require(appDataModelPath+"r_ProdC"), r_ProdG= require(appDataModelPath+"r_ProdG"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3"),
    ir_ProdColors= require(appDataModelPath+"ir_ProdColors"), ir_ProdSizes= require(appDataModelPath+"ir_ProdSizes"),
    r_ProdMQ= require(appDataModelPath+"r_ProdMQ"), t_PInP= require(appDataModelPath+"t_PInP"),
    r_DBIs= require(appDataModelPath+"r_DBIs"),
    t_Rec= require(appDataModelPath+"t_Rec"), t_RecD= require(appDataModelPath+"t_RecD"),
    systemFuncs= require("../systemFuncs");
module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels(
        [r_Prods,r_ProdC,r_ProdG,r_ProdG1,r_ProdG2,r_ProdG3,ir_ProdColors,ir_ProdSizes, r_ProdMQ, t_PInP, r_DBIs, t_Rec,t_RecD],
        errs, function(){ nextValidateModuleCallback(); });
};

module.exports.init= function(app){

    /**
     * callback = function(error, prodData), error = {error,errorMessage}
     */
    r_Prods.getNewProdNameByAttrs= function(dbUC,prodData,callback){
        //if_GetProdNameByMaskValues(ProdID, PCatName,PGrName1,PGrName3,PGrSName3,Article1,Article2,Article3, ColorName,ColorSName, SizeName,ValidSizes, Growth)
        database.selectParamsQuery(dbUC,
            "select ProdName= LTRIM(RTRIM( dbo.if_GetProdNameByMaskValues(@p0, @p1,@p2,@p3,@p4, @p5,@p6,@p7, @p8,@p9, @p10,@p11, @p12) ))",
            [prodData["ProdID"], prodData["PCatName"],prodData["PGrName1"],prodData["PGrName3"],prodData["PGrSName3"],
                prodData["Article1"],prodData["Article2"],prodData["Article3"],
                prodData["ColorName"],prodData["ColorSName"], prodData["SizeName"],prodData["ValidSizes"], prodData["Growth"]],
            function(err, recordset, rowsCount, fieldsTypes){
                if(err){ callback({error:err.message}); return; }
                if(recordset&&recordset.length>0)prodData["ProdName"]=recordset[0]["ProdName"];
                callback(null,prodData);
            });
    };
    if(!r_Prods.getProdDataWithAttrsByArticle1) throw new Error('NO r_Prods.getProdDataWithAttrsByArticle1!');//commonDirsForProds
    r_Prods.getProdAttrsAndNameByArticle1= function(dbUC,prodData,dbUserParams,callback){
        var prodArticle1= prodData["Article1"], sendResult={};
        if(prodArticle1==null||prodArticle1.trim()===""){
            r_Prods.getNewProdNameByAttrs(dbUC,prodData,function(err,prodNameData){
                if(prodNameData) sendResult.itemProdName={"ProdName":prodNameData["ProdName"],"UM":dbUserParams["DefaultUM"]};
                if(err)sendResult.errorProdName=err;
                callback(sendResult);
            });
            return;
        }
        r_Prods.getProdDataWithAttrsByArticle1(dbUC,prodData,function(resultProdDataWithAttrs){
            var prodDataWithAttrs=(resultProdDataWithAttrs&&resultProdDataWithAttrs.item)?resultProdDataWithAttrs.item:null;
                for(var fieldName in prodDataWithAttrs) prodData[fieldName]=prodDataWithAttrs[fieldName];
            if(prodDataWithAttrs) sendResult.item= prodDataWithAttrs;
            if(resultProdDataWithAttrs.error) sendResult.error= resultProdDataWithAttrs.error;
            r_Prods.getNewProdNameByAttrs(dbUC,prodData,function(err,prodNameData){
                if(prodNameData) sendResult.itemProdName= {"ProdName":prodNameData["ProdName"],"UM":dbUserParams["DefaultUM"]};
                if(err)sendResult.errorProdName=err;
                callback(sendResult);
            });
        });
    };
    t_Rec.getProdLastRecDataByArticle1= function(dbUC,prodData,callback){
        var prodArticle1= prodData["Article1"];
        t_Rec.getDataItem(dbUC,
            {"fields":["t_RecD.PriceCC_wt,t_RecD.Extra,t_RecD.PriceCC"],
                joinedSources:{"t_RecD":"t_RecD.ChID=t_Rec.ChID","r_Prods":"r_Prods.ProdID=t_RecD.ProdID"},
                conditions:{"r_Prods.Article1=":prodArticle1},
                order:"t_Rec.DocDate desc,t_Rec.DocID desc,t_RecD.SrcPosID desc", top:"Top 1"},
            function(result){ callback(result.item); });
    };
    app.get("/docsProdsRec/getProdAttrsAndNameByArticle1",function(req,res){
        r_Prods.getProdAttrsAndNameByArticle1(req.dbUC,req.query,req.dbUserParams,function(result){
            t_Rec.getProdLastRecDataByArticle1(req.dbUC,req.query,function(resultProdLastRecData){
                result= result||{};
                result.itemProdLastRecPrice= resultProdLastRecData||null;
                res.send(result);
            });
        });
    });
    //app.get("/dirsProds/getProdNameByAttrs",function(req,res){
    //    var conditions={}, prodData=req.query;
    //    r_Prods.getNewProdNameByAttrs(req.dbUC,
    //        {"Article1":prodData["ProdArticle1"],
    //            "PCatName":prodData["PCatName"],"PGrName":prodData["PGrName"],
    //            "PGrName1":prodData["PGrName1"],"PGrName2":prodData["PGrName2"],"PGrName3":prodData["PGrName3"],
    //            "ColorName":prodData["ProdColor"],"Size":prodData["ProdSize"]},
    //        function(err,prodNameData){
    //            if(err){ res.send({error:err}); return }
    //            if(prodNameData)prodData["ProdName"]=prodNameData["ProdName"];
    //            if(prodNameData)prodData["UM"]=req.dbUserParams["DefaultUM"];
    //            res.send({item:prodData});
    //        });
    //});

    if(!r_DBIs.getNewChID) throw new Error('NO r_DBIs.getNewChID!');//commonDirs
    if(!r_DBIs.getNewRefID) throw new Error('NO r_DBIs.getNewRefID!');//commonDirs
    /**
     * callback = function(result), result= { prodData, error,errorMessage }
     */
    r_Prods.getAttrIDorCreateNewByName= function(dbUC,prodData,callback){
        if(!prodData){
            callback({error:"No prod attributes!",errorMessage:"Нет данных атрибутов товара для создания нового товара!"});
            return;
        }
        var pCatID=prodData["PCatID"],pCatName=prodData["PCatName"];
        if((pCatID==null)&&(pCatName==null||pCatName.trim()==="")){
            callback({prodData:prodData, error:"No PCatID on PCatName!",errorMessage:"Не указан бренд для создания нового товара!"});
            return;
        }
        r_ProdC.findDataItemByOrCreateNew(dbUC,{resultFields:["PCatID"],findByFields:["PCatName"],
                idFieldName:"PCatID",fieldsValues:{"PCatName":pCatName},
                calcNewIDValue:function(params,callback){
                    r_DBIs.getNewChID(dbUC,"r_ProdC",function(chID,err){
                        if(!err) params.insData["ChID"]=chID;
                        r_DBIs.getNewRefID(dbUC,"r_ProdC","PCatID",function(refID,err){
                            if(!err) params.insData["PCatID"]=refID;
                            callback({data:params.insData},params);
                        })
                    })
                }},
            function(result){
                if(result.error){
                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новый бренд товара:"+pCatName+"!"});
                    return;
                }
                prodData["PCatID"]=result.resultItem["PCatID"];
                var pGrID=prodData["PGrID"],pGrName=prodData["PGrName"];
                if((pGrID==null)&&(pGrName==null||pGrName.trim()==="")){
                    callback({prodData:prodData, error:"No PGrID on PGrName!",errorMessage:"Не указана коллекция для создания нового товара!"});
                    return;
                }
                r_ProdG.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID"],findByFields:["PGrName"],
                        idFieldName:"PGrID",fieldsValues:{"PGrName":pGrName},
                        calcNewIDValue:function(params,callback){
                            r_DBIs.getNewChID(dbUC,"r_ProdG",function(chID,err){
                                if(!err){ params.insData["ChID"]=chID; }
                                r_DBIs.getNewRefID(dbUC,"r_ProdG","PGrID",function(refID,err){
                                    if(!err) params.insData["PGrID"]=refID;
                                    callback({data:params.insData},params);
                                })
                            })
                        }},
                    function(result){
                        if(result.error){
                            callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую коллекцию товара:"+pGrName+"!"});
                            return;
                        }
                        prodData["PGrID"]=result.resultItem["PGrID"];
                        var pGrID1=prodData["PGrID1"],pGrName1=prodData["PGrName1"];
                        if((pGrID1==null)&&(pGrName1==null||pGrName1.trim()==="")){
                            callback({prodData:prodData, error:"No PGrID1 on PGrName1!",errorMessage:"Не указана линия для создания нового товара!"});
                            return;
                        }
                        r_ProdG1.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID1"],findByFields:["PGrName1"],
                                idFieldName:"PGrID1",fieldsValues:{"PGrName1":pGrName1},
                                calcNewIDValue:function(params,callback){
                                    r_DBIs.getNewChID(dbUC,"r_ProdG1",function(chID,err){
                                        if(!err) params.insData["ChID"]=chID;
                                        r_DBIs.getNewRefID(dbUC,"r_ProdG1","PGrID1",function(refID,err){
                                            if(!err) params.insData["PGrID1"]=refID;
                                            callback({data:params.insData},params);
                                        })
                                    })
                                }},
                            function(result){
                                if(result.error){
                                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую линию товара:"+pGrName1+"!"});
                                    return;
                                }
                                prodData["PGrID1"]=result.resultItem["PGrID1"];
                                var pGrID2=prodData["PGrID2"],pGrName2=prodData["PGrName2"];
                                if((pGrID2==null)&&(pGrName2==null||pGrName2.trim()==="")){
                                    callback({prodData:prodData, error:"No PGrID2 on PGrName2!",errorMessage:"Не указан тип для создания нового товара!"});
                                    return;
                                }
                                r_ProdG2.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID2"],findByFields:["PGrName2"],
                                        idFieldName:"PGrID2",fieldsValues:{"PGrName2":pGrName2},
                                        calcNewIDValue:function(params,callback){
                                            r_DBIs.getNewChID(dbUC,"r_ProdG2",function(chID,err){
                                                if(!err) params.insData["ChID"]=chID;
                                                r_DBIs.getNewRefID(dbUC,"r_ProdG2","PGrID2",function(refID,err){
                                                    if(!err) params.insData["PGrID2"]=refID;
                                                    callback({data:params.insData},params);
                                                })
                                            })
                                        }},
                                    function(result){
                                        if(result.error){
                                            callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новый тип товара:"+pGrName2+"!"});
                                            return;
                                        }
                                        prodData["PGrID2"]=result.resultItem["PGrID2"];
                                        var pGrID3=prodData["PGrID3"],pGrName3=prodData["PGrName3"];
                                        if((pGrID3==null)&&(pGrName3==null||pGrName3.trim()==="")){
                                            callback({prodData:prodData, error:"No PGrID3 on PGrName3!",errorMessage:"Не указан вид для создания нового товара!"});
                                            return;
                                        }
                                        r_ProdG3.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID3"],findByFields:["PGrName3"],
                                                idFieldName:"PGrID3",fieldsValues:{"PGrName3":pGrName3},
                                                calcNewIDValue:function(params,callback){
                                                    r_DBIs.getNewChID(dbUC,"r_ProdG3",function(chID,err){
                                                        if(!err) params.insData["ChID"]=chID;
                                                        r_DBIs.getNewRefID(dbUC,"r_ProdG3","PGrID3",function(refID,err){
                                                            if(!err) params.insData["PGrID3"]=refID;
                                                            callback({data:params.insData},params);
                                                        })
                                                    })
                                                }},
                                            function(result){
                                                if(result.error){
                                                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новый вид товара:"+pGrName3+"!"});
                                                    return;
                                                }
                                                prodData["PGrID3"]=result.resultItem["PGrID3"];
                                                r_Prods.getColorOrCreateNew(dbUC,prodData,function(result){
                                                    if(result&&result.error){ callback(result); return; }
                                                    r_Prods.setSizeOrCreateNew(dbUC,prodData,function(result){
                                                        if(result&&result.error){ callback(result); return; }
                                                        callback({prodData:prodData});
                                                    })
                                                });
                                            })
                                    })
                            })
                    })
            })
    };
    /**
     * callback = function(result = {prodData, error,errorMessage})
     */
    r_Prods.getColorOrCreateNew= function(dbUC,prodData,callback){
        var colorID=prodData["ColorID"],colorName=prodData["ColorName"];
        if((colorID==null)&&(colorName==null||colorName.trim()==="")){
            prodData["ColorID"]=0;
            callback({prodData:prodData});
            return;
        }
        ir_ProdColors.findDataItemByOrCreateNew(dbUC, {resultFields:["ColorID"],findByFields:["ColorName"],
                idFieldName:"ColorID",fieldsValues:{"ColorName":colorName},
                calcNewIDValue:function(params,callback){
                    r_DBIs.getNewChID(dbUC,"ir_ProdColors",function(chID,err){
                        if(!err) params.insData["ChID"]=chID;
                        r_DBIs.getNewRefID(dbUC,"ir_ProdColors","ColorID",function(refID,err){
                            if(!err) params.insData["ColorID"]=refID;
                            callback({data:params.insData},params);
                        })
                    })
                }},
            function(result){
                if(result.error){
                    callback({prodData:prodData,error:result.error,errorMessage:"Не удалось найти и/или создать новый цвет товара:"+colorName+"!"});
                    return;
                }
                prodData["ColorID"]=result.resultItem["ColorID"];
                callback({prodData:prodData});
            })
    };
    /**
     * callback = function(result = {prodData, error,errorMessage})
     */
    r_Prods.setSizeOrCreateNew= function(dbUC,prodData,callback){
        var sizeName=prodData["SizeName"];
        if(sizeName==null||sizeName.trim()===""){
            prodData["SizeName"]="Размер не указан";
            callback({prodData:prodData});
            return;
        }
        ir_ProdSizes.findDataItemByOrCreateNew(dbUC,
            {resultFields:["SizeName"],findByFields:["SizeName"],idFieldName:"SizeName",fieldsValues:{"SizeName":sizeName},
                calcNewIDValue:function(params,callback){
                    r_DBIs.getNewChID(dbUC,"ir_ProdSizes",function(chID,err){
                        if(!err) params.insData["ChID"]=chID;
                        callback({data:params.insData},params);
                    })
                }},
            function(result){
                if(result.error){
                    callback({prodData:prodData,error:result.error,errorMessage:"Не удалось найти и/или создать новый размер товара:"+sizeName+"!"});
                    return;
                }
                prodData["SizeName"]=result.resultItem["SizeName"];
                callback({prodData:prodData});
            })
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.storeProdMQ=function(dbUC,prodPPData,callback){
        var qty =prodPPData["Qty"];
        if(qty===undefined)qty=1;
        var insProdMQData={"ProdID":prodPPData["ProdID"],"UM":prodPPData["UM"],"Qty":qty,
            "Weight":0.000,"Notes":null,"Barcode":prodPPData["Barcode"],"ProdBarcode":null,"PLID":0};
        for(var fieldName in insProdMQData)
            if(prodPPData[fieldName]!==undefined) insProdMQData[fieldName]=prodPPData[fieldName];
        r_ProdMQ.insDataItem(dbUC,{insData:insProdMQData},
            function(insResult){
                if(insResult.error||insResult.updateCount!=1){ callback({error:"Failed create prodMQ!"}); return; }
                callback({resultItem:insProdMQData});
            });
    };
    if(!r_DBIs.getNewPPID) throw new Error('NO r_DBIs.getNewPPID!');//commonDirs
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.storeProdPP=function(dbUC,prodPPData,callback){
        var prodID= prodPPData["ProdID"];
        var insProdPPData={"PPID":0,"ProdID":prodID,"PPDesc":"","Priority":0,
            "ProdDate":null,"ProdPPDate":null,"CompID":0,"Article":"","PPWeight":0,"PPDelay":0,"IsCommission":0,
            "PriceCC_In":0.00,"CostCC":0.00,"PriceMC":0.00, "CurrID":0, "PriceMC_In":0.00,"CostAC":0.00,
            "File1":null,"File2":null,"File3":null, "CstProdCode":"","CstDocCode":"", "ParentDocCode":0,"ParentChID":0};
        for(var fieldName in insProdPPData)
            if(prodPPData[fieldName]!==undefined) insProdPPData[fieldName]=prodPPData[fieldName];
        var ppIUD=prodPPData["PPID"];
        if(ppIUD!==undefined){
            t_PInP.insDataItem(dbUC,{insData:insProdPPData},function(insResult){
                if(insResult.error||insResult.updateCount!=1){ callback({error:"Failed create prod PP by PPID="+ppIUD+"!"}); return; }
                callback({resultItem:insProdPPData});
            });
            return;
        }
        r_DBIs.getNewPPID(dbUC,prodID,function(newPPID,err){
            if(err){ callback({error:"Failed calc new PPID!"}); return; }
            insProdPPData["PPID"]=newPPID;
            t_PInP.insDataItem(dbUC,{insData:insProdPPData},function(insResult){
                if(insResult.error||insResult.updateCount!=1){ callback({error:"Failed create prod PP by new PPID="+newPPID+"!"}); return; }
                callback({resultItem:insProdPPData});
            });
        });
    };
    if(!systemFuncs.getEAN13Barcode) throw new Error('NO systemFuncs.getEAN13Barcode!');//systemFuncs
    if(!r_Prods.delete) throw new Error('NO r_Prods.delete!');//commonDirsForProds
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.storeNewProdWithProdMQandProdPP0= function(dbUC,prodData,dbUserParams,callback){
        r_Prods.getAttrIDorCreateNewByName(dbUC,prodData,function(result){
            if(result&&result.error){
                callback({error:"Failed get product attribute ID! Reason:"+result.error,errorMessage:result.errorMessage||result.error});
                return;
            }
            var prodUM=prodData["UM"];
            if(!prodUM||prodUM.trim()==="") prodUM= dbUserParams["DefaultUM"];
            var insProdData={"ChID":null,"ProdID":null, "ProdName":null, "UM":prodUM,
                "Country":"", "Notes":"", "Note1":null, "Note2":null, "Note3":null,
                "Article1":null, "Article2":null, "Article3":null, "Weight":null, "Age":null,
                "InRems":1, "IsDecQty":0, "InStopList":0,
                "PCatID":null, "PGrID":null, "PGrID1":null, "PGrID2":null, "PGrID3":null,
                "ColorID":null, "SizeName":null, "ValidSizes":null,
                "PGrAID":0, "PBGrID":0,
                "MinPriceMC":0.00,"MaxPriceMC":0.00,"MinRem":0.000, "CstDty":0.0,"CstPrc":0.0,"CstExc":0.0,
                "StdExtraR":0,"StdExtraE":0,"MaxExtra":0.0,"MinExtra":0.0,
                "UseAlts":0,"UseCrts":0, "LExpSet":0,"EExpSet":0, "File1":null,"File2":null,"File3":null, "AutoSet":0,
                "Extra1":0.0,"Extra2":0.0,"Extra3":0.0,"Extra4":0.0,"Extra5":0.0,
                "Norma1":0.0,"Norma2":0.0,"Norma3":0.0,"Norma4":0.0,"Norma5":0.0,
                "RecMinPriceCC":0.00,"RecMaxPriceCC":0.00,"RecStdPriceCC":0.00,"RecRemQty":0.000,
                "PrepareTime":null, "Producer":null, "Growth":0.0, "Volume":0.0,"Length":0.0,
                "ScaleGrID":0,"ScaleStandard":null,"ScaleConditions":null,"ScaleComponents":null};
            for(var fieldName in insProdData) {
                var value=prodData[fieldName];
                if(value!==undefined)insProdData[fieldName]=value;
            }
            r_Prods.insDataItemWithNewID(dbUC,{insData:insProdData,idFieldName:"ProdID",
                    calcNewIDValue:function(params,callback){
                        r_DBIs.getNewChID(dbUC,"r_Prods",function(newChID,err){
                            if(err){
                                callback({error:err.message,errorMessage:"Не удалось получить новый ключ для создания нового товара!"});
                                return;
                            }
                            params.insData["ChID"]=newChID;
                            var prodID= params.insData["ProdID"];
                            if(prodID&&prodID.toString().trim()!=""){ callback({data:params.insData},params); return; }
                            r_DBIs.getNewRefID(dbUC,"r_Prods","ProdID",function(newProdID,err){
                                if(err){
                                    callback({error:err.message,errorMessage:"Не удалось получить новый код для создания нового товара!"});
                                    return;
                                }
                                params.insData["ProdID"]= newProdID;
                                callback({data:params.insData},params)
                            });
                        });
                    }
                },
                function(resultStoreProd){
                    if(!resultStoreProd.resultItem||resultStoreProd.error||!resultStoreProd.updateCount>0){
                        callback({updateCount:resultStoreProd.updateCount, error:resultStoreProd.error,errorMessage:"Не удалось создать новый товар!"});
                        return;
                    }
                    var resultItem= resultStoreProd.resultItem, prodID= resultItem["ProdID"], barcode= prodData["Barcode"];
                    if(barcode==null||barcode.trim()==""){
                        var iProdID=parseInt(prodID);
                        if(isNaN(iProdID)){
                            r_Prods.delete(dbUC,prodID);
                            callback({error:"Non correct ProdID for barcode!"});
                            return;
                        }
                        barcode= systemFuncs.getEAN13Barcode(iProdID,23);
                    }
                    r_Prods.storeProdMQ(dbUC,{"ProdID":prodID,"UM":insProdData["UM"],"Barcode":barcode},
                        function(resultStoreProdMQ){
                            if(resultStoreProdMQ.error){
                                r_Prods.delete(dbUC,prodID);
                                callback({error:resultStoreProdMQ.error});
                                return;
                            }
                            insProdData["Barcode"]=barcode;
                            r_Prods.storeProdPP(dbUC,{"ProdID":prodID,"PPID":0},function(resultStorePP0){
                                if(resultStorePP0.error){
                                    r_Prods.delete(dbUC,prodID);
                                    callback({error:resultStorePP0.error});
                                    return;
                                }
                                callback({resultItem:insProdData});
                            });
                        });
                });
        });
    };

    if(!r_Prods.addProdMQ) throw new Error('NO r_Prods.addProdMQ!');//commonDirsForProds
    if(!r_Prods.updProdMQ) throw new Error('NO r_Prods.updProdMQ!');//commonDirsForProds
    /** eProdID - exists ProdID, eBCUM - exists ProdMQ UM,
     * prodMQData = { ProdID, UM, Qty, Weight, Notes, Barcode, ProdBarcode, PLID }
     * callback = function(result), result= { resultItem, error,errorMessage, resultItemUpdProdMQ,resultItemUpdProdUM, resultItemAddProdMQ }
     */
    r_Prods.checkAndStoreProdMQ= function(dbUC,eProdID,eBCUM,prodName,prodMQData,callback){
        if(!eProdID){
            callback({error:"Failed check-update prodMQ! No exists ProdID data!",
                errorMessage:" Не удалось проверить и добавить/изменить штрихкод (вид упаковки) товара! Нет данных по существующему товару (Код товара)."});
            return;
        }
        if(!eProdID){
            callback({error:"Failed check-update prodMQ! No exists ProdID data!",
                errorMessage:" Не удалось проверить и добавить/изменить штрихкод (вид упаковки) товара! Нет данных по существующему товару (Код товара)."});
            return;
        }
        if(!prodMQData) prodMQData={};
        var prodID= prodMQData["ProdID"], sBCUM= prodMQData["UM"], sProdBarcode= prodMQData["Barcode"];
        var sErrMsg="Не удалось добавить/изменить штрихкод \""+sProdBarcode+"\" для товара \""+prodName+"\"!";
        r_ProdMQ.getDataItem(dbUC,{fields:["Barcode","Qty"],conditions:{"ProdID=":eProdID,"UM=":eBCUM}},
            function(resultFindProdMQBarcode){
                if(resultFindProdMQBarcode.error){ callback({error:resultFindProdMQBarcode.error,errorMessage:sErrMsg}); return; }
                if(resultFindProdMQBarcode.item){//update r_ProdMQ
                    sErrMsg="Не удалось изменить штрихкод \""+sProdBarcode+"\" для товара \""+prodName+"\"!";
                    if(!prodMQData["Qty"]) prodMQData["Qty"]= resultFindProdMQBarcode.item["Qty"];
                    r_Prods.updProdMQ(dbUC,eProdID,eBCUM,prodName,prodMQData,function(resultUpdProdMQ){
                        if(resultUpdProdMQ.error){ callback({error:resultUpdProdMQ.error,errorMessage:sErrMsg}); return; }
                        var resultCheckAndStoreProdMQ= {resultItem:resultUpdProdMQ.resultItem, resultItemUpdProdMQ:resultUpdProdMQ.resultItem};
                        if(resultUpdProdMQ.resultItemUpdProdUM) resultCheckAndStoreProdMQ.resultItemUpdProdUM= resultUpdProdMQ.resultItemUpdProdUM;
                        callback(resultCheckAndStoreProdMQ);
                    });
                    return;
                }
                //insert new r_ProdMQ
                sErrMsg="Не удалось добавить штрихкод \""+sProdBarcode+"\" для товара \""+prodName+"\"!";
                r_ProdMQ.getDataItem(dbUC,{fields:["Barcode"],conditions:{"ProdID=":prodID,"UM=":sBCUM}},
                    function(resultFindProdMQByUM){
                        if(resultFindProdMQByUM.error){ callback({error:resultFindProdMQByUM.error,errorMessage:sErrMsg}); return; }
                        if(!resultFindProdMQByUM.item){
                            r_Prods.addProdMQ(dbUC,prodMQData,function(resultAddProdMQ){
                                if(resultAddProdMQ.error){ callback({error:resultAddProdMQ.error,errorMessage:sErrMsg}); return; }
                                callback({resultItem:resultAddProdMQ.resultItem, resultItemAddProdMQ:resultAddProdMQ.resultItem});
                            });
                            return;
                        }
                        if(resultFindProdMQByUM.item["Barcode"]==sProdBarcode){ callback({resultItem:prodMQData}); return; }
                        var findMaxProdMQUMCondition={"ProdID=":prodID},
                            umCondition="((UM like '"+sBCUM+"[0-9]') or (UM like '"+sBCUM+"[0-9][0-9]') or (UM like '"+sBCUM+"[0-9][0-9][0-9]')"+
                                " or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9]') or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9][0-9]')"+
                                " or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9][0-9][0-9]') or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))";
                        findMaxProdMQUMCondition[umCondition]=null;
                        r_ProdMQ.getDataItem(dbUC,{fields:["MaxBCUMPostfix"],fieldsFunctions:{"MaxBCUMPostfix":"REPLACE(UM,'"+sBCUM+"','')"},
                                conditions:findMaxProdMQUMCondition, order:"UM desc", top:"TOP 1"},
                            function(resultFindMaxProdMQUM){
                                if(resultFindMaxProdMQUM.error){ callback({error:resultFindMaxProdMQUM.error,errorMessage:sErrMsg}); return; }
                                var sProdMQBCUMPostfix= "1";
                                if(resultFindMaxProdMQUM.item){
                                    sProdMQBCUMPostfix= resultFindMaxProdMQUM.item["MaxBCUMPostfix"];
                                    var iProdMQBCUMPostfix= parseInt(sProdMQBCUMPostfix);
                                    sProdMQBCUMPostfix= (isNaN(iProdMQBCUMPostfix))?sProdMQBCUMPostfix+"1":iProdMQBCUMPostfix+1;
                                }
                                prodMQData["UM"]= sBCUM+sProdMQBCUMPostfix;
                                r_Prods.addProdMQ(dbUC,prodMQData,function(resultAddProdMQ){
                                    if(resultAddProdMQ.error){ callback({error:resultAddProdMQ.error,errorMessage:sErrMsg}); return; }
                                    callback({resultItem:resultAddProdMQ.resultItem, resultItemAddProdMQ:resultAddProdMQ.resultItem});
                                });
                            });
                    });
            });
    };
    if(!r_Prods.findProdByBCIDNameValues) throw new Error('NO r_Prods.findProdByBCIDNameValues!');//commonDirsForProds
    if(!r_Prods.checkExistsProdID) throw new Error('NO r_Prods.checkExistsProdID!');//commonDirsForProds
    if(!r_Prods.checkExistsProdBarcode) throw new Error('NO r_Prods.checkExistsProdBarcode!');//commonDirsForProds
    /**
     * if product not finded by ProdName, create new product with barcode and pp
     * if product finded by name and not finded barcode, add barcode to exists product
     * else update product data
     * callback = function(result), result= { resultItem, error,errorMessage, resultItemNewProd,resultItemNewProdMQ }
     * if inserted  new product - result contain resultItemNewProd
     * if inserted only new barcode - result contain resultItemNewProdMQ
     */
    r_Prods.checkStoreProdWithBarcodeForDocRec= function(dbUC,recProdData,dbUserParams,callback){
        var prodName=recProdData["ProdName"];
        if(!prodName||(prodName=prodName.trim())===""){
            callback({error:"No ProdName!",errorMessage:"Не задано наименование товара!"});
            return;
        }
        var prodUM=recProdData["UM"];
        if(!prodUM||(prodUM=prodUM.trim())==="") prodUM= dbUserParams["DefaultUM"];
        if(!prodUM||(prodUM=prodUM.trim())===""){
            callback({error:"No Prod UM!",errorMessage:"Не задана единица измерения товара \n(и не определена в настройках по умолчанию для товара)!"});
            return;
        }
        r_Prods.findProdByBCIDNameValues(dbUC,{"ProdName=":prodName},function(resultFindProdByName){//finding by ProdName
            if(resultFindProdByName.error){ callback(resultFindProdByName); return; }
            var existsProdIDByProdName=null, existsProdBaseBarcodeByProdName=null, existsProdUMByProdName=null;
            if(resultFindProdByName.prodData){
                existsProdIDByProdName= resultFindProdByName.prodData["ProdID"];
                existsProdBaseBarcodeByProdName= resultFindProdByName.prodData["Barcode"];
                existsProdUMByProdName= resultFindProdByName.prodData["UM"];
            }
            var prodID=recProdData["ProdID"];
            if(prodID!=null&&typeof(prodID)=="string") prodID= prodID.trim();
            if(resultFindProdByName.prodData&&prodID!=null&&prodID.toString()&&prodID!=existsProdIDByProdName){
                callback({error:"ProdID not equals ProdID by ProdName!",
                    errorMessage:"Не верно указан код товара!\nДля товара с наименованием \""+prodName+"\" должен быть указан код товара "+existsProdIDByProdName+"!"});
                return;
            }
            r_Prods.checkExistsProdID(dbUC,prodID,existsProdIDByProdName,prodName,function(resultCheckExistsProdID){
                if(resultCheckExistsProdID.error){ callback(resultCheckExistsProdID); return; }
                var prodBarcode=recProdData["Barcode"];
                if(prodBarcode&&typeof(prodBarcode)=="string") prodBarcode= prodBarcode.toString().trim();
                r_Prods.checkExistsProdBarcode(dbUC,prodBarcode,prodName,function(resultCheckExistsProdBarcode){
                    if(resultCheckExistsProdBarcode.error){ callback(resultCheckExistsProdBarcode); return; }
                    if(!resultFindProdByName.prodData){//CREATE NEW PRODUCT WITH BARCODE
                        r_Prods.storeNewProdWithProdMQandProdPP0(dbUC,recProdData,dbUserParams,function(resultStoreNewProdWithProdMQandProdPP0){
                            if(resultStoreNewProdWithProdMQandProdPP0.error){ callback(resultStoreNewProdWithProdMQandProdPP0); return; }
                            var newProdData= resultStoreNewProdWithProdMQandProdPP0.resultItem;
                            callback({resultItem:newProdData, resultItemNewProd:newProdData});
                        });
                        return;
                    }
                    if((!prodID||!prodID.toString())&&existsProdIDByProdName) recProdData["ProdID"]=existsProdIDByProdName;
                    if(existsProdUMByProdName&&prodUM!=existsProdUMByProdName) recProdData["UM"]=existsProdUMByProdName;
                    if(!prodBarcode&&existsProdBaseBarcodeByProdName) recProdData["Barcode"]=existsProdBaseBarcodeByProdName;
                    if(resultFindProdByName.prodData && !resultCheckExistsProdBarcode.resultItem){//ADD OR UPDATE BARCODE DATA FOR EXISTS PRODUCT

                        var prodMQData= {"ProdID":recProdData["ProdID"], "Barcode":recProdData["Barcode"],"UM":recProdData["BCUM"],"Qty":recProdData["BCQty"]};
                        if(prodMQData["UM"]==null) prodMQData["UM"]= prodUM;
                        r_Prods.checkAndStoreProdMQ(dbUC,existsProdIDByProdName,existsProdUMByProdName,prodName,prodMQData,function(resultCheckAndStoreProdMQ){
                            if(resultCheckAndStoreProdMQ.error){
                                r_Prods.delete(dbUC,prodID);
                                callback(resultCheckAndStoreProdMQ);
                                return;
                            }
                            recProdData["Barcode"]= resultCheckAndStoreProdMQ.resultItem["Barcode"];
                            recProdData["BCUM"]= resultCheckAndStoreProdMQ.resultItem["UM"];
                            recProdData["BCQty"]= resultCheckAndStoreProdMQ.resultItem["Qty"];
                            if(resultCheckAndStoreProdMQ.resultItemUpdProdUM) recProdData["UM"]= resultCheckAndStoreProdMQ.resultItemUpdProdUM["UM"];
                            callback({resultItem:recProdData, resultItemNewProdMQ:resultCheckAndStoreProdMQ.resultItem});
                        });
                        return;
                    }

                    //

                    callback({resultItem:recProdData});
                })
            });
        });
    };

    /**
     * callback = function(result), result= { resultItem, error, errorMessage }
     */
    t_RecD.storeNewProdPP=function(dbUC,prodID,recChID,recDData,callback){
        t_Rec.getDataItem(dbUC,{fields:["DocDate","CurrID","CompID"],conditions:{"ChID=":recChID}},
            function(result){
                if(result.error||!result.item){ callback({error:"Failed get rec data for create prod PP!"}); return; }
                var recData=result.item, priceCC_wt=recDData["PriceCC_wt"];
                r_Prods.storeProdPP(dbUC,
                    {"ProdID":prodID,"ProdDate":recData["DocDate"],"CompID":recData["CompID"],"Article":"",
                        "PriceCC_In":priceCC_wt,"CostCC":priceCC_wt,"PriceMC":priceCC_wt,
                        "CurrID":recData["CurrID"], "PriceMC_In":priceCC_wt,"CostAC":priceCC_wt},
                    function(result){ callback(result); });
            });
    };
    t_RecD.setRecDTaxPriceCCnt=function(dbUC,prodID,recChID,recDData,callback){
        database.selectParamsQuery(dbUC,
            "select tax=dbo.zf_GetProdRecTax(@p0,OurID,CompID,DocDate) from t_Rec where ChID=@p1",[prodID,recChID],
            function(result){/* Возвращает ставку НДС для товара в зависимости от поставщика */
                var tax=(result&&result.length>0)?result[0]["tax"]:0;
                recDData["Tax"]=tax; recDData["PriceCC_nt"]=recDData["PriceCC_wt"]-tax;
                var qty= recDData["Qty"];
                recDData["TaxSum"]=tax*qty; recDData["SumCC_nt"]=recDData["SumCC_wt"]-tax*qty;
                callback(recDData);
            });
    };
    if(!r_Prods.delete) throw new Error('NO r_Prods.delete!');//commonDirsForProds
    /**
     * callback = function(result), result = { resultItem, error, errorMessage }
     */
    t_RecD.storeRecD=function(dbUC,storeData,dbUserParams,tRecDTableColumns,callbackStoreRecD){
        var docChID= storeData["ChID"], prodID=storeData["ProdID"];
        if(!docChID){
            callbackStoreRecD({error:"Failed store data to t_RecD!<br> No ChID!",
                errorMessage:"Не удалось сохранить данные в документе Приход товара!<br> Нет кода регистрации документа!"});
            return;
        }
        var qty= storeData["Qty"];
        if(qty==null||qty.toString().trim()==""){
            callbackStoreRecD({error:"Failed store data to t_RecD!<br> No Qty!",
                errorMessage:"Не удалось сохранить данные в документе Приход товара!<br> Не указано количество прихода товара!"});
            return;
        }
        if(isNaN(qty-0)){
            callbackStoreRecD({error:"Failed store data to t_RecD!<br> No correct Qty!",
                errorMessage:"Не удалось сохранить данные в документе Приход товара!<br> Неверно указано количество прихода товара!"});
            return;
        }
        storeData["Qty"]= qty-0;
        t_RecD.storeNewProdPP(dbUC,prodID,docChID,storeData,function(resultStorePP){
            if(resultStorePP.error){
                r_Prods.delete(dbUC,prodID);
                callbackStoreRecD({error:resultStorePP.error});
                return;
            }
            storeData["PPID"]= resultStorePP.resultItem["PPID"];
            storeData["SecID"]= dbUserParams["t_SecID"];
            t_RecD.setRecDTaxPriceCCnt(dbUC,prodID,docChID,storeData,function(storeData){
                if(isNaN(storeData["SumCC_wt"])) storeData["SumCC_wt"]=null;
                if(storeData["SumCC_wt"]==null) storeData["SumCC_wt"]= storeData["PriceCC_wt"]*storeData["Qty"];
                if(isNaN(storeData["SumCC_nt"])) storeData["SumCC_nt"]=null;
                if(storeData["SumCC_nt"]==null) storeData["SumCC_nt"]= storeData["PriceCC_nt"]*storeData["Qty"];
                storeData["CostCC"]= storeData["PriceCC_wt"]; storeData["CostSum"]= storeData["SumCC_wt"];
                t_RecD.storeTableDataItem(dbUC,{tableColumns:tRecDTableColumns, idFields:["ChID","SrcPosID"],storeTableData:storeData,
                        calcNewIDValue: function(params, callbackCalcNewIDValue){
                            t_RecD.getDataItem(dbUC,{fields:["maxSrcPosID"],fieldsFunctions:{maxSrcPosID:{function:"maxPlus1",sourceField:"SrcPosID"}},
                                    conditions:{"ChID=":params.storeTableData["ChID"]}},
                                function(result){
                                    if(result.error){
                                        callbackStoreRecD({error:"Failed calc new SrcPosID by prod in t_RecD!<br>"+result.error,
                                            errorMessage:"Не удалось вычислить новый номер позиции для товара в документе Приход товара!<br>"+result.error});
                                        return;
                                    }
                                    if(!result.item)params.storeTableData["SrcPosID"]=1;else params.storeTableData["SrcPosID"]= result.item["maxSrcPosID"];
                                    callbackCalcNewIDValue(params);
                                });
                        }},
                    function(result){
                        if(result.error){
                            r_Prods.delete(dbUC,prodID);
                            if(result.error.indexOf("Violation of PRIMARY KEY constraint '_pk_t_RecD'")>=0)
                                result.errorMessage="Некорректный номер позиции!<br> В документе уже есть позиция с таким номером."
                        }
                        callbackStoreRecD(result);
                    });
            });
        });
    };

    /**
     * callback = function(result), result = { resultItem, error, errorMessage }
     */
    t_RecD.checkStoreProdAndCheckStoreRecD=function(dbUC,storeData,dbUserParams,tRecDTableColumns,callback){
        var sErrMsgP= "Failed store data to t_RecD!<br> ", sUErrMsgP= "Не удалось сохранить данные в документе Приход товара!<br> ";
        if(!t_RecD.checkDataItemVal(storeData,"ChID","hasValue",sErrMsgP+"No ChID!",sUErrMsgP+"Нет кода регистрации документа!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"ChID","isNumber",sErrMsgP+"No correct ChID!",sUErrMsgP+"Неверный код регистрации документа!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"ProdID","isNumberNull",sErrMsgP+"No correct ProdID!",sUErrMsgP+"Неверно указан код товара в документе!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"Qty","hasValue",sErrMsgP+"No Qty!",sUErrMsgP+"Не указано количество прихода товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"Qty","isNumber",sErrMsgP+"No correct Qty!",sUErrMsgP+"Неверно указано количество прихода товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"PriceCC_wt","hasValue",sErrMsgP+"No PriceCC_wt!",sUErrMsgP+"Не указана цена прихода товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"PriceCC_wt","isNumber",sErrMsgP+"No correct PriceCC_wt!",sUErrMsgP+"Неверно указана цена прихода товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"Extra","hasValue",sErrMsgP+"No Extra!",sUErrMsgP+"Не указана наценка прихода товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"Extra","isNumber",sErrMsgP+"No correct Extra!",sUErrMsgP+"Неверно указана наценка прихода товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"PriceCC","hasValue",sErrMsgP+"No PriceCC!",sUErrMsgP+"Не указана цена продажи товара!",callback)) return;
        if(!t_RecD.checkDataItemVal(storeData,"PriceCC","isNumber",sErrMsgP+"No correct PriceCC!",sUErrMsgP+"Неверно указана цена продажи товара!",callback)) return;
        var prodData={"ChID":storeData["ProdChID"], "ProdID":storeData["ProdID"], "ProdName":storeData["ProdName"], "UM":storeData["UM"], "InRems":1,
            "Article1":storeData["Article1"], "Country":storeData["Country"], "Notes":storeData["ProdName"],
            "PCatName":storeData["PCatName"], "PGrName":storeData["PGrName"],
            "PGrName1":storeData["PGrName1"],"PGrName2":storeData["PGrName2"],"PGrName3":storeData["PGrName3"],
            "ColorName":storeData["ColorName"],"SizeName":storeData["SizeName"]};
        r_Prods.checkStoreProdWithBarcodeForDocRec(dbUC,prodData,dbUserParams,function(resultCheckStoreProd){
            if(!resultCheckStoreProd.resultItem||resultCheckStoreProd.error){
                callback({error:"Failed store product! Reason:"+resultCheckStoreProd.error,errorMessage:resultCheckStoreProd.errorMessage||resultCheckStoreProd.error});
                return;
            }
            if(resultCheckStoreProd.resultItemNewProd){
                storeData["ProdID"]= resultCheckStoreProd.resultItemNewProd["ProdID"];
                storeData["Barcode"]= resultCheckStoreProd.resultItemNewProd["Barcode"];
            }else if(resultCheckStoreProd.resultItemNewProdMQ){
                storeData["Barcode"]= resultCheckStoreProd.resultItemNewProdMQ["Barcode"];
            }
            t_RecD.storeRecD(dbUC,storeData,dbUserParams,tRecDTableColumns,function(result){ callback(result); });
        });
    };
};