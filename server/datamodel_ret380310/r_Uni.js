module.exports.id=module.id;
module.exports.modelData = { tableName:"r_Uni",idField:"RefTypeID",
    fields:["RefTypeID","RefID","RefName","Notes"]
};
module.exports.changeLog = [
    {changeID:"r_Uni__1", changeDatetime:"2019-07-07 17:30:00", changeObj:"r_Uni",
        changeVal:"insert into r_Uni(RefTypeID,RefID,RefName,Notes)values(10606,3,'Доставка перемещений','sendExcs')"}
];
