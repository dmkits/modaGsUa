module.exports.id=module.id;
var changeLog = [
    { changeID:"sys_sync_output_data_details__1", changeDatetime:"2016-10-07 12:41:00", changeObj:"sys_sync_output_data_details",
        changeVal:"CREATE TABLE sys_sync_output_data_details(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"sys_sync_output_data_details", field:"ID"},
    { changeID:"sys_sync_output_data_details__2", changeDatetime:"2016-10-07 12:42:00", changeObj:"sys_sync_output_data_details",
        changeVal:"ALTER TABLE sys_sync_output_data_details ADD COLUMN SYNC_OUTPUT_DATA_ID BIGINT UNSIGNED NOT NULL",
        field:"SYNC_OUTPUT_DATA_ID"},
    { changeID:"sys_sync_output_data_details__3", changeDatetime:"2016-10-07 12:43:00", changeObj:"sys_sync_output_data_details",
        changeVal:"ALTER TABLE sys_sync_output_data_details ADD CONSTRAINT SYS_SYNC_OUTPUT_DATA_DETAILS_SYNC_OUTPUT_DATA_ID_FK " +
            "FOREIGN KEY (SYNC_OUTPUT_DATA_ID) REFERENCES sys_sync_output_data(ID)" },
    { changeID:"sys_sync_output_data_details__4", changeDatetime:"2016-10-07 12:44:00", changeObj:"sys_sync_output_data_details",
        changeVal:"ALTER TABLE sys_sync_output_data_details ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME"},
    { changeID:"sys_sync_output_data_details__5", changeDatetime:"2016-10-07 12:45:00", changeObj:"sys_sync_output_data_details",
        changeVal:"ALTER TABLE sys_sync_output_data_details ADD COLUMN VALUE VARCHAR(255) NOT NULL",
        field:"VALUE"}
];
module.exports.changeLog=changeLog;