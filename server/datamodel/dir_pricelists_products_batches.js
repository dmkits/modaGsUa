module.exports.id=module.id;
var changeLog = [
    { changeID:"dir_pricelists_products_batches__1", changeDatetime:"2017-12-12 11:50:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"CREATE TABLE dir_pricelists_products_batches(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_pricelists_products_batches",
        field:"ID"},
    { changeID:"dir_pricelists_products_batches__2", changeDatetime:"2017-12-12 11:51:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD COLUMN PRICELIST_ID BIGINT UNSIGNED NOT NULL",
        field:"PRICELIST_ID"},
    { changeID:"dir_pricelists_products_batches__3", changeDatetime:"2017-12-12 11:52:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD CONSTRAINT DIR_PRICELISTS_PB_PRICELIST_ID_FK " +
            "FOREIGN KEY (PRICELIST_ID) REFERENCES dir_pricelists(ID)",
        field:"PRICELIST_ID", "source":"dir_pricelists", "linkField":"ID" },
    { changeID:"dir_pricelists_products_batches__4", changeDatetime:"2017-12-12 11:53:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ID"},
    { changeID:"dir_pricelists_products_batches__5", changeDatetime:"2017-12-12 11:54:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD COLUMN BATCH_NUMBER INTEGER UNSIGNED NOT NULL",
        field:"BATCH_NUMBER"},
    { changeID:"dir_pricelists_products_batches__6", changeDatetime:"2017-12-12 11:55:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD COLUMN CHANGE_DATETIME DATETIME NOT NULL",
        field:"CHANGE_DATETIME"},
    { changeID:"dir_pricelists_products_batches__7", changeDatetime:"2017-12-12 11:56:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ALTER COLUMN CHANGE_DATETIME DROP DEFAULT" },
    { changeID:"dir_pricelists_products_batches__8", changeDatetime:"2017-12-12 11:57:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD CONSTRAINT DIR_PRICELISTSPB_PRODUCT_SALE_PRICE_FK " +
            "FOREIGN KEY (CHANGE_DATETIME,PRODUCT_ID,BATCH_NUMBER,PRICELIST_ID) " +
            "REFERENCES dir_products_batches_sale_prices(CHANGE_DATETIME,PRODUCT_ID,BATCH_NUMBER,PRICELIST_ID)" },
    { changeID:"dir_pricelists_products_batches__9", changeDatetime:"2017-12-12 11:58:00", changeObj:"dir_pricelists_products_batches",
        changeVal:"ALTER TABLE dir_pricelists_products_batches ADD CONSTRAINT DIR_PLPB_PRICE_PRODUCT_BATCH_UNIQUE " +
            "UNIQUE(PRICELIST_ID,PRODUCT_ID,BATCH_NUMBER)" }
];
module.exports.changeLog=changeLog;