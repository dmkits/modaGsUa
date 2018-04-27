module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_ret_invs_products_wob__1", changeDatetime:"2017-08-11 10:21:00", changeObj:"wrh_ret_invs_products_wob",
        changeVal:"CREATE TABLE wrh_ret_invs_products_wob(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_ret_invs_products_wob", field:"ID"},
    { changeID:"wrh_ret_invs_products_wob__2", changeDatetime:"2017-08-11 10:22:00", changeObj:"wrh_ret_invs_products_wob",
        changeVal:"ALTER TABLE wrh_ret_invs_products_wob ADD COLUMN RET_INVS_PRODUCTS_ID BIGINT UNSIGNED NOT NULL",
        field:"RET_INVS_PRODUCTS_ID"},
    { changeID:"wrh_ret_invs_products_wob__3", changeDatetime:"2017-08-11 10:23:00", changeObj:"wrh_ret_invs_products_wob",
        changeVal:"ALTER TABLE wrh_ret_invs_products_wob ADD CONSTRAINT WRH_RET_INVS_PRODUCTS_WOB_INVS_PRODUCTS_ID_FK " +
            "FOREIGN KEY (RET_INVS_PRODUCTS_ID) REFERENCES wrh_ret_invs_products(ID)" },
    { changeID:"wrh_ret_invs_products_wob__4", changeDatetime:"2017-08-11 10:24:00", changeObj:"wrh_ret_invs_products_wob",
        changeVal:"ALTER TABLE wrh_ret_invs_products_wob ADD COLUMN BATCH_NUMBER INTEGER NOT NULL",
        field:"BATCH_NUMBER"},
    { changeID:"wrh_ret_invs_products_wob__5", changeDatetime:"2017-08-11 10:25:00", changeObj:"wrh_ret_invs_products_wob",
        changeVal:"ALTER TABLE wrh_ret_invs_products_wob ADD COLUMN BATCH_QTY DECIMAL(12,3) NOT NULL",
        field:"BATCH_QTY"}
];
module.exports.changeLog=changeLog;