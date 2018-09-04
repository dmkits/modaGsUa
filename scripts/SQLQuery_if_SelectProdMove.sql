USE [GMSSample38btkGsua]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER --CREATE
FUNCTION [dbo].[if_SelectProdMove](@BDate datetime, @EDate datetime)
/*  dmkits 20180904. */
RETURNS @out TABLE(OurID int, StockID int, ProdID int, DocCode int,  DocDate smalldatetime, OperType int, OperSNum int, BQty numeric(21,9), Qty numeric(21,9), EQty numeric(21,9))
AS BEGIN
	INSERT INTO @out
	select OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum,BQty,Qty,TQty
	from (
		select OurID,StockID,ProdID,DocCode=0,DocDate=null,OperType=null,OperSNum=null,BQty=SUM(Qty),Qty=null,TQty=null --,SUM(AccQty)
		from iv_JProdOperations jpo
		where jpo.DocDate<@BDate
		group by OurID,StockID,ProdID
		union all
		select OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum,BQty=null,Qty=SUM(Qty),TQty=null --,SUM(AccQty)
		from iv_JProdOperations jpo
		where jpo.DocDate between @BDate and @EDate
		group by OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum
		union all
		select OurID,StockID,ProdID,DocCode=0,DocDate=null,OperType=null,OperSNum=null,BQty=null,Qty=null,TQty=SUM(Qty) --,SUM(AccQty)
		from iv_JProdOperations jpo
		where jpo.DocDate<=@EDate
		group by OurID,StockID,ProdID
	) m
	group by OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum,BQty,Qty,TQty
	order by ProdID, OurID,StockID,
		CASE When BQty is Not NULL Then 0 When Qty is Not NULL Then 1 Else 2 END,
		DocDate,OperType desc,OperSNum,DocCode
	RETURN
END