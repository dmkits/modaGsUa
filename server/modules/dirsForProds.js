/**
 * Created by Dmitrk on 13.05.2018.
 */
var dataModel=require('../datamodel'),database= require("../databaseMSSQL");
var r_Prods= require(appDataModelPath+"r_Prods"),
    r_ProdC= require(appDataModelPath+"r_ProdC"),r_ProdG= require(appDataModelPath+"r_ProdG"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3"),
    ir_ProdColors= require(appDataModelPath+"ir_ProdColors"),ir_ProdSizes= require(appDataModelPath+"ir_ProdSizes");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Prods,r_ProdC,r_ProdG,r_ProdG1,r_ProdG2,r_ProdG3,ir_ProdColors,ir_ProdSizes], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.init= function(app){
    var prodsTableColumns=[
        {data: "ProdID", name: "ProdID", width: 80, type: "text", readOnly:true, visible:false},
        {data: "ProdName", name: "Наименование товара", width: 350, type: "text" },
        {data: "UM", name: "Ед. изм.", width: 55, type: "text", align:"center" },
        {data: "ProdArticle1", name: "Артикул1 товара", width: 200, type: "text", sourceField:"Article1" },
        {data: "Barcode", name: "Штрихкод", width: 50, type: "text",
            dataSource:"r_ProdMQ", sourceField:"barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM" },
        {data: "PCatName", name: "Бренд товара", width: 140,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForRecPCatName",
            dataSource:"r_ProdC", sourceField:"PCatName", linkCondition:"r_ProdC.PCatID=r_Prods.PCatID"},
        {data: "PGrName", name: "Коллекция товара", width: 95,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForRecPGrName",
            dataSource:"r_ProdG", sourceField:"PGrName", linkCondition:"r_ProdG.PGrID=r_Prods.PGrID"},
        {data: "PGrName2", name: "Тип товара", width: 140,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForRecPGrName2",
            dataSource:"r_ProdG2", sourceField:"PGrName2", linkCondition:"r_ProdG2.PGrID2=r_Prods.PGrID2"},
        {data: "PGrName3", name: "Вид товара", width: 150,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForRecPGrName3",
            dataSource:"r_ProdG3", sourceField:"PGrName3", linkCondition:"r_ProdG3.PGrID3=r_Prods.PGrID3"},
        {data: "PGrName1", name: "Линия товара", width: 90,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForRecPGrName1",
            dataSource:"r_ProdG1", sourceField:"PGrName1", linkCondition:"r_ProdG1.PGrID1=r_Prods.PGrID1"},
        {data: "ProdSize", name: "Размер товара", width: 90,
            type: "comboboxWN", sourceURL:"/dirsProds/getDataForRecProdSize",
            dataSource:"ir_ProdSizes", dataFunction:"CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '-' END",
            linkCondition:"ir_ProdSizes.SizeName=r_Prods.SizeName"}
    ];
    //dirProductsTableColumns=
    //    dir_products_bata.addProductColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductBataAttrsColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductAttrsColumnsTo(dirProductsTableColumns,8);

    app.get("/dirsProds/getDataForRecProdArticle1", function(req, res){
        r_Prods.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"ProdArticle1":"Article1"}, order:"Article1"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecPCatName", function(req, res){
        r_ProdC.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PCatName":"PCatName"},
                conditions:{"PCatID>0":null}, order:"PCatName"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecPGrName", function(req, res){
        r_ProdG.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName":"PGrName"},
                conditions:{"PGrID>0":null}, order:"PGrName"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecPGrName1", function(req, res){
        r_ProdG1.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName1":"PGrName1"},
                conditions:{"PGrID1>0":null}, order:"PGrName1"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecPGrName2", function(req, res){
        r_ProdG2.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName2":"PGrName2"},
                conditions:{"PGrID2>0":null}, order:"PGrName2"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecPGrName3", function(req, res){
        r_ProdG3.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"PGrName3":"PGrName3"},
                conditions:{"PGrID3>0":null}, order:"PGrName3"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecProdColor", function(req, res){
        ir_ProdColors.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"ProdColor":"ColorName"},
                conditions:{"ChID>0":null}, order:"ColorName"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getDataForRecProdSize", function(req, res){
        ir_ProdSizes.getDataItemsForTableCombobox(req.dbUC,{comboboxFields:{"ProdSize":"SizeName"},
                conditions:{"ChID>0":null}, order:"SizeName"},
            function(result){
                res.send(result);
            });
    });
    app.get("/dirsProds/getProdByID", function (req, res) {
        var conditions={};
        if(req.query["ProdID"])conditions["r_Prods.ProdID="]=req.query["ProdID"];
        if(req.query["ProdName"])conditions["r_Prods.ProdName="]=req.query["ProdName"];
        r_Prods.getDataItemForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){
                res.send(result);
            });
    });
    r_Prods.getNewProdNameByAttrs= function(dbUC,prodData,callback){
        //if_GetProdNameByMaskValues(ProdID, PCatName,PGrName1,PGrName3,PGrSName3,Article1,Article2,Article3, ColorName,ColorSName, Size,Sizes, Growth)
        database.selectParamsQuery(dbUC,
            "select ProdName="+
            "LTRIM(RTRIM("+
            "dbo.if_GetProdNameByMaskValues(@p0, @p1,@p2,@p3,@p4, @p5,@p6,@p7, @p8,@p9, @p10,@p11, @p12)))",
            [prodData.ProdID, prodData.PCatName,prodData.PGrName1,prodData.PGrName3,prodData.PGrSName3,
                prodData.Article1,prodData.Article2,prodData.Article3,
                prodData.ColorName,prodData.ColorSName, prodData.Size,prodData.Sizes, prodData.Growth],
            function(err, recordset, rowsCount, fieldsTypes){
                if(err){
                    callback({error:err.message});
                    return;
                }
                if(recordset&&recordset.length>0)prodData["ProdName"]=recordset[0]["ProdName"];
                callback(null,prodData);
            });
    };
    app.get("/dirsProds/getProdByArticle1", function (req, res) {
        var conditions={}, prodData=req.query;
        if(prodData["ProdArticle1"])conditions["r_Prods.Article1="]=prodData["ProdArticle1"];
        r_Prods.getDataItemsForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){
                if(!result.items) {
                    res.send({error:result.error,item:null});
                    return;
                }
                if(result.items.length==0) {
                    r_Prods.getNewProdNameByAttrs(req.dbUC,
                        {"Article1":prodData["ProdArticle1"],
                            "PCatName":prodData["PCatName"],"PGrName":prodData["PGrName"],
                            "PGrName1":prodData["PGrName1"],"PGrName2":prodData["PGrName2"],"PGrName3":prodData["PGrName3"],
                            "ColorName":prodData["ProdColor"],"Size":prodData["ProdSize"]},
                        function(err,prodNameData){         console.log("getProdByArticle1",err,prodData,prodNameData);
                            if(err){
                                res.send({error:err});
                                return
                            }
                            if(prodNameData)prodData["ProdName"]=prodNameData["ProdName"];
                            res.send({item:prodData});
                        });
                    return;
                }
                res.send({item:result.items[0]});
            });
    });
};
