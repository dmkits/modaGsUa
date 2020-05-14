USE GMSDev38Btk380307GS
--USE GMSData38btk
GO
DROP FUNCTION dbo.if_GetProdNameByMaskValues
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/*Возвращает имя товара по маске товара в общих настройках на закладке Бутик
  Доступные для использования шаблоны в имени товара описаны в общих настройках на закладке Бутик 
  FLP Kalinichev D. 2014-02-20 dmkits 20200505*/
CREATE FUNCTION dbo.if_GetProdNameByMaskValues(@ProdID int/*Код товара*/,
		@PCatName varchar(200)/*бренд*/, @PGrName1 varchar(200)/*вид*/, @PGrName3 varchar(200)/*линия*/, @PGrSName3 varchar(200),
		@Article1 varchar(200), @Article2 varchar(200), @Article3 varchar(200), 
		@ColorName varchar(200)/*цвет*/, @ColorSName varchar(200), @Size varchar(200), @Sizes varchar(200)/*Доступные размеры*/, @Growth numeric(21,9)/*Рост*/) 
	RETURNS varchar(250)
AS BEGIN
	DECLARE @ProdName varchar(250)
	SELECT @ProdName = ISNULL(VarValue,'') FROM z_Vars WHERE VarName = 'DefaultProdName'
	SELECT @ProdName = REPLACE(@ProdName, '%Код%', ISNULL(Convert(varchar(200),@ProdID),''))
	SELECT @ProdName = REPLACE( @ProdName, '%Бренд%', LTRIM(RTRIM(ISNULL(@PCatName,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%Линия%', LTRIM(RTRIM(ISNULL(@PGrName1,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%Вид%', LTRIM(RTRIM(ISNULL(@PGrName3,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%СокрВид%', CASE When LTRIM(RTRIM(ISNULL(@PGrSName3,'')))<>'' Then LTRIM(RTRIM(ISNULL(@PGrSName3,''))) Else ISNULL(@PGrName3,'') END )
	SELECT @ProdName = REPLACE(@ProdName, '%Артикул1%', LTRIM(RTRIM(ISNULL(@Article1,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%Артикул2%', LTRIM(RTRIM(ISNULL(@Article2,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%Артикул3%', LTRIM(RTRIM(ISNULL(@Article3,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%(Артикул1)%', CASE When LTRIM(RTRIM(ISNULL(@Article1,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article1,'')))+')' Else '' END)
	SELECT @ProdName = REPLACE(@ProdName, '%(Артикул2)%', CASE When LTRIM(RTRIM(ISNULL(@Article2,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article2,'')))+')' Else '' END)
	SELECT @ProdName = REPLACE(@ProdName, '%(Артикул3)%', CASE When LTRIM(RTRIM(ISNULL(@Article3,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article3,'')))+')' Else '' END)
	SELECT @ProdName = REPLACE( @ProdName, '%Цвет%', LTRIM(RTRIM(ISNULL(@ColorName,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%СокрЦвет%', LTRIM(RTRIM(ISNULL(@ColorSName,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%Размер%', LTRIM(RTRIM(ISNULL(@Size,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%Размеры%', LTRIM(RTRIM(ISNULL(@Sizes,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%Рост%', (CASE When @Growth>0 Then ISNULL(Convert(varchar(200),@Growth),'') Else '' END) )
	RETURN LTRIM(RTRIM(@ProdName))
END
GO
if not exists(select 1 from z_Objects where ObjName='if_GetProdNameByMaskValues')
	insert into z_Objects(ObjCode,ObjName,ObjDesc,ObjInfo,ObjType,RevID)
		select ObjCode=max(ObjCode)+1,ObjName='if_GetProdNameByMaskValues',ObjDesc='',ObjInfo='',ObjType='P',RevID=1 from z_Objects
go
update z_Objects set RevID=1,ObjDesc='Возвращает имя товара по маске товара в общих настройках на закладке Бутик на основе значений атрибутов товара',ObjInfo='Возвращает имя товара по маске товара в общих настройках на закладке Бутик на основе значений атрибутов товара. dmkits 20200505.' where ObjName='if_GetProdNameByMaskValues'
go
select * from z_Objects where ObjName='if_GetProdNameByMaskValues'
