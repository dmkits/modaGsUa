module.exports.id=module.id;
var changeLog = [
    { changeID: "dir_contractors__1", changeDatetime: "2016-08-30 08:41:00", changeObj: "dir_contractors",
        changeVal: "CREATE TABLE dir_contractors(ID BIGINT UNSIGNED PRIMARY KEY NOT NULL) CHARACTER SET utf8",
        tableName:"dir_contractors", field:"ID", id:"ID" },
    { changeID: "dir_contractors__2", changeDatetime: "2016-08-30 08:42:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN NAME VARCHAR(200) NOT NULL",
        field:"NAME" },
    { changeID: "dir_contractors__3", changeDatetime: "2016-08-30 08:43:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD CONSTRAINT DIR_CONTRACTORS_NAME_UNIQUE UNIQUE(NAME)" },
    { changeID: "dir_contractors__4", changeDatetime: "2016-08-30 08:44:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN FULL_NAME VARCHAR(500) NOT NULL",
        field:"FULL_NAME" },
    { changeID: "dir_contractors__5", changeDatetime: "2016-08-30 08:45:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN NOTE VARCHAR(500)",
        field:"NOTE" },
    { changeID: "dir_contractors__6", changeDatetime: "2016-08-30 08:46:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN CITY VARCHAR(100)",
        field:"CITY" },
    { changeID: "dir_contractors__7", changeDatetime: "2016-08-30 08:47:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN ADDRESS VARCHAR(255)",
        field:"ADDRESS" },
    { changeID: "dir_contractors__8", changeDatetime: "2016-08-30 08:48:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN IS_SUPPLIER SMALLINT NOT NULL",
        field:"IS_SUPPLIER" },
    { changeID: "dir_contractors__9", changeDatetime: "2016-08-30 08:49:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN IS_BUYER SMALLINT NOT NULL",
        field:"IS_BUYER" },
    { changeID: "dir_contractors_10", changeDatetime: "2016-09-12 00:05:00", changeObj: "dir_contractors",
        changeVal: "ALTER TABLE dir_contractors ADD COLUMN COUNTRY VARCHAR(100) NOT NULL",
        field:"COUNTRY" },
    { changeID: "dir_contractors_11", changeDatetime: "2016-09-12 00:06:00", changeObj: "dir_contractors",
        changeVal:
            "INSERT INTO dir_contractors (ID,NAME,FULL_NAME,NOTE,COUNTRY,CITY,ADDRESS,IS_SUPPLIER,IS_BUYER) " +
                "values (0,'Розничный покупатель','Розничный покупатель','Розничный покупатель','Украина','Днепр','-',0,1)" },
    { changeID: "dir_contractors_12", changeDatetime: "2016-09-12 00:07:00", changeObj: "dir_contractors",
        changeVal:
            "INSERT INTO dir_contractors (ID,NAME,FULL_NAME,NOTE,COUNTRY,CITY,ADDRESS,IS_SUPPLIER,IS_BUYER) " +
                "values (1,'Поставщик 1','Поставщик 1','Поставщик 1','Украина','Днепр','-',1,0)" }
];
module.exports.changeLog=changeLog;
