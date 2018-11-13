--select * from r_Users
/*
ALTER TABLE dbo.ir_UserData DROP CONSTRAINT ir_UserData_FK_UserID
ALTER TABLE dbo.ir_UserData DROP CONSTRAINT ir_UserData_FK_UserID_Unique
DROP TABLE dbo.ir_UserData
GO
*/
CREATE TABLE dbo.ir_UserData(
    UserID smallint NOT NULL,
	  PswrdNote varchar(1000),
    CONSTRAINT ir_UserData_FK_UserID FOREIGN KEY (UserID) REFERENCES r_Users(UserID),
    CONSTRAINT ir_UserData_FK_UserID_Unique UNIQUE(UserID)
);
GO
