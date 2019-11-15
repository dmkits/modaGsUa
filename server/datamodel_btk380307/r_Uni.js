module.exports.id=module.id;
module.exports.modelData = { tableName:"r_Uni",idField:"RefTypeID",
    fields:["RefTypeID","RefID","RefName","Notes"]
};
module.exports.changeLog = [
    {changeID:"r_Uni__1", changeDatetime:"2019-07-07 17:30:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID,RefID,RefName,Notes)values(10606,3,'Доставка перемещений','sendExcs')"},
    {changeID:"r_Uni__2", changeDatetime:"2019-11-15 11:25:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID,RefID,RefName,Notes)values(10606,4,'Перемещение со склада','excFromStock')"},
    {changeID:"r_Uni__3", changeDatetime:"2019-11-15 15:47:00", changeObj:"r_Uni",
        changeVal:"update r_Uni set Notes='excDelivery' where RefTypeID=10606 and RefID=3 and RefName='Доставка перемещений' and Notes='sendExcs'"}
];
