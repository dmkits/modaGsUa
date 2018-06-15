--select * from t_RecD where ProdID in (1073)
/*
SELECT ISNULL(MAX(pip.PPID)+1,dbs.DocID_Start) as NewDocID 
            FROM r_DBIs dbs 
            LEFT JOIN t_PInP pip ON pip.PPID between dbs.PPID_Start and dbs.PPID_End 
            WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') AND pip.ProdID=1073
            GROUP BY dbs.DocID_Start, dbs.DocID_End
*/
/*
select *
		--,GMS_DBVersion,OT_DBiID,t_OurID,t_OneOur,OT_MainOurID,z_CurrMC,z_CurrCC, 
		--t_StockID,t_OneStock,it_MainStockID,t_SecID,DefaultUM
	from z_Vars

select GMS_DBVersion=dbo.zf_Var('GMS_DBVersion'),OT_DBiID=dbo.zf_Var('OT_DBiID'),
	t_OurID=dbo.zf_Var('t_OurID'),t_OneOur=dbo.zf_Var('t_OneOur'),OT_MainOurID=dbo.zf_Var('OT_MainOurID'),
	z_CurrMC=dbo.zf_Var('z_CurrMC'),z_CurrCC=dbo.zf_Var('z_CurrCC'),
	t_StockID=dbo.zf_Var('t_StockID'),t_OneStock=dbo.zf_Var('t_OneStock'),it_MainStockID=dbo.zf_Var('it_MainStockID'),
	t_SecID=dbo.zf_Var('t_SecID'),DefaultUM=dbo.zf_Var('DefaultUM')
*/
--select * from t_RecD
/*
insert into t_RecD(ChID,SrcPosID,ProdID,Barcode,UM,PPID,SecID,Qty,PriceCC_nt,SumCC_nt,Tax,TaxSum,PriceCC_wt,SumCC_wt,CostCC,CostSum,Extra,PriceCC) 
values(100000742,1,1004,'2900000010048','רע.',18,1,1,0,0,0,0,0,0,0,0,0,0)
*/
/*
select * from r_States

select CurrID, CurrName, dbo.zf_GetRateCC(CurrID) as RateCC, dbo.zf_GetRateMC(CurrID) as RateMC
	from r_Currs
	order by CurrID

--select * from r_DBIs
SELECT dbs.ChID_Start, dbs.ChID_End, ISNULL(MAX(r.ChID),dbs.ChID_Start)
	FROM r_DBIs dbs, t_Rec r
	WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') and r.ChID between dbs.ChID_Start and dbs.ChID_End
	GROUP BY dbs.ChID_Start, dbs.ChID_End
SELECT dbs.DocID_Start, dbs.DocID_End, ISNULL(MAX(r.DocID),dbs.DocID_Start)
	FROM r_DBIs dbs, t_Rec r
	WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') and r.DocID between dbs.DocID_Start and dbs.DocID_End
	GROUP BY dbs.DocID_Start, dbs.DocID_End

select * from t_Rec
select * from t_Ret

SELECT dbs.ChID_Start, dbs.ChID_End, ISNULL(MAX(r.ChID),dbs.ChID_Start)
	FROM r_DBIs dbs
	LEFT JOIN t_Ret r ON r.ChID between dbs.ChID_Start and dbs.ChID_End
	WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID') 
	GROUP BY dbs.ChID_Start, dbs.ChID_End
*/