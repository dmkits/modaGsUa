module.exports.id=module.id;
var changeLog = [
    { changeID:"fin_retail_receipts__1", changeDatetime:"2016-09-26 21:01:00", changeObj:"fin_retail_receipts",
        changeVal:"CREATE TABLE fin_retail_receipts(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"fin_retail_receipts", field:"ID"},
    { changeID:"fin_retail_receipts__2", changeDatetime:"2016-09-26 21:02:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN NUMBER INTEGER UNSIGNED NOT NULL",
        field:"NUMBER"},
    { changeID:"fin_retail_receipts__3", changeDatetime:"2016-09-26 21:03:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN DOCDATE DATE NOT NULL",
        field:"DOCDATE" },
    { changeID:"fin_retail_receipts__4", changeDatetime:"2016-09-26 21:04:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN UNIT_ID BIGINT UNSIGNED NOT NULL",
        field:"UNIT_ID"},
    { changeID:"fin_retail_receipts__5", changeDatetime:"2016-09-26 21:05:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD CONSTRAINT FIN_RETAIL_RECEIPTS_UNIT_ID_FK " +
            "FOREIGN KEY (UNIT_ID) REFERENCES dir_units(ID)" },
    { changeID:"fin_retail_receipts__6", changeDatetime:"2016-09-26 21:06:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN BUYER_ID BIGINT UNSIGNED NOT NULL",
        field:"BUYER_ID"},
    { changeID:"fin_retail_receipts__7", changeDatetime:"2016-09-26 21:07:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD CONSTRAINT FIN_RETAIL_RECEIPTS_BUYER_ID_FK " +
            "FOREIGN KEY (BUYER_ID) REFERENCES dir_contractors(ID)" },
    { changeID:"fin_retail_receipts__8", changeDatetime:"2016-09-26 21:08:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN CURRENCY_ID INTEGER UNSIGNED NOT NULL",
        field:"CURRENCY_ID"},
    { changeID:"fin_retail_receipts__9", changeDatetime:"2016-09-26 21:09:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD CONSTRAINT FIN_RETAIL_RECEIPTS_CURRENCY_ID_FK " +
            "FOREIGN KEY (CURRENCY_ID) REFERENCES sys_currency(ID)" },
    { changeID:"fin_retail_receipts_10", changeDatetime:"2016-09-26 21:10:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN RATE DECIMAL(10,2) NOT NULL",
        field:"RATE"},
    { changeID:"fin_retail_receipts_11", changeDatetime:"2016-09-26 21:11:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN DOCSTATE_ID INTEGER NOT NULL",
        field:"DOCSTATE_ID"},
    { changeID:"fin_retail_receipts_12", changeDatetime:"2016-09-26 21:12:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD CONSTRAINT FIN_RETAIL_RECEIPTS_DOCSTATE_ID_FK " +
            "FOREIGN KEY (DOCSTATE_ID) REFERENCES sys_docstates(ID)" },
    { changeID:"fin_retail_receipts_13", changeDatetime:"2016-09-26 21:13:00", changeObj:"fin_retail_receipts",
        changeVal:"ALTER TABLE fin_retail_receipts ADD COLUMN SOURCE_ID VARCHAR(64) NOT NULL",
        field:"SOURCE_ID"},
    { changeID: "fin_retail_receipts_14", changeDatetime:"2016-09-26 21:14:00", changeObj: "fin_retail_receipts",
        changeVal: "ALTER TABLE fin_retail_receipts ADD CONSTRAINT SOURCE_ID " +
        "UNIQUE(UNIT_ID,SOURCE_ID)" }
];
module.exports.changeLog=changeLog;

