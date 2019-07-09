
var Debugger = function(gState, klass) {

    this.debug = {}

    if (gState && klass.isDebug) {
        for (var m in console)
            if (typeof console[m] == 'function')
                this.debug[m] = console[m].bind(window.console, klass.toString()+": ")
    }else{
        for (var m in console)
            if (typeof console[m] == 'function')
                this.debug[m] = function(){}
    }
    return this.debug
}

isDebug = true //global debug state

debug = Debugger(isDebug, this)

debug.log('Hello log!')
debug.trace('Hello trace!')



log = function(){
    if(!window.console||!console.log)return function(){};
    return Function.prototype.bind.call(console.log, console);
}();
log('Hello log!');
log('Hello trace!',2,this)
