module.exports.id=module.id;
module.exports.changeLog = [
    { changeID:"ir_UserRoles__1", changeDatetime:"2019-12-25 18:05:00", changeObj:"ir_UserRoles",
        changeVal:"CREATE TABLE ir_UserRoles(" +
            "   UserRoleID int NOT NULL PRIMARY KEY," +
            "   UserRoleAlias varchar(64) NOT NULL, " +
            "   UserRoleName varchar(200) NOT NULL, " +
            "   Notes varchar(200) NOT NULL) ",
        tableName:"ir_UserRoles", fields:["UserRoleID","UserRoleAlias","UserRoleName","Notes"] , idField:"UserRoleID"},
    {changeID:"ir_UserRoles__2", changeDatetime:"2019-12-26 18:15:00", changeObj:"ir_UserRoles",
        changeVal:"insert into ir_UserRoles(UserRoleID,UserRoleAlias,UserRoleName,Notes)values(-1,'sysadmin','Системный администратор','sysadmin')"},
    {changeID:"ir_UserRoles__3", changeDatetime:"2019-12-26 18:16:00", changeObj:"ir_UserRoles",
        changeVal:"insert into ir_UserRoles(UserRoleID,UserRoleAlias,UserRoleName,Notes)values(1,'director','Директор','Директор (владелец)')"},
    {changeID:"ir_UserRoles__4", changeDatetime:"2019-12-26 18:17:00", changeObj:"ir_UserRoles",
        changeVal:"insert into ir_UserRoles(UserRoleID,UserRoleAlias,UserRoleName,Notes)values(2,'buhgalter','Бухгалтер','Бухгалтер (учет)')"},
    {changeID:"ir_UserRoles__5", changeDatetime:"2019-12-26 18:18:00", changeObj:"ir_UserRoles",
        changeVal:"insert into ir_UserRoles(UserRoleID,UserRoleAlias,UserRoleName,Notes)values(3,'cashier','Кассир','Кассир (розничная торговля)')"}
];
