module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_lines__1", changeDatetime: "2017-09-22 13:00:00", changeObj: "dir_products_lines",
        changeVal: "CREATE TABLE dir_products_lines(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_lines", field:"ID", id:"ID" },
    { changeID: "dir_products_lines__2", changeDatetime: "2017-09-22 13:01:00", changeObj: "dir_products_lines",
        changeVal: "ALTER TABLE dir_products_lines ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME" },
    { changeID: "dir_products_lines__3", changeDatetime: "2017-09-22 13:02:00", changeObj: "dir_products_lines",
        changeVal: "ALTER TABLE dir_products_lines ADD CONSTRAINT DIR_PRODUCTS_LINES_NAME_UNIQUE UNIQUE(NAME)" }
];
module.exports.changeLog=changeLog;
