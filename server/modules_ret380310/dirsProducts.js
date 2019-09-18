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
module.exports.moduleViewPath = "dirs/products.html";
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
        {data:"BaseUM", name:"Осн. Ед.изм.", width:55, type:"text", align:"center", dataSource:"r_Prods", sourceField:"UM" },
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
        {data:"UM", name:"Ед.изм. ШК", width:70, type:"text", align:"center", dataSource:"r_ProdMQ", sourceField:"UM" },
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
            if(tColData.data=="PCatName"){ tColData.visible=allItems; break; }
        }
        r_Prods.getDataForTable(req.dbUC,{tableColumns:prodsWAllBarcodesTableColumns, identifier:prodsWAllBarcodesTableColumns[0].data,
                conditions:conditions, order:"r_Prods.ProdID,r_ProdMQ.UM,r_ProdMQ.Barcode"},
            function(result){
                res.send(result);
            });
    });
    app.post("/dirs/products/storeProductsWBCTableData",function(req,res){
        var tLoginData=req.body;
        r_Users.checkLoginPassDBUser(req.dbUC,tLoginData,function(result,login,lpass,suname){
            if(result.error){
                res.send(result);
                return;
            }
            var storeLoginResult={};
            r_Users.createLoginIfNotExists(req.dbUC,tLoginData,login,lpass,suname,storeLoginResult,function(result){
                if(result.error){
                    res.send(result);
                    return;
                }
                r_Users.createDBUserIfNotExists(req.dbUC,tLoginData,login,lpass,suname,result,function(result){
                    if(result.error){
                        res.send(result);
                        return;
                    }
                    r_Users.updateLoginDBUser(req.dbUC,tLoginData,login,lpass,suname,result,function(result){
                        if(result.error){
                            res.send(result);
                            return;
                        }
                        r_Users.updateEmpData(req.dbUC,tLoginData,login,lpass,suname,result,function(result){
                            if(result.error){
                                res.send(result);
                                return;
                            }
                            if(lpass==userVisiblePass){
                                r_Users.getLoginData(req.dbUC,tLoginData,result,function(result){
                                    res.send(result);
                                });
                                return;
                            }
                            ir_UserData.updateUserData(req.dbUC,tLoginData,login,lpass,suname,result,function(result){
                                res.send(result);
                            });
                        });
                    });
                });
            });
        });
    })
};

