module.exports.id=module.id;
module.exports.modelData = { queryName:"queryProdMove",
    query:"select OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum,BQty,Qty,TQty\n"+
        "   from (\n"+
        "       select OurID,StockID,ProdID,DocCode=0,DocDate=@BDate,OperType=null,OperSNum=null,BQty=SUM(Qty),Qty=null,TQty=null --,SUM(AccQty)\n"+
        "       from iv_JProdOperations jpo\n"+
        "       where jpo.DocDate<@BDate\n"+
        "       group by OurID,StockID,ProdID\n"+
        "       union all\n"+
        "       select OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum,BQty=null,Qty=SUM(Qty),TQty=null --,SUM(AccQty)\n"+
        "       from iv_JProdOperations jpo\n"+
        "       where jpo.DocDate between @BDate and @EDate\n"+
        "       group by OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum\n"+
        "       union all\n"+
        "       select OurID,StockID,ProdID,DocCode=0,DocDate=@EDate,OperType=null,OperSNum=null,BQty=null,Qty=null,TQty=SUM(Qty) --,SUM(AccQty)\n"+
        "       from iv_JProdOperations jpo\n"+
        "       where jpo.DocDate<=@EDate\n"+
        "       group by OurID,StockID,ProdID\n"+
        "   ) m\n"+
        "   group by OurID,StockID,ProdID,DocCode,DocDate,OperType,OperSNum,BQty,Qty,TQty\n",
        /*   order by ProdID, OurID,StockID
               CASE When BQty is Not NULL Then 0 When Qty is Not NULL Then 1 Else 2 END
               DocDate,OperType desc,OperSNum,DocCode
        */
    queryParameters:["@BDate","@EDate"],
    fields:["OurID","StockID","ProdID","DocCode","DocDate","OperType","OperSNum","BQty","Qty","TQty"]
};
