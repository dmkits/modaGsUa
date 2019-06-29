/*
select top 1 * from t_Sale	--select * from t_Sale
select top 1 * from t_CRRet
*/
declare @BDate smalldatetime,@EDate smalldatetime
select @BDate='20181101',@EDate='20181102'
select DocCode,ChID,OurID,DocID,IntDocID,DocDate,DocTime,StockID,CRID,CompID,TEmpID,OperID,
	Notes,StateCode,DocCreateTime,DeskCode,Visitors,
	CodeID1,CodeID2,CodeID3,CodeID4,CodeID5,
	CurrID,KursMC,TSumCC_nt,TTaxSum,TSumCC_wt,TLevySum,TRealSum,
	TPurSumCC_nt,TPurTaxSum,TPurSumCC_wt,
	SrcPosID,ProdID,BarCode,UM,SecID,Qty,PPID,
	PLID,PriceCC_nt,Tax,PriceCC_wt,RealPrice,SumCC_nt,TaxSum,SumCC_wt,RealSum,
	EmpID,CreateTime,ModifyTime, Discount,PurPriceCC_nt,PurTax,PurPriceCC_wt
from (
	select DocCode=11035, s.ChID, 
		s.OurID,s.DocID,s.IntDocID,s.DocDate,s.DocTime, s.StockID,s.CRID,s.CompID,TEmpID=s.EmpID,s.OperID, 
		s.Notes, s.StateCode, s.DocCreateTime, s.DeskCode,s.Visitors,
		s.CodeID1,s.CodeID2,s.CodeID3,s.CodeID4,s.CodeID5, 
		s.CurrID,s.KursMC,s.TSumCC_nt,s.TTaxSum,s.TSumCC_wt, s.TLevySum, s.TRealSum,
		s.TPurSumCC_nt,s.TPurTaxSum,s.TPurSumCC_wt,
		sd.SrcPosID,sd.ProdID,sd.BarCode,sd.UM,sd.SecID,sd.Qty,sd.PPID,
		sd.PLID,sd.PriceCC_nt,sd.Tax,sd.PriceCC_wt,sd.RealPrice,sd.SumCC_nt,sd.TaxSum,sd.SumCC_wt,sd.RealSum,
		sd.EmpID,sd.CreateTime,sd.ModifyTime, sd.Discount,sd.PurPriceCC_nt,sd.PurTax,sd.PurPriceCC_wt
	from t_Sale s,t_SaleD sd where sd.ChID=s.ChID and DocDate between @BDate and @EDate
	union all
	select DocCode=11004, crr.ChID, 
		crr.OurID,crr.DocID,crr.IntDocID,crr.DocDate,crr.DocTime, crr.StockID,crr.CRID,crr.CompID,TEmpID=crr.EmpID,crr.OperID, 
		crr.Notes, crr.StateCode, DocCreateTime=NULL, DeskCode=NULL,Visitors=NULL,
		crr.CodeID1,crr.CodeID2,crr.CodeID3,crr.CodeID4,crr.CodeID5, 
		crr.CurrID,crr.KursMC,-crr.TSumCC_nt,-crr.TTaxSum,-crr.TSumCC_wt, -crr.TLevySum, -crr.TRealSum,
		TPurSumCC_nt=NULL,TPurTaxSum=NULL,TPurSumCC_wt=NULL,
		crrd.SrcPosID,crrd.ProdID,crrd.BarCode,crrd.UM,crrd.SecID,-crrd.Qty,crrd.PPID,
		PLID=NULL,crrd.PriceCC_nt,crrd.Tax,crrd.PriceCC_wt,crrd.RealPrice,-crrd.SumCC_nt,-crrd.TaxSum,-crrd.SumCC_wt,-crrd.RealSum,
		crrd.EmpID,crrd.CreateTime,crrd.ModifyTime, Discount=NULL,PurPriceCC_nt=NULL,PurTax=NULL,PurPriceCC_wt=NULL
	from t_CRRet crr,t_CRRetD crrd where crrd.ChID=crr.ChID and DocDate between @BDate and @EDate
) m
/*
select DocCode,ChID,OurID,DocID,IntDocID,DocDate,DocTime,StockID,CRID,CompID,EmpID,OperID,
	Notes,StateCode,DocCreateTime,DeskCode,Visitors,
	CodeID1,CodeID2,CodeID3,CodeID4,CodeID5,
	CurrID,KursMC,TSumCC_nt,TTaxSum,TSumCC_wt,TLevySum,TRealSum,
	Discount,TPurSumCC_nt,TPurTaxSum,TPurSumCC_wt
from (
	select DocCode=11035, s.ChID, 
		s.OurID,s.DocID,s.IntDocID,s.DocDate,s.DocTime, s.StockID,s.CRID,s.CompID,s.EmpID,s.OperID, 
		s.Notes, s.StateCode, s.DocCreateTime, s.DeskCode,s.Visitors,
		s.CodeID1,s.CodeID2,s.CodeID3,s.CodeID4,s.CodeID5, 
		s.CurrID,s.KursMC,s.TSumCC_nt,s.TTaxSum,s.TSumCC_wt, s.TLevySum, s.TRealSum,
		s.Discount, s.TPurSumCC_nt,s.TPurTaxSum,s.TPurSumCC_wt
	from t_Sale s where DocDate between @BDate and @EDate
	union all
	select DocCode=11004, crr.ChID, 
		crr.OurID,crr.DocID,crr.IntDocID,crr.DocDate,crr.DocTime, crr.StockID,crr.CRID,crr.CompID,crr.EmpID,crr.OperID, 
		crr.Notes, crr.StateCode, DocCreateTime=NULL, DeskCode=NULL,Visitors=NULL,
		crr.CodeID1,crr.CodeID2,crr.CodeID3,crr.CodeID4,crr.CodeID5, 
		crr.CurrID,crr.KursMC,crr.TSumCC_nt,crr.TTaxSum,crr.TSumCC_wt, crr.TLevySum, crr.TRealSum,
		crr.Discount, TPurSumCC_nt=NULL,TPurTaxSum=NULL,TPurSumCC_wt=NULL
	from t_CRRet crr where DocDate between @BDate and @EDate
) m
*/