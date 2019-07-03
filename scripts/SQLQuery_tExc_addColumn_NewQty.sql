use GMSTest38Btk380307GS
go
/*
--DocCode 1021
--TableCode 11021002
select * from z_Fields where TableCode=11021002  --столбцы таблицы остатков t_ExcD
select * from z_FieldsRep where FieldName = 'Qty'
select * from z_FieldsRep where FieldName = 'NewQty'
select * from z_Tables where TableName='t_ExcD'
select * from z_Tables where TableCode=11021002
select * from syscolumns where name = 'FactQty'
select * from z_FieldsRep where FieldName = 'FactQty'
select * from z_Fields where FieldName = 'FactQty'

--update z_FieldsRep set Visible=1 where FieldName = 'FactQty'
select * from z_Docs where DocCode=11021
select * from z_FieldsRep where FieldName='NewQty'
select * from z_Fields where TableCode=11021002
select * from z_DataSetFields where DSCode=11021002
select * from z_DataSets where DSCode=11021002
*/

/*
delete from z_DataSetFields where DSCode=11021002 and FieldName='NewQty'
delete f from z_Fields f,z_Tables t where f.TableCode=t.TableCode and t.TableName='t_ExcD' and f.FieldName='NewQty'
ALTER TABLE t_ExcD DROP Constraint DF__t_ExcD__NewQty__7364913B
ALTER TABLE t_ExcD DROP COLUMN NewQty
*/

ALTER TABLE t_ExcD ADD NewQty numeric(21,9) NOT NULL DEFAULT 0
go
select top 1 * from t_ExcD where ChID is NULL
--Adding Field to Fields
select f.* from z_Fields f,z_Tables t where f.TableCode=t.TableCode and t.TableName='t_ExcD' order by FieldPosID desc--check
insert into z_Fields (TableCode, FieldPosID, FieldName, FieldInfo, Required, DataSize,  DBDefault) 
	select 
		distinct TableCode, m.ColID PosID,m.name, NULL, m.isnullable*-1 + 1, m.Length, NULL 
		from syscolumns m, sysobjects t, z_Tables d 
		where t.id = m.id AND d.TableName = t.name AND t.name = 't_ExcD' AND m.name = 'NewQty' order by TableCode, PosID		
go
select f.* from z_Fields f,z_Tables t where f.TableCode=t.TableCode and t.TableName='t_ExcD' and f.FieldName='NewQty' Order by FieldPosID desc--check

--Adding Field to OTTrade
--select * from z_DataSetFields where DSCode=11021002
update z_DataSetFields 
	set FieldPosID=FieldPosID+1 --Adding shift to place NewQty near Qty, where '9' is PosID of 'Qty'
	where DSCode=11021002 and FieldPosID > 9
go	 
insert into z_DataSetFields(DSCode,FieldPosID,FieldName,FieldInfo,Required,ReadOnly,Visible,DisplayFormat,Width,AutoNewType,AutoNewValue,DataSize,Calc,Lookup,LookupKey,LookupSource,LookupSourceKey,LookupSourceResult,PickListType,PickList,EditMask,EditFormat,MinValue,MaxValue,CustomConstraint,ErrorMessage,InitBeforePost,IsHidden) --Adding column to field 11021
	values(11021002, 10, 'NewQty', '', 1, 0, 0, '', 10, 0, '', 9, 0, 0, '', '', '', '', 0, '', '', '', 0, 0, '', '', 0, 0)
go
select * from z_DataSetFields where DSCode=11021002 and FieldName='NewQty'