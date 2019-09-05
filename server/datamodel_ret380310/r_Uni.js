module.exports.id=module.id;
module.exports.modelData = { tableName:"r_Uni",idField:"RefTypeID",
    fields:["RefTypeID","RefID","RefName","Notes"]
};
module.exports.changeLog = [
    {changeID:"r_Uni__1", changeDatetime:"2019-09-05 17:45:00", changeObj:"r_Uni",
        changeVal:"update r_Emps set ShiftPostID=0"},
    {changeID:"r_Uni__2", changeDatetime:"2019-09-05 17:46:00", changeObj:"r_Uni",
        changeVal:"delete from r_Uni where RefTypeID=10606 and RefID<>0"},
    {changeID:"r_Uni__3", changeDatetime:"2019-09-05 17:47:00", changeObj:"r_Uni",
        changeVal:"update r_Uni set Notes='cashier',RefName='Кассир' where RefTypeID=10606 and RefID=0"},
    {changeID:"r_Uni__4", changeDatetime:"2019-09-05 17:48:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID, RefID, RefName, Notes) values (10606, -1,'сисадмин','sysadmin');"},
    {changeID:"r_Uni__5", changeDatetime:"2019-09-05 17:49:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID, RefID, RefName, Notes) values (10606, 1,'Менеджер','manager');"},
    {changeID:"r_Uni__6", changeDatetime:"2019-09-05 17:50:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID, RefID, RefName, Notes) values (10606, 2,'Управляющий (директор)','admin');"},
    {changeID:"r_Uni__7", changeDatetime:"2019-09-05 17:51:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID,RefID,RefName,Notes) values(10606, 3,'Доставка перемещений','sendExcs')"},
    {changeID:"r_Uni__8", changeDatetime:"2019-09-05 17:52:00", changeObj:"r_Uni",
        changeVal:"update r_Emps set ShiftPostID=-1 where EmpID in (0,1)"}
];