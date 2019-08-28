module.exports.moduleViewURL = "/main/mainpage";
module.exports.moduleViewPath = "main/mainpage.html";

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    nextValidateModuleCallback();
};

module.exports.init = function(app){

};