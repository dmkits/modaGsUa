var dataModel= require(appDataModelPath), database= require("../databaseMSSQL");
var r_Prods= require(appDataModelPath+"r_Prods"), r_ProdMQ= require(appDataModelPath+"r_ProdMQ"),
    r_ProdC= require(appDataModelPath+"r_ProdC"), r_ProdG= require(appDataModelPath+"r_ProdG"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3"),
    ir_ProdColors= require(appDataModelPath+"ir_ProdColors"), ir_ProdSizes= require(appDataModelPath+"ir_ProdSizes"),
    r_CRUniInput= require(appDataModelPath+"r_CRUniInput");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels(
        [r_Prods,r_ProdMQ,r_ProdC,r_ProdG,r_ProdG1,r_ProdG2,r_ProdG3,ir_ProdColors,ir_ProdSizes, r_CRUniInput],
        errs, function(){ nextValidateModuleCallback(); });
};

module.exports.init= function(app){
    var prodsTableColumns=[
        {data: "ProdID", name: "ProdID", width: 80, type: "text", readOnly:true, visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center" },
        {data: "Article1", name: "Артикул1 товара", width: 200, type: "text", sourceField:"Article1" },
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
            dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END",
            linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"}
    ];
    //dirProductsTableColumns=
    //    dir_products_bata.addProductColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductBataAttrsColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductAttrsColumnsTo(dirProductsTableColumns,8);

    app.get("/dirsProds/getDataForArticle1Combobox", function(req, res){
        r_Prods.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"Article1":"Article1"}, order:"Article1"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForPCatNameCombobox", function(req, res){
        r_ProdC.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PCatName":"PCatName","PCatID":"PCatID"},
                conditions:{"PCatID>0":null}, order:"PCatName"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForPGrNameCombobox", function(req, res){
        r_ProdG.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName":"PGrName","PGrID":"PGrID"},
                conditions:{"PGrID>0":null}, order:"PGrName"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForPGrName1Combobox", function(req, res){
        r_ProdG1.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName1":"PGrName1","PGrID1":"PGrID1"},
                conditions:{"PGrID1>0":null}, order:"PGrName1"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForPGrName2Combobox", function(req, res){
        r_ProdG2.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName2":"PGrName2","PGrID2":"PGrID2"},
                conditions:{"PGrID2>0":null}, order:"PGrName2"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForPGrName3Combobox", function(req, res){
        r_ProdG3.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName3":"PGrName3","PGrID3":"PGrID3"},
                conditions:{"PGrID3>0":null}, order:"PGrName3"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForColorNameCombobox", function(req, res){
        ir_ProdColors.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"ColorName":"ColorName"},
                conditions:{"ChID>0":null}, order:"ColorName"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getDataForSizeNameCombobox", function(req, res){
        ir_ProdSizes.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"SizeName":"SizeName"},
                conditions:{"ChID>0":null}, order:"SizeName"},
            function(result){ res.send(result); });
    });
    app.get("/dirsProds/getProdDataByIDName",function(req,res){
        var conditions={};
        if(req.query["ProdID"]) conditions["r_Prods.ProdID="]=req.query["ProdID"];
        if(req.query["ProdName"]) conditions["r_Prods.ProdName="]=req.query["ProdName"];
        r_Prods.getDataItemForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){ res.send(result); });
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

    r_Prods.getProdDataWithAttrsByArticle1= function(dbUC,prodData,callback){
        var prodArticle1= prodData["Article1"], resultProdDataWithAttrs={};
        r_Prods.getDataItemsForTable(dbUC,{tableColumns:prodsTableColumns, conditions:{"r_Prods.Article1=":prodArticle1}},
            function(result){
                var resultProdAttrs=null;
                if(result.items&&result.items.length>0) {
                    var resultItem=result.items[0], resultProdAttrs={};
                    resultProdAttrs["PCatName"]=resultItem["PCatName"]; resultProdAttrs["PGrName"]=resultItem["PGrName"];
                    resultProdAttrs["PGrName1"]=resultItem["PGrName1"]; resultProdAttrs["PGrName2"]=resultItem["PGrName2"];
                    resultProdAttrs["PGrName3"]=resultItem["PGrName3"];
                }
                if(resultProdAttrs) resultProdDataWithAttrs.item= resultProdAttrs;
                if(result.error) resultProdDataWithAttrs.error= result.error;
                callback(resultProdDataWithAttrs);
            });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.delete=function(connection,prodID,callback){
        this.delDataItem(connection,{conditions:{"ProdID=":prodID}},function(result){
            if(callback)callback(result);
        });
    };
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkExistsProdID= function(dbUC,prodID,existsProdIDByProdName,prodName,callback){
        if(!prodID || prodID==existsProdIDByProdName){ callback({}); return; }
        r_Prods.getDataItemForTable(dbUC,{tableColumns:prodsTableColumns,conditions:{"r_Prods.ProdID=":prodID,"r_Prods.ProdName<>":prodName}},
            function(resultFindProdByProdID){
                if(resultFindProdByProdID.error){ callback(resultFindProdByProdID); return; }
                if(resultFindProdByProdID.item){
                    callback({error:"ProdID already exists!",errorMessage:"Для товара неверно указан код товара!"+
                        " Товар с указанным кодом уже существует для товара с наименованием \""+resultFindProdByProdID.item["ProdName"]+"\""});
                    return;
                }
                callback({});
            });
    };
    var prodsWAllBarcodesTableColumns=[
        {data:"ProdID", name:"ProdID", width:80, type:"text", readOnly:true, visible:false},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text" },
        {data:"UM", name:"Осн. Ед.изм.", width:55, type:"text", align:"center" },
        {data:"Article1", name:"Артикул1 товара", width:200, type:"text", sourceField:"Article1" },
        {data:"Barcode", name:"Штрихкод", width:50, type:"text",
            dataSource:"r_ProdMQ", sourceField:"barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID" },
        {data:"BCUM", name:"Ед.изм. ШК", width:55, type:"text", align:"center", dataSource:"r_ProdMQ", sourceField:"UM" },
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
    /** finding product by Barcode/ProdID/ProdName
     * findConditions = { "Barcode=":<value>, "ProdID=":<value>, "ProdName=":<value> }
     * callback = function(result={prodData, error,errorMessage})
     */
    r_Prods.findProdByBCIDNameValues= function(dbUC,findConditions,callback){//finding by Barcode/ProdID/ProdName
        var conditions={}, findByBarcode=false;
        if(findConditions["Barcode="]){ conditions["Barcode="]= findConditions["Barcode="]; findByBarcode=true; }
        if(findConditions["ProdID="]) conditions["r_Prods.ProdID="]= findConditions["ProdID="];
        if(findConditions["ProdName="]) conditions["r_Prods.ProdName="]= findConditions["ProdName="];
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
    /**
     * params = Barcode=<value> & ProdID=<value> & ProdName=<value>
     */
    app.get("/dirsProds/getProdDataByProdBarcodeIDName",function(req,res){
        r_Prods.findProdByBCIDNameValues(req.dbUC,req.query,function(findProdResult){
            if(findProdResult&&findProdResult.error){
                res.send({error:{error:findProdResult.error,userMesssage:findProdResult.userMesssage}});
                return;
            }
            res.send({item:findProdResult.prodData});
        });
    });
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkExistsProdBarcode= function(dbUC,prodBarcode,prodName,callback){
        if(prodBarcode==null){ callback({}); return; }
        r_Prods.findProdWAllBCsByCondition(dbUC,{"Barcode=":prodBarcode},function(resultFindProdByBarcode){
            if(resultFindProdByBarcode.error){ callback(resultFindProdByBarcode); return; }
            if( resultFindProdByBarcode.prodData && resultFindProdByBarcode.prodData["ProdName"]!=prodName ){
                callback({error:"Barcode already exists!",errorMessage:"Для товара неверно указан штрихкод товара!"+
                    " Товар с указанным штрихкодом уже существует для товара с наименованием \""+resultFindProdByBarcode.prodData["ProdName"]+"\""});
                return;
            }
            callback({resultItem:resultFindProdByBarcode.prodData});
        });
    };
    /**
     * prodMQData = { ProdID, Barcode, UM,Qty, Weight, Notes, ProdBarcode, PLID }
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.addProdMQ= function(dbUC,prodMQData,callback){
        if(!prodMQData) prodMQData={};
        var qty= prodMQData["Qty"];
        if(qty===undefined) qty=1;
        var insProdMQData={"ProdID":prodMQData["ProdID"],"UM":prodMQData["UM"], "Barcode":prodMQData["Barcode"], "Qty":qty,
            "Weight":0.000,"Notes":null,"ProdBarcode":null,"PLID":0};
        for(var fieldName in insProdMQData)
            if(prodMQData[fieldName]!==undefined) insProdMQData[fieldName]=prodMQData[fieldName];
        r_ProdMQ.insDataItem(dbUC,{insData:insProdMQData}, function(resultInsProdMQ){
            if(resultInsProdMQ.error||resultInsProdMQ.updateCount!=1){
                callback({error:"Failed create prodMQ! Reason:"+(resultInsProdMQ.error||"UNKNOWN!")});
                return;
            }
            callback({resultItem:insProdMQData});
        });
    };
    /**
     * eProdID - exists ProdID, eBCUM - exists ProdMQ UM,
     * prodMQData = { ProdID, UM, Qty, Weight, Notes, Barcode, ProdBarcode, PLID }
     * In this do not change ProdID!
     * callback = function(result), result= { resultItem, error,errorMessage, resultItemUpdProdUM = {UM:<updated prod UM>} }
     * if updated r_Prods.UM result contain resultItemUpdProdUM
     */
    r_Prods.updProdMQ= function(dbUC,eProdID,eBCUM,prodName,prodMQData,callback){
        if(!eProdID){
            callback({error:"Failed update prodMQ! No exists ProdID data!",
                errorMessage:" Не удалось изменить штрихкод (вид упаковки) товара! Нет данных по существующему товару (Код товара)."});
            return;
        }
        if(!prodMQData) prodMQData={};
        var prodID= prodMQData["ProdID"];
            if(eProdID!=prodID){
            callback({error:"Failed update prodMQ! Do not change ProdID!",
                errorMessage:" Не удалось изменить штрихкод (вид упаковки) товара! Нельзя изменять существующий код товара ШК (вида упаковки)."});
            return;
        }
        var sBCUM= prodMQData["UM"], sProdBarcode= prodMQData["Barcode"];
        r_ProdMQ.getDataItem(dbUC,{fields:["Barcode"],conditions:{"ProdID=":prodID,"UM=":sBCUM,"UM!=":eBCUM}},
            function(resultFindProdMQByUM){
                if(resultFindProdMQByUM.error){
                    callback({error:"Failed update prodMQ! Cannot get Prod barcode UM by ProdID="+prodID+". Reason:"+resultFindProdMQByUM.error+"."});
                    return;
                }
                if(resultFindProdMQByUM.item){
                    callback({error:"Failed update prodMQ! UM already exists by ProdID="+prodID+".",
                        errorMessage:"Не удалось изменить штрихкод \""+sProdBarcode+"\" для товара \""+prodName+"\"!"+" У товара уже есть указанная еденица измерениия."});
                    return;
                }
                var sNewBCUM= prodMQData["UM"], updProdMQData={"Barcode":sProdBarcode, "UM":sNewBCUM}, updProdMQFields=["Qty","Weight","Notes","ProdBarcode","PLID"];
                for(var fieldName of updProdMQFields)
                    if(prodMQData[fieldName]!==undefined) updProdMQData[fieldName]= prodMQData[fieldName];
                r_ProdMQ.updDataItem(dbUC,{updData:updProdMQData,conditions:{"ProdID=":prodID,"UM=":eBCUM}}, function(resultUpdProdMQ){
                    if(resultUpdProdMQ.error||resultUpdProdMQ.updateCount!=1){ callback({error:"Failed update prodMQ!"}); return; }
                    var resultUpdProdMQ= {resultItem:updProdMQData};
                    r_Prods.updDataItem(dbUC,{updData:{"UM":sNewBCUM},conditions:{"ProdID=":prodID},ignoreErrorNoUpdate:true},
                        function(resultUpdProdUM){
                            if(resultUpdProdUM.error){
                                callback({error:"Failed update prod UM to value=\""+sNewBCUM+"\"! Reason:"+resultUpdProdUM.error});
                                return;
                            }
                            if(resultUpdProdUM.updateCount) resultUpdProdMQ.resultItemUpdProdUM= {"UM":sNewBCUM};
                            callback(resultUpdProdMQ);
                        });
                });
            });
    };
};
