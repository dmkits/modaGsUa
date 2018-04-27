module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_retail_tickets__1", changeDatetime:"2016-09-26 21:51:00", changeObj:"wrh_retail_tickets",
        changeVal:"CREATE TABLE wrh_retail_tickets(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_retail_tickets", field:"ID"},
    { changeID:"wrh_retail_tickets__2", changeDatetime:"2016-09-26 21:52:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN RETAIL_RECEIPT_ID BIGINT UNSIGNED NOT NULL",
        field:"RETAIL_RECEIPT_ID"},
    { changeID:"wrh_retail_tickets__3", changeDatetime:"2016-09-26 21:53:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD CONSTRAINT WRH_RETAIL_TICKETS_RETAIL_RECEIPT_ID_FK " +
            "FOREIGN KEY (RETAIL_RECEIPT_ID) REFERENCES fin_retail_receipts(ID)" },
    { changeID:"wrh_retail_tickets__4", changeDatetime:"2016-09-26 21:54:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN NUMBER INTEGER UNSIGNED NOT NULL",
        field:"NUMBER"},
    { changeID:"wrh_retail_tickets__5", changeDatetime:"2016-09-26 21:55:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN DOCDATE DATE NOT NULL",
        field:"DOCDATE"},
    { changeID:"wrh_retail_tickets__6", changeDatetime:"2016-09-26 21:56:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN UNIT_ID BIGINT UNSIGNED NOT NULL",
        field:"UNIT_ID"},
    { changeID:"wrh_retail_tickets__7", changeDatetime:"2016-09-26 21:57:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD CONSTRAINT WRH_RETAIL_TICKETS_UNIT_ID_FK " +
            "FOREIGN KEY (UNIT_ID) REFERENCES dir_units(ID)" },
    { changeID:"wrh_retail_tickets__8", changeDatetime:"2016-09-26 21:58:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN BUYER_ID BIGINT UNSIGNED NOT NULL",
        field:"BUYER_ID"},
    { changeID:"wrh_retail_tickets__9", changeDatetime:"2016-09-26 21:59:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD CONSTRAINT WRH_RETAIL_TICKETS_BUYER_ID_FK " +
            "FOREIGN KEY (BUYER_ID) REFERENCES dir_contractors(ID)" },
    { changeID:"wrh_retail_tickets_10", changeDatetime:"2016-09-26 22:01:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN CURRENCY_ID INTEGER UNSIGNED NOT NULL",
        field:"CURRENCY_ID"},
    { changeID:"wrh_retail_tickets_11", changeDatetime:"2016-09-26 22:02:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD CONSTRAINT WRH_RETAIL_TICKETS_CURRENCY_ID_FK " +
            "FOREIGN KEY (CURRENCY_ID) REFERENCES sys_currency(ID)" },
    { changeID:"wrh_retail_tickets_12", changeDatetime:"2016-09-26 22:03:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN RATE DECIMAL(10,2) NOT NULL",
        field:"RATE"},
    { changeID:"wrh_retail_tickets_13", changeDatetime:"2016-09-26 22:04:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN DOCSTATE_ID INTEGER NOT NULL",
        field:"DOCSTATE_ID"},
    { changeID:"wrh_retail_tickets_14", changeDatetime:"2016-09-26 22:05:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD CONSTRAINT WRH_RETAIL_TICKETS_DOCSTATE_ID_FK " +
            "FOREIGN KEY (DOCSTATE_ID) REFERENCES sys_docstates(ID)" },
    { changeID:"wrh_retail_tickets_15", changeDatetime:"2016-09-26 22:06:00", changeObj:"wrh_retail_tickets",
        changeVal:"ALTER TABLE wrh_retail_tickets ADD COLUMN SOURCE_ID VARCHAR(64) NOT NULL",
        field:"SOURCE_ID"},
    { changeID: "wrh_retail_tickets_16", changeDatetime:"2016-09-26 22:07:00", changeObj: "wrh_retail_tickets",
        changeVal: "ALTER TABLE wrh_retail_tickets ADD CONSTRAINT SOURCE_ID " +
        "UNIQUE(UNIT_ID,SOURCE_ID)" }
];
module.exports.changeLog=changeLog;