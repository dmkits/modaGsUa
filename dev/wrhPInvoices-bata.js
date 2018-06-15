var dataModel=require('../datamodel'), dateFormat = require('dateformat');
var server= require("../server"), log= server.log;
var wrh_pinvs= require(appDataModelPath+"wrh_pinvs"), wrh_pinvs_products= require(appDataModelPath+"wrh_pinvs_products"),
    sys_operations=require(appDataModelPath+"sys_operations"),
    wrh_products_r_operations=require(appDataModelPath+"wrh_products_r_operations");
var dir_units= require(appDataModelPath+"dir_units"), dirContractors= require(appDataModelPath+"dir_contractors"),
    sys_currency= require(appDataModelPath+"sys_currency"), sysDocStates= require(appDataModelPath+"sys_docstates"),
    dir_products_collections= require(appDataModelPath+"dir_products_collections"),
    dir_products_bata= require(appDataModelPath+"dir_products-bata"),
    dir_products_batches= require(appDataModelPath+"dir_products_batches"),
    dir_products_genders_bata=require(appDataModelPath+"dir_products_genders-bata"),
    dir_products_subcategories_bata=require(appDataModelPath+"dir_products_subcategories-bata"),
    dir_products_categories_bata=require(appDataModelPath+"dir_products_categories-bata"),
    dir_products_types=require(appDataModelPath+"dir_products_types"),
    wrh_products_operations_v=require(appDataModelPath+"wrh_products_operations_v"),
    dir_pricelists_products_batches=require(appDataModelPath+"dir_pricelists_products_batches"),
    dir_products_batches_sale_prices=require(appDataModelPath+"dir_products_batches_sale_prices"),
    sys_sync_output_data=require(appDataModelPath+"sys_sync_output_data"),
    sys_sync_POSes=require(appDataModelPath+"sys_sync_POSes");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([wrh_pinvs,wrh_pinvs_products, sys_operations, wrh_products_r_operations,
            dir_products_bata, dir_products_batches,dir_products_genders_bata,dir_products_subcategories_bata,
            dir_products_categories_bata,dir_products_types,wrh_products_operations_v,
            dir_pricelists_products_batches,dir_products_batches_sale_prices,sys_sync_output_data], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.modulePageURL = "/wrh/pinvoices";
module.exports.modulePagePath = "wrh/pinvoices-bata.html";
module.exports.init = function(app){
    var wrhPInvsListTableColumns=[
        {data: "ID", name: "ID", width: 50, type: "text", readOnly:true, visible:false, dataSource:"wrh_pinvs"},
        {data: "NUMBER", name: "Номер", width: 50, type: "text", dataSource:"wrh_pinvs"},
        {data: "DOCDATE", name: "Дата", width: 55, type: "dateAsText", dataSource:"wrh_pinvs"},
        {data: "UNIT_NAME", name: "Подразделение", width: 120, type: "text", dataSource:"dir_units", sourceField:"NAME"},
        {data: "SUPPLIER_NAME", name: "Поставщик", width: 150, type: "text", dataSource:"dir_contractors", sourceField:"NAME"},
        {data: "SUPPLIER_ORDER_NUM", name: "Номер заказа поставщика", width: 100, type: "text", dataSource:"wrh_pinvs"},
        {data: "SUPPLIER_INV_NUM", name: "Номер накл. поставщика", width: 100, type: "text", dataSource:"wrh_pinvs"},
        {data: "PRODUCT_COLLECTION", name: "Коллекция", width: 120, type: "text", visible:false,
            dataSource:"dir_products_collections", sourceField:"NAME"},
        {data: "DOCCOUNT", name: "Строк", width: 60, type: "numeric", visible:false,
            childDataSource:"wrh_pinvs_products", childLinkField:"PINV_ID", parentLinkField:"ID",
            dataFunction:{function:"rowsCountIsNull", source:"wrh_pinvs_products", sourceField:"POSIND"} },
        {data: "DOCQTYSUM", name: "Кол-во", width: 60, type: "numeric",
            childDataSource:"wrh_pinvs_products", childLinkField:"PINV_ID", parentLinkField:"ID",
            dataFunction:{function:"sumIsNull", source:"wrh_pinvs_products", sourceField:"QTY"} },
        {data: "DOCSUM", name: "Сумма", width: 80, type: "numeric2",
            childDataSource:"wrh_pinvs_products", childLinkField:"PINV_ID", parentLinkField:"ID",
            dataFunction:{function:"sumIsNull", sourceField:"wrh_pinvs_products.PRICE*wrh_pinvs_products.QTY"} },
        {data: "CURRENCY_CODE", name: "Валюта", width: 50, type: "text", dataSource:"sys_currency", sourceField:"CODE"},
        {data: "CURRENCY_CODENAME", name: "Валюта", width: 50, type: "text", visible:false,
            dataSource:"sys_currency", dataFunction:{function:"concat",fields:["sys_currency.CODE","' ('","sys_currency.NAME","')'"]} },
        {data: "DOCSTATE_NAME", name: "Статус", width: 110, type: "text", dataSource:"sys_docstates", sourceField:"NAME"},
        {data: "DOCSTATE_ALIAS", name: "Имя статуса", width: 110, type: "text", dataSource:"sys_docstates", sourceField:"ALIAS",visible:false},
        {data: "RATE", name: "Курс валюты", width: 60, type: "numeric2", visible:false, dataSource:"wrh_pinvs"},
        {data: "BASE_FACTOR", name: "Базов.коэфф.", width: 60, type: "numeric2", visible:false, dataSource:"wrh_pinvs"}
    ];
    app.get("/wrh/pInvoices/getDataForPInvsListTable", function(req, res){
        var conditions={};
        for(var condItem in req.query) conditions["wrh_pinvs."+condItem]=req.query[condItem];
        wrh_pinvs.getDataForDocTable({tableColumns:wrhPInvsListTableColumns,
                identifier:wrhPInvsListTableColumns[0].data,
                conditions:conditions,
                order:["DOCDATE","NUMBER","UNIT_NAME","SUPPLIER_NAME","SUPPLIER_ORDER_NUM","SUPPLIER_INV_NUM"]},
            function(result){
                res.send(result);
            });
    });
    app.get("/wrh/pInvoices/getPInvData", function(req, res){
        var conditions={};
        for(var condItem in req.query) conditions["wrh_pinvs."+condItem]=req.query[condItem];
        wrh_pinvs.getDataItemForTable({tableColumns:wrhPInvsListTableColumns,
                conditions:conditions},
            function(result){
                res.send(result);
            });
    });
    app.get("/wrh/pInvoices/getNewPInvData", function(req, res){
        wrh_pinvs.getDataItem({fields:["MAXNUMBER"],fieldsFunctions:{"MAXNUMBER":{function:"maxPlus1", sourceField:"NUMBER"}},
                conditions:{"1=1":null}},
            function(result){
                var newNumber=(result&&result.item)?result.item["MAXNUMBER"]:"", docDate=dateFormat(new Date(),"yyyy-mm-dd");
                dir_units.getDataItem({fields:["NAME"],conditions:{"ID=":"0"}}, function(result){
                    var unitName=(result&&result.item)?result.item["NAME"]:"";
                    dirContractors.getDataItem({fields:["NAME"],conditions:{"ID=":"1"}}, function(result){
                        var supplierName=(result&&result.item)?result.item["NAME"]:"";
                        sys_currency.getDataItem({ fields:["CODE","CODENAME"],
                                fieldsFunctions:{"CODENAME":{function:"concat",fields:["CODE","' ('","NAME","')'"]}},
                                conditions:{"ID=":"0"} },
                            function(result){
                                var sysCurrencyCode=(result&&result.item)?result.item["CODE"]:"";
                                var sysCurrencyCodeName=(result&&result.item)?result.item["CODENAME"]:"";
                                dir_products_collections.getDataItem({ fields:["NAME"], conditions:{"ID=":"1"} },
                                    function(result){
                                        var dirProductsCollectionName=(result&&result.item)?result.item["NAME"]:"";
                                        //sysDocStates.getDataItem({fields:["NAME"],conditions:{"ID=":"0"}}, function(result){
                                        //});
                                        wrh_pinvs.setDataItem({
                                                fields:["NUMBER","DOCDATE","UNIT_NAME","SUPPLIER_NAME","SUPPLIER_ORDER_NUM","SUPPLIER_INV_NUM",
                                                    "CURRENCY_CODE","CURRENCY_CODENAME", "PRODUCT_COLLECTION", "DOCSTATE_NAME", "DOCCOUNT","DOCQTYSUM","DOCSUM",
                                                    "RATE","BASE_FACTOR"],
                                                values:[newNumber,docDate,unitName,supplierName,"","",
                                                    sysCurrencyCode,sysCurrencyCodeName, dirProductsCollectionName, "",0,0,0,
                                                    1, 2]},
                                            function(result){
                                                res.send(result);
                                            });
                                    });
                            });
                    });
                });
            });
    });
    app.post("/wrh/pInvoices/storePInvData", function(req, res){
        var storeData=req.body;
        dir_units.getDataItem({fields:["ID"],conditions:{"NAME=":storeData["UNIT_NAME"]}}, function(result){
            if(!result.item){
                res.send({ error:"Cannot find unit by name!"});
                return;
            }
            storeData["UNIT_ID"]=result.item["ID"];
            dirContractors.getDataItem({fields:["ID"],conditions:{"NAME=":storeData["SUPPLIER_NAME"]}}, function(result){
                if(!result.item){
                    res.send({ error:"Cannot find contractor by name!"});
                    return;
                }
                storeData["SUPPLIER_ID"]=result.item["ID"];
                sys_currency.getDataItem({fields:["ID"],conditions:{"CODE=":storeData["CURRENCY_CODE"]}}, function(result){
                    if(!result.item){
                        res.send({ error:"Cannot find currency by code!"});
                        return;
                    }
                    storeData["CURRENCY_ID"]=result.item["ID"];
                    dir_products_collections.getDataItem({fields:["ID"],conditions:{"NAME=":storeData["PRODUCT_COLLECTION"]}}, function(result){
                        storeData["COLLECTION_ID"]=result.item["ID"];
                        var docStateID=0;
                        sysDocStates.getDataItem({fields:["ID"],conditions:{"NAME=":storeData["DOCSTATE_NAME"]}}, function(result){
                            if(result.item) docStateID=result.item["ID"];
                            storeData["DOCSTATE_ID"]=docStateID;
                            wrh_pinvs.storeTableDataItem({tableColumns:wrhPInvsListTableColumns, idFieldName:"ID", storeTableData:storeData},
                                function(result){
                                    res.send(result);
                                });
                        });
                    });
                });
            });
        });
    });
    app.post("/wrh/pInvoices/deletePInvData", function(req, res){
        var delData=req.body;
        wrh_pinvs.delTableDataItem({idFieldName:"ID", delTableData:delData},
            function(result){
                res.send(result);
            });
    });

    var wrhPInvProductsTableColumns=[
        {data: "ID", name: "ID", width: 50, type: "text", readOnly:true, visible:false},
        {data: "PINV_ID", name: "PINV_ID", width: 50, type: "text", readOnly:true, visible:false},
        //{data: "SUPPLIER_ID", name: "SUPPLIER_ID", width: 65, type: "text", readOnly:true, visible:false,
        //    dataSource:"wrh_pinvs", sourceField:"SUPPLIER_ID", linkCondition:"wrh_pinvs.ID=wrh_pinvs_products.PINV_ID" },
        {dataSource:"wrh_pinvs", sourceField:"SUPPLIER_ID", linkCondition:"wrh_pinvs.ID=wrh_pinvs_products.PINV_ID" },
        {data: "SUPPLIER_COUNTRY", name: "SUPPLIER_COUNTRY", width: 65, type: "text", readOnly:true, visible:false,
            dataSource:"dir_contractors", sourceField:"COUNTRY", linkCondition:"dir_contractors.ID=wrh_pinvs.SUPPLIER_ID" },
        {data: "POSIND", name: "POSIND", width: 45, type: "numeric", visible:false},
        {data: "POS", name: "Номер п/п", width: 45, type: "numeric", dataFunction:"TRUNCATE(POSIND,0)"},
        {dataSource:"wrh_products_r_operations",linkCondition:"wrh_products_r_operations.OPERATION_ID=wrh_pinvs_products.ID"},
        {data: "BARCODE", name: "Штрихкод", width: 75, type: "text", dataSource:"dir_products", sourceField:"PBARCODE",visible:false },
        {data: "PRODUCT_CODE", name: "Код товара", width: 65, type: "text", dataSource:"dir_products", sourceField:"CODE",
            linkCondition:"dir_products.ID=wrh_products_r_operations.PRODUCT_ID",visible:false},
        {data: "PRODUCT_PBARCODE", name: "Штрихкод товара", width: 75, type: "text",
            dataSource:"dir_products", sourceField:"PBARCODE",visible:false},
        {data: "PRODUCT_NAME", name: "Товар", width: 250, type: "text",
            dataSource:"dir_products", sourceField:"NAME",visible:false},
        {data: "PRODUCT_UM", name: "Ед.изм.", width: 55, type: "text", dataSource:"dir_products", sourceField:"UM",visible:false},
        {data: "PRODUCT_PRINT_NAME", name: "Печатное наименование товара", width: 250, type: "text",
            dataSource:"dir_products", sourceField:"PRINT_NAME", visible:false},
        {data: "PRODUCT_GENDER_CODE", name: "Код группы", width: 65,
            type: "combobox", "sourceURL":"/dir/products/getDataForOrderBataProductsGendersCombobox/genderCode",
            dataSource:"dir_products_genders", sourceField:"CODE", linkCondition:"dir_products_genders.ID=dir_products.GENDER_ID" },
        {data: "PRODUCT_GENDER", name: "Группа", width: 150,
            type: "combobox", "sourceURL":"/dir/products/getDataForOrderBataProductsGendersCombobox/gender",
            dataSource:"dir_products_genders", sourceField:"NAME", linkCondition:"dir_products_genders.ID=dir_products.GENDER_ID" },
        {data: "PRODUCT_CATEGORY_CODE", name: "Код категории", width: 80,
            type: "combobox", "sourceURL":"/dir/products/getDataForOrderBataProductsCategoryCombobox/CategoryCode",
            dataSource:"dir_products_categories", sourceField:"CODE", linkCondition:"dir_products_categories.ID=dir_products.CATEGORY_ID" },
        {data: "PRODUCT_CATEGORY", name: "Категория", width: 200,
            type: "combobox", "sourceURL":"/dir/products/getDataForOrderBataProductsCategoryCombobox/Category",
            dataSource:"dir_products_categories", sourceField:"NAME", linkCondition:"dir_products_categories.ID=dir_products.CATEGORY_ID" },
        {data: "PRODUCT_SUBCATEGORY_CODE", name: "Код подкатегории", width: 100,
            type: "combobox", "sourceURL":"/dir/products/getDataForOrderBataProductsSubcategoryCombobox/SubcategoryCode",
            dataSource:"dir_products_subcategories", sourceField:"CODE", linkCondition:"dir_products_subcategories.ID=dir_products.SUBCATEGORY_ID" },
        {data: "PRODUCT_SUBCATEGORY", name: "Подкатегория", width: 200,
            type: "combobox", "sourceURL":"/dir/products/getDataForOrderBataProductsSubcategoryCombobox/Subcategory",
            dataSource:"dir_products_subcategories", sourceField:"NAME", linkCondition:"dir_products_subcategories.ID=dir_products.SUBCATEGORY_ID" },
        {data: "PRODUCT_ARTICLE", name: "Артикул", width: 80,
            type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsArticleCombobox",
            dataSource:"dir_products_articles", sourceField:"VALUE", linkCondition:"dir_products_articles.ID=dir_products.ARTICLE_ID" },
        {data: "PRODUCT_COLLECTION", name: "Коллекция", width: 150, visible:false,
            type: "combobox", "sourceURL":"/dir/products/getDataForProductsCollectionCombobox",
            dataSource:"dir_products_collections", sourceField:"NAME", linkCondition:"dir_products_collections.ID=dir_products.COLLECTION_ID" },
        {data: "PRODUCT_COLLECTION_CODE", name: "Код коллекции", width: 100, visible:false,
            type: "combobox", "sourceURL":"/dir/products/getDataForProductsCollectionCodeCombobox",
            dataSource:"dir_products_collections", sourceField:"CODE", linkCondition:"dir_products_collections.ID=dir_products.COLLECTION_ID" },
        {data: "PRODUCT_TYPE", name: "Тип", width: 100, //type: "text",
            type: "combobox", "sourceURL":"/dir/products/getDataForProductsTypesCombobox",
            dataSource:"dir_products_types", sourceField:"NAME",linkCondition:"dir_products_types.ID=dir_products.TYPE_ID"},
        {data: "PRODUCT_KIND", name: "Вид", width: 150, //type: "text",
            type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsKindsCombobox",
            dataSource:"dir_products_kinds", sourceField:"NAME", linkCondition:"dir_products_kinds.ID=dir_products.KIND_ID" },
        {data: "PRODUCT_COMPOSITION", name: "Состав", width: 200,
            type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsCompositionCombobox",
            dataSource:"dir_products_compositions", sourceField:"VALUE", linkCondition:"dir_products_compositions.ID=dir_products.COMPOSITION_ID" },
        {data: "PRODUCT_SIZE", name: "Размер", width: 50,
            type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSizeCombobox",
            dataSource:"dir_products_sizes", sourceField:"VALUE", linkCondition:"dir_products_sizes.ID=dir_products.SIZE_ID" },
        {data: "QTY", name: "Кол-во", width: 50, type: "numeric"},
        {data: "PRICE", name: "Цена", width: 60, type: "numeric2"},
        {data: "POSSUM", name: "Сумма", width: 80, type: "numeric2", dataFunction:"wrh_pinvs_products.PRICE*wrh_pinvs_products.QTY" },
        {data: "BATCH_NUMBER", name: "Партия", width: 60, type: "text",dataSource:"wrh_products_r_operations", sourceField:"BATCH_NUMBER", visible:false},
        {data: "FACTOR", name: "Коэфф.", width: 60, type: "numeric2"},
        {dataSource:"dir_units", linkCondition:"dir_units.ID=wrh_pinvs.UNIT_ID" },
        {leftJoinedSources: {"dir_pricelists_products_batches": {
                                    "dir_pricelists_products_batches.PRICELIST_ID=dir_units.PRICELIST_ID":null ,
                                    "dir_pricelists_products_batches.PRODUCT_ID=dir_products.ID":null,
                                    "dir_pricelists_products_batches.BATCH_NUMBER=wrh_products_r_operations.BATCH_NUMBER": null},
                             "dir_products_batches_sale_prices": {
                                    "dir_products_batches_sale_prices.CHANGE_DATETIME=dir_pricelists_products_batches.CHANGE_DATETIME": null,
                                    "dir_products_batches_sale_prices.PRODUCT_ID=dir_pricelists_products_batches.PRODUCT_ID": null,
                                    "dir_products_batches_sale_prices.BATCH_NUMBER=dir_pricelists_products_batches.BATCH_NUMBER": null,
                                    "dir_products_batches_sale_prices.PRICELIST_ID=dir_pricelists_products_batches.PRICELIST_ID": null}}},
        {data: "SALE_PRICE", name: "Цена продажи", width: 75, type: "numeric2",
            dataSource:"dir_products_batches_sale_prices", sourceField:"PRICE"}
        //{data: "PRICELIST_PRICE", name: "Цена по прайс-листу", width: 75, type: "numeric2", dataFunction:"0"}
    ];
    app.get("/wrh/pInvoices/getDataForPInvProductsTable", function(req, res){
        wrh_pinvs_products.getDataForDocTable({tableColumns:wrhPInvProductsTableColumns,
                identifier:wrhPInvProductsTableColumns[0].data,
                conditions:req.query,
                order:["POSIND"]},
            function(result){
                res.send(result);
            });
    });

    wrh_pinvs_products.insNewPInvTableDataItem= function(tableDataItem, callback){

        var findFields = [];
        if (tableDataItem["PRODUCT_CODE"] || tableDataItem["PRODUCT_NAME"]) {
            if (tableDataItem["PRODUCT_CODE"])findFields.push("CODE");
            if (tableDataItem["PRODUCT_NAME"])findFields.push("NAME");
        }
        dir_products_bata.findDataItemByOrCreateNew({
                resultFields: ["ID", "CODE", "NAME", "PRINT_NAME", "UM", "PBARCODE"],
                findByFields: findFields,
                idFieldName: "ID",
                fieldsValues: {
                    "CODE": tableDataItem["PRODUCT_CODE"],
                    "NAME": tableDataItem["PRODUCT_NAME"],
                    "PRINT_NAME": tableDataItem["PRODUCT_PRINT_NAME"],
                    "UM": tableDataItem["PRODUCT_UM"],
                    "PBARCODE": tableDataItem["BARCODE"],
                    "ARTICLE": tableDataItem["PRODUCT_ARTICLE"],
                    "COLLECTION": tableDataItem["PRODUCT_COLLECTION"],
                    "TYPE": tableDataItem["PRODUCT_TYPE"],
                    "KIND": tableDataItem["PRODUCT_KIND"],
                    "COMPOSITION": tableDataItem["PRODUCT_COMPOSITION"],
                    "SIZE": tableDataItem["PRODUCT_SIZE"] || "",
                    "GENDER": tableDataItem["PRODUCT_GENDER"],
                    "GENDER_CODE": tableDataItem["PRODUCT_GENDER_CODE"],
                    "CATEGORY": tableDataItem["PRODUCT_CATEGORY"],
                    "CATEGORY_CODE": tableDataItem["PRODUCT_CATEGORY_CODE"],
                    "SUBCATEGORY": tableDataItem["PRODUCT_SUBCATEGORY"],
                    "SUBCATEGORY_CODE": tableDataItem["PRODUCT_SUBCATEGORY_CODE"]
                }
            },
            function (result) {
                if (result.error) {
                    callback({error: "Failed find/create product! Reason:" + result.error});
                    return;
                }
                if (!result.resultItem) {
                    callback({error: "Failed find/create product! Reason: no result!"});
                    return;
                }
                tableDataItem["PRODUCT_ID"]=result.resultItem["ID"];
                if (!tableDataItem["BARCODE"])tableDataItem["BARCODE"] = result.resultItem["PBARCODE"];
                sys_operations.insDataItemWithNewID({idFieldName:"ID", insData:{}}, function(sysOperIdRes){
                    if(sysOperIdRes.error){
                        callback({error:sysOperIdRes.error});
                        return;
                    }
                    var sysOperId=sysOperIdRes.resultItem["ID"];
                    dir_products_batches.createNewBatch({prodData:{"PRODUCT_ID":tableDataItem["PRODUCT_ID"]}},
                        function(newBatchRes){
                            if(newBatchRes.error){
                                callback({error:newBatchRes.error});
                                return;
                            }
                            var batchNum= newBatchRes.resultItem["BATCH_NUMBER"];
                            tableDataItem["BATCH_NUMBER"]=newBatchRes.resultItem["BATCH_NUMBER"];
                            wrh_products_r_operations.insDataItem({insData:{OPERATION_ID:sysOperId,BATCH_NUMBER: batchNum,
                                PRODUCT_ID:tableDataItem["PRODUCT_ID"],BARCODE:tableDataItem["BARCODE"]}}, function(prodOperRes){
                                if(prodOperRes.error){
                                    callback({error:newBatchRes.error});
                                    return;
                                }
                                wrh_pinvs_products.matchAndUpdateSalePrice(tableDataItem,function(updPriceRes){
                                    if(updPriceRes.error){
                                        callback({error:updPriceRes.error});
                                        return;
                                    }
                                    wrh_pinvs_products.insTableDataItem({tableColumns:wrhPInvProductsTableColumns,idFieldName:"ID",insTableData:{ID:sysOperId,
                                        PINV_ID:tableDataItem["PINV_ID"], POSIND:tableDataItem["POSIND"],
                                        QTY:tableDataItem["QTY"], PRICE:tableDataItem["PRICE"],FACTOR:tableDataItem["FACTOR"]}}, function(wrhProdRes){
                                        if(wrhProdRes.error){
                                            callback({error:wrhProdRes.error});
                                            return;
                                        }
                                        wrhProdRes["POSSUM"]=tableDataItem["QTY"]*tableDataItem["PRICE"];
                                        callback(wrhProdRes);
                                    });
                                });
                            });
                        });
                })
            });
    };

    wrh_pinvs_products.updPInvTableDataItem= function(tableDataItem, callback){
        wrh_products_r_operations.getDataItem({fields:["PRODUCT_ID","BATCH_NUMBER"],
                conditions:{"OPERATION_ID=":tableDataItem["ID"]}},
            function(result){
                if(result.error){
                    callback({error:result.error});
                    return;
                }
                tableDataItem['REGISTERED_PROD_ID']=result.item["PRODUCT_ID"];
                tableDataItem['REGISTERED_BATCH_NUMBER']=result.item["BATCH_NUMBER"];
                dir_products_bata.getDataItem({fields:["ID"],
                        conditions: {"NAME=":tableDataItem["PRODUCT_NAME"]}},
                    function(result){
                        if(result.error){
                            callback({error:result.error});
                            return;
                        }
                        if(result.item){
                            tableDataItem["PRODUCT_ID"]=result.item['ID'];
                            // prod was changed to
                            if(tableDataItem['REGISTERED_PROD_ID']!=tableDataItem["PRODUCT_ID"]){
                                wrh_pinvs_products.changeProductToExistent(tableDataItem, function(result){
                                    if(result.error){
                                        callback({error:result.error});
                                        return;
                                    }
                                    callback(result);
                                });
                                return;
                            }
                          // if(tableDataItem["PRODUCT_NAME"]== registered prod. name
                            wrh_pinvs_products.updProdAttrAndGetRowData(tableDataItem, function(result){
                                if(result.error){
                                    callback({error:result.error});
                                    return;
                                }
                                callback(result);
                            });
                            return;
                        }
                        //check if prod id is used before
                        wrh_products_operations_v.getDataItems({fields:["OPERATION_ID","PRODUCT_ID"],
                            conditions:{"PRODUCT_ID=":tableDataItem['REGISTERED_PROD_ID'],"OPERATION_ID<>":tableDataItem["ID"]}},
                            function(result){
                                if(result.error){
                                    callback({error:result.error});
                                    return;
                                }//not used -> update
                                if(!result.items|| result.items.length==0){
                                    dir_products_bata.updProductDataById(tableDataItem['REGISTERED_PROD_ID'], tableDataItem,
                                        function(result){
                                            if(result.error){
                                                callback({error:result.error});
                                                return;
                                            }
                                            wrh_pinvs_products.updDataItem({updData:{QTY:tableDataItem["QTY"], PRICE:tableDataItem["PRICE"],
                                                    FACTOR:tableDataItem["FACTOR"]}, conditions:{"ID=":tableDataItem["ID"]}},
                                                function(updRes){
                                                    if(updRes.error){
                                                        callback({error:updRes.error});
                                                        return;
                                                    }
                                                    tableDataItem['PRODUCT_ID']=tableDataItem['REGISTERED_PROD_ID'];
                                                    wrh_pinvs_products.matchAndUpdateSalePrice(tableDataItem, function(result){
                                                        if(result.error){
                                                            callback(result);
                                                            return;
                                                        }
                                                        wrh_pinvs_products.getDataItemForTable({tableColumns:wrhPInvProductsTableColumns,
                                                            conditions:{"wrh_pinvs_products.ID=":tableDataItem["ID"]}}, function(updDataRes){
                                                            if(updDataRes.error){
                                                                callback({error:updRes.error});
                                                                return;
                                                            }
                                                            callback({resultItem:updDataRes.item,updateCount:updRes.updateCount });
                                                        })
                                                    });
                                                });
                                        });
                                    return;
                                }
                                // used create new prod
                                dir_products_bata.insertNewProduct(tableDataItem,function(result){
                                    if(result.error){
                                        callback({error:result.error});
                                        return;
                                    }
                                    var newProd=result.resultItem;
                                    tableDataItem["PRODUCT_ID"]=newProd["ID"];
                                    dir_products_batches.createNewBatch({prodData:{"PRODUCT_ID":newProd["ID"]}},
                                        function(newBatchRes){
                                            if(newBatchRes.error){
                                                callback({error:newBatchRes.error});
                                                return;
                                            }
                                            var batchNum= newBatchRes.resultItem["BATCH_NUMBER"];
                                            tableDataItem["BATCH_NUMBER"]=batchNum;
                                            wrh_products_r_operations.updDataItem({updData:{BATCH_NUMBER: batchNum,
                                                PRODUCT_ID:newProd["ID"],BARCODE:newProd["PBARCODE"]},
                                                conditions:{"OPERATION_ID=":tableDataItem["ID"]}}, function(prodOperRes){
                                                if(prodOperRes.error){
                                                    callback({error:prodOperRes.error});
                                                    return;
                                                }
                                                wrh_pinvs_products.updDataItem({updData:{QTY:tableDataItem["QTY"], PRICE:tableDataItem["PRICE"],
                                                       FACTOR:tableDataItem["FACTOR"]}, conditions:{"ID=":tableDataItem["ID"]}},
                                                    function(updRes){
                                                        if(updRes.error){
                                                            callback({error:updRes.error});
                                                            return;
                                                        }
                                                        wrh_pinvs_products.matchAndUpdateSalePrice(tableDataItem,function(result){
                                                            if(result.error){
                                                                callback(result);
                                                                return;
                                                            }
                                                            wrh_pinvs_products.getDataItemForTable({tableColumns:wrhPInvProductsTableColumns,
                                                                conditions:{"wrh_pinvs_products.ID=":tableDataItem["ID"]}}, function(updDataRes){
                                                                if(updDataRes.error){
                                                                    callback({error:updRes.error});
                                                                    return;
                                                                }
                                                                callback({resultItem:updDataRes.item,updateCount:updRes.updateCount });
                                                            })
                                                        });
                                                    });
                                            });
                                        });
                                });
                            });
                    });
            });
    };

    wrh_pinvs_products.changeProductToExistent=function(tableDataItem,callback){
        dir_products_batches.createNewBatch({prodData:{"PRODUCT_ID":tableDataItem["PRODUCT_ID"]}},
            function(newBatchRes){
                if(newBatchRes.error){
                    callback({error:newBatchRes.error});
                    return;
                }
                var batchNum= newBatchRes.resultItem["BATCH_NUMBER"];
                tableDataItem["BATCH_NUMBER"]=batchNum;
                wrh_products_r_operations.updDataItem({updData:{BATCH_NUMBER: batchNum, PRODUCT_ID:tableDataItem["PRODUCT_ID"], BARCODE:tableDataItem["BARCODE"]},
                        conditions:{"OPERATION_ID=":tableDataItem["ID"],"BATCH_NUMBER=":tableDataItem['REGISTERED_BATCH_NUMBER'],"PRODUCT_ID=":tableDataItem['REGISTERED_PROD_ID']}},
                    function(prodOperRes){
                        if(prodOperRes.error){
                            callback({error:newBatchRes.error});
                            return;
                        }
                        wrh_pinvs_products.updDataItem({updData:{QTY:tableDataItem["QTY"], PRICE:tableDataItem["PRICE"],
                                FACTOR:tableDataItem["FACTOR"]}, conditions:{"ID=":tableDataItem["ID"]}},
                            function(updRes){
                                if(updRes.error){
                                    callback({error:updRes.error});
                                    return;
                                }
                                wrh_pinvs_products.matchAndUpdateSalePrice(tableDataItem, function(result){
                                    if(result.error){
                                        callback(result);
                                        return;
                                    }
                                    wrh_pinvs_products.getDataItemForTable({tableColumns:wrhPInvProductsTableColumns,
                                        conditions:{"wrh_pinvs_products.ID=":tableDataItem["ID"]}}, function(updDataRes){
                                        if(updDataRes.error){
                                            callback({error:updDataRes.error});
                                            return;
                                        }
                                        callback({resultItem:updDataRes.item,updateCount:updRes.updateCount });
                                    });
                                })
                            });
                    });
            });
    };

    wrh_pinvs_products.updProdAttrAndGetRowData=function(tableDataItem,callback){
        dir_products_bata.updNonNominalProdAttr(tableDataItem,
            function(result){
                if(result.error){
                    callback({error:result.error});
                    return;
                }
                wrh_pinvs_products.updDataItem({updData:{QTY:tableDataItem["QTY"], PRICE:tableDataItem["PRICE"],
                        FACTOR:tableDataItem["FACTOR"]}, conditions:{"ID=":tableDataItem["ID"]}},
                    function(updRes){
                        if(updRes.error){
                            callback({error:updRes.error});
                            return;
                        }
                        wrh_pinvs_products.matchAndUpdateSalePrice(tableDataItem,function(result){
                            if(result.error){
                                callback(result);
                                return;
                            }
                            wrh_pinvs_products.getDataItemForTable({tableColumns:wrhPInvProductsTableColumns,
                                conditions:{"wrh_pinvs_products.ID=":tableDataItem["ID"]}}, function(updDataRes){
                                if(updDataRes.error){
                                    callback({error:updRes.error});
                                    return;
                                }
                                callback({resultItem:updDataRes.item,updateCount:updRes.updateCount });
                            })
                        })
                    });
        })
    };

    wrh_pinvs_products.matchAndUpdateSalePrice=function(wrhProdData,callback){
        wrh_pinvs.getDataItem({fields:["UNIT_ID"], conditions:{"ID=":wrhProdData["PINV_ID"]}},
        function(result){
            if(result.error){
                callback({error:result.error});
                return;
            }
            var unitId=result.item["UNIT_ID"];
            dir_units.getDataItem({fields:["PRICELIST_ID"], conditions:{"ID=":unitId}},
            function(result){
                if(result.error){
                    callback({error:result.error});
                    return;
                }
                wrhProdData["PRICELIST_ID"]=result.item["PRICELIST_ID"];
                if(!wrhProdData["SALE_PRICE"] ||wrhProdData["SALE_PRICE"]==0){
                    dir_pricelists_products_batches.getDataItem({fields:["CHANGE_DATETIME"],
                            conditions:{"PRICELIST_ID=":wrhProdData["PRICELIST_ID"],"PRODUCT_ID=":wrhProdData["PRODUCT_ID"],"BATCH_NUMBER=":wrhProdData["BATCH_NUMBER"]}},
                        function(result){
                            if(result.error){
                                callback({error:result.error});
                                return;
                            }
                            if(!result.item){
                                callback(result);
                                return;
                            }
                            dir_pricelists_products_batches.delDataItem({conditions: {"PRICELIST_ID=": wrhProdData["PRICELIST_ID"],
                                    "PRODUCT_ID=":wrhProdData["PRODUCT_ID"],"BATCH_NUMBER=":wrhProdData["BATCH_NUMBER"]}},
                                function(result){
                                    callback(result);
                                });
                        });
                    return;
                }
                dir_pricelists_products_batches.getDataItem({fields:["CHANGE_DATETIME"],
                    conditions:{"PRICELIST_ID=":wrhProdData["PRICELIST_ID"],"PRODUCT_ID=":wrhProdData["PRODUCT_ID"],"BATCH_NUMBER=":wrhProdData["BATCH_NUMBER"]}},
                function(result){
                    if(result.error){
                        callback({error:result.error});
                        return;
                    }
                    if(!result.item ||!result.item["CHANGE_DATETIME"] ){
                        dir_products_batches_sale_prices.insertSalePrice(wrhProdData,function(result){
                            callback(result);
                        });
                        return;
                    }
                    wrhProdData["CHANGE_PRICE_DATETIME"]=result.item["CHANGE_DATETIME"];
                    dir_products_batches_sale_prices.getDataItem({fields:["PRiCE"],
                        conditions:{"CHANGE_DATETIME=":wrhProdData["CHANGE_PRICE_DATETIME"],"PRODUCT_ID=":wrhProdData["PRODUCT_ID"],
                            "BATCH_NUMBER=":wrhProdData["BATCH_NUMBER"],"PRICELIST_ID=":wrhProdData["PRICELIST_ID"] }},
                        function(result){
                            if(result.error){
                                callback({error:result.error});
                                return;
                            }
                            if(!result.item||!result.item["PRiCE"]){
                                dir_products_batches_sale_prices.insertSalePrice(wrhProdData,function(result){
                                    callback(result);
                                });
                                return;
                            }
                            var registeredSalePrice=result.item["PRiCE"];
                            if(registeredSalePrice!=wrhProdData["SALE_PRICE"]){
                                dir_products_batches_sale_prices.updateSalePrice(wrhProdData,function(result){
                                    callback(result);
                                });
                                return;
                            }
                            callback({});
                    });
                })
            })
        });
    };
    dir_products_batches_sale_prices.updateSalePrice=function(wrhProdData,callback){ console.log("wrhProdData updateSalePrice=",wrhProdData);
        var changeDateTime = dateFormat(new Date, "yyyy-mm-dd HH:MM:ss");
        dir_products_batches_sale_prices.insDataItem({insData:{"CHANGE_DATETIME":changeDateTime,"PRODUCT_ID":wrhProdData["PRODUCT_ID"],
                "BATCH_NUMBER":wrhProdData["BATCH_NUMBER"], "PRICELIST_ID":wrhProdData["PRICELIST_ID"],"PRICE":wrhProdData["SALE_PRICE"]}},
            function(result){           console.log("result 613=",result);
                if(result.error){
                    callback({error:result.error});
                    return;
                }
                dir_pricelists_products_batches.updDataItem({updData:{"CHANGE_DATETIME":changeDateTime},
                    conditions:{"PRICELIST_ID=":wrhProdData["PRICELIST_ID"],"PRODUCT_ID=":wrhProdData["PRODUCT_ID"],
                        "BATCH_NUMBER=":wrhProdData["BATCH_NUMBER"]}},
                    function(result){                   console.log("result 621=",result);
                        if(result.error){
                            callback({error:result.error});
                            return;
                        }

                callback({});
            });
        });
    };
    dir_products_batches_sale_prices.insertSalePrice=function(wrhProdData,callback){                console.log("insertSalePrice wrhProdData=",wrhProdData);
        var changeDateTime=dateFormat(new Date, "yyyy-mm-dd HH:MM:ss");
        dir_products_batches_sale_prices.insDataItem({insData:{"CHANGE_DATETIME":changeDateTime,"PRODUCT_ID":wrhProdData["PRODUCT_ID"],
                "BATCH_NUMBER":wrhProdData["BATCH_NUMBER"], "PRICELIST_ID":wrhProdData["PRICELIST_ID"],"PRICE":wrhProdData["SALE_PRICE"]}},
            function(result){
                if(result.error){
                    callback({error:result.error});
                    return;
                }
                dir_pricelists_products_batches.insDataItemWithNewID({idFieldName:"ID", insData:{"PRICELIST_ID":wrhProdData["PRICELIST_ID"],
                    "PRODUCT_ID":wrhProdData["PRODUCT_ID"],"BATCH_NUMBER":wrhProdData["BATCH_NUMBER"],
                    "CHANGE_DATETIME":changeDateTime}},function(result){
                    if(result.error){
                        callback({error:result.error});
                        return;
                    }
                    callback({});
                });
            });
    };

    wrh_pinvs_products.storePInvTableDataItem = function(storeData, callback){
        if (!storeData["ID"]) {
            wrh_pinvs_products.insNewPInvTableDataItem(storeData, function(insNewDataResult){
                callback(insNewDataResult);
            });
            return;
        }
        wrh_pinvs.updDataItem({updData:{"ID":storeData["PINV_ID"]},conditions:{"ID=":storeData["PINV_ID"]}},
        function(result){
            if(result.error){
                callback({error:result.error});
                return;
            }
            wrh_pinvs_products.updPInvTableDataItem(storeData,function(updateRes){
                callback(updateRes);
            });
        });
    };
    app.post("/wrh/pInvoices/storePInvProductsTableData", function(req, res){
        var storeData=req.body;
        wrh_pinvs_products.storePInvTableDataItem(storeData,
            function(result){
                res.send(result);
            });
    });
    app.post("/wrh/pInvoices/deletePInvProductsTableData", function(req, res){
        var delData=req.body;
        wrh_pinvs_products.delTableDataItem({idFieldName:"ID", delTableData:delData},
            function(result){
                res.send(result);
            });
    });
    app.post("/wrh/pInvoices/closePInv", function (req, res) {
        var pinvId = req.body["PINV_ID"];
        res.connection.setTimeout(0);
        wrh_pinvs_products.getDataItems({fields: ["ID"], conditions: {"PINV_ID=": pinvId}},
            function (result) {
                if (result.error) {
                    res.send({error: result.error});
                    return;
                }
                if (!result.items || result.items.length == 0) {
                    res.send({userErrorMsg: "Невозможно закрыть пустую накладную.",
                        error: "FAIL! Reason:Impossible to close empty pinv."
                    });
                    return;
                }
                var operationIdItems = result.items;
                wrh_pinvs.getDataItem({fields: ["UNIT_ID"], conditions: {"ID=": pinvId}},
                    function (result) {
                        if (result.error) {
                            res.send({error: result.error});
                            return;
                        }
                        var pinvData = {};
                        pinvData["PINV_ID"] = pinvId;
                        pinvData["UNIT_ID"] = result.item["UNIT_ID"];
                        sys_sync_POSes.getDataItems({fields:["ID"],conditions:{"UNIT_ID=":pinvData["UNIT_ID"],"ACTIVE=":1}},function(result){
                            if(result.error){
                                res({error:result.error});
                                return;
                            }
                            if(!result.items||result.items.length==0){
                                res({error:"Не удалось найти активные POS-терминалы в БД"});
                                return;
                            }
                            var posIdArr=[];//result.items;
                            result.items.forEach(function(item){
                                posIdArr.push(item["ID"]);
                            });
                            pinvData["POS_ID_ARR"]=posIdArr;
                            dir_units.getDataItem({fields: ["PRICELIST_ID"], conditions: {"ID=": pinvData["UNIT_ID"]}},
                                function (result) {
                                    if (result.error) {
                                        callback({error: result.error});
                                        return;
                                    }
                                    pinvData["PRICELIST_ID"]= result.item["PRICELIST_ID"];

                                    wrh_pinvs.updDataItem({updData: {"DOCSTATE_ID": "1"}, conditions: {"ID=": pinvId}
                                    }, function (result) {
                                        if (result.error) {
                                            res.send({error: result.error});
                                            return;
                                        }
                                        res.send({});

                                        setTimeout(function(){
                                            wrh_pinvs_products.getAndInsertDataForSysSyncOut(0, operationIdItems, pinvData,
                                                function (result) {
                                                    if (result.error) {
                                                        log.error("FAIL!!! Insert data to sys_sync_output_data " +
                                                            "by PINV_ID "+ pinvId+" failed.Reason:"+result.error);
                                                        return;
                                                    }
                                                    log.info("Data inserted successfully data to sys_sync_output_data by PINV_ID "+ pinvId+".");
                                                });
                                        },0);
                                    });
                                });
                        })
                    });
            });
    });
    wrh_pinvs_products.getAndInsertDataForSysSyncOut = function (ind, operationIdArr, pinvData, callback) {
        if (!operationIdArr[ind]) {
            callback({});
            return;
        }
        wrh_pinvs.getDataItems({fields:["dir_products.CODE","dir_products.PBARCODE", "dir_products.NAME",
                "dir_products_batches_sale_prices.PRICE",  "wrh_products_r_operations.PRODUCT_ID", "wrh_products_r_operations.OPERATION_ID"],
                joinedSources:{
                    "wrh_pinvs_products":{"wrh_pinvs_products.PINV_ID=wrh_pinvs.ID":null},
                    "wrh_products_r_operations":{"wrh_products_r_operations.OPERATION_ID=wrh_pinvs_products.ID":null},
                    "dir_products":{"dir_products.ID=wrh_products_r_operations.PRODUCT_ID":null},
                    "dir_units":{"dir_units.ID=wrh_pinvs.UNIT_ID":null}
                }
                ,leftJoinedSources:{
                    "dir_pricelists_products_batches": {
                        "dir_pricelists_products_batches.PRICELIST_ID=dir_units.PRICELIST_ID":null ,
                        "dir_pricelists_products_batches.PRODUCT_ID=dir_products.ID": null,
                        "dir_pricelists_products_batches.BATCH_NUMBER=wrh_products_r_operations.BATCH_NUMBER": null},
                    "dir_products_batches_sale_prices": {
                        "dir_products_batches_sale_prices.CHANGE_DATETIME=dir_pricelists_products_batches.CHANGE_DATETIME": null,
                        "dir_products_batches_sale_prices.PRODUCT_ID=dir_pricelists_products_batches.PRODUCT_ID": null,
                        "dir_products_batches_sale_prices.BATCH_NUMBER=dir_pricelists_products_batches.BATCH_NUMBER": null,
                        "dir_products_batches_sale_prices.PRICELIST_ID=dir_pricelists_products_batches.PRICELIST_ID": null}},
                conditions:{"wrh_pinvs.ID=":pinvData["PINV_ID"]}},
            function(result){
                if (result.error) {
                    callback({error: result.error});
                    return;
                }
                var syncOutDataArr=[];
                for(var i in result.items){
                    var syncOutData={};
                    var item=result.items[i];
                    syncOutData["PRODUCT_ID"]=item["PRODUCT_ID"];
                    syncOutData["OPERATION_ID"]=item["OPERATION_ID"];
                    syncOutData["POS_ID_ARR"] = pinvData["POS_ID_ARR"];

                    syncOutData.detailData = {};
                    syncOutData.detailData["TAXCAT"] = '000';
                    syncOutData.detailData["PRICESELLWD"] = 0;
                    syncOutData.detailData["PRICEBUY"] = 0;
                    syncOutData.detailData["ISSCALE"] = 0;
                    syncOutData.detailData["CATEGORY"] = '000';
                    syncOutData.detailData["DISCOUNT"] = 0;
                    syncOutData.detailData["ISCOM"] = 0;

                    syncOutData.detailData["REFERENCE"] = item["CODE"];
                    syncOutData.detailData["CODE"] = item["PBARCODE"];
                    syncOutData.detailData["NAME"] = item["NAME"];
                    syncOutData.detailData["PRICESELL"]=item["PRICE"]||0;
                    syncOutDataArr.push(syncOutData);
                }
                setTimeout(function(){
                    sys_sync_output_data.insertSysSyncOutData(0,syncOutDataArr, function (result) {
                        if (result.error) {
                            callback({error: result.error});
                            return;
                        }
                        callback({});
                    });
                },0);
            });
    };
};