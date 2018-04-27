module.exports.id=module.id;
var changeLog=[
    { changeID:"wrh_orders_bata_v__1", changeDatetime: "2017-08-16 16:30:00", changeObj: "wrh_orders_bata_v",
        changeVal: "CREATE VIEW wrh_orders_bata_v(ID, NUMBER, DOCDATE, SUPPLIER_ORDER_NUM, UNIT_NAME, SUPPLIER_NAME, DOCSUM, CURRENCY_CODE, DOCSTATE_NAME)AS"
        +" SELECT wob.ID,wob.NUMBER,wob.DOCDATE,wob.SUPPLIER_ORDER_NUM,du.NAME as UNIT_CODE, dc.NAME as SUPPLIER_NAME, 0 as DOCSUM, sc.CODE as CURRENCY_CODE, sds.NAME as DOCSTATE_NAME"
        +" FROM wrh_orders_bata wob"
        +" INNER JOIN dir_units du ON wob.UNIT_ID=du.ID"
        +" INNER JOIN dir_contractors dc ON wob.SUPPLIER_ID=dc.ID"
        +" INNER JOIN sys_currency sc ON wob.CURRENCY_ID=sc.ID"
        +" INNER JOIN sys_docstates sds ON wob.DOCSTATE_ID=sds.ID" }
];
module.exports.changeLog=changeLog;
