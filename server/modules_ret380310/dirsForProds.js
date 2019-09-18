var dataModel=require(appDataModelPath),database= require("../databaseMSSQL"), common= require("../common");
var r_Prods= require(appDataModelPath+"r_Prods"),r_ProdMQ= require(appDataModelPath+"r_ProdMQ"),
    r_ProdC= require(appDataModelPath+"r_ProdC"),r_ProdG= require(appDataModelPath+"r_ProdG"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3"),
    t_PInP= require(appDataModelPath+"t_PInP"),r_DBIs=require(appDataModelPath+"r_DBIs"),
    r_CRUniInput= require(appDataModelPath+"r_CRUniInput");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Prods,r_ProdMQ,r_ProdC,r_ProdG,r_ProdG1,r_ProdG2,r_ProdG3,
            t_PInP,r_DBIs,r_CRUniInput], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init= function(app){
    var prodsTableColumns=[
        {data:"ProdID", name:"ProdID", width:80, type:"text", readOnly:true, visible:false},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text" },
        {data:"UM", name:"Ед.изм.", width:55, type:"text", align:"center" },
        {data:"Article1", name:"Артикул1 товара", width:200, type:"text", sourceField:"Article1" },
        {data:"Barcode", name:"Штрихкод", width:50, type:"text",
            dataSource:"r_ProdMQ", sourceField:"Barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM" },
        {data:"PCatName", name:"Категория товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data:"PGrName", name:"Группа товара", width:95,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data:"PGrName1", name:"Подгруппа 1 товара", width:90,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data:"PGrName2", name:"Подгруппа 2 товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data:"PGrName3", name:"Подгруппа 3 товара", width:150,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"}
    ];
    var prodsWAllBarcodesTableColumns=[
        {data:"ProdID", name:"ProdID", width:80, type:"text", readOnly:true, visible:false},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text" },
        {data:"BaseUM", name:"Осн. Ед.изм.", width:55, type:"text", align:"center" },
        {data:"Article1", name:"Артикул1 товара", width:200, type:"text", sourceField:"Article1" },
        {data:"Barcode", name:"Штрихкод", width:50, type:"text",
            dataSource:"r_ProdMQ", sourceField:"barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID" },
        {data:"UM", name:"Ед.изм. ШК", width:55, type:"text", align:"center", dataSource:"r_ProdMQ", sourceField:"UM" },
        {data:"PCatName", name:"Категория товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data:"PGrName", name:"Группа товара", width:95,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data:"PGrName1", name:"Подгруппа 1 товара", width:90,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data:"PGrName2", name:"Подгруппа 2 товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data:"PGrName3", name:"Подгруппа 3 товара", width:150,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"}
    ];
    //dirProductsTableColumns=
    //    dir_products_bata.addProductColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductBataAttrsColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductAttrsColumnsTo(dirProductsTableColumns,8);

    app.get("/dirsProds/getDataForArticle1Combobox",function(req,res){
        r_Prods.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"Article1":"Article1"}, order:"Article1"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForPCatNameCombobox",function(req,res){
        r_ProdC.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PCatName":"PCatName"},
                conditions:{"PCatID>0":null}, order:"PCatName"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForPGrNameCombobox",function(req,res){
        r_ProdG.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName":"PGrName"},
                conditions:{"PGrID>0":null}, order:"PGrName"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForPGrName1Combobox",function(req,res){
        r_ProdG1.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName1":"PGrName1"},
                conditions:{"PGrID1>0":null}, order:"PGrName1"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForPGrName2Combobox",function(req,res){
        r_ProdG2.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName2":"PGrName2"},
                conditions:{"PGrID2>0":null}, order:"PGrName2"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForPGrName3Combobox",function(req,res){
        r_ProdG3.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName3":"PGrName3"},
                conditions:{"PGrID3>0":null}, order:"PGrName3"},
            function(result){
                res.send(result);
            });
    });
    /** finding product by Barcode/ProdID/ProdName
     * fieldsValues = { "Barcode":<value>, "ProdID":<value>, "ProdName":<value> }
     * callback = function(result={prodData, error,errorMessage})
     */
    r_Prods.findProdByFieldsValues= function(dbUC,fieldsValues,callback){//finding by Barcode/ProdID/ProdName
        var conditions={}, findByBarcode=false;
        if(fieldsValues["Barcode"]){ conditions["Barcode="]=fieldsValues["Barcode"]; findByBarcode=true; }
        if(fieldsValues["ProdID"])conditions["r_Prods.ProdID="]=fieldsValues["ProdID"];
        if(fieldsValues["ProdName"])conditions["r_Prods.ProdName="]=fieldsValues["ProdName"];
        r_Prods.getDataItemForTable(dbUC,{tableColumns:(findByBarcode)?prodsWAllBarcodesTableColumns:prodsTableColumns,
                conditions:conditions},
            function(result){
                if(result&&result.error){
                    callback({error:"Failed find r_Prods prod data by ProdID/ProdName/Barcode! Reason:"+result.error,
                        errorMessage:"Не удалось найти товар по значениям (Код/Наименование/Штрихкод)!"});
                    return;
                }
                callback({prodData:result.item});
            });
    };
    app.get("/dirsProds/getProdDataByProdBarcodeIDName",function(req,res){
        r_Prods.findProdByFieldsValues(req.dbUC,req.query,function(findProdResult){
            if(findProdResult&&findProdResult.error){
                res.send({error:{error:findProdResult.error,userMesssage:findProdResult.userMesssage}});
                return;
            }
            res.send({item:findProdResult.prodData});
        });
    });
    /** find product with all product barcodes
     * conditions = { <conditions> }
     * callback = function(result={prodData, error,errorMessage})
     */
    r_Prods.findProdWAllBCsByCondition= function(dbUC,conditions,callback){
        r_Prods.getDataItemForTable(dbUC,{tableColumns:prodsWAllBarcodesTableColumns, conditions:conditions},
            function(result){
                if(result&&result.error){
                    callback({error:"Failed find r_Prods with barcode prod data by conditions! Reason:"+result.error,
                        errorMessage:"Не удалось найти товар со штрихкодом!"});
                    return;
                }
                callback({prodData:result.item});
            });
    };
    /** used in mobile inventory
     * conditions = { <conditions> }
     * callback = function(result), result = { prodData, error,errorMessage }
     */
    r_Prods.findProdByCondition= function(dbUC,conditions,callback){//IT'S used for get prod data from mobile invent
        r_Prods.getDataItemForTable(dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){
                if(!result||!result.item){
                    var error="Cannot find r_Prods prod data!",errMsg="Не удалось найти товар!";
                    if(result&&result.error){
                        error+="\n"+result.error;errMsg+="\n"+result.error;
                    }
                    callback({error:error,errorMessage:errMsg});
                    return;
                }
                callback({prodData:result.item});
            });
    };
    /** used in mobile inventory
     * value = Barcode or ProdID
     * callback = function(result), result = { prodData, error,errorMessage }
     */
    r_Prods.findProdByCRUniInput= function(dbUC,value,callback){//IT'S used for get prod data from mobile invent
        var conditions={}/*valule like UniInputMask*/;
        conditions[value+" like UniInputMask"]=null;
        r_CRUniInput.getDataItem(dbUC,{fields:["UniInputAction"], conditions:conditions},
            function(result){
                if(!result||!result.item){
                    var error="Cannot get CRUniInput UniInputAction value!",
                        errMsg="Не удалось определить метод обработки значения для поиска товара!";
                    if(result&&result.error){
                        error+="\n"+result.error;errMsg+="\n"+result.error;
                    }
                    callback({error:error,errorMessage:errMsg});
                    return;
                }
                var uniInputAction=result.item["UniInputAction"], findProdConditions={};
                if(uniInputAction==1/*barcode*/)findProdConditions["Barcode="]=value;
                else/*result.item==2 ProdID*/findProdConditions["r_Prods.ProdID="]=value;
                r_Prods.findProdByCondition(dbUC,findProdConditions,function(resultFindProd){
                    if(!resultFindProd||!resultFindProd.prodData){
                        var error="Cannot find r_Prods prod data by "+(uniInputAction==1)?"Barcode=":"r_Prods.ProdID="+value+"!",
                            errMsg="Не удалось найти товар по значению "+value+"!";
                        if(resultFindProd&&resultFindProd.error){
                            error+="\n"+resultFindProd.error; errMsg+="\n"+resultFindProd.errorMessage;
                        }
                        callback({error:error,errorMessage:errMsg});
                        return;
                    }
                    callback({prodData:resultFindProd.prodData});
                });
            });
    };

    /**
     *
     * callback = function(error, prodData), error = {error,userMessage}
     */
    r_Prods.getNewProdNameByAttrs= function(dbUC,prodData,callback){
        //if_GetProdNameByMaskValues(ProdID, PCatName,PGrName1,PGrName3,PGrSName3,Article1,Article2,Article3, ColorName,ColorSName, SizeName,ValidSizes, Growth)
        database.selectParamsQuery(dbUC,
            "select ProdName="+
            "LTRIM(RTRIM("+
            "dbo.if_GetProdNameByMaskValues(@p0, @p1,@p2,@p3,@p4, @p5,@p6,@p7, @p8,@p9, @p10,@p11, @p12) ))",
            [prodData["ProdID"], prodData["PCatName"],prodData["PGrName1"],prodData["PGrName3"],prodData["PGrSName3"],
                prodData["Article1"],prodData["Article2"],prodData["Article3"],
                prodData["ColorName"],prodData["ColorSName"], prodData["SizeName"],prodData["ValidSizes"], prodData["Growth"]],
            function(err,recordset,rowsCount,fieldsTypes){
                if(err){ callback({error:err.message}); return; }
                if(recordset&&recordset.length>0)prodData["ProdName"]=recordset[0]["ProdName"];
                callback(null,prodData);
            });
    };
    app.get("/dirsProds/getProdProdAttrsAndNameByArticle1",function(req,res){
        var prodData=req.query, prodArticle1=prodData["Article1"], sendResult={};
        if(prodArticle1===undefined||prodArticle1===null||prodArticle1.trim()===""){
            r_Prods.getNewProdNameByAttrs(req.dbUC,prodData,function(err,prodNameData){
                if(prodNameData) sendResult.itemProdName={"ProdName":prodNameData["ProdName"],"UM":req.dbUserParams["DefaultUM"]};
                if(err)sendResult.errorProdName=err;
                res.send(sendResult);
            });
            return;
        }
        r_Prods.getDataItemsForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:{"r_Prods.Article1=":prodArticle1}},
            function(result){
                var resultProdAttrs=null;
                if(result.items&&result.items.length>0){
                    var resultItem=result.items[0], resultProdAttrs={};
                    resultProdAttrs["PCatName"]=resultItem["PCatName"]; resultProdAttrs["PGrName"]=resultItem["PGrName"];
                    resultProdAttrs["PGrName1"]=resultItem["PGrName1"]; resultProdAttrs["PGrName2"]=resultItem["PGrName2"];
                    resultProdAttrs["PGrName3"]=resultItem["PGrName3"];
                    for(var fieldName in resultProdAttrs) prodData[fieldName]=resultProdAttrs[fieldName];
                }
                if(resultProdAttrs) sendResult.item=resultProdAttrs;
                if(result.error)sendResult.error=result.error;
                r_Prods.getNewProdNameByAttrs(req.dbUC,prodData,function(err,prodNameData){
                    if(prodNameData) sendResult.itemProdName={"ProdName":prodNameData["ProdName"],"UM":req.dbUserParams["DefaultUM"]};
                    if(err)sendResult.errorProdName=err;
                    res.send(sendResult);
                });
            });
    });

    /**
     * params= { prodData,defValues={<fieldName>:<fieldValue>, ...}
     * callback = function(result), result= { prodData, error,errorMessage }
     */
    r_Prods.getAttrIDorCreateNewByName= function(dbUC,params,callback){
        if(!params||!params.prodData){
            callback({error:"No prod attributes!",errorMessage:"Нет данных атрибутов товара для создания нового товара!"});
            return;
        }
        var prodData=params.prodData;
        var pCatID=prodData["PCatID"],pCatName=prodData["PCatName"];
        if((pCatID===undefined||pCatID===null)&&(pCatName===undefined||pCatName===null||pCatName.trim()==="")){
            callback({prodData:prodData, error:"No PCatID on PCatName!",errorMessage:"Не указана категория для создания нового товара!"});
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
                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую категорию товара:"+pCatName+"!"});
                    return;
                }
                prodData["PCatID"]=result.resultItem["PCatID"];
                var pGrID=prodData["PGrID"],pGrName=prodData["PGrName"];
                if((pGrID===undefined||pGrID===null)&&(pGrName===undefined||pGrName===null||pGrName.trim()==="")){
                    callback({prodData:prodData, error:"No PGrID on PGrName!",errorMessage:"Не указана группа для создания нового товара!"});
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
                            callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую группу товара:"+pGrName+"!"});
                            return;
                        }
                        prodData["PGrID"]=result.resultItem["PGrID"];
                        var pGrID1=prodData["PGrID1"]||0,pGrName1=prodData["PGrName1"];
                        if((pGrID1===undefined||pGrID1===null)&&(pGrName1===undefined||pGrName1===null||pGrName1.trim()==="")){
                            callback({prodData:prodData, error:"No PGrID1 on PGrName1!",errorMessage:"Не указана подгруппа 1 для создания нового товара!"});
                            return;
                        }
                        r_ProdG1.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID1"],findByFields:["PGrName1"],
                                idFieldName:"PGrID1",fieldsValues:{"PGrName1":pGrName1},fieldsDefValues:{"PGrID1":pGrID1},
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
                                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую подгруппу 1 товара:"+pGrName1+"!"});
                                    return;
                                }
                                prodData["PGrID1"]=result.resultItem["PGrID1"];
                                var pGrID2=prodData["PGrID2"]||0,pGrName2=prodData["PGrName2"];
                                if((pGrID2===undefined||pGrID2===null)&&(pGrName2===undefined||pGrName2===null||pGrName2.trim()==="")){
                                    callback({prodData:prodData, error:"No PGrID2 on PGrName2!",errorMessage:"Не указана подгруппа 2 для создания нового товара!"});
                                    return;
                                }
                                r_ProdG2.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID2"],findByFields:["PGrName2"],
                                        idFieldName:"PGrID2",fieldsValues:{"PGrName2":pGrName2},fieldsDefValues:{"PGrID2":pGrID2},
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
                                            callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую подгруппу 2 товара:"+pGrName2+"!"});
                                            return;
                                        }
                                        prodData["PGrID2"]=result.resultItem["PGrID2"];
                                        var pGrID3=prodData["PGrID3"]||0,pGrName3=prodData["PGrName3"];
                                        if((pGrID3===undefined||pGrID3===null)&&(pGrName3===undefined||pGrName3===null||pGrName3.trim()==="")){
                                            callback({prodData:prodData, error:"No PGrID3 on PGrName3!",errorMessage:"Не указана подгруппа 3 для создания нового товара!"});
                                            return;
                                        }
                                        r_ProdG3.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID3"],findByFields:["PGrName3"],
                                                idFieldName:"PGrID3",fieldsValues:{"PGrName3":pGrName3},fieldsDefValues:{"PGrID3":pGrID3},
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
                                                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую подгруппу 3 товара:"+pGrName3+"!"});
                                                    return;
                                                }
                                                prodData["PGrID3"]=result.resultItem["PGrID3"];
                                                callback({prodData:prodData});
                                            })
                                    })
                            })
                    })
            })
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.storeProdMQ= function(connection,prodMQData,callback){
        if(!prodMQData) prodMQData={};
        var qty =prodMQData["Qty"];
        if(!qty)qty=1;
        var insProdMQData={"ProdID":prodMQData["ProdID"],"UM":prodMQData["UM"],"Qty":qty,
            "Weight":0.000,"Notes":null,"Barcode":prodMQData["Barcode"],"ProdBarcode":null,"PLID":0};
        for(var fieldName in insProdMQData)
            if(prodMQData[fieldName]!==undefined) insProdMQData[fieldName]=prodMQData[fieldName];
        r_ProdMQ.insDataItem(connection,{insData:insProdMQData},
            function(insResult){
                if(insResult.error||insResult.updateCount!=1){
                    callback({error:"Failed create prodMQ!"});
                    return;
                }
                callback({resultItem:insProdMQData});
            });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.storeProdPP= function(connection,prodPPData,callback){
        var prodID =prodPPData["ProdID"];
        var insProdPPData={"PPID":0,"ProdID":prodID,"PPDesc":"","Priority":0,
            "ProdDate":null,"ProdPPDate":null,"CompID":0,"Article":"","PPWeight":0,"PPDelay":0,"IsCommission":0,
            "PriceCC_In":0.00,"CostCC":0.00,"PriceMC":0.00, "CurrID":0, "PriceMC_In":0.00,"CostAC":0.00,
            "File1":null,"File2":null,"File3":null, "CstProdCode":"","CstDocCode":"", "ParentDocCode":0,"ParentChID":0};
        for(var fieldName in insProdPPData)
            if(prodPPData[fieldName]!==undefined) insProdPPData[fieldName]=prodPPData[fieldName];
        var ppIUD=prodPPData["PPID"];
        if(ppIUD!==undefined){
            t_PInP.insDataItem(connection,{insData:insProdPPData},function(insResult){
                if(insResult.error||insResult.updateCount!=1){
                    callback({error:"Failed create prod PP by PPID="+ppIUD+"!"});
                    return;
                }
                callback({resultItem:insProdPPData});
            });
            return;
        }
        r_DBIs.getNewPPID(connection,prodID,function(newPPID,err){
            if(err){
                callback({error:"Failed calc new PPID!"});
                return;
            }
            insProdPPData["PPID"]=newPPID;
            t_PInP.insDataItem(connection,{insData:insProdPPData},function(insResult){
                if(insResult.error||insResult.updateCount!=1){
                    callback({error:"Failed create prod PP by new PPID="+newPPID+"!"});
                    return;
                }
                callback({resultItem:insProdPPData});
            });
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.delete= function(connection,prodID,callback){
        this.delDataItem(connection,{conditions:{"ProdID=":prodID}},function(result){
            if(callback)callback(result);
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.storeNewProdWithProdMQandProdPP0= function(dbUC,prodData,dbUserParams,callback){
        r_Prods.getAttrIDorCreateNewByName(dbUC,{prodData:prodData,defValues:{"PGrID1":0,"PGrID2":0,"PGrID3":0}},function(prodAttrResult){
            if(prodAttrResult&&prodAttrResult.error){
                callback({error:"Failed get product attribute ID! Reason:"+prodAttrResult.error,errorMessage:prodAttrResult.errorMessage});
                return;
            }
            var prodUM= prodData["UM"];
            if(!prodUM||(prodUM=prodUM.trim())==="") prodUM= dbUserParams["DefaultUM"];
            var insProdData={"ChID":null,"ProdID":null, "ProdName":null, "UM":prodUM,
                "Article1":null, "Article2":null, "Article3":null, "Weight":null, "Age":null,
                "Country":"", "Notes":"", "Note1":null, "Note2":null, "Note3":null,
                "InRems":1, "IsDecQty":0, "InStopList":0,
                "PCatID":null, "PGrID":null, "PGrID1":null, "PGrID2":null, "PGrID3":null, "PGrAID":0, "PBGrID":0,
                "MinPriceMC":0.00,"MaxPriceMC":0.00,"MinRem":0.000, "CstDty":0.0,"CstPrc":0.0,"CstExc":0.0,
                "StdExtraR":0,"StdExtraE":0,"MaxExtra":0.0,"MinExtra":0.0,
                "UseAlts":0,"UseCrts":0, "LExpSet":0,"EExpSet":0, "File1":null,"File2":null,"File3":null, "AutoSet":0,
                "Extra1":0.0,"Extra2":0.0,"Extra3":0.0,"Extra4":0.0,"Extra5":0.0,
                "Norma1":0.0,"Norma2":0.0,"Norma3":0.0,"Norma4":0.0,"Norma5":0.0,
                "RecMinPriceCC":0.00,"RecMaxPriceCC":0.00,"RecStdPriceCC":0.00,"RecRemQty":0.000,
                "PrepareTime":null,
                "PGrID6":0, "ExciseGrID":0, "ScaleGrID":0,"ScaleStandard":null,"ScaleConditions":null,"ScaleComponents":null,
                "TaxFreeReason":null,
                "CstProdCode":null,"TaxTypeID":0,"CstDty2":0.0};
            for(var fieldName in insProdData){
                var value=prodData[fieldName];
                if(value!==undefined)insProdData[fieldName]=value;
            }
            r_Prods.insDataItemWithNewID(dbUC, {insData:insProdData, idFieldName:"ProdID",
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
                    if(barcode===undefined||barcode===null||barcode.trim()==""){
                        var iProdID=parseInt(prodID);
                        if(isNaN(iProdID)){
                            r_Prods.delete(dbUC,prodID);
                            callback({error:"Non correct ProdID for barcode!"});
                            return;
                        }
                        barcode= common.getEAN13Barcode(iProdID,23);
                    }
                    r_Prods.storeProdMQ(dbUC,{"ProdID":prodID,"UM":insProdData["UM"],"Barcode":barcode},
                        function(resultStoreProdMQ){
                            if(resultStoreProdMQ.error){
                                callback({error:resultStoreProdMQ.error});
                                r_Prods.delete(dbUC,prodID);
                                return;
                            }
                            resultItem["Barcode"]=barcode;
                            r_Prods.storeProdPP(dbUC,{"ProdID":prodID,"PPID":0},function(resultStorePP0){
                                if(resultStorePP0.error){
                                    r_Prods.delete(dbUC,prodID);
                                    callback({error:resultStorePP0.error});
                                    return;
                                }
                                callback({resultItem:resultItem});
                            });
                        });
                });
        });
    };

    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkExistsProdID= function(dbUC,prodName,prodID,existsProdIDByProdName,callback){
        if(!prodID || prodID==existsProdIDByProdName){
            callback({});
            return;
        }
        r_Prods.findProdByCondition(dbUC,{"r_Prods.ProdID=":prodID,"r_Prods.ProdName<>":prodName},function(findedProdByProdIDResult){
            if(findedProdByProdIDResult.error){ callback(findedProdByProdIDResult); return; }
            if(findedProdByProdIDResult.prodData){
                callback({error:"ProdID already exists!",errorMessage:"Для товара неверно указан код товара!"+
                    " Товар с указанным кодом уже существует для товара с наименованием \""+findedProdByProdIDResult.prodData["ProdName"]+"\""});
                return;
            }
            callback({resultItem:findedProdByProdIDResult});
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkExistsProdBarcode= function(dbUC,prodName,prodBarcode,existsProdBaseBarcodeByProdName,callback){
        if(!prodBarcode || prodBarcode==existsProdBaseBarcodeByProdName){
            callback({});
            return;
        }
        r_Prods.findProdWAllBCsByCondition(dbUC,{"Barcode=":prodBarcode},function(findedProdByProdBarcodeResult){
            if(findedProdByProdBarcodeResult.error){ callback(findedProdByProdBarcodeResult); return; }
            if(findedProdByProdBarcodeResult.prodData && findedProdByProdBarcodeResult.prodData["ProdName"]!=prodName){
                callback({error:"Barcode already exists!",errorMessage:"Для товара неверно указан штрихкод товара!"+
                    " Товар с указанным штрихкодом уже существует для товара с наименованием \""+findedProdByProdBarcodeResult.prodData["ProdName"]+"\""});
                return;
            }
            callback({resultItem:findedProdByProdBarcodeResult.prodData});
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkAndStoreProdMQ= function(connection,prodName,prodMQData,callback){
        if(!prodMQData) prodMQData={};
        var sBarcode= prodMQData["Barcode"],sBCUM= prodMQData["UM"];
        if(!prodMQData["Qty"]) prodMQData["Qty"]=1;
        var sErrMsg="Не удалось добавить штрихкод \""+prodMQData["Barcode"]+"\" для товара \""+prodName+"\"!";
        r_ProdMQ.getDataItem(connection,{fields:["Barcode"],conditions:{"ProdID=":prodMQData["ProdID"],"UM=":sBCUM}},
            function(findProdMQResult){
                if(findProdMQResult.error){ callback({error:findProdMQResult.error,errorMessage:sErrMsg}); return; }
                if(!findProdMQResult.item){
                    r_Prods.storeProdMQ(connection,prodMQData,function(storeProdMQResult){
                        if(storeProdMQResult.error){ callback({error:storeProdMQResult.error,errorMessage:sErrMsg}); return; }
                        callback({resultItem:storeProdMQResult.resultItem});
                    });
                    return;
                }
                if(findProdMQResult.item["Barcode"]==sBarcode){ callback({resultItem:prodMQData}); return; }
                var findMaxProdMQUMCondition={"ProdID=":prodMQData["ProdID"]},
                    umCondition="((UM like '"+sBCUM+"[0-9]') or (UM like '"+sBCUM+"[0-9][0-9]') or (UM like '"+sBCUM+"[0-9][0-9][0-9]')"+
                        " or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9]') or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9][0-9]')"+
                        " or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9][0-9][0-9]') or (UM like '"+sBCUM+"[0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))";
                findMaxProdMQUMCondition[umCondition]=null;
                r_ProdMQ.getDataItem(connection,{fields:["MaxBCUMPostfix"],fieldsFunctions:{"MaxBCUMPostfix":"REPLACE(UM,'"+sBCUM+"','')"},
                        conditions:findMaxProdMQUMCondition, order:"UM desc", top:"TOP 1"},
                    function(findMaxProdMQUMResult){
                        if(findMaxProdMQUMResult.error){ callback({error:findMaxProdMQUMResult.error,errorMessage:sErrMsg}); return; }
                        var sProdMQBCUMPostfix= "1";
                        if(findMaxProdMQUMResult.item){
                            sProdMQBCUMPostfix= findMaxProdMQUMResult.item["MaxBCUMPostfix"];
                            var iProdMQBCUMPostfix= parseInt(sProdMQBCUMPostfix);
                            sProdMQBCUMPostfix= (isNaN(iProdMQBCUMPostfix))?sProdMQBCUMPostfix+"1":iProdMQBCUMPostfix+1;
                        }
                        prodMQData["UM"]= sBCUM+sProdMQBCUMPostfix;
                        r_Prods.storeProdMQ(connection,prodMQData,function(storeProdMQResult){
                            if(storeProdMQResult.error){ callback({error:storeProdMQResult.error,errorMessage:sErrMsg}); return; }
                            callback({resultItem:storeProdMQResult.resultItem});
                        });
                    });
            });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkAndStoreNewProdIfNotExists= function(dbUC,prodData,dbUserParams,callback){
        var prodName=prodData["ProdName"];
        if(!prodName||(prodName=prodName.trim())===""){
            callback({error:"No ProdName!",errorMessage:"Не задано наименование товара!"});
            return;
        }
        var prodUM=prodData["UM"];
        if(!prodUM||(prodUM=prodUM.trim())==="")prodUM=dbUserParams["DefaultUM"];
        if(!prodUM||(prodUM=prodUM.trim())===""){
            callback({error:"No Prod UM!",errorMessage:"Не задана единица измерения товара \n(и не определена в настройках по умолчанию для товара)!"});
            return;
        }
        r_Prods.findProdByFieldsValues(dbUC,{"ProdName":prodName},function(findProdByNameResult){//finding by Barcode/ProdID/ProdName
            if(findProdByNameResult.error){ callback(findProdByNameResult); return; }
            var existsProdIDByProdName=null, existsProdBaseBarcodeByProdName=null,
                existsProdUMByProdName=null;
            if(findProdByNameResult.prodData){
                existsProdIDByProdName= findProdByNameResult.prodData["ProdID"];
                existsProdBaseBarcodeByProdName= findProdByNameResult.prodData["Barcode"];
                existsProdUMByProdName= findProdByNameResult.prodData["UM"];
            }
            var prodID=prodData["ProdID"];
            if(prodID&&typeof(prodID)=="string") prodID= prodID.toString().trim();
            r_Prods.checkExistsProdID(dbUC,prodName,prodID,existsProdIDByProdName,function(checkExistsProdIDResult){
                if(checkExistsProdIDResult.error){ callback(checkExistsProdIDResult); return; }
                var prodBarcode=prodData["Barcode"];
                if(prodBarcode&&typeof(prodBarcode)=="string") prodBarcode= prodBarcode.toString().trim();
                r_Prods.checkExistsProdBarcode(dbUC,prodName,prodBarcode,existsProdBaseBarcodeByProdName,function(checkExistsProdBarcodeResult){
                    if(checkExistsProdBarcodeResult.error){ callback(checkExistsProdBarcodeResult); return; }
                    if(!findProdByNameResult.prodData){//CREATE NEW PRODUCT WITH BARCODE
                        r_Prods.storeNewProdWithProdMQandProdPP0(dbUC,prodData,dbUserParams,callback);
                        return;
                    }
                    if(!prodID&&existsProdIDByProdName) prodData["ProdID"]=existsProdIDByProdName;
                    if(existsProdUMByProdName&&prodUM!=existsProdUMByProdName) prodData["UM"]=existsProdUMByProdName;
                    if(!prodBarcode&&existsProdBaseBarcodeByProdName) prodData["Barcode"]=existsProdBaseBarcodeByProdName;
                    if(findProdByNameResult.prodData && !checkExistsProdBarcodeResult.resultItem){//ADD BARCODE FOR EXISTS PRODUCT
                        r_Prods.checkAndStoreProdMQ(dbUC,prodName,{"ProdID":prodData["ProdID"],"UM":prodData["UM"],"Barcode":prodData["Barcode"]},
                            function(resultCheckAndStoreProdMQ){
                                if(resultCheckAndStoreProdMQ.error){
                                    r_Prods.delete(dbUC,prodID);
                                    callback(resultCheckAndStoreProdMQ);
                                    return;
                                }
                                prodData["UM"]= resultCheckAndStoreProdMQ.resultItem["UM"];
                                callback({resultItem:prodData});
                            });
                        return;
                    }
                    callback({resultItem:prodData});
                })
            });
        });
    }
};
