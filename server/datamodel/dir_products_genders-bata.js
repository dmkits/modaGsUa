module.exports.id=module.id;
var changeLog=[
    { changeID:"dir_products_genders__1", changeDatetime: "2016-08-31 18:01:00", changeObj: "dir_products_genders",
        changeVal: "CREATE TABLE dir_products_genders(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_genders", field:"ID", id:"ID" },
    { changeID:"dir_products_genders__2", changeDatetime: "2016-08-31 18:02:00", changeObj: "dir_products_genders",
        changeVal: "ALTER TABLE dir_products_genders ADD COLUMN CODE VARCHAR(1) NOT NULL",
        field:"CODE" },
    { changeID:"dir_products_genders__3", changeDatetime: "2016-08-31 18:03:00", changeObj: "dir_products_genders",
        changeVal: "ALTER TABLE dir_products_genders ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME" },
    { changeID:"dir_products_genders__4", changeDatetime: "2016-08-31 18:04:00", changeObj: "dir_products_genders",
        changeVal: "ALTER TABLE dir_products_genders ADD CONSTRAINT DIR_PRODUCTS_GENDERS_CODE_UNIQUE UNIQUE(CODE)" },
    { changeID:"dir_products_genders__5", changeDatetime: "2016-08-31 18:05:00", changeObj: "dir_products_genders",
        changeVal: "ALTER TABLE dir_products_genders ADD CONSTRAINT DIR_PRODUCTS_GENDERS_NAME_UNIQUE UNIQUE(NAME)" },
    { changeID:"dir_products_genders__6", changeDatetime: "2016-09-01 13:06:00", changeObj: "dir_products_genders",
        changeVal: "ALTER TABLE dir_products_genders ADD COLUMN CONSTANT SMALLINT NOT NULL",
        field:"CONSTANT" }
];
module.exports.changeLog=changeLog;
