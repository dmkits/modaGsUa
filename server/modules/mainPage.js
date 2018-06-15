module.exports.modulePageURL = "/main/mainpage";
module.exports.modulePagePath = "main/mainpage.html";

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    nextValidateModuleCallback();
};

module.exports.init = function(app){

};