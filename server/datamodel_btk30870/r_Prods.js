module.exports.id=module.id;
module.exports.modelData = { tableName:"r_Prods",idField:"ProdID",
    fields:["ChID","ProdID","ProdName","UM","Country","Notes",
        "PCatID","PGrID",
        "Article1","Article2","Article3","Weight","Age",
        "TaxPercent","PriceWithTax",
        "Note1","Note2","Note3",
        "MinPriceMC","MaxPriceMC","MinRem",
        "CstDty","CstPrc","CstExc","StdExtraR","StdExtraE","MaxExtra","MinExtra",
        "UseAlts","UseCrts",
        "PGrID1","PGrID2","PGrID3","PGrAID","PBGrID",
        "RExpSet","EExpSet",
        "InRems","IsDecQty",
        "File1","File2","File3",
        "AutoSet","Extra1","Extra2","Extra3","Extra4","Extra5","Norma1","Norma2","Norma3","Norma4","Norma5",
        "RecMinPriceCC","RecMaxPriceCC","RecStdPriceCC","RecRemQty",
        "InStopList"]
};
module.exports.changeLog = [
    { changeID:"r_Prods__1", changeDatetime:"2020-01-08 16:01:00", changeObj:"r_Prods",
        changeVal:"ALTER TABLE r_Prods ADD ColorID smallint NOT NULL DEFAULT 0",
        field:"ColorID"},
    { changeID:"r_Prods__2", changeDatetime:"2020-01-08 16:02:00", changeObj:"r_Prods",
        changeVal:"ALTER TABLE r_Prods ADD SizeName varchar(250) NOT NULL DEFAULT ''",
        field:"SizeName"}
];
