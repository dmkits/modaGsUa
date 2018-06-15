USE [GMSData38btkKlnk]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*Возвращает имя товара по маске товара в общих настройках на закладке Бутик
  Доступные для использования шаблоны в имени товара описаны в общих настройках на закладке Бутик 
  FLP Kalinichev D. 2014-02-20 */
CREATE
--ALTER 
	FUNCTION [dbo].[if_GetProdNameByMaskValues](@ProdID int/*Код товара*/, 
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
	SELECT @ProdName = REPLACE( @ProdName, '%СокрВид%', 
		case when LTRIM(RTRIM(ISNULL(@PGrSName3,'')))<>'' then LTRIM(RTRIM(ISNULL(@PGrSName3,''))) else ISNULL(@PGrName3,'') end )
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
	SELECT @ProdName = REPLACE( @ProdName, '%Рост%', (CASE WHEN @Growth>0 THEN ISNULL(Convert(varchar(200),@Growth),'') ELSE '' END) )
	
	RETURN LTRIM(RTRIM(@ProdName))
END