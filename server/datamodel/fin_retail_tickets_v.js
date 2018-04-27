module.exports.id=module.id;
var changeLog=[
    { changeID:"fin_retail_tickets_v__1", changeDatetime: "2017-10-09 14:30:00", changeObj: "fin_retail_tickets_v",
        changeVal: "CREATE VIEW fin_retail_tickets_v\n" +
            "(ID, RETAIL_RECEIPT_ID, UNIT_ID, DOCDATE, NUMBER, BUYER_ID, CURRENCY_ID, RATE, DOCSTATE_ID, PAYCOUNT, PAYSUM)AS \n"+
            "SELECT m.ID, m.RETAIL_RECEIPT_ID, m.UNIT_ID, m.DOCDATE, m.NUMBER, m.BUYER_ID, m.CURRENCY_ID, m.RATE, m.DOCSTATE_ID,\n"+
            "COALESCE(SUM(CASE WHEN Not mp.ID is NULL THEn 1 ELSE 0 END),0) as PAYCOUNT,\n"+
            "COALESCE(SUM(mp.DOCSUM),0) as PAYSUM \n"+
            "FROM wrh_retail_tickets m \n"+
            "INNER JOIN fin_retail_receipts mr ON mr.ID = m.RETAIL_RECEIPT_ID \n"+
            "LEFT JOIN fin_retail_payments mp ON mp.RETAIL_RECEIPT_ID=mr.ID \n"+
            "GROUP BY m.ID, m.RETAIL_RECEIPT_ID, m.UNIT_ID, m.DOCDATE, m.NUMBER, m.BUYER_ID, m.CURRENCY_ID, m.RATE, m.DOCSTATE_ID \n"+
            "ORDER BY m.UNIT_ID, m.DOCDATE, m.NUMBER",
        viewName:"fin_retail_tickets_v",
        fields:["ID", "RETAIL_RECEIPT_ID", "UNIT_ID", "DOCDATE", "NUMBER", "BUYER_ID", "CURRENCY_ID", "RATE", "DOCSTATE_ID", "PAYCOUNT", "PAYSUM"]}
];
module.exports.changeLog=changeLog;