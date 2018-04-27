module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_compositions__1", changeDatetime: "2016-09-09 16:21:00", changeObj: "dir_products_compositions",
        changeVal: "CREATE TABLE dir_products_compositions(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_compositions", field:"ID", id:"ID" },
    { changeID: "dir_products_compositions__2", changeDatetime: "2016-09-09 16:22:00", changeObj: "dir_products_compositions",
        changeVal: "ALTER TABLE dir_products_compositions ADD COLUMN VALUE VARCHAR(255) NOT NULL",
        field:"VALUE" },
    { changeID: "dir_products_compositions__3", changeDatetime: "2016-09-09 16:23:00", changeObj: "dir_products_compositions",
        changeVal: "ALTER TABLE dir_products_compositions ADD CONSTRAINT DIR_PRODUCTS_COMPOSITIONS_VALUE_UNIQUE UNIQUE(VALUE)" }
];
module.exports.changeLog=changeLog;
