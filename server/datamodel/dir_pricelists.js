module.exports.id=module.id;
var changeLog = [
    { changeID:"dir_pricelists__1", changeDatetime:"2016-09-26 09:01:00", changeObj:"dir_pricelists",
        changeVal:"CREATE TABLE dir_pricelists(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_pricelists", field:"ID"},
    { changeID:"dir_pricelists__2", changeDatetime:"2016-09-26 09:02:00", changeObj:"dir_pricelists",
        changeVal:"ALTER TABLE dir_pricelists ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME"},
    { changeID:"dir_pricelists__3", changeDatetime:"2016-09-26 09:03:00", changeObj:"dir_pricelists",
        changeVal:"ALTER TABLE dir_pricelists ADD COLUMN DESCRIPTION VARCHAR(255) NOT NULL",
        field:"DESCRIPTION"},
    { changeID:"dir_pricelists__4", changeDatetime:"2016-09-26 09:04:00", changeObj:"dir_pricelists",
        changeVal:"ALTER TABLE dir_pricelists ADD CONSTRAINT DIR_PRICELISTS_NAME_UNIQUE UNIQUE(NAME)" },
    { changeID:"dir_pricelists__5", changeDatetime:"2016-09-26 09:05:00", changeObj:"dir_pricelists",
        changeVal:"INSERT INTO dir_pricelists(ID,NAME,DESCRIPTION) values(0,'Основной прайс-лист','Основной прайс-лист')" }
];
module.exports.changeLog=changeLog;