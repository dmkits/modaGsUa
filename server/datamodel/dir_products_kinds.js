module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_kinds__1", changeDatetime: "2016-09-09 16:01:00", changeObj: "dir_products_kinds",
        changeVal: "CREATE TABLE dir_products_kinds(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_kinds", field:"ID", id:"ID" },
    { changeID: "dir_products_kinds__2", changeDatetime: "2016-09-09 16:02:00", changeObj: "dir_products_kinds",
        changeVal: "ALTER TABLE dir_products_kinds ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME" },
    { changeID: "dir_products_kinds__3", changeDatetime: "2016-09-09 16:03:00", changeObj: "dir_products_kinds",
        changeVal: "ALTER TABLE dir_products_kinds ADD CONSTRAINT DIR_PRODUCTS_KINDS_NAME_UNIQUE UNIQUE(NAME)" }
];
module.exports.changeLog=changeLog;
