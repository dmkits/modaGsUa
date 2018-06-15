SELECT ISNULL(MAX(pip.PPID)+1,dbs.PPID_Start) as NewPPID 
	FROM r_DBIs dbs 
	LEFT JOIN t_PInP pip ON pip.PPID between dbs.PPID_Start and dbs.PPID_End AND pip.ProdID=24287
	WHERE dbs.DBiID = dbo.zf_Var('OT_DBiID')  GROUP BY dbs.PPID_Start, dbs.PPID_End  

select r_Prods.ProdID as ProdID,r_Prods.ProdName as ProdName,r_Prods.UM as UM,r_Prods.Article1 as Article1,r_ProdMQ.barcode as Barcode,
	r_ProdC.PCatName as PCatName,r_ProdG.PGrName as PGrName,r_ProdG2.PGrName2 as PGrName2,r_ProdG3.PGrName3 as PGrName3,r_ProdG1.PGrName1 as PGrName1,
	CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END as ColorName,
	CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END as SizeName from r_Prods 
inner join r_ProdC on r_ProdC.PCatID=r_Prods.PCatID 
inner join r_ProdG on r_ProdG.PGrID=r_Prods.PGrID 
inner join r_ProdG2 on r_ProdG2.PGrID2=r_Prods.PGrID2 
inner join r_ProdG3 on r_ProdG3.PGrID3=r_Prods.PGrID3 
inner join r_ProdG1 on r_ProdG1.PGrID1=r_Prods.PGrID1 
inner join ir_ProdColors on ir_ProdColors.ColorID=r_Prods.ColorID inner join ir_ProdSizes on ir_ProdSizes.SizeName=r_Prods.SizeName 
inner join r_ProdMQ on r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM 
where r_Prods.ProdName='Potyll 1   (260)'
select * from r_Prods where ProdName='Potyll 1   (260)'

--delete p from r_Prods p left join r_ProdMQ pmq on pmq.ProdID=p.ProdID where pmq.Barcode is NULL
--delete from t_PInP where ProdID in (24286,24287)
--delete p from r_Prods p where p.ProdID in (24287,24287)
select r_Prods.ProdID as ProdID,'|'+r_Prods.ProdName+'|' as ProdName,r_Prods.UM as UM,r_Prods.Article1 as Article1,r_ProdMQ.barcode as Barcode
	,pip.PPID, pip.ProdDate, pip.ProdPPDate, pip.PriceCC_In, pip.CostCC, pip.CompID, pip.Article, pip.CurrID, pip.Priority, pip.PPWeight, pip.PPDesc
	--,r_ProdC.PCatName as PCatName,r_ProdG.PGrName as PGrName,r_ProdG2.PGrName2 as PGrName2,r_ProdG3.PGrName3 as PGrName3,r_ProdG1.PGrName1 as PGrName1
	--,CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END as ColorName
	--,ir_ProdSizes.SizeName as SizeName 
from r_Prods 
left join r_ProdMQ on r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM 
left join t_PInP pip on pip.ProdID=r_Prods.ProdID and pip.PPID=0
left join r_ProdC on r_ProdC.PCatID=r_Prods.PCatID 
left join r_ProdG on r_ProdG.PGrID=r_Prods.PGrID 
left join r_ProdG2 on r_ProdG2.PGrID2=r_Prods.PGrID2 
left join r_ProdG3 on r_ProdG3.PGrID3=r_Prods.PGrID3 
left join r_ProdG1 on r_ProdG1.PGrID1=r_Prods.PGrID1 
left join ir_ProdColors on ir_ProdColors.ColorID=r_Prods.ColorID 
left join ir_ProdSizes on ir_ProdSizes.SizeName=r_Prods.SizeName --where r_Prods.Article1='$1193-123'--'A389 Benzair'
order by r_Prods.ProdID desc
/*
select r_Prods.ProdID as ProdID,'|'+r_Prods.ProdName+'|' as ProdName,r_Prods.UM as UM,r_Prods.Article1 as Article1,r_ProdMQ.barcode as Barcode,
	r_ProdC.PCatName as PCatName,r_ProdG.PGrName as PGrName,r_ProdG2.PGrName2 as PGrName2,r_ProdG3.PGrName3 as PGrName3,r_ProdG1.PGrName1 as PGrName1,
	CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END as ColorName,
	ir_ProdSizes.SizeName as SizeName 
from r_Prods 
inner join r_ProdMQ on r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM 
inner join r_ProdC on r_ProdC.PCatID=r_Prods.PCatID 
inner join r_ProdG on r_ProdG.PGrID=r_Prods.PGrID 
inner join r_ProdG2 on r_ProdG2.PGrID2=r_Prods.PGrID2 
inner join r_ProdG3 on r_ProdG3.PGrID3=r_Prods.PGrID3 
inner join r_ProdG1 on r_ProdG1.PGrID1=r_Prods.PGrID1 
inner join ir_ProdColors on ir_ProdColors.ColorID=r_Prods.ColorID 
inner join ir_ProdSizes on ir_ProdSizes.SizeName=r_Prods.SizeName --where r_Prods.Article1='$1193-123'--'A389 Benzair'
*/
/*
select * from r_ProdMQ
select * from r_Prods where Article1 like '%A389 Benzair%'

select * from r_Prods where Article1='$1193-123'--'$1193-123'

select * from ir_ProdSizes

select '|'+Article1+'|' from r_Prods group by Article1 
select '|'+Article1+'|' from r_Prods where Article1 like '%  %' group by Article1

select r_Prods.ProdID as ProdID,r_Prods.ProdName as ProdName,r_Prods.UM as UM,r_Prods.Article1 as Article1,r_ProdMQ.barcode as Barcode,r_ProdC.PCatName as PCatName,r_ProdG.PGrName as PGrName,r_ProdG2.PGrName2 as PGrName2,r_ProdG3.PGrName3 as PGrName3,r_ProdG1.PGrName1 as PGrName1,CASE When ir_ProdColors.ColorID>0 Then ir_ProdColors.ColorName Else '' END as ColorName,CASE When ir_ProdSizes.ChID>100000001 Then ir_ProdSizes.SizeName Else '' END as SizeName from r_Prods inner join r_ProdMQ on r_Prods.ProdID=r_ProdMQ.ProdID and r_Prods.UM=r_ProdMQ.UM inner join r_ProdC on r_ProdC.PCatID=r_Prods.PCatID inner join r_ProdG on r_ProdG.PGrID=r_Prods.PGrID inner join r_ProdG2 on r_ProdG2.PGrID2=r_Prods.PGrID2 inner join r_ProdG3 on r_ProdG3.PGrID3=r_Prods.PGrID3 inner join r_ProdG1 on r_ProdG1.PGrID1=r_Prods.PGrID1 inner join ir_ProdColors on ir_ProdColors.ColorID=r_Prods.ColorID inner join ir_ProdSizes on ir_ProdSizes.SizeName=r_Prods.SizeName where r_Prods.ProdName='Jonesitt “ÛÙÎ≥   ($1193-123)'
select * from r_Prods where ProdName='Jonesitt “ÛÙÎ≥   ($1193-123)'
--|Jonesitt “ÛÙÎ≥    ($1193-123)|
-- Jonesitt “ÛÙÎ≥   ($1193-123)
*/

--select * from r_DBIs