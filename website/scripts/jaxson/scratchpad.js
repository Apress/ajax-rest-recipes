function () {
    var origFunc = (function (tstvalue) {
        info("DefinedClass.defined", "parameter (" + tstvalue + ") arguments count (" + arguments.length + ")");
        DefinedClass.prototype.defined.value = 10;
        assertEquals(tstvalue, this.value);
    });
    var proxyFunc = (function (tstValue, toCall, args) {
        globals.info("proxyfunction1", "parameter (" + tstValue + ") received arg count (" + arguments.length + ") original arg count (" + args.length + ")");
        toCall.apply(this, args);
    });
    var args = new Array(); for (var c1 = 0; c1 < arguments.length; c1++) {
        args.push(arguments[0]);
    }
    args.push(origFunc);
    args.push(arguments);
    return proxyFunc.apply(this, args);
}

function () {
    var origFunc = (function () {
        var origFunc = (function (tstvalue) {
            info("DefinedClass.defined", "parameter (" + tstvalue + ") arguments count (" + arguments.length + ")");
            DefinedClass.prototype.defined.value = 10;
            assertEquals(tstvalue, this.value);
        });
        var proxyFunc = (function (tstValue, toCall, args) {
            globals.info("proxyfunction1", "parameter (" + tstValue + ") received arg count (" + arguments.length + ") original arg count (" + args.length + ")");
            toCall.apply(this, args);
        });
        var args = new Array();for (var c1 = 0; c1 < arguments.length; c1++) {
            args.push(arguments[0]);
        }
        args.push(origFunc);
        args.push(arguments);
        return proxyFunc.apply(this, args);
    });
    var proxyFunc = (function (tstValue, toCall, args) {
        globals.info("proxyfunction2", "parameter (" + tstValue + ") received arg count (" + arguments.length + ") original arg count (" + args.length + ")");
        toCall.apply(this, args);
    });
    var args = new Array(); for (var c1 = 0; c1 < arguments.length; c1++) {
        args.push(arguments[0]);
    }
    args.push(origFunc);
    args.push(arguments);
    return proxyFunc.apply(this, args);
}

function () {
    var args = new Array(); for (var c1 = 0; c1 < arguments.length; c1++) {
        args.push(arguments[c1]);
    }
    args.push(orig);
    args.push(arguments);
    proxy_function.apply(this, args);
}
