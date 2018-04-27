module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_ret_invs_products__1", changeDatetime:"2017-08-11 09:15:00", changeObj:"wrh_ret_invs_products",
        changeVal:"CREATE TABLE wrh_ret_invs_products(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_ret_invs_products", field:"ID"},
    { changeID:"wrh_ret_invs_products__2", changeDatetime:"2017-08-11 09:16:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN RET_INV_ID BIGINT UNSIGNED NOT NULL",
        field:"RET_INV_ID"},
    { changeID:"wrh_ret_invs_products__3", changeDatetime:"2017-08-11 09:17:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD CONSTRAINT WRH_RET_INVS_PRODUCTS_INV_ID_FK " +
            "FOREIGN KEY (RET_INV_ID) REFERENCES wrh_ret_invs(ID)" },
    { changeID:"wrh_ret_invs_products__4", changeDatetime:"2017-08-11 09:18:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN POSIND DOUBLE UNSIGNED NOT NULL",
        field:"POSIND"},
    { changeID:"wrh_ret_invs_products__5", changeDatetime:"2017-08-11 09:19:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ID"},
    { changeID:"wrh_ret_invs_products__6", changeDatetime:"2017-08-11 09:20:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD CONSTRAINT WRH_RET_INVS_PRODUCTS_PRODUCT_ID_FK " +
            "FOREIGN KEY (PRODUCT_ID) REFERENCES dir_products(ID)" },
    { changeID:"wrh_ret_invs_products__7", changeDatetime:"2017-08-11 09:21:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN QTY DECIMAL(12,3) NOT NULL",
        field:"QTY"},
    { changeID:"wrh_ret_invs_products__8", changeDatetime:"2017-08-11 09:22:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN PRICE DECIMAL(12,2) NOT NULL",
        field:"PRICE"},
    { changeID:"wrh_ret_invs_products__9", changeDatetime:"2017-08-11 09:23:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN POSSUM DECIMAL(12,2) NOT NULL",
        field:"POSSUM"},
    { changeID:"wrh_ret_invs_products_10", changeDatetime:"2017-08-11 09:24:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD COLUMN BARCODE BIGINT UNSIGNED NOT NULL",
        field:"BARCODE"},
    { changeID:"wrh_ret_invs_products_11", changeDatetime:"2017-08-11 09:25:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD CONSTRAINT WRH_RET_INVS_PRODUCTS_BARCODE_PRODUCT_ID_FK " +
            "FOREIGN KEY (BARCODE,PRODUCT_ID) REFERENCES dir_products_barcodes(BARCODE,PRODUCT_ID)" },
    { changeID:"wrh_ret_invs_products_12", changeDatetime:"2017-08-11 09:26:00", changeObj:"wrh_ret_invs_products",
        changeVal:"ALTER TABLE wrh_ret_invs_products ADD CONSTRAINT WRH_RET_INVS_PRODUCTS_INV_ID_POSIND_UNIQUE " +
            "UNIQUE(RET_INV_ID,POSIND)" }
];
module.exports.changeLog=changeLog;