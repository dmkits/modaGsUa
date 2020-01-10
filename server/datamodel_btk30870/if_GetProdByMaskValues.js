module.exports.id=module.id;
module.exports.changeLog = [
    { changeID:"if_GetProdNameByMaskValues__1", changeDatetime:"2020-01-08 17:25:00", changeObj:"if_GetProdNameByMaskValues",
        changeVal:"/*Возвращает имя товара по маске товара в общих настройках на закладке Бутик\n" +
            "Доступные для использования шаблоны в имени товара описаны в общих настройках на закладке Бутик\n" +
            "FLP Kalinichev D. 2014-02-20 */\n" +
            "CREATE FUNCTION dbo.if_GetProdNameByMaskValues\n" +
            "   (@ProdID int/*Код товара*/, @PCatName varchar(200)/*Коллекция*/,@PCatSName varchar(200)/*Сокр.Коллекция*/, @PGrName varchar(200)/*Бренд*/,\n" +
            "   @PGrName1 varchar(200)/*Линия*/,@PGrSName1 varchar(200)/*Сокр.Линия*/,\n" +
            "   @PGrName2 varchar(200)/*Вид*/, @PGrName3 varchar(200)/*Состав*/,\n" +
            "   @Article1 varchar(200), @Article2 varchar(200), @Article3 varchar(200),\n" +
            "   @ColName varchar(200)/*Цвет*/, @Size varchar(200)/*Размер*/, @Sizes varchar(200)/*Доступные размеры*/ /*, @Growth numeric(21,9)Рост*/)\n" +
            "RETURNS varchar(250)\n" +
            "AS BEGIN\n" +
            "   DECLARE @ProdName varchar(250)\n" +
            "   SELECT @ProdName = ISNULL(VarValue,'') FROM z_Vars WHERE VarName='DefaultProdName'\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%Код%', ISNULL(Convert(varchar(200),@ProdID),''))\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Коллекция%', ISNULL(@PCatName,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%СокрКоллекция%', ISNULL(@PCatSName,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Бренд%', ISNULL(@PGrName,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Линия%', ISNULL(@PGrName1,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%СокрЛиния%', ISNULL(@PGrSName1,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Вид%', ISNULL(@PGrName2,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Состав%', ISNULL(@PGrName3,'') )\n" +
            "   --SELECT @ProdName = REPLACE( @ProdName, '%СокрВид%',\n" +
            "   --	(CASE WHEN @PGrID3>0 THEN case when LTRIM(RTRIM(ISNULL(ShortName,'')))<>'' then LTRIM(RTRIM(ISNULL(ShortName,''))) else ISNULL(PGrName3,'') end ELSE '' END) )\n" +
            "   --		FROM r_ProdG3 WHERE PGRID3=@PGrID3\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%Артикул1%', ISNULL(@Article1,''))\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%Артикул2%', ISNULL(@Article2,''))\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%Артикул3%', ISNULL(@Article3,''))\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%(Артикул1)%', CASE When LTRIM(RTRIM(ISNULL(@Article1,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article1,'')))+')' Else '' END)\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%(Артикул2)%', CASE When LTRIM(RTRIM(ISNULL(@Article2,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article2,'')))+')' Else '' END)\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%(Артикул3)%', CASE When LTRIM(RTRIM(ISNULL(@Article3,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article3,'')))+')' Else '' END)\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Цвет%', ISNULL(@ColName,'') )\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%СокрЦвет%', (CASE WHEN ChID>0 THEN ISNULL(ShortName,'') ELSE '' END) ) FROM ir_ProdColors WHERE ColorName=@ColName\n" +
            "   SELECT @ProdName = REPLACE( @ProdName, '%Размер%', (CASE WHEN @Size<>'Размер не указан' AND LTRIM(ISNULL(@Size,''))<>'' THEN 'р.'+@Size ELSE '' END) )\n" +
            "   SELECT @ProdName = REPLACE(@ProdName, '%Размеры%', ISNULL(@Sizes,''))\n" +
            "   --SELECT @ProdName = REPLACE( @ProdName, '%Рост%', (CASE WHEN @Growth>0 THEN Convert(varchar(200),@Growth) ELSE '' END) )\n" +
            "   RETURN REPLACE(REPLACE(LTRIM(RTRIM(@ProdName)),'   ',' '),'  ',' ')\n" +
            "END\n",
        functionName:"if_GetProdNameByMaskValues",
        functionParameters:["@ProdID","@PCatName","@PCatSName","@PGrName","@PGr1Name","@PGr1SName","@PGr2Name","@PGr3Name",
            "@Article1","@Article2","@Article3","@PColName","@PSize","@Sizes"]
    }
];
