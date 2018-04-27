module.exports.id=module.id;
var changeLog=[
    { changeID: "dir_products_collections__1", changeDatetime: "2016-09-12 09:31:00", changeObj: "dir_products_collections",
        changeVal: "CREATE TABLE dir_products_collections(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"dir_products_collections", field:"ID", id:"ID" },
    { changeID: "dir_products_collections__2", changeDatetime: "2016-09-12 09:32:00", changeObj: "dir_products_collections",
        changeVal: "ALTER TABLE dir_products_collections ADD COLUMN NAME VARCHAR(255) NOT NULL",
        field:"NAME" },
    { changeID: "dir_products_collections__3", changeDatetime: "2016-09-12 09:33:00", changeObj: "dir_products_collections",
        changeVal: "ALTER TABLE dir_products_collections ADD CONSTRAINT DIR_PRODUCTS_COLLECTIONS_NAME_UNIQUE" +
            " UNIQUE(NAME)" },
    { changeID: "dir_products_collections__4", changeDatetime: "2016-09-12 09:34:00", changeObj: "dir_products_collections",
        changeVal: "ALTER TABLE dir_products_collections ADD COLUMN CODE VARCHAR(255) NOT NULL",
        field:"CODE" },
    { changeID: "dir_products_collections__5", changeDatetime: "2016-09-12 09:55:00", changeObj: "dir_products_collections",
        changeVal:
            "INSERT INTO dir_products_collections(ID,NAME,CODE)" +
                " values(1,'коллекция 1 2017','1Z6')" }
];
module.exports.changeLog=changeLog;
