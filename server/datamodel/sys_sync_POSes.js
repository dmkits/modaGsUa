module.exports.id=module.id;
var changeLog = [
    { changeID:"sys_sync_POSes__1", changeDatetime:"2016-09-26 10:01:00", changeObj:"sys_sync_POSes",
        changeVal:"CREATE TABLE sys_sync_POSes(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"sys_sync_POSes", field:"ID"},
    { changeID:"sys_sync_POSes__2", changeDatetime:"2016-09-26 10:02:00", changeObj:"sys_sync_POSes",
        changeVal:"ALTER TABLE sys_sync_POSes ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME"},
    { changeID:"sys_sync_POSes__3", changeDatetime:"2016-09-26 10:03:00", changeObj:"sys_sync_POSes",
        changeVal:"ALTER TABLE sys_sync_POSes ADD COLUMN HOST_NAME VARCHAR(255) NOT NULL",
        field:"HOST_NAME"},
    { changeID:"sys_sync_POSes__4", changeDatetime:"2016-09-26 10:04:00", changeObj:"sys_sync_POSes",
        changeVal:"ALTER TABLE sys_sync_POSes ADD COLUMN DATABASE_NAME VARCHAR(255) NOT NULL",
        field:"DATABASE_NAME"},
    { changeID:"sys_sync_POSes__5", changeDatetime:"2016-09-26 10:05:00", changeObj:"sys_sync_POSes",
        changeVal:"ALTER TABLE sys_sync_POSes ADD COLUMN UNIT_ID BIGINT UNSIGNED NOT NULL",
        field:"UNIT_ID"},
    { changeID:"sys_sync_POSes__6", changeDatetime:"2016-09-26 10:06:00", changeObj:"sys_sync_POSes",
        changeVal:"ALTER TABLE sys_sync_POSes ADD CONSTRAINT SYS_SYNC_POSES_UNIT_ID_FK " +
            "FOREIGN KEY(UNIT_ID) REFERENCES dir_units(ID)",
        field:"UNIT_ID", "source":"dir_units", "linkField":"ID" },
    { changeID:"sys_sync_POSes__7", changeDatetime:"2016-09-26 10:07:00", changeObj:"sys_sync_POSes",
        changeVal:"ALTER TABLE sys_sync_POSes ADD COLUMN ACTIVE SMALLINT NOT NULL DEFAULT 0",
        field:"ACTIVE"},
    { changeID:"sys_sync_POSes__8", changeDatetime:"2016-09-26 10:08:00", changeObj:"sys_sync_POSes",
        changeVal:"INSERT INTO sys_sync_POSes(ID,NAME,HOST_NAME,DATABASE_NAME,UNIT_ID) values(1,'POS1','CASHBOX1','cashbox1', 1)" },
    { changeID:"sys_sync_POSes__9", changeDatetime:"2016-09-26 10:09:00", changeObj:"sys_sync_POSes",
        changeVal:"INSERT INTO sys_sync_POSes(ID,NAME,HOST_NAME,DATABASE_NAME,UNIT_ID) values(2,'POS2','CASHBOX2','cashbox2', 1)" }
];
module.exports.changeLog=changeLog;