module.exports.id=module.id;
module.exports.changeLog = [
    { changeID:"ir_EmpStockForExc__1", changeDatetime:"2019-11-17 17:50:00", changeObj:"ir_EmpStockForExc",
        changeVal:"CREATE TABLE dbo.ir_EmpStockForExc(\n"+
            "   EmpID int NOT NULL,\n"+
            "   StockID int NOT NULL,\n"+
            "   CONSTRAINT IFK_ir_EmpStockForExc_EmpID FOREIGN KEY(EmpID) REFERENCES r_Emps(EmpID) ON DELETE CASCADE ON UPDATE CASCADE,\n"+
            "   CONSTRAINT IFK_ir_EmpStockForExc_StockID FOREIGN KEY(StockID) REFERENCES r_Stocks(StockID) ON DELETE CASCADE ON UPDATE CASCADE\n"+
            ") ON [PRIMARY]",
        tableName:"ir_EmpStockForExc", idField:"UserID",
        fields:["EmpID","StockID"]
    }
];
