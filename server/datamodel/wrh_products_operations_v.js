module.exports.id=module.id;
var changeLog=[
    { changeID:"wrh_products_operations_v__1", changeDatetime: "2017-10-16 09:00:00", changeObj: "wrh_products_operations_v",
        changeVal: "CREATE VIEW wrh_products_operations_v(OPERATION_ID, PRODUCT_ID, UNIT_ID, DOCCODE, DOCDATE, DOCNUMBER, DOCPOSIND, DOCQTY, BATCH_NUMBER, BATCH_QTY) AS\n"+
            "SELECT wpro.OPERATION_ID, wpro.PRODUCT_ID, wpi.UNIT_ID, 10 as DOCCODE, wpi.DOCDATE, wpi.NUMBER, wpip.POSIND, wpip.QTY, wpro.BATCH_NUMBER, wpip.QTY\n"+
            "FROM wrh_pinvs_products wpip\n"+
            "INNER JOIN wrh_pinvs wpi ON wpi.ID=wpip.PINV_ID\n"+
            "INNER JOIN wrh_products_r_operations wpro ON wpro.OPERATION_ID=wpip.ID\n"+
            "INNER JOIN dir_products_batches dpb ON dpb.PRODUCT_ID=wpro.PRODUCT_ID AND dpb.BATCH_NUMBER=wpro.BATCH_NUMBER\n"+
            "UNION ALL\n"+
            "SELECT wip.ID, wip.PRODUCT_ID, wi.UNIT_ID, 80 as DOCCODE, wi.DOCDATE, wi.NUMBER, wip.POSIND, wip.QTY,\n"+
            "CASE When wipb.BATCH_NUMBER is NULL Then SIGN(0) Else wipb.BATCH_NUMBER END,\n"+
            "CASE When wipb.BATCH_NUMBER is NULL Then -wip.QTY Else -wipb.BATCH_QTY END\n"+
            "FROM wrh_invs_products wip\n"+
            "INNER JOIN wrh_invs wi ON wi.ID=wip.INV_ID\n"+
            "LEFT JOIN wrh_invs_products_wob wipb ON wipb.INVS_PRODUCTS_ID=wip.ID\n"+
            "LEFT JOIN dir_products_batches dpb ON dpb.PRODUCT_ID=wip.PRODUCT_ID AND dpb.BATCH_NUMBER=wipb.BATCH_NUMBER\n"+
            "UNION ALL\n"+
            "SELECT wrip.ID, wrip.PRODUCT_ID, wri.UNIT_ID, 20 as DOCCODE, wri.DOCDATE, wri.NUMBER, wrip.POSIND, wrip.QTY,\n"+
            "CASE When wripb.BATCH_NUMBER is NULL Then SIGN(0) Else wripb.BATCH_NUMBER END,\n"+
            "CASE When wripb.BATCH_NUMBER is NULL Then wrip.QTY Else wripb.BATCH_QTY END\n"+
            "FROM wrh_ret_invs_products wrip\n"+
            "INNER JOIN wrh_ret_invs wri ON wri.ID=wrip.RET_INV_ID\n"+
            "LEFT JOIN wrh_ret_invs_products_wob wripb ON wripb.RET_INVS_PRODUCTS_ID=wrip.ID\n"+
            "LEFT JOIN dir_products_batches dpb ON dpb.PRODUCT_ID=wrip.PRODUCT_ID AND dpb.BATCH_NUMBER=wripb.BATCH_NUMBER\n"+
            "UNION ALL\n"+
            "SELECT wrtp.ID, wrtp.PRODUCT_ID, wrt.UNIT_ID, 90 as DOCCODE, wrt.DOCDATE, wrt.NUMBER, wrtp.POS+1, wrtp.QTY,\n"+
            "CASE When dpb.BATCH_NUMBER is NULL Then SIGN(0) Else wrtpw.BATCH_NUMBER END,\n"+
            "CASE When dpb.BATCH_NUMBER is NULL Then -wrtp.QTY Else 0 -wrtpw.BATCH_QTY END\n"+
            "FROM wrh_retail_tickets_products wrtp\n"+
            "INNER JOIN wrh_retail_tickets wrt ON wrt.ID=wrtp.RETAIL_TICKET_ID\n"+
            "LEFT JOIN wrh_retail_tickets_products_wob wrtpw ON wrtpw.RETAIL_TICKETS_PRODUCTS_ID=wrtp.ID\n"+
            "LEFT JOIN dir_products_batches dpb ON dpb.PRODUCT_ID=wrtp.PRODUCT_ID AND dpb.BATCH_NUMBER=wrtpw.BATCH_NUMBER\n"+
            "WHERE wrtp.QTY>=0\n"+
            "UNION ALL\n"+
            "SELECT wrtp.ID, wrtp.PRODUCT_ID, wrt.UNIT_ID, 40 as DOCCODE, wrt.DOCDATE, wrt.NUMBER, wrtp.POS+1, wrtp.QTY,\n"+
            "CASE When dpb.BATCH_NUMBER is NULL Then SIGN(0) Else wrtpw.BATCH_NUMBER END,\n"+
            "CASE When dpb.BATCH_NUMBER is NULL Then -wrtp.QTY Else -wrtpw.BATCH_QTY END\n"+
            "FROM wrh_retail_tickets_products wrtp\n"+
            "INNER JOIN wrh_retail_tickets wrt ON wrt.ID=wrtp.RETAIL_TICKET_ID\n"+
            "LEFT JOIN wrh_retail_tickets_products_wob wrtpw ON wrtpw.RETAIL_TICKETS_PRODUCTS_ID=wrtp.ID\n"+
            "LEFT JOIN dir_products_batches dpb ON dpb.PRODUCT_ID=wrtp.PRODUCT_ID AND dpb.BATCH_NUMBER=wrtpw.BATCH_NUMBER\n"+
            "WHERE wrtp.QTY<0\n",
        viewName:"wrh_products_operations_v",
        fields:["OPERATION_ID", "PRODUCT_ID", "UNIT_ID", "DOCCODE", "DOCDATE", "DOCNUMBER", "DOCPOSIND", "DOCQTY", "BATCH_NUMBER", "BATCH_QTY"] }
];
module.exports.changeLog=changeLog;