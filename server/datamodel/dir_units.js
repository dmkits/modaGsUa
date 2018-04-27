module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_units__1", changeDatetime: "2016-08-29 11:41:00", changeObj: "dir_units",
        changeVal: "CREATE TABLE dir_units(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_units", field:"ID", id:"ID" },
    { changeID: "dir_units__2", changeDatetime: "2016-08-29 11:42:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN NAME VARCHAR(200) NOT NULL",
        field:"NAME" },
    { changeID: "dir_units__3", changeDatetime: "2016-08-29 11:43:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD CONSTRAINT DIR_UNITS_NAME_UNIQUE UNIQUE(NAME)" },
    { changeID: "dir_units__4", changeDatetime: "2016-08-29 11:44:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN FULL_NAME VARCHAR(500) NOT NULL",
        field:"FULL_NAME" },
    { changeID: "dir_units__5", changeDatetime: "2016-08-29 11:45:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN NOTE VARCHAR(500)",
        field:"NOTE" },
    { changeID: "dir_units__6", changeDatetime: "2016-08-29 11:46:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN CITY VARCHAR(100)",
        field:"CITY" },
    { changeID: "dir_units__7", changeDatetime: "2016-08-29 11:47:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN ADDRESS VARCHAR(255)",
        field:"ADDRESS" },
    { changeID: "dir_units__8", changeDatetime: "2016-08-29 11:48:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN NOT_USED SMALLINT NOT NULL",
        field:"NOT_USED" },
    { changeID: "dir_units__9", changeDatetime: "2016-09-26 09:51:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD COLUMN PRICELIST_ID BIGINT UNSIGNED NOT NULL",
        field:"PRICELIST_ID" },
    { changeID: "dir_units_10", changeDatetime: "2016-09-26 09:52:00", changeObj: "dir_units",
        changeVal: "ALTER TABLE dir_units ADD CONSTRAINT DIR_UNITS_PRICELIST_ID_FK " +
            "FOREIGN KEY (PRICELIST_ID) REFERENCES dir_pricelists(ID)",
        field:"PRICELIST_ID", source:"dir_pricelists", linkField:"ID" },
    { changeID: "dir_units_11", changeDatetime: "2016-09-26 09:53:00", changeObj: "dir_units",
        changeVal:
        "INSERT INTO dir_units(ID,NAME,FULL_NAME,NOTE,CITY,ADDRESS,NOT_USED,PRICELIST_ID)" +
        " values (0,'Гл.офис','офис','офис','Днипро','Днипро',0, 0)" },
    { changeID: "dir_units_12", changeDatetime: "2016-09-26 09:54:00", changeObj: "dir_units",
        changeVal:
        "INSERT INTO dir_units(ID,NAME,FULL_NAME,NOTE,CITY,ADDRESS,NOT_USED,PRICELIST_ID)" +
        " values (1,'Магазин 1','Магазин 1','Магазин 1','Днипро','Днипро',0, 0);" }
];
module.exports.changeLog=changeLog;
