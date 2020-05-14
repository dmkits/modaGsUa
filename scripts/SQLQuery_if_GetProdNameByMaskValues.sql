USE GMSDev38Btk380307GS
--USE GMSData38btk
GO
DROP FUNCTION dbo.if_GetProdNameByMaskValues
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/*���������� ��� ������ �� ����� ������ � ����� ���������� �� �������� �����
  ��������� ��� ������������� ������� � ����� ������ ������� � ����� ���������� �� �������� ����� 
  FLP Kalinichev D. 2014-02-20 dmkits 20200505*/
CREATE FUNCTION dbo.if_GetProdNameByMaskValues(@ProdID int/*��� ������*/,
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
	SELECT @ProdName = REPLACE( @ProdName, '%�������%', CASE When LTRIM(RTRIM(ISNULL(@PGrSName3,'')))<>'' Then LTRIM(RTRIM(ISNULL(@PGrSName3,''))) Else ISNULL(@PGrName3,'') END )
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
	SELECT @ProdName = REPLACE( @ProdName, '%����%', (CASE When @Growth>0 Then ISNULL(Convert(varchar(200),@Growth),'') Else '' END) )
	RETURN LTRIM(RTRIM(@ProdName))
END
GO
if not exists(select 1 from z_Objects where ObjName='if_GetProdNameByMaskValues')
	insert into z_Objects(ObjCode,ObjName,ObjDesc,ObjInfo,ObjType,RevID)
		select ObjCode=max(ObjCode)+1,ObjName='if_GetProdNameByMaskValues',ObjDesc='',ObjInfo='',ObjType='P',RevID=1 from z_Objects
go
update z_Objects set RevID=1,ObjDesc='���������� ��� ������ �� ����� ������ � ����� ���������� �� �������� ����� �� ������ �������� ��������� ������',ObjInfo='���������� ��� ������ �� ����� ������ � ����� ���������� �� �������� ����� �� ������ �������� ��������� ������. dmkits 20200505.' where ObjName='if_GetProdNameByMaskValues'
go
select * from z_Objects where ObjName='if_GetProdNameByMaskValues'
