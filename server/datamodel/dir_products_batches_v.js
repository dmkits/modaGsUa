module.exports.id=module.id;
var changeLog=[
    { changeID:"dir_products_batches_v__1", changeDatetime: "2017-10-18 19:00:00", changeObj: "dir_products_batches_v",
        changeVal: "CREATE VIEW dir_products_batches_v(PRODUCT_ID, BATCH_NUMBER, OPERATION_ID, QTY, PRICE, " +
                "UNIT_ID, R_DOCDATE, R_DOCNUMBER, SUPPLIER_ID, CURRENCY_ID, RATE) AS\n"+
            "SELECT m.PRODUCT_ID, m.BATCH_NUMBER, wpro.OPERATION_ID, wpip.QTY, wpip.PRICE, " +
                "wpi.UNIT_ID, wpi.DOCDATE as R_DOCDATE, wpi.NUMBER as R_DOCNUMBER, wpi.SUPPLIER_ID, wpi.CURRENCY_ID, wpi.RATE\n"+
            "FROM dir_products_batches m\n"+
            "LEFT JOIN wrh_products_r_operations wpro ON wpro.PRODUCT_ID=m.PRODUCT_ID AND wpro.BATCH_NUMBER=m.BATCH_NUMBER\n"+
            "LEFT JOIN wrh_pinvs_products wpip ON wpip.ID=wpro.OPERATION_ID\n"+
            "LEFT JOIN wrh_pinvs wpi ON wpi.ID=wpip.PINV_ID\n",
        viewName:"dir_products_batches_v",
        fields:["PRODUCT_ID", "BATCH_NUMBER", "OPERATION_ID", "QTY", "PRICE", "UNIT_ID", "R_DOCDATE", "R_DOCNUMBER", "SUPPLIER_ID", "CURRENCY_ID", "RATE"] }
];
module.exports.changeLog=changeLog;