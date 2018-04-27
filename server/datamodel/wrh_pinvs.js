module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_pinvs__1", changeDatetime:"2016-09-07 10:01:00", changeObj:"wrh_pinvs",
        changeVal:"CREATE TABLE wrh_pinvs(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_pinvs", field:"ID"},
    { changeID:"wrh_pinvs__2", changeDatetime:"2016-09-07 10:02:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN NUMBER INTEGER UNSIGNED NOT NULL",
        field:"NUMBER"},
    { changeID:"wrh_pinvs__3", changeDatetime:"2016-09-07 10:03:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN DOCDATE DATETIME NOT NULL",
        field:"DOCDATE"},
    { changeID:"wrh_pinvs__4", changeDatetime:"2016-09-07 10:04:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN SUPPLIER_INV_NUM VARCHAR(255) NOT NULL",
        field:"SUPPLIER_INV_NUM"},
    { changeID:"wrh_pinvs__5", changeDatetime:"2016-09-07 10:05:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN DOCSTATE_ID INTEGER NOT NULL",
        field:"DOCSTATE_ID"},
    { changeID:"wrh_pinvs__6", changeDatetime:"2016-09-07 10:06:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD CONSTRAINT WRH_PINVS_DOCSTATE_ID_FK " +
            "FOREIGN KEY (DOCSTATE_ID) REFERENCES sys_docstates(ID)",
        field:"DOCSTATE_ID", "source":"sys_docstates", "linkField":"ID" },
    { changeID:"wrh_pinvs__7", changeDatetime:"2016-09-07 10:07:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN CURRENCY_ID INTEGER UNSIGNED NOT NULL",
        field:"CURRENCY_ID"},
    { changeID:"wrh_pinvs__8", changeDatetime:"2016-09-07 10:08:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD CONSTRAINT WRH_PINVS_CURRENCY_ID_FK " +
            "FOREIGN KEY (CURRENCY_ID) REFERENCES sys_currency(ID)",
        field:"CURRENCY_ID", "source":"sys_currency", "linkField":"ID" },
    { changeID:"wrh_pinvs__9", changeDatetime:"2016-09-07 10:09:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN RATE DECIMAL(10,2) NOT NULL",
        field:"RATE"},
    { changeID:"wrh_pinvs_10", changeDatetime:"2016-09-07 10:10:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN BASE_FACTOR DECIMAL(10,2) NOT NULL",
        field:"BASE_FACTOR"},
    { changeID:"wrh_pinvs_11", changeDatetime:"2016-09-07 10:11:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN UNIT_ID BIGINT UNSIGNED NOT NULL",
        field:"UNIT_ID"},
    { changeID:"wrh_pinvs_12", changeDatetime:"2016-09-07 10:12:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD CONSTRAINT WRH_PINVS_UNIT_ID_FK " +
            "FOREIGN KEY (UNIT_ID) REFERENCES dir_units(ID)",
        field:"UNIT_ID", "source":"dir_units", "linkField":"ID" },
    { changeID:"wrh_pinvs_13", changeDatetime:"2016-09-07 10:13:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN SUPPLIER_ID BIGINT UNSIGNED NOT NULL",
        field:"SUPPLIER_ID"},
    { changeID:"wrh_pinvs_14", changeDatetime:"2016-09-07 10:14:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD CONSTRAINT WRH_PINVS_SUPPLIER_ID_FK " +
            "FOREIGN KEY (SUPPLIER_ID) REFERENCES dir_contractors(ID)",
        field:"SUPPLIER_ID", "source":"dir_contractors", "linkField":"ID" },
    { changeID:"wrh_pinvs_15", changeDatetime:"2016-09-12 09:46:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN COLLECTION_ID BIGINT UNSIGNED NOT NULL",
        field:"COLLECTION_ID"},
    { changeID:"wrh_pinvs_16", changeDatetime:"2016-09-12 09:47:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD CONSTRAINT WRH_PINVS_COLLECTION_ID_FK " +
            "FOREIGN KEY (COLLECTION_ID) REFERENCES dir_products_collections(ID)",
        field:"COLLECTION_ID", "source":"dir_products_collections", "linkField":"ID" },
    { changeID:"wrh_pinvs_17", changeDatetime:"2016-09-12 22:20:00", changeObj:"wrh_pinvs",
        changeVal:"ALTER TABLE wrh_pinvs ADD COLUMN SUPPLIER_ORDER_NUM VARCHAR(255)",
        field:"SUPPLIER_ORDER_NUM"},
    { changeID: "wrh_pinvs_18", changeDatetime:"2016-09-12 22:21:00", changeObj: "wrh_pinvs",
        changeVal: "ALTER TABLE wrh_pinvs ADD CONSTRAINT WRH_PINVS_UNIT_ID_NUMBER_UNIQUE " +
            "UNIQUE(UNIT_ID,NUMBER)" },
    { changeID:"wrh_pinvs_19", changeDatetime:"2016-09-12 22:22:00", changeObj:"wrh_pinvs",
        changeVal: "CREATE TRIGGER upd_pinv "+
        "BEFORE UPDATE ON wrh_pinvs "+
        "FOR EACH ROW "+
        "BEGIN "+
        "IF OLD.DOCSTATE_ID <> 0 AND NEW.DOCSTATE_ID <> 0 "+
        "THEN  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Impossible to update a \"closed\" state document.'; "+
        "END IF; "+
        "END;  " },
    { changeID:"wrh_pinvs_20", changeDatetime:"2016-09-12 22:23:00", changeObj:"wrh_pinvs",
        changeVal: "CREATE TRIGGER del_pinv "+
        "BEFORE DELETE ON wrh_pinvs "+
        "FOR EACH ROW "+
        "BEGIN "+
        "IF OLD.DOCSTATE_ID <> 0 "+
        "THEN "+
        "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Impossible to delete a \"closed\" state document.'; "+
        "END IF; "+
        "END;  "}
];
module.exports.changeLog=changeLog;