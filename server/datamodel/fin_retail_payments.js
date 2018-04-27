module.exports.id=module.id;
var changeLog = [
    { changeID:"fin_retail_payments__1", changeDatetime:"2016-09-26 21:31:00", changeObj:"fin_retail_payments",
        changeVal:"CREATE TABLE fin_retail_payments(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"fin_retail_payments", field:"ID"},
    { changeID:"fin_retail_payments__2", changeDatetime:"2016-09-26 21:32:00", changeObj:"fin_retail_payments",
        changeVal:"ALTER TABLE fin_retail_payments ADD COLUMN RETAIL_RECEIPT_ID BIGINT UNSIGNED NOT NULL",
        field:"RETAIL_RECEIPT_ID"},
    { changeID:"fin_retail_payments__3", changeDatetime:"2016-09-26 21:33:00", changeObj:"fin_retail_payments",
        changeVal:"ALTER TABLE fin_retail_payments ADD CONSTRAINT FIN_RETAIL_PAYMENTS_RETAIL_RECEIPT_ID_FK " +
            "FOREIGN KEY (RETAIL_RECEIPT_ID) REFERENCES fin_retail_receipts(ID)",
        field:"RETAIL_RECEIPT_ID", "source":"fin_retail_receipts", "linkField":"ID" },
    { changeID:"fin_retail_payments__4", changeDatetime:"2016-09-26 21:34:00", changeObj:"fin_retail_payments",
        changeVal:"ALTER TABLE fin_retail_payments ADD COLUMN DOCSUM DECIMAL(12,2) NOT NULL",
        field:"DOCSUM"},
    { changeID:"fin_retail_payments__5", changeDatetime:"2016-09-26 21:35:00", changeObj:"fin_retail_payments",
        changeVal:"ALTER TABLE fin_retail_payments ADD COLUMN PAYMENT_FORM_CODE INTEGER UNSIGNED NOT NULL",
        field:"PAYMENT_FORM_CODE"}
];
module.exports.changeLog=changeLog;