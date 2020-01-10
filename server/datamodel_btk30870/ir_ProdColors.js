module.exports.id=module.id;
module.exports.changeLog = [
    { changeID:"ir_ProdColors__1", changeDatetime:"2020-01-04 18:01:00", changeObj:"ir_ProdColors",
        changeVal:"CREATE TABLE ir_ProdColors(\n" +
            "ChID int NOT NULL,\n" +
            "ColorID smallint NOT NULL,\n" +
            "ColorName varchar(250) NOT NULL,\n" +
            "Notes varchar(250) NULL,\n" +
            "ShortName varchar(250) NULL,\n" +
            "CONSTRAINT pk_ir_ProdColors PRIMARY KEY(ColorID ASC)\n)",
        tableName:"ir_ProdColors", idField:"ColorID",
        fields:["ChID","ColorID","ColorName","Notes","ShortName"]
    },
    { changeID:"ir_ProdColors__2", changeDatetime:"2020-01-04 18:02:00", changeObj:"ir_ProdColors",
        changeVal:"insert into ir_ProdColors(ChID,ColorID,ColorName,Notes,ShortName) values(0, 0, '','Нет цвета','')"
    }
];
