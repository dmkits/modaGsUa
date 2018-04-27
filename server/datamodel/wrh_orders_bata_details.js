module.exports.id=module.id;
var changeLog=[
    { changeID: "wrh_orders_bata_details__1", changeDatetime: "2016-09-04 20:01:00", changeObj: "wrh_orders_bata_details",
        changeVal: "CREATE TABLE wrh_orders_bata_details(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_orders_bata_details", field:"ID", id:"ID" },
    { changeID: "wrh_orders_bata_details__2", changeDatetime: "2016-09-04 20:02:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN ORDER_BATA_ID BIGINT UNSIGNED NOT NULL",
        field:"ORDER_BATA_ID" },
    { changeID: "wrh_orders_bata_details__3", changeDatetime: "2016-09-04 20:03:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD CONSTRAINT WRH_ORDER_BATA_DETAILS_ORDER_BATA_ID_FK " +
            "FOREIGN KEY (ORDER_BATA_ID) REFERENCES wrh_orders_bata(ID)",
        field:"ORDER_BATA_ID", "source":"wrh_orders_bata", "linkField":"ID" },
    { changeID: "wrh_orders_bata_details__4", changeDatetime: "2016-09-04 20:04:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN POS INTEGER UNSIGNED NOT NULL NOT NULL",
        field:"POS" },
    { changeID: "wrh_orders_bata_details__5", changeDatetime: "2016-09-04 20:05:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN PRODUCT_GENDER_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_GENDER_ID" },
    { changeID: "wrh_orders_bata_details__6", changeDatetime: "2016-09-04 20:06:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD CONSTRAINT WRH_ORDER_BATA_DETAILS_PRODUCT_GENDER_ID_FK " +
            "FOREIGN KEY (PRODUCT_GENDER_ID) REFERENCES dir_products_genders(ID)",
        field:"PRODUCT_GENDER_ID", "source":"dir_products_genders", "linkField":"ID" },
    { changeID: "wrh_orders_bata_details__7", changeDatetime: "2016-09-04 20:07:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN PRODUCT_CATEGORY_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_CATEGORY_ID" },
    { changeID: "wrh_orders_bata_details__8", changeDatetime: "2016-09-04 20:08:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD CONSTRAINT WRH_ORDER_BATA_DETAILS_PRODUCT_CATEGORY_ID_FK " +
            "FOREIGN KEY (PRODUCT_CATEGORY_ID) REFERENCES dir_products_categories(ID)",
        field:"PRODUCT_CATEGORY_ID", "source":"dir_products_categories", "linkField":"ID" },
    { changeID: "wrh_orders_bata_details__9", changeDatetime: "2016-09-04 20:09:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN PRODUCT_ARTICLE_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ARTICLE_ID" },
    { changeID: "wrh_orders_bata_details_10", changeDatetime: "2016-09-04 20:10:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD CONSTRAINT WRH_ORDER_BATA_DETAILS_PRODUCT_ARTICLE_ID_FK " +
            "FOREIGN KEY (PRODUCT_ARTICLE_ID) REFERENCES dir_products_articles(ID)",
        field:"PRODUCT_ARTICLE_ID", "source":"dir_products_articles", "linkField":"ID" },
    { changeID: "wrh_orders_bata_details_11", changeDatetime: "2016-09-04 20:11:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN QTY DECIMAL(12,3) NOT NULL",
        field:"QTY" },
    { changeID: "wrh_orders_bata_details_12", changeDatetime: "2016-09-04 20:22:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN RETAIL_PRICE DECIMAL(12,4) NOT NULL",
        field:"RETAIL_PRICE" },
    { changeID: "wrh_orders_bata_details_13", changeDatetime: "2016-09-04 20:23:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN PRICE DECIMAL(12,4) NOT NULL",
        field:"PRICE" },
    { changeID: "wrh_orders_bata_details_14", changeDatetime: "2016-09-04 20:24:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN POSSUM DECIMAL(12,2) NOT NULL",
        field:"POSSUM" },
    { changeID: "wrh_orders_bata_details_15", changeDatetime: "2016-09-11 16:31:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD COLUMN PRODUCT_SUBCATEGORY_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_SUBCATEGORY_ID" },
    { changeID: "wrh_orders_bata_details_16", changeDatetime: "2016-09-11 16:32:00", changeObj: "wrh_orders_bata_details",
        changeVal: "ALTER TABLE wrh_orders_bata_details ADD CONSTRAINT WRH_ORDER_BATA_DETAILS_PRODUCT_SUBCATEGORY_ID_FK " +
            "FOREIGN KEY (PRODUCT_SUBCATEGORY_ID) REFERENCES dir_products_subcategories(ID)",
        field:"PRODUCT_SUBCATEGORY_ID", "source":"dir_products_subcategories", "linkField":"ID" }
];
module.exports.changeLog=changeLog;

