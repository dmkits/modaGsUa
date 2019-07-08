/*
select * from z_ReplicaPubs order by ReplicaPubCode
--100000003	SrvDocs->cashbox1	0	Сервер документы -> Касса 1 магазин 1
select * from z_ReplicaTables where ReplicaPubCode=100000003
*/
/*
--@ChID,@SrcPosID,@ProdID,@PPID,@UM,@Qty,@PriceCC_nt,@SumCC_nt,@Tax,@TaxSum,@PriceCC_wt,@SumCC_wt,@BarCode,@SecID,@NewSecID
--ChID,SrcPosID,ProdID,PPID,UM,Qty,PriceCC_nt,SumCC_nt,Tax,TaxSum,PriceCC_wt,SumCC_wt,BarCode,SecID,NewSecID
select * from z_Fields where TableCode=11021002 order by FieldPosID

--delete from z_ReplicaFields

insert into z_ReplicaFields(ReplicaPubCode,TableCode,FieldPosID,FieldName)
select rp.ReplicaPubCode,f.TableCode,f.FieldPosID,f.FieldName
from z_Fields f,z_ReplicaPubs rp where f.TableCode=11021002 and rp.ReplicaPubCode>=100000003 and FieldPosID<=15

select * from z_ReplicaFields where TableCode=11021002 and ReplicaPubCode=100000003 order by FieldPosID
select * from z_ReplicaFields where TableCode=11021002 order by ReplicaPubCode,FieldPosID
*/
/*
insert into z_ReplicaFields(ReplicaPubCode,TableCode,FieldPosID,FieldName)
select rp.ReplicaPubCode,f.TableCode,f.FieldPosID,f.FieldName
from z_Fields f,z_ReplicaPubs rp where f.TableCode=11021002 and rp.ReplicaPubCode>=100000003 and FieldPosID>15

select * from z_ReplicaFields where TableCode=11021002 and ReplicaPubCode=100000003 order by FieldPosID
*/
select * from z_ReplicaPubs where ReplicaPubCode=100000082
--100000082	SrvDocs->cashbox80	0	Сервер документы -> Касса 80 магазин 80 склад 85 Склад магазина 80 Multisport
insert into z_ReplicaFields(ReplicaPubCode,TableCode,FieldPosID,FieldName)
select rp.ReplicaPubCode,f.TableCode,f.FieldPosID,f.FieldName
from z_Fields f,z_ReplicaPubs rp where f.TableCode=11021002 and rp.ReplicaPubCode>=100000082 and FieldPosID>15
go
select * from z_ReplicaFields where TableCode=11021002 and ReplicaPubCode=100000082 order by FieldPosID

