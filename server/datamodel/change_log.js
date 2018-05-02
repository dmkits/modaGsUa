module.exports.id=module.id;
var changeLog= [
    { changeID:"chl__1", changeDatetime:"2016-08-29 09:01:00", changeObj:"change_log",
        changeVal:"CREATE TABLE change_log(" +
            "ID VARCHAR(64) NOT NULL PRIMARY KEY, CHANGE_DATETIME DATETIME NOT NULL," +
            "CHANGE_OBJ VARCHAR(255) NOT NULL, CHANGE_VAL VARCHAR(8000) NOT NULL," +
            "APPLIED_DATETIME DATETIME NOT NULL)",
        tableName:"change_log",
        fields:["ID","CHANGE_DATETIME","CHANGE_OBJ","CHANGE_VAL","APPLIED_DATETIME"] , id:"ID"}
];
module.exports.changeLog=changeLog;
