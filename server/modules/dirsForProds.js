/**
 * Created by Dmitrk on 13.05.2018.
 */
var dataModel=require('../datamodel'),database= require("../databaseMSSQL");
var r_Prods= require(appDataModelPath+"r_Prods"), r_ProdC= require(appDataModelPath+"r_ProdC"),
    r_ProdG1= require(appDataModelPath+"r_ProdG1"), r_ProdG2= require(appDataModelPath+"r_ProdG2"),
    r_ProdG3= require(appDataModelPath+"r_ProdG3");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([r_Prods,r_ProdC,r_ProdG1,r_ProdG1,r_ProdG3], errs,
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
            dataSource:"r_ProdMQ", sourceField:"barcode", linkCondition:"r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM" }

        //{data: "GENDER_CODE", name: "Код группы", width: 50,
        //    type: "combobox", "sourceURL":"/dir/products/getDataForProductsGendersCombobox/genderCode",
        //    dataSource:"dir_products_genders", sourceField:"CODE"},
        //{data: "GENDER", name: "Группа", width: 120,
        //    type: "combobox", "sourceURL":"/dir/products/getDataForProductsGendersCombobox/gender",
        //    dataSource:"dir_products_genders", sourceField:"NAME"},
        //{data: "CATEGORY_CODE", name: "Код категории", width: 60,
        //    type: "combobox", "sourceURL":"/dir/products/getDataForProductsCategoryCombobox/CategoryCode",
        //    dataSource:"dir_products_categories", sourceField:"CODE"},
        //{data: "CATEGORY", name: "Категория", width: 200,
        //    type: "combobox", "sourceURL":"/dir/products/getDataForProductsCategoryCombobox/category",
        //    dataSource:"dir_products_categories", sourceField:"NAME"},
        //{data: "SUBCATEGORY_CODE", name: "Код подкатегории", width: 100,
        //    type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/SubcategoryCode",
        //    dataSource:"dir_products_subcategories", sourceField:"CODE"},
        //{data: "SUBCATEGORY", name: "Подкатегория", width: 200,
        //    type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_subcategories", sourceField:"NAME"},
        //{data: "COLLECTION", name: "Коллекция", width: 120,
        //    type: "text",
        //    //type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_collections", sourceField:"NAME"},
        //{data: "COLLECTION_CODE", name: "Код коллекции", width: 120, visible:false,
        //    type: "text",
        //    //type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_collections", sourceField:"CODE"},
        //{data: "ARTICLE", name: "Артикул", width: 80,
        //    type: "text",
        //    //type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_articles", sourceField:"VALUE"},
        //{data: "KIND", name: "Вид", width: 150,
        //    type: "text",
        //    //type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_kinds", sourceField:"NAME"},
        //{data: "COMPOSITION_ID", name: "Состав", width: 150,
        //    type: "text",
        //    //type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_compositions", sourceField:"VALUE"},
        //{data: "SIZE", name: "Размер", width: 50,
        //    type: "text",
        //    //type: "comboboxWN", "sourceURL":"/dir/products/getDataForProductsSubcategoryCombobox/subcategory",
        //    dataSource:"dir_products_sizes", sourceField:"VALUE"},
    ];
    //dirProductsTableColumns=
    //    dir_products_bata.addProductColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductBataAttrsColumnsTo(dirProductsTableColumns,1);
    //dirProductsTableColumns=
    //    dir_products_bata.addProductAttrsColumnsTo(dirProductsTableColumns,8);

    app.get("/dirsProds/getProdByID", function (req, res) {
        var conditions={};
        if(req.query["ProdID"])conditions["r_Prods.ProdID="]=req.query["ProdID"];
        if(req.query["ProdName"])conditions["r_Prods.ProdName="]=req.query["ProdName"];
        r_Prods.getDataItemForTable(req.dbUC,{tableColumns:prodsTableColumns, conditions:conditions},
            function(result){
                res.send(result);
            });
    });
};
