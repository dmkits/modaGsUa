module.exports.id=module.id;
module.exports.changeLog = [
    { changeID:"ir_ProdSizes__1", changeDatetime:"2020-01-04 18:15:00", changeObj:"ir_ProdSizes",
        changeVal:"CREATE TABLE ir_ProdSizes(\n" +
            "ChID int NOT NULL,\n" +
            "SizeName varchar(250) NOT NULL,\n" +
            "Notes varchar(250) NOT NULL,\n" +
            "CONSTRAINT pk_ir_ProdSizes PRIMARY KEY(SizeName ASC)\n)",
        tableName:"ir_ProdSizes", idField:"SizeName",
        fields:["ChID","SizeName"]
    },
    { changeID:"ir_ProdSizes__2", changeDatetime:"2020-01-04 18:16:00", changeObj:"ir_ProdSizes",
        changeVal:"insert into ir_ProdSizes(ChID,SizeName,Notes) values(0, '','Нет размера')"
    }
];
