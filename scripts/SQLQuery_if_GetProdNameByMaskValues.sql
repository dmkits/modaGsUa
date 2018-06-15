USE [GMSData38btkKlnk]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*���������� ��� ������ �� ����� ������ � ����� ���������� �� �������� �����
  ��������� ��� ������������� ������� � ����� ������ ������� � ����� ���������� �� �������� ����� 
  FLP Kalinichev D. 2014-02-20 */
CREATE
--ALTER 
	FUNCTION [dbo].[if_GetProdNameByMaskValues](@ProdID int/*��� ������*/, 
		@PCatName varchar(200)/*�����*/, @PGrName1 varchar(200)/*���*/, @PGrName3 varchar(200)/*�����*/, @PGrSName3 varchar(200),
		@Article1 varchar(200), @Article2 varchar(200), @Article3 varchar(200), 
		@ColorName varchar(200)/*����*/, @ColorSName varchar(200), @Size varchar(200), @Sizes varchar(200)/*��������� �������*/, @Growth numeric(21,9)/*����*/) 
	RETURNS varchar(250)
AS BEGIN
	DECLARE @ProdName varchar(250)
	
	SELECT @ProdName = ISNULL(VarValue,'') FROM z_Vars WHERE VarName = 'DefaultProdName'
	
	SELECT @ProdName = REPLACE(@ProdName, '%���%', ISNULL(Convert(varchar(200),@ProdID),''))
	SELECT @ProdName = REPLACE( @ProdName, '%�����%', LTRIM(RTRIM(ISNULL(@PCatName,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%�����%', LTRIM(RTRIM(ISNULL(@PGrName1,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%���%', LTRIM(RTRIM(ISNULL(@PGrName3,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%�������%', 
		case when LTRIM(RTRIM(ISNULL(@PGrSName3,'')))<>'' then LTRIM(RTRIM(ISNULL(@PGrSName3,''))) else ISNULL(@PGrName3,'') end )
	SELECT @ProdName = REPLACE(@ProdName, '%�������1%', LTRIM(RTRIM(ISNULL(@Article1,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%�������2%', LTRIM(RTRIM(ISNULL(@Article2,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%�������3%', LTRIM(RTRIM(ISNULL(@Article3,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%(�������1)%', CASE When LTRIM(RTRIM(ISNULL(@Article1,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article1,'')))+')' Else '' END)
	SELECT @ProdName = REPLACE(@ProdName, '%(�������2)%', CASE When LTRIM(RTRIM(ISNULL(@Article2,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article2,'')))+')' Else '' END)
	SELECT @ProdName = REPLACE(@ProdName, '%(�������3)%', CASE When LTRIM(RTRIM(ISNULL(@Article3,'')))<>'' Then '('+LTRIM(RTRIM(ISNULL(@Article3,'')))+')' Else '' END)
	SELECT @ProdName = REPLACE( @ProdName, '%����%', LTRIM(RTRIM(ISNULL(@ColorName,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%��������%', LTRIM(RTRIM(ISNULL(@ColorSName,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%������%', LTRIM(RTRIM(ISNULL(@Size,''))))
	SELECT @ProdName = REPLACE(@ProdName, '%�������%', LTRIM(RTRIM(ISNULL(@Sizes,''))))
	SELECT @ProdName = REPLACE( @ProdName, '%����%', (CASE WHEN @Growth>0 THEN ISNULL(Convert(varchar(200),@Growth),'') ELSE '' END) )
	
	RETURN LTRIM(RTRIM(@ProdName))
END