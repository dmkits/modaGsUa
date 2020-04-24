var path = require('path'), fs = require('fs'),
    moment=require('moment') /*dateFormat = require('dateformat'), cron = require('node-cron')*/;
var server=require('../server'), log = server.log;
var dataModel=require(appDataModelPath),
    r_Prods= require(appDataModelPath+"r_Prods"), r_ProdC= require(appDataModelPath+"r_ProdC");

module.exports.validateModule = function(errs,nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Prods,r_ProdC], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.moduleViewURL = "/dirs/products";
module.exports.moduleViewPath = "dirs/dir_products.html";
module.exports.init = function(app){
    app.get("/dirs/products/getDirPCatsForSelect",function(req,res){
        r_ProdC.getDataItemsForSelect(req.dbUC,{valueField:"PCatID",labelField:"PCatName", order:"PCatName"},
            function(result){
                if(result.items)result.items=[{value:-1, label:'Все категории'}].concat(result.items);
                res.send(result);
            });
    });
    var prodsWAllBarcodesTableColumns=[
        {data:"ProdID", name:"Код товара", width:60, type:"text", align:"center", readOnly:false,visible:true},
        {data:"ProdName", name:"Наименование товара", width:350, type:"text" },
        {data:"UM", name:"Осн. Ед.изм.", width:55, type:"text", align:"center", dataSource:"r_Prods", sourceField:"UM" },
        {data:"Article1", name:"Артикул1 товара", width:200, type:"text", align:"center", sourceField:"Article1" },
        {data:"InRems", name:"Товар участвует в остатках", width:65, type:"checkboxMSSQL", align:"center", sourceField:"InRems",visible:true },
        {data:"IsDecQty", name:"У товара дробное количество", width:65, type:"checkboxMSSQL", align:"center", sourceField:"IsDecQty",visible:true },
        {data:"PriceWithTax", name:"Цена продажи включает НДС", width:65, type:"checkboxMSSQL", align:"center", sourceField:"PriceWithTax",visible:true },
        {data:"InStopList", name:"Товар в стоп-списке", width:65, type:"checkboxMSSQL", align:"center", sourceField:"InStopList",visible:true },

        {data:"Notes", name:"Примечание товара", width:200, type:"text", align:"left", sourceField:"Notes",visible:false },
        {data:"Country", name:"Страна-производитель товара", width:200, type:"text", align:"center", sourceField:"Country",visible:false },
        {data:"Article2", name:"Артикул2 товара", width:200, type:"text", align:"center", sourceField:"Article2",visible:false },
        {data:"Article3", name:"Артикул3 товара", width:200, type:"text", align:"center", sourceField:"Article3",visible:false },

        {data:"Note1", name:"Примечание 1 товара", width:200, type:"text", align:"left", sourceField:"Note1",visible:false },
        {data:"Note2", name:"Примечание 2 товара", width:200, type:"text", align:"left", sourceField:"Note2",visible:false },
        {data:"Note3", name:"Примечание 3 товара", width:200, type:"text", align:"left", sourceField:"Note3",visible:false },

        {data:"Barcode", name:"Штрихкод", width:95, type:"text", align:"center",
            dataSource:"r_ProdMQ", sourceField:"Barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID" },
        {data:"_Barcode_", name:"_Barcode_", width:95, type:"text", align:"center", visible:false,
            dataSource:"r_ProdMQ", sourceField:"Barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID" },
        {data:"BCUM", name:"Ед.изм. ШК", width:70, type:"text", align:"center", dataSource:"r_ProdMQ", sourceField:"UM" },
        {data:"QtyBarcode", name:"Кол-во в ШК", width:70, type:"text", align:"center", dataSource:"r_ProdMQ", sourceField:"Qty", visible:false },
        {data:"PCatID", name:"Код категории товара", width:65, type:"text", align:"center",visible:false, dataSource:"r_Prods" },
        {data:"PCatName", name:"Категория товара", width:130,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPCatNameCombobox",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data:"PGrID", name:"Код группы товара", width:65, type:"text", align:"center",visible:false, dataSource:"r_Prods" },
        {data:"PGrName", name:"Группа товара", width:150,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrNameCombobox",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data:"PGrID1", name:"Код подгруппы 1 товара", width:75, type:"text", align:"center",visible:false, dataSource:"r_Prods" },
        {data:"PGrName1", name:"Подгруппа 1 товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName1Combobox",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data:"PGrID2", name:"Код подгруппы 2 товара", width:75, type:"text", align:"center",visible:false, dataSource:"r_Prods" },
        {data:"PGrName2", name:"Подгруппа 2 товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName2Combobox",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data:"PGrID3", name:"Код подгруппы 3 товара", width:75, type:"text", align:"center",visible:false, dataSource:"r_Prods" },
        {data:"PGrName3", name:"Подгруппа 3 товара", width:140,
            type:"comboboxWN", sourceURL:"/dirsProds/getDataForPGrName3Combobox",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"}
    ];
    app.get('/dirs/products/getProductsWAllBCsDataForTable',function(req,res){
        var conditions=null, allItems=false;
        for(var condItem in req.query) {
            var val=req.query[condItem];
            if(condItem.indexOf("PCatID")==0&&val=="-1") allItems=true;//ALL
            else{
                var newCondItem=condItem;
                for(var cInd in prodsWAllBarcodesTableColumns){
                    var colData=prodsWAllBarcodesTableColumns[cInd];
                    if(colData&&colData.data&&condItem.indexOf(colData.data)==0&&colData.dataSource){
                        newCondItem=colData.dataSource+"."+condItem; break;
                    }
                }
                if(!conditions) conditions={};
                conditions[newCondItem]=val;
            }
        }
        if(conditions||allItems){
            if(!conditions) conditions={};
            conditions["r_Prods.ProdID>"]=0;
        }
        for(var i=0; i<prodsWAllBarcodesTableColumns.length; i++){
            var tColData=prodsWAllBarcodesTableColumns[i];
            if(tColData.data=="PCatName"){ tColData.doVisible=allItems; break; }
        }
        r_Prods.getDataForTable(req.dbUC,{tableColumns:prodsWAllBarcodesTableColumns, identifier:prodsWAllBarcodesTableColumns[0].data,
                conditions:conditions, order:"r_Prods.ProdID,r_ProdMQ.UM,r_ProdMQ.Barcode"},
            function(result){
                res.send(result);
            });
    });

    /**
    * if product not finded by ProdName, create new product with barcode and pp
    * if product finded by name and not finded barcode, add barcode to exists product
    * else update product data
    * callback = function(result), result= { resultItem, error,errorMessage, resultItemNewProd,resultItemNewProdMQ }
    * if inserted  new product - result contain resultItemNewProd
    * if inserted only new barcode - result contain resultItemNewProdMQ
    */
    /**
     * callback = function(result), result= { resultItem, error,errorMessage }
     */
    r_Prods.checkProdByOldBarcode= function(dbUC,oldProdBarcode,prodData,callback){
        if(oldProdBarcode==null||!oldProdBarcode.toString()){ callback({}); return; }
        r_Prods.findProdWAllBCsByCondition(dbUC,{"Barcode=":oldProdBarcode},function(resultFindProdByOldBarcode){
            if(resultFindProdByOldBarcode.error){ callback(resultFindProdByOldBarcode); return; }
            if(resultFindProdByOldBarcode.prodData&&resultFindProdByOldBarcode.prodData["ProdName"]!=prodData["ProdName"]){
                callback({error:"Cannot change ProdName in product barcode!",errorMessage:"Нельзя изменять наименование товара для штрихкода!"});
                return;
            }
            var prodID=prodData["ProdID"];
            if(prodID!=null&&prodID.toString()&&resultFindProdByOldBarcode.prodData&&resultFindProdByOldBarcode.prodData["ProdID"]!=prodID){
                callback({error:"Cannot change ProdID in product barcode!",errorMessage:"Нельзя изменять код товара для штрихкода!"});
                return;
            }
            callback({resultItem:resultFindProdByOldBarcode.prodData});
        });
    };
    //if(!r_Prods.checkStoreProdWithBarcode) throw new Error('NO r_Prods.checkStoreProdWithBarcode!');
    r_Prods.checkStoreProdWithBarcodeInDirProds= function(dbUC,prodData,dbUserParams,callback){
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
        var oldProdBarcode=prodData["_Barcode_"];//oldProdBarcode used in product directories for update product barcode
        r_Prods.checkProdByOldBarcode(dbUC,oldProdBarcode,prodData,function(resultFindProdByOldBarcode){
            if(resultFindProdByOldBarcode.error){ callback(resultFindProdByOldBarcode); return; }
            r_Prods.findProdByFieldsValues(dbUC,{"ProdName":prodName},function(resultFindProdByName){//finding by ProdName
                if(resultFindProdByName.error){ callback(resultFindProdByName); return; }
                var existsProdIDByProdName=null, existsProdBaseBarcodeByProdName=null,
                    existsProdUMByProdName=null;
                if(resultFindProdByName.prodData){
                    existsProdIDByProdName= resultFindProdByName.prodData["ProdID"];
                    existsProdBaseBarcodeByProdName= resultFindProdByName.prodData["Barcode"];
                    existsProdUMByProdName= resultFindProdByName.prodData["UM"];
                }
                var prodID=prodData["ProdID"];
                if(prodID!=null&&typeof(prodID)=="string") prodID= prodID.trim();
                if(resultFindProdByName.prodData&&prodID!=null&&prodID.toString()&&prodID!=existsProdIDByProdName){//update product ProdID by ProdName
                    callback({error:"ProdID not equals ProdID by ProdName!",
                        errorMessage:"Не верно указан код товара!\nДля товара с наименованием \""+prodName+"\" должен быть указан код товара "+existsProdIDByProdName+"!"});
                    return;
                }
                r_Prods.checkExistsProdID(dbUC,prodName,prodID,existsProdIDByProdName,function(resultCheckExistsProdID){
                    if(resultCheckExistsProdID.error){ callback(resultCheckExistsProdID); return; }
                    var prodBarcode=prodData["Barcode"];
                    if(prodBarcode&&typeof(prodBarcode)=="string") prodBarcode= prodBarcode.toString().trim();
                    r_Prods.checkExistsProdBarcode(dbUC,prodName,prodBarcode,oldProdBarcode,function(resultCheckExistsProdBarcode){
                        if(resultCheckExistsProdBarcode.error){ callback(resultCheckExistsProdBarcode); return; }
                        if(!resultFindProdByName.prodData){//CREATE NEW PRODUCT WITH BARCODE
                            r_Prods.storeNewProdWithProdMQandProdPP0(dbUC,prodData,dbUserParams,function(resultStoreNewProdWithProdMQandProdPP0){
                                if(resultStoreNewProdWithProdMQandProdPP0.error) {
                                    callback(resultStoreNewProdWithProdMQandProdPP0);
                                    return;
                                }
                                var newProdData= resultStoreNewProdWithProdMQandProdPP0.resultItem;
                                callback({resultItem:newProdData, resultItemNewProd:newProdData});
                            });
                            return;
                        }
                        if((!prodID||!prodID.toString())&&existsProdIDByProdName) prodData["ProdID"]=existsProdIDByProdName;
                        if(existsProdUMByProdName&&prodUM!=existsProdUMByProdName) prodData["UM"]=existsProdUMByProdName;
                        if(!prodBarcode&&existsProdBaseBarcodeByProdName) prodData["Barcode"]=existsProdBaseBarcodeByProdName;
                        if(resultFindProdByName.prodData && !resultCheckExistsProdBarcode.resultItem){//ADD OR UPDATE BARCODE DATA FOR EXISTS PRODUCT
                            var prodMQData= {"ProdID":prodData["ProdID"], "Barcode":prodData["Barcode"],"_Barcode_":prodData["_Barcode_"],
                                "UM":prodData["BCUM"],"Qty":prodData["QtyBarcode"]};
                            if(prodMQData["UM"]==null) prodMQData["UM"]= prodUM;
                            r_Prods.checkAndStoreProdMQ(dbUC,prodName, prodMQData, function(resultCheckAndStoreProdMQ){
                                if(resultCheckAndStoreProdMQ.error){
                                    r_Prods.delete(dbUC,prodID);
                                    callback(resultCheckAndStoreProdMQ);
                                    return;
                                }
                                prodData["Barcode"]= resultCheckAndStoreProdMQ.resultItem["Barcode"];
                                prodData["_Barcode_"]= resultCheckAndStoreProdMQ.resultItem["Barcode"];
                                prodData["BCUM"]= resultCheckAndStoreProdMQ.resultItem["UM"];
                                prodData["QtyBarcode"]= resultCheckAndStoreProdMQ.resultItem["Qty"];
                                if(resultCheckAndStoreProdMQ.resultItemUpdProdUM) prodData["UM"]= resultCheckAndStoreProdMQ.resultItemUpdProdUM["UM"];
                                callback({resultItem:prodData, resultItemNewProdMQ:resultCheckAndStoreProdMQ.resultItem});
                            });
                            return;
                        }

                        //

                        callback({resultItem:prodData});
                    })
                });
            });
        });
    };

    app.post("/dirs/products/storeProductsWBCTableData",function(req,res){
        var prodData=req.body;

        var barcode=prodData["Barcode"];
        if(barcode==null||barcode.trim()===""){ res.send({error:{error:"No Barcode!",message:"Не задан штрихкод товара!"}}); return; }

                                                                                            console.log("storeProductsWBCTableData prodData=",prodData);
        r_Prods.checkStoreProdWithBarcodeInDirProds(req.dbUC,prodData,req.dbUserParams,function(resultCheckStoreProdWithBC){
            if(resultCheckStoreProdWithBC&&resultCheckStoreProdWithBC.error){
                res.send({error:{
                    error:resultCheckStoreProdWithBC.error,
                    userMessage:resultCheckStoreProdWithBC.errorMessage||resultCheckStoreProdWithBC.error
                }});
                return;
            }

            if(resultCheckStoreProdWithBC.resultItemNewProd){                    console.log("r_Prods.checkStoreProdWithBarcode resultCheckStoreProdWithBC=",resultCheckStoreProdWithBC,"prodData=",prodData);
                res.send({resultItem:resultCheckStoreProdWithBC.resultItem});
                return;
            }


            //var prodDataForUpdate= {"ProdID":prodData["ProdID"], "ProdName":prodData["ProdName"], "UM":prodData["UM"], "InRems":prodData["InRems"],
            //    "Article1":prodData["Article1"], "Country":prodData["Country"], "Notes":prodData["ProdName"]};
            //var pCatID,pGrID,pGrID1,pGrID2,pGrID3;
            //if((pCatID=prodData["PCatID"])!=null) prodDataForUpdate["PCatID"]= pCatID;
            //if((pGrID=prodData["PGrID"])!=null) prodDataForUpdate["PGrID"]= pGrID;
            //if((pGrID1=prodData["PGrID1"])!=null) prodDataForUpdate["PGrID1"]= pGrID1;
            //if((pGrID2=prodData["PGrID2"])!=null) prodDataForUpdate["PGrID2"]= pGrID2;
            //if((pGrID3=prodData["PGrID3"])!=null) prodDataForUpdate["PGrID3"]= pGrID3;

            res.send(resultCheckStoreProdWithBC);

            //r_Prods.updateProdData(req.dbUC,prodData,function(resultUpdateProdData){        console.log("r_Prods.checkStoreProdWithBarcode updateProdData resultUpdateProdData=",resultUpdateProdData,"prodData=",prodData);
            //    res.send(resultUpdateProdData);
            //});

        });
    })
};

