var body=document.body;if(body) body.style.display="none";

window.$app= function(arg){
    if(arg&&typeof(arg)=="object"){
        for(var p in arg) window.$$[p]=arg[p]
    }
};

window.log= function(){};
window.$app.dev= function(on){
    if(!on||!window.console||!console.log){ window.log= function(){}; return; }
    window.log= Function.prototype.bind.call(console.log,console);
};
window.$app.debug=window.$app.dev;

$app._loadScript=function(parent,src,attributes,onload){
    if(!parent)return;
    var script = document.createElement('script');
    script.type = "text/javascript";script.src = $app.baseURI+src; script.async = true;
    if(attributes) for(var aName in attributes) script.setAttribute(aName,attributes[aName]);
    script.onload=onload;
    script.onreadystatechange= function(){//for IE8
        var self = this;
        if(this.readyState=="complete"||this.readyState=="loaded") setTimeout(function(){ self.onload() },0);
    };
    parent.appendChild(script);
};
$app._runScript=function(parent,scriptText){
    if(!parent)return;
    var script = document.createElement('script');
    script.type = "text/javascript";script.text = scriptText; script.async = true;
    parent.appendChild(script);
};
$app._loadCSS=function(parent,href){
    if(!parent)return;
    var link = document.createElement('link');
    link.rel = "stylesheet";link.media = "screen";link.href = href;
    parent.appendChild(link);
};
$app._loadLibCSS=function(parent,href){
    $app._loadCSS(parent,$app.baseURI+href)
};

$app.baseURI=document.currentScript.attributes.src.value.replace("dojoApp.js","");
$app.$parentNode=document.currentScript.parentNode;
$app.$handsontable=document.currentScript.getAttribute("handsontable");
$app.$htableStyle=document.currentScript.getAttribute("htableStyle");
$app._loadHTable= function(parentNode, callback){
    if(!$app.$handsontable&&callback){ callback();return; }
    $app._loadScript($app.$parentNode,$app.$handsontable+"/handsontable.full.min.js",{},
        function(){
            $app._loadLibCSS($app.$parentNode,$app.$handsontable+"/handsontable.full.min.css");
            if($app.$htableStyle) $app._loadCSS($app.$parentNode,$app.$htableStyle);
            $app._loadScript($app.$parentNode,$app.$handsontable+"/numbro/languages/ru-RU.min.js");
            if(callback)callback();
        });
};

$app.startup= function(pageTagID,pageScript){
    var body=document.body;
    if(body) body.style.display="none";
    if(document.body.classList.length==0) document.body.setAttribute("class","claro");
    $app.dojoTheme=document.body.classList[0];
    $app._loadHTable($app.parentNode,function(){
        $app._loadLibCSS($app.$parentNode,"dijit/themes/"+$app.dojoTheme+"/"+$app.dojoTheme+".css");
        $app._loadScript($app.$parentNode,"/dojo/dojo.js",{"data-dojo-config":"async:true,parseOnLoad:false"},
            function(){
                window.$$={};
                var appHTableModules=
                    (window.Handsontable)?["app/hTableSimple","app/hTableSimpleFiltered","app/tDocSimpleTable","app/hTableEditable","app/tDocSimpleTableEdt","app/tDocStdTable"]:[];
                require(["dijit/registry","dojo/ready","app/dialogs","app/request","app/Page","app/InnerPage"].concat(appHTableModules),
                    function (registry,ready,dialogs,request){
                        window.$$.dialogs= dialogs;
                        window.$$.request= request;
                        ready(function(){
                            var pageID=(pageTagID)?pageTagID.toString().replace("#",""):pageTagID;          //log("$app.startup dojo/ready pageID=",pageID);//!!!IT'S FOR TESTING!!!
                            if(body) body.style.display="";
                            var page=new window.Page({id:pageID},pageID);                                   log("$app.startup dojo/ready pageID=",pageID,page);//!!!IT'S FOR TESTING!!!
                            page.startup();
                            if(!pageScript)return;
                            $$=page.$page;
                            page.$page.startup=pageScript;
                            page.$page.startup(page);
                        });
                    });
            });
    });
};
