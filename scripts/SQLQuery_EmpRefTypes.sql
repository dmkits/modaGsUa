use GMSSample38btkGsua
go
update r_UniTypes set RefTypeName='Справочник должностей служащих',Notes='Должности для доступа к web-отчетам moda.GS.UA (cashier,manager)' where RefTypeID=10606
select * from r_UniTypes where RefTypeID=10606


insert into r_Uni(RefTypeID,RefID,RefName,Notes)values(10606,'-1','сисадмин','sysadmin')
update r_Uni set RefName='Учредитель',Notes='' where RefTypeID=10606 and RefID=1
update r_Uni set RefName='Директор',Notes='' where RefTypeID=10606 and RefID=2
update r_Uni set RefName='Менеджер',Notes='manager' where RefTypeID=10606 and RefID=3
update r_Uni set RefName='Кассир',Notes='cashier' where RefTypeID=10606 and RefID=4
select * from r_Uni where RefTypeID=10606

update r_Emps set ShiftPostID=-1 where EmpID=0
select EmpID,EmpName,Notes,ShiftPostID from r_Emps order by EmpID
