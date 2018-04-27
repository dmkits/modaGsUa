module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_barcodes__1", changeDatetime: "2016-08-30 16:21:00", changeObj: "dir_products_barcodes",
      changeVal: "CREATE TABLE dir_products_barcodes(BARCODE BIGINT UNSIGNED NOT NULL) CHARACTER SET utf8",
      tableName:"dir_products_barcodes", field:"BARCODE" },
    { changeID: "dir_products_barcodes__2", changeDatetime: "2016-08-30 16:22:00", changeObj: "dir_products_barcodes",
      changeVal: "ALTER TABLE dir_products_barcodes ADD CONSTRAINT DIR_PRODUCTS_BARCODES_BARCODE_UNIQUE" +
          " UNIQUE(BARCODE)" },
    { changeID: "dir_products_barcodes__3", changeDatetime: "2016-08-30 16:23:00", changeObj: "dir_products_barcodes",
      changeVal: "ALTER TABLE dir_products_barcodes ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
      field:"PRODUCT_ID" },
    { changeID: "dir_products_barcodes__4", changeDatetime: "2016-08-30 16:24:00", changeObj: "dir_products_barcodes",
      changeVal: "ALTER TABLE dir_products_barcodes ADD CONSTRAINT DIR_PRODUCTS_BARCODES_PRODUCT_ID_FK" +
          " FOREIGN KEY (PRODUCT_ID) REFERENCES dir_products(ID)",
      field:"PRODUCT_ID", "source":"dir_products", "linkField":"ID" },
    { changeID: "dir_products_barcodes__5", changeDatetime: "2016-08-30 16:25:00", changeObj: "dir_products_barcodes",
      changeVal: "ALTER TABLE dir_products_barcodes ADD PRIMARY KEY (BARCODE,PRODUCT_ID)" }
];
module.exports.changeLog=changeLog;