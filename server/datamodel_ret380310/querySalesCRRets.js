module.exports.id=module.id;
module.exports.modelData = { queryName:"querySalesCRRets",
    query:"select DocCode,ChID,OurID,DocID,IntDocID,DocDate,DocTime,StockID,CRID,CompID,TEmpID,OperID,\n"+
        "Notes,StateCode,DocCreateTime,DeskCode,Visitors,\n"+
        "CodeID1,CodeID2,CodeID3,CodeID4,CodeID5,\n"+
        "CurrID,KursMC,TSumCC_nt,TTaxSum,TSumCC_wt,TLevySum,TRealSum,\n"+
        "TPurSumCC_nt,TPurTaxSum,TPurSumCC_wt,\n"+
        "SrcPosID,ProdID,BarCode,UM,SecID,Qty,PPID,\n"+
        "PLID,PriceCC_nt,Tax,PriceCC_wt,RealPrice,SumCC_nt,TaxSum,SumCC_wt,RealSum,\n"+
        "EmpID,CreateTime,ModifyTime, Discount,PurPriceCC_nt,PurTax,PurPriceCC_wt\n"+
        "   from (\n"+
        "       select DocCode=11035, s.ChID,\n"+
        "           s.OurID,s.DocID,s.IntDocID,s.DocDate,s.DocTime, s.StockID,s.CRID,s.CompID,TEmpID=s.EmpID,s.OperID,\n"+
        "           s.Notes, s.StateCode, s.DocCreateTime, s.DeskCode,s.Visitors,\n"+
        "           s.CodeID1,s.CodeID2,s.CodeID3,s.CodeID4,s.CodeID5,\n"+
        "           s.CurrID,s.KursMC,s.TSumCC_nt,s.TTaxSum,s.TSumCC_wt, s.TLevySum, s.TRealSum,\n"+
        "           s.TPurSumCC_nt,s.TPurTaxSum,s.TPurSumCC_wt,\n"+
        "           sd.SrcPosID,sd.ProdID,sd.BarCode,sd.UM,sd.SecID,sd.Qty,sd.PPID,\n"+
        "           sd.PLID,sd.PriceCC_nt,sd.Tax,sd.PriceCC_wt,sd.RealPrice,sd.SumCC_nt,sd.TaxSum,sd.SumCC_wt,sd.RealSum,\n"+
        "           sd.EmpID,sd.CreateTime,sd.ModifyTime, sd.Discount,sd.PurPriceCC_nt,sd.PurTax,sd.PurPriceCC_wt\n"+
        "       from t_Sale s,t_SaleD sd where sd.ChID=s.ChID and DocDate between @BDate and @EDate\n"+
        "       union all\n"+
        "       select DocCode=11004, crr.ChID,\n"+
        "           crr.OurID,crr.DocID,crr.IntDocID,crr.DocDate,crr.DocTime, crr.StockID,crr.CRID,crr.CompID,TEmpID=crr.EmpID,crr.OperID,\n"+
        "           crr.Notes, crr.StateCode, DocCreateTime=NULL, DeskCode=NULL,Visitors=NULL,\n"+
        "           crr.CodeID1,crr.CodeID2,crr.CodeID3,crr.CodeID4,crr.CodeID5,\n"+
        "           crr.CurrID,crr.KursMC,crr.TSumCC_nt,crr.TTaxSum,crr.TSumCC_wt, crr.TLevySum, crr.TRealSum,\n"+
        "           TPurSumCC_nt=NULL,TPurTaxSum=NULL,TPurSumCC_wt=NULL,\n"+
        "           crrd.SrcPosID,crrd.ProdID,crrd.BarCode,crrd.UM,crrd.SecID,-crrd.Qty,crrd.PPID,\n"+
        "           PLID=NULL,crrd.PriceCC_nt,crrd.Tax,crrd.PriceCC_wt,crrd.RealPrice,-crrd.SumCC_nt,-crrd.TaxSum,-crrd.SumCC_wt,-crrd.RealSum,\n"+
        "           crrd.EmpID,crrd.CreateTime,crrd.ModifyTime, Discount=NULL,PurPriceCC_nt=NULL,PurTax=NULL,PurPriceCC_wt=NULL\n"+
        "       from t_CRRet crr,t_CRRetD crrd where crrd.ChID=crr.ChID and DocDate between @BDate and @EDate\n"+
        "   ) m\n",
    queryParameters:["@BDate","@EDate"],
    fields:["DocCode","ChID","OurID","DocID","IntDocID","DocDate","DocTime","StockID","CRID","CompID","TEmpID","OperID",
            "Notes","StateCode","DocCreateTime","DeskCode","Visitors",
            "CodeID1","CodeID2","CodeID3","CodeID4","CodeID5",
            "CurrID","KursMC","TSumCC_nt","TTaxSum","TSumCC_wt","TLevySum","TRealSum",
            "TPurSumCC_nt","TPurTaxSum","TPurSumCC_wt",
            "SrcPosID","ProdID","BarCode","UM","SecID","Qty","PPID",
            "PLID","PriceCC_nt","Tax","PriceCC_wt","RealPrice","SumCC_nt","TaxSum","SumCC_wt","RealSum",
            "EmpID","CreateTime","ModifyTime","Discount","PurPriceCC_nt","PurTax","PurPriceCC_wt"]
};
