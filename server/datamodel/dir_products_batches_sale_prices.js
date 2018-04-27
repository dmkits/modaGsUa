module.exports.id=module.id;
var changeLog = [
    { changeID:"dir_products_batches_sale_prices__1", changeDatetime:"2017-12-12 11:40:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"CREATE TABLE dir_products_batches_sale_prices(CHANGE_DATETIME DATETIME NOT NULL) CHARACTER SET utf8",
        tableName:"dir_products_batches_sale_prices",
        field:"CHANGE_DATETIME"},
    { changeID:"dir_products_batches_sale_prices__2", changeDatetime:"2017-12-12 11:41:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ID"},
    { changeID:"dir_products_batches_sale_prices__3", changeDatetime:"2017-12-12 11:42:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD COLUMN BATCH_NUMBER INTEGER UNSIGNED NOT NULL",
        field:"BATCH_NUMBER"},
    { changeID:"dir_products_batches_sale_prices__4", changeDatetime:"2017-12-12 11:43:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD CONSTRAINT DIR_PBSP_PRODUCT_ID_BATCH_NUMBER_FK " +
            "FOREIGN KEY (PRODUCT_ID,BATCH_NUMBER) REFERENCES dir_products_batches(PRODUCT_ID,BATCH_NUMBER)" },
    { changeID:"dir_products_batches_sale_prices__5", changeDatetime:"2017-12-12 11:44:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD COLUMN PRICELIST_ID BIGINT UNSIGNED NOT NULL",
        field:"PRICELIST_ID"},
    { changeID:"dir_products_batches_sale_prices__6", changeDatetime:"2017-12-12 11:45:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD CONSTRAINT DIR_PBSP_PRICELIST_ID_FK " +
            "FOREIGN KEY (PRICELIST_ID) REFERENCES dir_pricelists(ID)" },
    { changeID:"dir_products_batches_sale_prices__7", changeDatetime:"2017-12-12 11:46:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD COLUMN PRICE DECIMAL(12,2)",
        field:"PRICE"},
    { changeID:"dir_products_batches_sale_prices__8", changeDatetime:"2017-12-12 11:47:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD COLUMN DISCOUNT DECIMAL(12,2)",
        field:"DISCOUNT"},
    { changeID:"dir_products_batches_sale_prices__9", changeDatetime:"2017-12-12 11:48:00", changeObj:"dir_products_batches_sale_prices",
        changeVal:"ALTER TABLE dir_products_batches_sale_prices ADD COLUMN PRICE_WITH_DISCOUNT DECIMAL(12,2)",
        field:"PRICE_WITH_DISCOUNT"},
    { changeID: "dir_products_batches_sale_prices_10",changeDatetime:"2017-12-12 11:49:00", changeObj: "dir_products_batches_sale_prices",
        changeVal: "ALTER TABLE dir_products_batches_sale_prices ADD PRIMARY KEY (CHANGE_DATETIME,PRODUCT_ID,BATCH_NUMBER,PRICELIST_ID)"}
];
module.exports.changeLog=changeLog;