module.exports.id=module.id;
module.exports.changeLog = [
    { changeID:"ir_UserData__1", changeDatetime:"2018-11-13 18:51:00", changeObj:"ir_UserData",
        changeVal:"CREATE TABLE dbo.ir_UserData(\n"+
            "UserID smallint NOT NULL,\n"+
            "PswrdNote varchar(1000),\n"+
            "CONSTRAINT ir_UserData_FK_UserID FOREIGN KEY (UserID) REFERENCES r_Users(UserID),\n"+
            "CONSTRAINT ir_UserData_FK_UserID_Unique UNIQUE(UserID))",
        tableName:"ir_UserData", id:"UserID",
        fields:["UserID","PswrdNote"]
    }
];
