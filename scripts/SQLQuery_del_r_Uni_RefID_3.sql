--update r_Uni set RefID=RefID+1 where RefTypeID=10606 and RefID>=3
--delete from r_Uni where RefTypeID=10606 and RefID=3
select * from r_Uni where RefTypeID=10606