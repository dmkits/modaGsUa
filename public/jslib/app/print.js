/**
 * Created by dmkits on 30.12.16.
 */
define(["app/dialogs"],
    function (dialogs) {
        return {
            /**
             * params = { prodTagsContentData, pageProdTagType,
              *     priceItemName }
             */
            openPagePrintProductsTags: function (params) {
                if (!params) return;
                var length = params.prodTagsContentData.length;
                var qty = 0;
                for (var i = 0; i < length; i++) {
                   var item=params.prodTagsContentData[i];
                    if (item["QTY"] === undefined) {
                        qty = qty + 1;
                        continue;
                    }
                    qty = qty + item["QTY"];
                }
                if (qty > 1000) {
                    dialogs.impossibleToPrintTagsDialog();
                } else if (qty > 100) {
                    dialogs.printTagsDialog(function () {
                        openPrintPage();
                    });
                } else openPrintPage();

                function openPrintPage() {
                    var printWindow = window.open("/print/printTags");
                    printWindow["prodTagsContentData"] = params.prodTagsContentData;
                    printWindow["pageProdTagType"] = params.pageProdTagType;
                    printWindow["prodTagsContentPriceItemName"] = params.priceItemName;
                }
            }
        }
    });