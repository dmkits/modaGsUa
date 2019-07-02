var server= require("../server"), appConfig= server.getAppConfig();

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    nextValidateModuleCallback();
};

module.exports.init = function(app){
    app.get("/print/printDocSimpleTable", function (req, res) {
        var icon32x32=(appConfig['icon32x32']||"/icons/modaua32x32.ico"),
            title=((appConfig.title)?appConfig.title:"")+" Print document";
        res.render(appViewsPath+"print/printDocSimpleTable.ejs",{icon:icon32x32, title:title});
    });
    app.get("/print/printProductsTags", function (req, res) {
        res.sendFile(appViewsPath+"print/printProductsTags.html");
    });
    app.get("/print/productTag40x25", function (req, res) {
        res.sendFile(appViewsPath+"print/productTag40x25.html");
    });
    app.get("/print/productTag58x30", function (req, res) {
        res.sendFile(appViewsPath+"print/productTag58x30.html");
    });
    //app.get("/print/productTag58x40", function (req, res) {
    //    res.sendFile(appViewsPath+"print/productTag58x40.html");
    //});
    app.get("/print/tag40x25price", function (req, res) {
        res.sendFile(appViewsPath+"print/tag40x25price.html");
    });
};
