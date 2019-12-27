module.exports.id=module.id;
module.exports.modelData = { tableName:"r_Emps",idField:"ChID",
    fields:["ChID","EmpID","EmpName","UAEmpName","EmpLastName","EmpFirstName","EmpParName","UAEmpLastName","UAEmpFirstName","UAEmpParName","EmpInitials","UAEmpInitials",
        "TaxCode","EmpSex","BirthDay","File1","File2","File3","Education","IhecID","EduID","FamilyStatus","BirthPlace",
        "Phone","InPhone","Mobile","EMail","Percent1","Percent2","Percent3","Notes",
        "MilStatus","MilFitness","MilRank","MilSpecialCalc","MilProfes","MilCalcGrp","MilCalcCat","MilStaff","MilRegOffice","MilNum",
        "PassNo","PassSer","PassDate","PassDept","DisNum","PensNum","WorkBookNo","WorkBookSer","PerFileNo","InStopList"]
};
module.exports.changeLog = [
    { changeID:"r_Emps__1", changeDatetime:"2019-12-26 18:30:00", changeObj:"r_Emps",
        changeVal:"ALTER TABLE r_Emps ADD UserRoleID int",
        field:"UserRoleID"},
    { changeID:"r_Emps__2", changeDatetime:"2019-12-26 18:31:00", changeObj:"r_Emps",
        changeVal:"update r_Emps set UserRoleID=-1 where EmpID=0"},
    { changeID:"r_Emps__3", changeDatetime:"2019-12-26 18:32:00", changeObj:"r_Emps",
        changeVal:"update r_Emps set UserRoleID=3 where EmpID=1"},
    { changeID:"r_Emps__4", changeDatetime:"2019-12-26 18:33:00", changeObj:"r_Emps",
        changeVal:"ALTER TABLE r_Emps ALTER COLUMN UserRoleID int NOT NULL"},
    { changeID:"r_Emps__5", changeDatetime:"2019-12-26 18:34:00", changeObj:"r_Emps",
        changeVal:"ALTER TABLE r_Emps ADD CONSTRAINT FK_r_Emps_UserRoleID FOREIGN KEY(UserRoleID) REFERENCES ir_UserRoles(UserRoleID)"}
];
