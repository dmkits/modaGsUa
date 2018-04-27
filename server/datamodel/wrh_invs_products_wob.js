module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_invs_products_wob__1", changeDatetime:"2017-06-09 14:01:00", changeObj:"wrh_invs_products_wob",
        changeVal:"CREATE TABLE wrh_invs_products_wob(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_invs_products_wob", field:"ID"},
    { changeID:"wrh_invs_products_wob__2", changeDatetime:"2017-06-09 14:02:00", changeObj:"wrh_invs_products_wob",
        changeVal:"ALTER TABLE wrh_invs_products_wob ADD COLUMN INVS_PRODUCTS_ID BIGINT UNSIGNED NOT NULL",
        field:"INVS_PRODUCTS_ID" },
    { changeID:"wrh_invs_products_wob__3", changeDatetime:"2017-06-09 14:03:00", changeObj:"wrh_invs_products_wob",
        changeVal:"ALTER TABLE wrh_invs_products_wob ADD CONSTRAINT WRH_INVS_PRODUCTS_WOB_INVS_PRODUCTS_ID_FK " +
            "FOREIGN KEY (INVS_PRODUCTS_ID) REFERENCES wrh_invs_products(ID)" },
    { changeID:"wrh_invs_products_wob__4", changeDatetime:"2017-06-09 14:04:00", changeObj:"wrh_invs_products_wob",
        changeVal:"ALTER TABLE wrh_invs_products_wob ADD COLUMN BATCH_NUMBER INTEGER UNSIGNED NOT NULL",
        field:"BATCH_NUMBER" },
    { changeID:"wrh_invs_products_wob__5", changeDatetime:"2017-06-09 14:05:00", changeObj:"wrh_invs_products_wob",
        changeVal:"ALTER TABLE wrh_invs_products_wob ADD COLUMN BATCH_QTY DECIMAL(12,3) NOT NULL",
        field:"BATCH_QTY" }
];
module.exports.changeLog=changeLog;
