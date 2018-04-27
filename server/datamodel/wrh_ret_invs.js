module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_ret_invs__1", changeDatetime:"2017-08-11 09:01:00", changeObj:"wrh_ret_invs",
        changeVal:"CREATE TABLE wrh_ret_invs(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_ret_invs", field:"ID"},
    { changeID:"wrh_ret_invs__2", changeDatetime:"2017-08-11 09:02:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN NUMBER INTEGER UNSIGNED NOT NULL",
        field:"NUMBER"},
    { changeID:"wrh_ret_invs__3", changeDatetime:"2017-08-11 09:03:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN DOCDATE DATE NOT NULL",
        field:"DOCDATE"},
    { changeID:"wrh_ret_invs__4", changeDatetime:"2017-08-11 09:04:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN UNIT_ID BIGINT UNSIGNED NOT NULL",
        field:"UNIT_ID"},
    { changeID:"wrh_ret_invs__5", changeDatetime:"2017-08-11 09:05:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD CONSTRAINT WRH_RET_INVS_UNIT_ID_FK " +
            "FOREIGN KEY (UNIT_ID) REFERENCES dir_units(ID)",
        field:"UNIT_ID","source":"dir_units", "linkField":"ID"},
    { changeID:"wrh_ret_invs__6", changeDatetime:"2017-08-11 09:06:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN BUYER_ID BIGINT UNSIGNED NOT NULL",
        field:"BUYER_ID"},
    { changeID:"wrh_ret_invs__7", changeDatetime:"2017-08-11 09:07:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD CONSTRAINT WRH_RET_INVS_BUYER_ID_FK " +
            "FOREIGN KEY (BUYER_ID) REFERENCES dir_contractors(ID)",
        field:"BUYER_ID", "source":"dir_contractors", "linkField":"ID"},
    { changeID:"wrh_ret_invs__8", changeDatetime:"2017-08-11 09:08:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN CURRENCY_ID INTEGER UNSIGNED NOT NULL",
        field:"CURRENCY_ID"},
    { changeID:"wrh_ret_invs__9", changeDatetime:"2017-08-11 09:09:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD CONSTRAINT WRH_RET_INVS_CURRENCY_ID_FK " +
            "FOREIGN KEY (CURRENCY_ID) REFERENCES sys_currency(ID)",
        field:"CURRENCY_ID", "source":"sys_currency", "linkField":"ID" },
    { changeID:"wrh_ret_invs_10", changeDatetime:"2017-08-11 09:10:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN DOCSTATE_ID INTEGER NOT NULL",
        field:"DOCSTATE_ID"},
    { changeID:"wrh_ret_invs_11", changeDatetime:"2017-08-11 09:11:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD CONSTRAINT WRH_RET_INVS_DOCSTATE_ID_FK " +
            "FOREIGN KEY (DOCSTATE_ID) REFERENCES sys_docstates(ID)",
        field:"DOCSTATE_ID", "source":"sys_docstates", "linkField":"ID" },
    { changeID:"wrh_ret_invs_12", changeDatetime:"2017-08-11 09:12:00", changeObj:"wrh_ret_invs",
        changeVal:"ALTER TABLE wrh_ret_invs ADD COLUMN RATE DECIMAL(10,2) NOT NULL",
        field:"RATE"}
];
module.exports.changeLog=changeLog;