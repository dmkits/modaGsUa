module.exports.id=module.id;
var changeLog = [
    { changeID:"wrh_retail_tickets_products__1", changeDatetime:"2016-09-26 22:21:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"CREATE TABLE wrh_retail_tickets_products(ID BIGINT UNSIGNED NOT NULL PRIMARY KEY) CHARACTER SET utf8",
        tableName:"wrh_retail_tickets_products", field:"ID"},
    { changeID:"wrh_retail_tickets_products__2", changeDatetime:"2016-09-26 22:22:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN RETAIL_TICKET_ID BIGINT UNSIGNED NOT NULL",
        field:"RETAIL_TICKET_ID"},
    { changeID:"wrh_retail_tickets_products__3", changeDatetime:"2016-09-26 22:23:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD CONSTRAINT WRH_RETAIL_TICKETS_PRODUCTS_RETAIL_TICKET_ID_FK " +
            "FOREIGN KEY (RETAIL_TICKET_ID) REFERENCES wrh_retail_tickets(ID)",
        field:"RETAIL_TICKET_ID", "source":"wrh_retail_tickets", "linkField":"ID" },
    { changeID:"wrh_retail_tickets_products__4", changeDatetime:"2016-09-26 22:24:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN POS INTEGER UNSIGNED NOT NULL",
        field:"POS"},
    { changeID:"wrh_retail_tickets_products__5", changeDatetime:"2016-09-26 22:25:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN PRODUCT_ID BIGINT UNSIGNED NOT NULL",
        field:"PRODUCT_ID"},
    { changeID:"wrh_retail_tickets_products__6", changeDatetime:"2016-09-26 22:26:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD CONSTRAINT WRH_RETAIL_TICKETS_PRODUCTS_PRODUCT_ID_FK " +
            "FOREIGN KEY (PRODUCT_ID) REFERENCES dir_products(ID)",
        field:"PRODUCT_ID", "source":"dir_products", "linkField":"ID" },
    { changeID:"wrh_retail_tickets_products__7", changeDatetime:"2016-09-26 22:27:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN QTY DECIMAL(12,3) NOT NULL",
        field:"QTY"},
    { changeID:"wrh_retail_tickets_products__8", changeDatetime:"2016-09-26 22:28:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN PRICE DECIMAL(12,2) NOT NULL",
        field:"PRICE"},
    { changeID:"wrh_retail_tickets_products__9", changeDatetime:"2016-09-26 22:29:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN POSSUM DECIMAL(12,2) NOT NULL",
        field:"POSSUM"},
    { changeID:"wrh_retail_tickets_products_10", changeDatetime:"2017-01-27 14:31:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN SALE_PRICE DECIMAL(12,2) NOT NULL",
        field:"SALE_PRICE"},
    { changeID:"wrh_retail_tickets_products_11", changeDatetime:"2017-01-27 14:32:00", changeObj:"wrh_retail_tickets_products",
        changeVal:"ALTER TABLE wrh_retail_tickets_products ADD COLUMN DISCOUNT DECIMAL(12,4) NOT NULL",
        field:"DISCOUNT"}
];
module.exports.changeLog=changeLog;