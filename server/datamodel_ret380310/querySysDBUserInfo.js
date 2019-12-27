module.exports.id=module.id;
module.exports.modelData = { queryName:"querySysDBUserInfo",
    query:"select SUSER_NAME() as dbUserName,\n"+
        "   GMS_DBVersion= dbo.zf_Var('GMS_DBVersion'), OT_DBiID= dbo.zf_Var('OT_DBiID'),\n"+
        "   t_OurID= dbo.zf_Var('t_OurID'), t_OneOur= dbo.zf_Var('t_OneOur'), OT_MainOurID= dbo.zf_Var('OT_MainOurID'),\n"+
        "   z_CurrMC= dbo.zf_Var('z_CurrMC'), z_CurrCC= dbo.zf_Var('z_CurrCC'),\n"+
        "   t_StockID= dbo.zf_Var('t_StockID'), t_OneStock= dbo.zf_Var('t_OneStock'), it_MainStockID= dbo.zf_Var('it_MainStockID'),\n"+
        "   t_SecID= dbo.zf_Var('t_SecID'), DefaultUM= dbo.zf_Var('DefaultUM'),\n"+
        "   EmpID= (select EmpID from r_Users where UserName=SUSER_NAME()),\n"+
        "   EmpName= (select EmpName from r_Users u, r_Emps e where e.EmpID=u.EmpID and u.UserName=SUSER_NAME()),\n"+
        "   EmpRole= (select un.Notes from r_Users u, r_Emps e,r_Uni un where e.EmpID=u.EmpID and u.UserName=SUSER_NAME() and un.RefTypeID=10606 and un.RefID=e.ShiftPostID)",
    fields:["dbUserName","GMS_DBVersion","OT_DBiID",
        "t_OurID","t_OneOur","OT_MainOurID","z_CurrMC","z_CurrCC","t_StockID","t_OneStock","it_MainStockID","t_SecID","DefaultUM",
        "EmpID","EmpName","EmpRole"]
};
