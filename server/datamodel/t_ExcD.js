module.exports.id=module.id;
module.exports.modelData = { tableName:"t_ExcD", idField:"ChID",
    fields:["ChID","SrcPosID","ProdID","PPID","UM","Qty","PriceCC_nt","SumCC_nt","Tax","TaxSum","PriceCC_wt","SumCC_wt","BarCode","SecID","NewSecID"]
};
module.exports.changeLog = [
    { changeID:"t_ExcD__1", changeDatetime:"2019-07-03 16:04:00", changeObj:"t_ExcD",
        changeVal:"ALTER TABLE t_ExcD ADD NewQty numeric(21,9) NOT NULL DEFAULT 0",
        field:"NewQty"},
    { changeID:"t_ExcD__2", changeDatetime:"2019-07-03 16:05:00", changeObj:"t_ExcD",
        changeVal:"select f.* from z_Fields f,z_Tables t where f.TableCode=t.TableCode and t.TableName='t_ExcD' order by FieldPosID desc\n"+
            "insert into z_Fields (TableCode, FieldPosID, FieldName, FieldInfo, Required, DataSize,  DBDefault)\n"+
            "select distinct TableCode, m.ColID PosID,m.name, NULL, m.isnullable*-1 + 1, m.Length, NULL\n"+
            "from syscolumns m, sysobjects t, z_Tables d\n"+
            "where t.id = m.id AND d.TableName = t.name AND t.name = 't_ExcD' AND m.name = 'NewQty' order by TableCode, PosID"},
    { changeID:"t_ExcD__3", changeDatetime:"2019-07-03 16:06:00", changeObj:"t_ExcD",
        changeVal:"update z_DataSetFields set FieldPosID=FieldPosID+1 where DSCode=11021002 and FieldPosID > 9"},
    { changeID:"t_ExcD__4", changeDatetime:"2019-07-03 16:07:00", changeObj:"t_ExcD",
        changeVal:"insert into z_DataSetFields(DSCode,FieldPosID,FieldName,FieldInfo,Required,ReadOnly,Visible,\n"+
            "   DisplayFormat,Width,AutoNewType,AutoNewValue,DataSize,Calc,\n"+
            "   Lookup,LookupKey,LookupSource,LookupSourceKey,LookupSourceResult,PickListType,PickList,\n"+
            "   EditMask,EditFormat,MinValue,MaxValue,CustomConstraint,ErrorMessage,InitBeforePost,IsHidden)\n"+
            "values(11021002, 10, 'NewQty', '', 1, 0, 0, \n"+
            "   '', 10, 0, '', 9, 0, \n"+
            "   0, '', '', '', '', 0, '', \n"+
            "   '', '', 0, 0, '', '', 0, 0)"}
];
