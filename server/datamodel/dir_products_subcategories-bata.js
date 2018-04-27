module.exports.id=module.id;
var changeLog=[
    { changeID:"dir_products_subcategories__1", changeDatetime: "2016-09-11 14:11:00", changeObj: "dir_products_subcategories",
        changeVal: "CREATE TABLE dir_products_subcategories(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_subcategories", field:"ID", id:"ID" },
    { changeID:"dir_products_subcategories__2", changeDatetime: "2016-09-11 14:12:00", changeObj: "dir_products_subcategories",
        changeVal: "ALTER TABLE dir_products_subcategories ADD COLUMN CODE INTEGER NOT NULL",
        field:"CODE" },
    { changeID:"dir_products_subcategories__3", changeDatetime: "2016-09-11 14:13:00", changeObj: "dir_products_subcategories",
        changeVal: "ALTER TABLE dir_products_subcategories ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME" },
    { changeID:"dir_products_subcategories__4", changeDatetime: "2016-09-11 14:14:00", changeObj: "dir_products_subcategories",
        changeVal: "ALTER TABLE dir_products_subcategories ADD CONSTRAINT DIR_DIR_PRODUCTS_SUBCATEGORIES_CODE_NAME_UNIQUE" +
            " UNIQUE(CODE,NAME)" },
    { changeID:"dir_products_subcategories__5", changeDatetime: "2016-09-11 14:15:00", changeObj: "dir_products_subcategories",
        changeVal: "ALTER TABLE dir_products_subcategories ADD COLUMN CONSTANT SMALLINT NOT NULL",
        field:"CONSTANT" }
];
module.exports.changeLog=changeLog;
