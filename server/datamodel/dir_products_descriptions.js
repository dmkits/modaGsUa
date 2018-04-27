module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_descriptions__1", changeDatetime: "2017-09-22 14:00:00", changeObj: "dir_products_descriptions",
        changeVal: "CREATE TABLE dir_products_descriptions(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_descriptions", field:"ID", id:"ID" },
    { changeID: "dir_products_descriptions__2", changeDatetime: "2017-09-22 14:01:00", changeObj: "dir_products_descriptions",
        changeVal: "ALTER TABLE dir_products_descriptions ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME" },
    { changeID: "dir_products_descriptions__3", changeDatetime: "2017-09-22 14:02:00", changeObj: "dir_products_descriptions",
        changeVal: "ALTER TABLE dir_products_descriptions ADD CONSTRAINT DIR_PRODUCTS_DESCRIPTIONS_NAME_UNIQUE UNIQUE(NAME)" }
];
module.exports.changeLog=changeLog;
