module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_products_r_operations__1", changeDatetime:"2016-09-08 11:10:00", changeObj:"wrh_products_r_operations",
        changeVal:"CREATE TABLE wrh_products_r_operations(OPERATION_ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_products_r_operations", field:"OPERATION_ID"},
    { changeID:"wrh_products_r_operations__2", changeDatetime:"2016-09-08 11:11:00", changeObj:"wrh_products_r_operations",
        changeVal:"ALTER TABLE wrh_products_r_operations ADD CONSTRAINT WRH_PROD_R_OP_OPERATION_ID_FK " +
            "FOREIGN KEY (OPERATION_ID) REFERENCES sys_operations(ID)" },
    { changeID: "wrh_products_r_operations__3",changeDatetime:"2016-09-08 11:12:00", changeObj: "wrh_products_r_operations",
        changeVal: "ALTER TABLE wrh_products_r_operations ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ID" },
    { changeID:"wrh_products_r_operations__4", changeDatetime:"2016-09-08 11:13:00", changeObj:"wrh_products_r_operations",
        changeVal:"ALTER TABLE wrh_products_r_operations ADD COLUMN BARCODE BIGINT UNSIGNED NOT NULL",
        field:"BARCODE"},
    { changeID:"wrh_products_r_operations__5", changeDatetime:"2016-09-08 11:14:00", changeObj:"wrh_products_r_operations",
        changeVal:"ALTER TABLE wrh_products_r_operations ADD CONSTRAINT WRH_PROD_R_OP_PRODUCTS_BARCODE_PRODUCT_ID_FK " +
            "FOREIGN KEY (BARCODE,PRODUCT_ID) REFERENCES dir_products_barcodes(BARCODE,PRODUCT_ID)" },
    { changeID: "wrh_products_r_operations__6",changeDatetime:"2016-09-08 11:15:00", changeObj: "wrh_products_r_operations",
        changeVal: "ALTER TABLE wrh_products_r_operations ADD COLUMN BATCH_NUMBER INTEGER UNSIGNED NOT NULL",
        field:"BATCH_NUMBER" },
    { changeID:"wrh_products_r_operations__7", changeDatetime:"2016-09-08 11:16:00", changeObj:"wrh_products_r_operations",
        changeVal:"ALTER TABLE wrh_products_r_operations ADD CONSTRAINT WRH_PROD_R_OP_PRODUCT_ID_BATCH_NUMBER_UNIQUE " +
            "UNIQUE(PRODUCT_ID,BATCH_NUMBER)" },
    { changeID: "wrh_products_r_operations__8", changeDatetime:"2016-09-08 11:17:00", changeObj:"wrh_products_r_operations",
        changeVal:"ALTER TABLE wrh_products_r_operations ADD CONSTRAINT WRH_PROD_R_OP_PRODUCT_ID_BATCH_NUMBER_FK " +
            "FOREIGN KEY (PRODUCT_ID,BATCH_NUMBER) REFERENCES dir_products_batches(PRODUCT_ID,BATCH_NUMBER)" }
];
module.exports.changeLog=changeLog;