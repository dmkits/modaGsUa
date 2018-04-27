module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_batches__1",changeDatetime:"2016-09-08 11:01:00", changeObj: "dir_products_batches",
        changeVal: "CREATE TABLE dir_products_batches(BATCH_NUMBER INTEGER UNSIGNED NOT NULL) CHARACTER SET utf8",
        tableName:"dir_products_batches", field:"BATCH_NUMBER" },
    { changeID: "dir_products_batches__2",changeDatetime:"2016-09-08 11:02:00", changeObj: "dir_products_batches",
        changeVal: "ALTER TABLE dir_products_batches ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ID" },
    { changeID: "dir_products_batches__3",changeDatetime:"2016-09-08 11:03:00", changeObj: "dir_products_batches",
        changeVal: "ALTER TABLE dir_products_batches ADD CONSTRAINT DIR_PRODUCTS_BATCHES_PRODUCT_ID_FK " +
            "FOREIGN KEY (PRODUCT_ID) REFERENCES dir_products(ID)",
        field:"PRODUCT_ID", "source":"dir_products", "linkField":"ID" },
    { changeID: "dir_products_batches__4",changeDatetime:"2016-09-08 11:04:00", changeObj: "dir_products_batches",
        changeVal: "ALTER TABLE dir_products_batches ADD PRIMARY KEY (BATCH_NUMBER,PRODUCT_ID)"}
];
module.exports.changeLog=changeLog;