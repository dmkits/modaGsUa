module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_products_balance_01", changeDatetime:"2017-06-13 16:10:00", changeObj:"wrh_products_balance_v",
        changeVal:"CREATE VIEW wrh_products_batches_balance_v(PRODUCT_ID, UNIT_ID, BATCH_NUMBER, BATCH_BALANCE) AS " +
            "SELECT PRODUCT_ID, UNIT_ID, BATCH_NUMBER, SUM(BATCH_QTY) as BATCH_BALANCE " +
            "FROM wrh_products_operations GR UP BY PRODUCT_ID, UNIT_ID, BATCH_NUMBER " +
            "HAVING SUM(BATCH_QTY)<>0 " }
];
module.exports.changeLog=changeLog;
