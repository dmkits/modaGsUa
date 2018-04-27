module.exports.id=module.id;
var changeLog=[
    { changeID:"wrh_retail_tickets_v__1", changeDatetime: "2017-10-09 14:20:00", changeObj: "wrh_retail_tickets_v",
        changeVal: "CREATE VIEW wrh_retail_tickets_v" +
            "(ID, RETAIL_RECEIPT_ID, UNIT_ID, DOCDATE, NUMBER, BUYER_ID, CURRENCY_ID, RATE, DOCSTATE_ID, DOCCOUNT, DOCQTY, DOCSUM)AS \n"+
            "SELECT m.ID, m.RETAIL_RECEIPT_ID, m.UNIT_ID, m.DOCDATE, m.NUMBER, m.BUYER_ID, m.CURRENCY_ID, m.RATE, m.DOCSTATE_ID,\n"+
            "COALESCE(SUM(CASE WHEN Not md.ID is NULL THEn 1 ELSE 0 END),0) as DOCCOUNT,\n"+
            "COALESCE(SUM(md.QTY),0) as DOCQTY, COALESCE(SUM(md.POSSUM),0) as DOCSUM \n"+
            "FROM wrh_retail_tickets m \n"+
            "LEFT JOIN wrh_retail_tickets_products md ON md.RETAIL_TICKET_ID=m.ID \n"+
            "GROUP BY m.ID, m.RETAIL_RECEIPT_ID, m.UNIT_ID, m.DOCDATE, m.NUMBER, m.BUYER_ID, m.CURRENCY_ID, m.RATE, m.DOCSTATE_ID \n"+
            "ORDER BY m.UNIT_ID, m.DOCDATE, m.NUMBER",
        viewName:"wrh_retail_tickets_v",
        fields:["ID", "RETAIL_RECEIPT_ID", "UNIT_ID", "DOCDATE", "NUMBER", "BUYER_ID", "CURRENCY_ID", "RATE", "DOCSTATE_ID", "DOCCOUNT", "DOCQTY", "DOCSUM"] }
];
module.exports.changeLog=changeLog;