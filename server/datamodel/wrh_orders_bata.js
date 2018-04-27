module.exports.id=module.id;
var changeLog=[
    { changeID: "wrh_orders_bata__1", changeDatetime: "2016-09-04 19:31:00", changeObj: "wrh_orders_bata",
      changeVal: "CREATE TABLE wrh_orders_bata(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_orders_bata",
        field:"ID", id:"ID" },
    { changeID: "wrh_orders_bata__2", changeDatetime: "2016-09-04 19:32:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN NUMBER INTEGER UNSIGNED NOT NULL",
        field:"NUMBER" },
    { changeID: "wrh_orders_bata__3", changeDatetime: "2016-09-04 19:33:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN DOCDATE DATETIME NOT NULL",
        field:"DOCDATE" },
    { changeID: "wrh_orders_bata__4", changeDatetime: "2016-09-04 19:34:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN SUPPLIER_ORDER_NUM VARCHAR(255) NOT NULL",
        field:"SUPPLIER_ORDER_NUM" },
    { changeID: "wrh_orders_bata__5", changeDatetime: "2016-09-04 19:35:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN DOCSTATE_ID INTEGER NOT NULL",
        field:"DOCSTATE_ID" },
    { changeID: "wrh_orders_bata__6", changeDatetime: "2016-09-04 19:36:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD CONSTRAINT WRH_ORDERS_BATA_DOCSTATE_ID_FK " +
          "FOREIGN KEY (DOCSTATE_ID) REFERENCES sys_docstates(ID)",
        field:"DOCSTATE_ID", "source":"sys_docstates", "linkField":"ID" },
    { changeID: "wrh_orders_bata__7", changeDatetime: "2016-09-04 19:37:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN CURRENCY_ID INTEGER UNSIGNED NOT NULL",
        field:"CURRENCY_ID" },
    { changeID: "wrh_orders_bata__8", changeDatetime: "2016-09-04 19:38:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD CONSTRAINT WRH_ORDERS_BATA_CURRENCY_ID_FK " +
          "FOREIGN KEY (CURRENCY_ID) REFERENCES sys_currency(ID)",
        field:"CURRENCY_ID", "source":"sys_currency", "linkField":"ID" },
    { changeID: "wrh_orders_bata__9", changeDatetime: "2016-09-04 19:39:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN UNIT_ID BIGINT UNSIGNED NOT NULL",
        field:"UNIT_ID" },
    { changeID: "wrh_orders_bata_10", changeDatetime: "2016-09-04 19:40:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD CONSTRAINT WRH_ORDERS_BATA_UNIT_ID_FK " +
          "FOREIGN KEY (UNIT_ID) REFERENCES dir_units(ID)",
        field:"UNIT_ID", "source":"dir_units", "linkField":"ID" },
    { changeID: "wrh_orders_bata_11", changeDatetime: "2016-09-04 19:41:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD COLUMN SUPPLIER_ID BIGINT UNSIGNED NOT NULL",
        field:"SUPPLIER_ID" },
    { changeID: "wrh_orders_bata_12", changeDatetime: "2016-09-04 19:42:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD CONSTRAINT WRH_ORDERS_BATA_SUPPLIER_ID_FK " +
          "FOREIGN KEY (SUPPLIER_ID) REFERENCES dir_contractors(ID)",
        field:"SUPPLIER_ID", "source":"dir_contractors", "linkField":"ID" },
    { changeID: "wrh_orders_bata_13", changeDatetime: "2016-09-12 22:25:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD CONSTRAINT WRH_ORDERS_BATA_SUPPLIER_ID_SUPPLIER_ORDER_NUM_UNIQUE " +
          "UNIQUE(SUPPLIER_ID,SUPPLIER_ORDER_NUM)" },
    { changeID: "wrh_orders_bata_14", changeDatetime: "2016-09-12 22:26:00", changeObj: "wrh_orders_bata",
      changeVal: "ALTER TABLE wrh_orders_bata ADD CONSTRAINT WRH_ORDERS_BATA_UNIT_ID_NUMBER_UNIQUE " +
          "UNIQUE(UNIT_ID,NUMBER)" }
];
module.exports.changeLog=changeLog;
