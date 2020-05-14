var dataModel= require(appDataModelPath),database= require("../databaseMSSQL"), systemFuncs= require("../systemFuncs");
var r_Prods= require(appDataModelPath+"r_Prods"), r_ProdMQ= require(appDataModelPath+"r_ProdMQ"),
    r_ProdC= require(appDataModelPath+"r_ProdC"), r_ProdG= require(appDataModelPath+"r_ProdG"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3"),
    ir_ProdColors= require(appDataModelPath+"ir_ProdColors"), ir_ProdSizes= require(appDataModelPath+"ir_ProdSizes"),
    if_GetProdByMaskValues= require(appDataModelPath+"if_GetProdByMaskValues"),
    t_PInP= require(appDataModelPath+"t_PInP"), z_Sys= require(appDataModelPath+"z_Sys"), r_Currs= require(appDataModelPath+"r_Currs");
    //r_CRUniInput=require(appDataModelPath+"r_CRUniInput");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Prods,r_ProdMQ,r_ProdC,r_ProdG,r_ProdG1,r_ProdG2,r_ProdG3,ir_ProdColors,ir_ProdSizes,if_GetProdByMaskValues,
            t_PInP,z_Sys,r_Currs/*,r_CRUniInput*/], errs,
        function(){ nextValidateModuleCallback(); });
};

module.exports.init= function(app){
    var prodsTableColumns=[
        {data: "ProdID", name: "ProdID", width: 80, type: "text", readOnly:true, visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center" },
        {data: "Article1", name: "Артикул1 товара", width: 200, type: "text", sourceField:"Article1" },
        {data:"Country", name:"Страна товара", width:80, sourceField:"Country"
            //type:"comboboxWN", sourceURL:"/dirsProds/getDataForArticle1Combobox",
        },
        {data: "Barcode", name: "Штрихкод", width: 50, type: "text",
            dataSource:"r_ProdMQ", sourceField:"barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM" },
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
        {data: "PGrName1", name: "Линия товара", width: 90,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data: "ColorName", name: "Цвет товара", width: 80,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForColorNameCombobox",
            dataSource:"ir_ProdColors", dataFunction:"CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END",
            linkCondition:"ir_ProdColors.ColorID=r_Prods.ColorID"},
        {data: "SizeName", name: "Размер товара", width: 90,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForSizeNameCombobox",
            dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>0 Then ir_ProdSizes.SizeName Else '' END",
            linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"}
    ];
    //dirProductsTableColumns=
    //    dir_products_bata.addProductColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductBataAttrsColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductAttrsColumnsTo(dirProductsTableColumns,8);

    app.get("/dirsProds/getDataForCountryCombobox", function(req,res){
        r_Prods.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"Country":"Country"}, order:"Country"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForArticle1Combobox", function(req,res){
        r_Prods.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"Article1":"Article1"}, order:"Article1"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForPCatNameCombobox", function(req,res){
        r_ProdC.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PCatName":"PCatName","PCatID":"PCatID"},
                conditions:{"PCatID>0":null}, order:"PCatName desc"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForPGrNameCombobox", function(req,res){
        r_ProdG.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName":"PGrName","PGrID":"PGrID"},
                conditions:{"PGrID>0":null}, order:"PGrName"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForPGrName1Combobox", function(req,res){
        r_ProdG1.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName1":"PGrName1","PGrID1":"PGrID1"},
                conditions:{"PGrID1>0":null}, order:"PGrName1"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForPGrName2Combobox", function(req,res){
        r_ProdG2.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName2":"PGrName2","PGrID2":"PGrID2"},
                conditions:{"PGrID2>0":null}, order:"PGrName2"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForPGrName3Combobox", function(req,res){
        r_ProdG3.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName3":"PGrName3","PGrID3":"PGrID3"},
                conditions:{"PGrID3>0":null}, order:"PGrName3"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForColorNameCombobox", function(req,res){
        ir_ProdColors.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"ColorName":"ColorName"},
                conditions:{"ChID>0":null}, order:"ColorName"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getDataForSizeNameCombobox", function(req,res){
        ir_ProdSizes.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"SizeName":"SizeName"},
                conditions:{"ChID>0":null}, order:"SizeName"},
            function(result){ res.send(result); }
        );
    });
    app.get("/dirsProds/getProdDataByIDName",function(req,res){
        var conditions={};
        if(req.query["ProdID"]) conditions["r_Prods.ProdID="]=req.query["ProdID"];
        if(req.query["ProdName"]) conditions["r_Prods.ProdName="]=req.query["ProdName"];
        r_Prods.getDataItemForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){ res.send(result); }
        );
    });
    /** used in mobile inventory
     * conditions = { <conditions> }
     * callback = function(result), result = { prodData, error,errorMessage }
     */
    r_Prods.findProdByCondition= function(dbUC,conditions,callback){//IT'S used for get prod data from mobile invent
        r_Prods.getDataItemForTable(dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){
                if(!result||result.error){
                    var sErr= "Failed find r_Prods prod data!",sErrMsg= "Не удалось найти товар!";
                    sErr+="\n"+result.error; sErrMsg+="\n"+result.error;
                    callback({error:sErr,errorMessage:sErrMsg});
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
                    if(!resultFindProd||resultFindProd.error){
                        var sErr="Failed find r_Prods prod data by "+(uniInputAction==1)?"Barcode=\""+value+"\"!":"r_Prods.ProdID="+value+"!",
                            sErrMsg="Не удалось найти товар по значению "+value+"!";
                        sErr+="\n"+resultFindProd.error; sErrMsg+="\n"+resultFindProd.errorMessage;
                        callback({error:sErr,errorMessage:sErrMsg});
                        return;
                    }else if(!resultFindProd.prodData){
                        var sErr="Cannot find r_Prods prod data by "+(uniInputAction==1)?"Barcode=\""+value+"\"!":"r_Prods.ProdID="+value+"!",
                            sErrMsg="Товар по значению "+value+" не найден!";
                        callback({error:sErr,errorMessage:sErrMsg});
                        return;
                    }
                    callback({prodData:resultFindProd.prodData});
                });
            });
    };

    /**
     *
     * callback = function(error, prodData), error = {error,errorMessage}
     */
    r_Prods.getNewProdNameByAttrs= function(dbUC,prodData,callback){
        //dbo.if_GetProdNameByMaskValues
        //(@ProdID int/*Код товара*/, @PCatName varchar(200)/*Коллекция*/,@PCatSName varchar(200)/*Сокр.Коллекция*/, @PGrName varchar(200)/*Бренд*/, @PGrName1 varchar(200)/*Линия*/,@PGrSName1 varchar(200)/*Сокр.Линия*/,
        //    @PGrName2 varchar(200)/*Вид*/, @PGrName3 varchar(200)/*Состав*/,
        //    @Article1 varchar(200), @Article2 varchar(200), @Article3 varchar(200),
        //    @ColName varchar(200)/*Цвет*/, @Size varchar(200)/*Размер*/, @Sizes varchar(200)/*Доступные размеры*/)

        //if_GetProdNameByMaskValues(ProdID, PCatName,PGrName1,PGrName3,PGrSName3,Article1,Article2,Article3, ColorName,ColorSName, SizeName,ValidSizes, Growth)
        database.selectParamsQuery(dbUC,
            "select ProdName= LTRIM(RTRIM( dbo.if_GetProdNameByMaskValues(@p0, @p1,@p2,@p3,@p4,@p5, @p6,@p7, @p8,@p9,@p10, @p11,@p12,@p13) ))",
            [prodData["ProdID"], prodData["PCatName"],prodData["PCatSName"], prodData["PGrName"], prodData["PGrName1"],prodData["PGrSName1"],
                prodData["PGrName2"], prodData["PGrName3"],
                prodData["Article1"],prodData["Article2"],prodData["Article3"],
                prodData["ColorName"], prodData["SizeName"],prodData["ValidSizes"]],
            function(err, recordset, rowsCount, fieldsTypes){
                if(err){
                    callback({error:"Failed GetProdNameByMaskValues! Reason: "+err.message,
                        errorMessage:"Не удалось получить наименование товара по артибутам товара!"});
                    return;
                }
                if(recordset&&recordset.length>0)prodData["ProdName"]=recordset[0]["ProdName"];
                callback(null,prodData);
            });
    };
    app.get("/dirsProds/getProdNameAndAttrsByArticle1",function(req,res){
        var prodData=req.query, prodArticle1=prodData["Article1"], sendResult={};
        if(prodArticle1==null||prodArticle1.trim()==""){
            r_Prods.getNewProdNameByAttrs(req.dbUC,prodData,function(err,prodNameData){
                if(prodNameData) sendResult.itemProdName={"ProdName":prodNameData["ProdName"],"UM":req.dbUserParams["DefaultUM"]};
                if(err)sendResult.errorProdName=err;
                res.send(sendResult);
            });
            return;
        }
        r_Prods.getDataItemsForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:{"r_Prods.Article1=":prodArticle1}},
            function(result){
                var resultProdAttrs=null, sUM;
                if(result.items&&result.items.length>0) {
                    var resultItem= result.items[0], resultProdAttrs={};
                    resultProdAttrs["PCatName"]= resultItem["PCatName"]; resultProdAttrs["PGrName"]= resultItem["PGrName"];
                    resultProdAttrs["PGrName1"]= resultItem["PGrName1"]; resultProdAttrs["PGrName2"]= resultItem["PGrName2"];
                    resultProdAttrs["PGrName3"]= resultItem["PGrName3"];
                    resultProdAttrs["UM"]= resultItem["UM"]; resultProdAttrs["Country"]= resultItem["Country"];
                    for(var fieldName in resultProdAttrs) prodData[fieldName]= resultProdAttrs[fieldName];
                    sUM= resultProdAttrs["UM"];
                    if(sUM==null||sUM.trim()=="") resultProdAttrs["UM"]= req.dbUserParams["DefaultUM"];
                }
                if(resultProdAttrs) sendResult.item= resultProdAttrs;
                if(result.error) sendResult.error= result.error;
                r_Prods.getNewProdNameByAttrs(req.dbUC,prodData,function(err,prodNameData){
                    if(prodNameData) sendResult.itemProdName={"ProdName":prodNameData["ProdName"]};
                    if(err)sendResult.errorProdName=err;
                    res.send(sendResult);
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
    //            if(err){
    //                res.send({error:err});
    //                return
    //            }
    //            if(prodNameData)prodData["ProdName"]=prodNameData["ProdName"];
    //            if(prodNameData)prodData["UM"]=req.dbUserParams["DefaultUM"];
    //            res.send({item:prodData});
    //        });
    //});
    if(!z_Sys.getNewChID) throw new Error('NO z_Sys.getNewChID!');
    /**
     * callback = function(result), result= { prodData, error,errorMessage }
     */
    r_Prods.getAttrIDorCreateNewByName= function(dbUC,prodData,callback){
        if(!prodData){
            callback({error:"No prod attributes!",errorMessage:"Нет данных атрибутов товара для создания нового товара!"});
            return;
        }
        var pCatID= prodData["PCatID"], pCatName= prodData["PCatName"];
        if((pCatID==null)&&(pCatName==null||pCatName.trim()==="")){
            callback({prodData:prodData, error:"No PCatID on PCatName!",errorMessage:"Не указана коллекция для создания нового товара!"});
            return;
        }
        r_ProdC.findDataItemByOrCreateNew(dbUC,{resultFields:["PCatID"],findByFields:["PCatName"],
                idFieldName:"PCatID",fieldsValues:{"PCatName":pCatName},
                calcNewIDValue:function(params,callback){
                    z_Sys.getNewChID(dbUC,"r_ProdC",function(chID,err){
                        if(!err) params.insData["ChID"]=chID;
                        z_Sys.getNewRefID(dbUC,"r_ProdC","PCatID",function(refID,err){
                            if(!err) params.insData["PCatID"]=refID;
                            callback({data:params.insData},params);
                        })
                    })
                }},
            function(result){
                if(result.error){
                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новую коллекцию товара:"+pCatName+"!"});
                    return;
                }
                prodData["PCatID"]= result.resultItem["PCatID"];
                var pGrID= prodData["PGrID"], pGrName= prodData["PGrName"];
                if((pGrID==null)&&(pGrName==null||pGrName.trim()==="")){
                    callback({prodData:prodData, error:"No PGrID on PGrName!",errorMessage:"Не указан бренд для создания нового товара!"});
                    return;
                }
                r_ProdG.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID"],findByFields:["PGrName"],
                        idFieldName:"PGrID",fieldsValues:{"PGrName":pGrName},
                        calcNewIDValue:function(params,callback){
                            z_Sys.getNewChID(dbUC,"r_ProdG",function(chID,err){
                                if(!err){ params.insData["ChID"]=chID; }
                                z_Sys.getNewRefID(dbUC,"r_ProdG","PGrID",function(refID,err){
                                    if(!err) params.insData["PGrID"]=refID;
                                    callback({data:params.insData},params);
                                })
                            })
                        }},
                    function(result){
                        if(result.error){
                            callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новый бренд товара:"+pGrName+"!"});
                            return;
                        }
                        prodData["PGrID"]= result.resultItem["PGrID"];
                        var pGrID1= prodData["PGrID1"], pGrName1= prodData["PGrName1"];
                        if((pGrID1==null)&&(pGrName1==null||pGrName1.trim()==="")){
                            callback({prodData:prodData, error:"No PGrID1 on PGrName1!",errorMessage:"Не указана линия для создания нового товара!"});
                            return;
                        }
                        r_ProdG1.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID1"],findByFields:["PGrName1"],
                                idFieldName:"PGrID1",fieldsValues:{"PGrName1":pGrName1},
                                calcNewIDValue:function(params,callback){
                                    z_Sys.getNewChID(dbUC,"r_ProdG1",function(chID,err){
                                        if(!err) params.insData["ChID"]=chID;
                                        z_Sys.getNewRefID(dbUC,"r_ProdG1","PGrID1",function(refID,err){
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
                                prodData["PGrID1"]= result.resultItem["PGrID1"];
                                var pGrID2= prodData["PGrID2"], pGrName2= prodData["PGrName2"];
                                if((pGrID2==null)&&(pGrName2==null||pGrName2.trim()==="")){
                                    callback({prodData:prodData, error:"No PGrID2 on PGrName2!",errorMessage:"Не указан вид для создания нового товара!"});
                                    return;
                                }
                                r_ProdG2.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID2"],findByFields:["PGrName2"],
                                        idFieldName:"PGrID2",fieldsValues:{"PGrName2":pGrName2},
                                        calcNewIDValue:function(params,callback){
                                            z_Sys.getNewChID(dbUC,"r_ProdG2",function(chID,err){
                                                if(!err) params.insData["ChID"]=chID;
                                                z_Sys.getNewRefID(dbUC,"r_ProdG2","PGrID2",function(refID,err){
                                                    if(!err) params.insData["PGrID2"]=refID;
                                                    callback({data:params.insData},params);
                                                })
                                            })
                                        }},
                                    function(result){
                                        if(result.error){
                                            callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новый вид товара:"+pGrName2+"!"});
                                            return;
                                        }
                                        prodData["PGrID2"]= result.resultItem["PGrID2"];
                                        var pGrID3= prodData["PGrID3"], pGrName3= prodData["PGrName3"];
                                        if((pGrID3==null)&&(pGrName3==null||pGrName3.trim()==="")){
                                            callback({prodData:prodData, error:"No PGrID3 on PGrName3!",errorMessage:"Не указан состав для создания нового товара!"});
                                            return;
                                        }
                                        r_ProdG3.findDataItemByOrCreateNew(dbUC,{resultFields:["PGrID3"],findByFields:["PGrName3"],
                                                idFieldName:"PGrID3",fieldsValues:{"PGrName3":pGrName3},
                                                calcNewIDValue:function(params,callback){
                                                    z_Sys.getNewChID(dbUC,"r_ProdG3",function(chID,err){
                                                        if(!err) params.insData["ChID"]=chID;
                                                        z_Sys.getNewRefID(dbUC,"r_ProdG3","PGrID3",function(refID,err){
                                                            if(!err) params.insData["PGrID3"]=refID;
                                                            callback({data:params.insData},params);
                                                        })
                                                    })
                                                }},
                                            function(result){
                                                if(result.error){
                                                    callback({prodData:prodData, error:result.error,errorMessage:"Не удалось найти и/или создать новый состав товара:"+pGrName3+"!"});
                                                    return;
                                                }
                                                prodData["PGrID3"]= result.resultItem["PGrID3"];
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
        if((colorID===undefined||colorID===null)&&(colorName===undefined||colorName===null||colorName.trim()==="")){
            prodData["ColorID"]=0;
            callback({prodData:prodData});
            return;
        }
        ir_ProdColors.findDataItemByOrCreateNew(dbUC, {resultFields:["ColorID"],findByFields:["ColorName"],
                idFieldName:"ColorID",fieldsValues:{"ColorName":colorName},
                calcNewIDValue:function(params,callback){
                    z_Sys.getNewChID(dbUC,"ir_ProdColors",function(chID,err){
                        if(!err) params.insData["ChID"]=chID;
                        z_Sys.getNewRefID(dbUC,"ir_ProdColors","ColorID",function(refID,err){
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
        if(sizeName===undefined||sizeName===null||sizeName.trim()===""){
            prodData["SizeName"]="Размер не указан";
            callback({prodData:prodData});
            return;
        }
        ir_ProdSizes.findDataItemByOrCreateNew(dbUC,
            {resultFields:["SizeName"],findByFields:["SizeName"],idFieldName:"SizeName",fieldsValues:{"SizeName":sizeName,"Notes":sizeName},
                calcNewIDValue:function(params,callback){
                    z_Sys.getNewChID(dbUC,"ir_ProdSizes",function(chID,err){
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
    r_Prods.addProdMQ= function(dbUC,prodPPData,callback){
        var qty =prodPPData["Qty"];
        if(qty===undefined)qty=1;
        var insProdMQData={"ProdID":prodPPData["ProdID"],"UM":prodPPData["UM"],"Qty":qty,
            "Weight":0.000,"Notes":null,"Barcode":prodPPData["Barcode"],"ProdBarcode":null,"PLID":0};
        for(var fieldName in insProdMQData)
            if(prodPPData[fieldName]!==undefined) insProdMQData[fieldName]=prodPPData[fieldName];
        r_ProdMQ.insDataItem(dbUC,{insData:insProdMQData},
            function(insResult){
                if(insResult.error||insResult.updateCount!=1){
                    callback({error:"Failed create prodMQ! Reason:"+(insResult.error||"UNKNOWN."),
                        errorMessage:"Не удалось создать вид упаковки для товара!"});
                    return;
                }
                callback({resultItem:insProdMQData});
            });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.addProdPP=function(dbUC,prodPPData,callback){
        var prodID= prodPPData["ProdID"];
        var insProdPPData={
            "ProdID":prodID,"PPID":0,"PPDesc":"","Priority":0,"ProdDate":null,
            "Article":null,"PPWeight":0, "PPDelay":0,"ProdPPDate":null,
            "PriceMC_In":0.00,"PriceMC":0.00, "CurrID":null,"CompID":0, "CostAC":0.00, "PriceCC_In":0.00,"CostCC":0.00,
            "File1":null,"File2":null,"File3":null
        };
        for(var fieldName in insProdPPData)
            if(prodPPData[fieldName]!==undefined) insProdPPData[fieldName]=prodPPData[fieldName];

        var currID= prodPPData["CurrID"]||0;
        r_Currs.getDataItem(dbUC,{fields:["CurrID","CurrName"],conditions:{"CurrID=":currID}},function(resultGetCurr){
            if(resultGetCurr.error||!resultGetCurr.item){
                callback({error:"Failed get Curr for create prod PP! Reason:"+(resultGetCurr.error||"NO Curr in Currs dir."),
                    errorMessage:"Не удалось получить валюту для создания партии товара!"+
                        " "+((resultGetCurr.error)?"Не удалось найти валюту для партиию.":"Нет валюты в справочнике валют.")});
                return;
            }
            insProdPPData["CurrID"]= resultGetCurr.item["CurrID"];
            var ppIUD= prodPPData["PPID"];
            if(ppIUD!==undefined){
                t_PInP.insDataItem(dbUC,{insData:insProdPPData},function(insResult){
                    if(insResult.error||insResult.updateCount!=1){
                        callback({error:"Failed create prod PP by PPID="+ppIUD+"! Reason:"+(insResult.error||"UNKNOWN."),
                            errorMessage:"Не удалось создать партию "+ppIUD+" для товара!"});
                        return;
                    }
                    callback({resultItem:insProdPPData});
                });
                return;
            }
            z_Sys.getNewPPID(dbUC,prodID,function(newPPID,err){
                if(err){ callback({error:"Failed calc new PPID!",errorMessage:"Не удалось вычислить номер для согдания новой партии!"}); return; }
                insProdPPData["PPID"]=newPPID;
                t_PInP.insDataItem(dbUC,{insData:insProdPPData},function(insResult){
                    if(insResult.error||insResult.updateCount!=1){
                        callback({error:"Failed create prod new PP by new PPID="+newPPID+"! Reason:"+(insResult.error||"UNKNOWN."),
                            errorMessage:"Не удалось создать новую партию для товара!"});
                        return;
                    }
                    callback({resultItem:insProdPPData});
                });
            });
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.delete=function(dbUC,prodID,callback){
        this.delDataItem(dbUC,{conditions:{"ProdID=":prodID}},function(result){
            if(callback)callback(result);
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.addProdWithProdMQandProdPP0= function(dbUC,prodData,dbUserParams,callback){
        r_Prods.getAttrIDorCreateNewByName(dbUC,prodData,function(result){
            if(result&&result.error){
                callback({error:"Failed get product attribute ID! Reason:"+result.error,errorMessage:result.errorMessage||result.error});
                return;
            }
            var prodUM= prodData["UM"];
            if(!prodUM||prodUM.trim()==="") prodUM= dbUserParams["DefaultUM"];
            if(!prodUM||prodUM.trim()===""){
                callback({error:"Failed create new product! Reason: no product UM.",errorMessage:"Не удалось создать новый товар! Не указана Ед.Изм. для товара."});
                return;
            }
            var insProdData= {
                "ChID":null,"ProdID":null,"ProdName":"","UM":prodUM,"Country":null,"Notes":null,"InRems":1,"IsDecQty":0,"InStopList":0,
                "Note1":null,"Note2":null,"Note3":null,
                "Article1":null,"Article2":null,"Article3":null,"Weight":null,"Age":null,
                "TaxPercent":0,"PriceWithTax":0,
                "PCatID":null,"PGrID":null, "PGrID1":null,"PGrID2":null,"PGrID3":null,"PGrAID":0,"PBGrID":0,
                "MinPriceMC":0.00,"MaxPriceMC":0.00,"MinRem":0.00,
                "CstDty":0.00,"CstPrc":0.00,"CstExc":0.00,"StdExtraR":0.00,"StdExtraE":0.00,"MaxExtra":0.00,"MinExtra":0.00,
                "UseAlts":0,"UseCrts":0, "RExpSet":0,"EExpSet":0,
                "File1":null,"File2":null,"File3":null,
                "AutoSet":0,"Extra1":0.00,"Extra2":0.00,"Extra3":0.00,"Extra4":0.00,"Extra5":0.00,
                "Norma1":0.00,"Norma2":0.00,"Norma3":0.00,"Norma4":0.00,"Norma5":0.00,
                "RecMinPriceCC":0.00,"RecMaxPriceCC":0.00,"RecStdPriceCC":0.00,"RecRemQty":0.00,
                "ColorID":null,"SizeName":null
            };
            for(var fieldName in insProdData) {
                var value= prodData[fieldName];
                if(value!==undefined) insProdData[fieldName]=value;
            }
            r_Prods.insDataItemWithNewID(dbUC,{insData:insProdData,idFieldName:"ProdID",
                    calcNewIDValue:function(params,callback){
                        z_Sys.getNewChID(dbUC,"r_Prods",function(newChID,err){
                            if(err){
                                callback({error:err.message,errorMessage:"Не удалось получить новый ключ для создания нового товара!"});
                                return;
                            }
                            params.insData["ChID"]=newChID;
                            var prodID= params.insData["ProdID"];
                            if(prodID&&prodID.toString().trim()!=""){ callback({data:params.insData},params); return; }
                            z_Sys.getNewRefID(dbUC,"r_Prods","ProdID",function(newProdID,err){
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
                            callback({error:"Non correct ProdID for barcode!",errorMessage:"Не корректный код товара для создания штрихкода!"});
                            return;
                        }
                        barcode= systemFuncs.getEAN13Barcode(iProdID,23);
                    }
                    r_Prods.addProdMQ(dbUC,{"ProdID":prodID,"UM":insProdData["UM"],"Barcode":barcode},
                        function(resultStoreProdMQ){
                            if(resultStoreProdMQ.error){
                                callback({error:resultStoreProdMQ.error,errorMessage:resultStoreProdMQ.errorMessage});
                                r_Prods.delete(dbUC,prodID);
                                return;
                            }
                            insProdData["Barcode"]=barcode;
                            r_Prods.addProdPP(dbUC,{"ProdID":prodID,"PPID":0},function(resultStorePP0){
                                if(resultStorePP0.error){
                                    r_Prods.delete(dbUC,prodID);
                                    callback({error:resultStorePP0.error, errorMessage:resultStorePP0.errorMessage});
                                    return;
                                }
                                callback({resultItem:insProdData});
                            });
                        });
                });
        });
    }
};
