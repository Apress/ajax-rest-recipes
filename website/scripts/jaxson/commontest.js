window.onerror = function(msg, page, linecount) {
    globals.info("onerrror", "arg count=" + arguments.length + " " + arguments.toString());
    globals.info("onerror{argument[ 0]}", arguments[0].toString());
    globals.info("onerror{argument[ 1]}", arguments[1].toString());
    globals.info("onerror{argument[ 2]}", arguments[2].toString());
    return true;
}

function jsUnitTraceGenerator(outputElement) {
    this.outputElement = outputElement;
}

function jsUnitTraceGenerator_Warn(param1, param2) {
    var msg = document.getElementById(this.outputElement).innerHTML;
    msg += "<b>Warn</b>:";
    if (param1 != null) {
        msg += "<i>" + param1.toString() + "</i> ";
    }
    if (param2 != null) {
        msg += param2.toString();
    }
    msg += "<br />";
    document.getElementById(this.outputElement).innerHTML = msg;
}

function jsUnitTraceGenerator_Inform(param1, param2) {
    var msg = document.getElementById(this.outputElement).innerHTML;
    msg += "Info:";
    if (param1 != null) {
        msg += "<i>" + param1.toString() + "</i> ";
    }
    if (param2 != null) {
        msg += param2.toString();
    }
    msg += "<br/>";
    document.getElementById(this.outputElement).innerHTML = msg;
}

function jsUnitTraceGenerator_Debug(param1, param2) {
    var msg = document.getElementById(this.outputElement).innerHTML;
    msg += "Debug:";
    if (param1 != null) {
        msg += "<i>" + param1.toString() + "</i> ";
    }
    if (param2 != null) {
        msg += param2.toString();
    }
    msg += "<br/>";
    document.getElementById(this.outputElement).innerHTML = msg;
}

jsUnitTraceGenerator.prototype.warn = jsUnitTraceGenerator_Warn;
jsUnitTraceGenerator.prototype.inform = jsUnitTraceGenerator_Inform;
jsUnitTraceGenerator.prototype.debug = jsUnitTraceGenerator_Debug;

globals.error = function(e) {
    var msg;
    if (e.isJsUnitException) {
        msg = "JSUnitException(<b>" + e.comment + "</b>:" + e.jsUnitMessage + "</b>)";
    }
    else {
        msg = (e.message) ? e.message : e.description;
        msg = "General error (<b>" + msg + "</b>)";
    }
    warn(msg);
    throw e;
}

globals.info = function(area, msg) {
    info(area, msg);
}

function TestManager() {
    this.isRunning = false;
    this.tests = null;
}

TestManager.prototype.runTest = function(event, callback) {
    //try {
    this.isRunning = true;
    if (event) {
        callback(event);
    }
    else {
        callback();
    }
    //}
    //catch( e) {
    //    globals.error(e);
    //    throw e;
    //}
}

TestManager.prototype.success = function(element) {
    document.getElementById(element).innerHTML = "success";
    testManager.isRunning = false;
}

TestManager.prototype.failed = function(element) {
    document.getElementById(element).innerHTML = "failed";
    this.isRunning = false;
}

TestManager.prototype.waiting = function(element) {
    document.getElementById(element).innerHTML = "waiting";
    this.isRunning = false;
}

TestManager.prototype.setTestCases = function(tests) {
    this.tests = tests;
    this.isRunning = false;
    for ( func in tests) {
        var buffer =
            "TestManager.prototype." + func.toString() + " = function ( event) {"
            + "  if( ! this.isRunning) { "
            + "      info(\"" + func.toString() + "\", \"*** Started ***\"); "
            + "      this.runTest( event, this.tests[ \"" + func.toString() + "\"]);"
            + "  }"
            + "}";
        eval(buffer);
    }
}

TestManager.prototype.runAll = function() {
    this.testIndex = 0;
    this.maxTests = 0;
    for ( func in this.tests) {
        this.maxTests ++;
    }
    RunPeriodicTests();
}

var testManager = new TestManager();

function RunPeriodicTests() {
    var counter = 0;
    for( func in testManager.tests) {
        if (counter == testManager.testIndex) {
            if (! testManager.isRunning) {
                testManager.testIndex ++;
                testManager[func.toString()]();
                break;
            }
        }
        counter ++;
    }
    if (testManager.testIndex < testManager.maxTests) {
        window.setTimeout("RunPeriodicTests()", 1000);
    }
}

function AssignParentChildCallbacks(childWindow) {
    if (typeof(childWindow["globals"]) == "undefined") {
        info("AssignParentChildCallbacks", "Childwindow does not have a globals");
    }
    else {
        childWindow.globals.info = function() {
            window.parent.globals.info.apply(window.parent.globals, arguments);
        }
        childWindow.onerror = function(msg, page, linecount) {
            window.parent.info("onerrror", "arg count=" + arguments.length + " " + arguments.toString());
            window.parent.info("onerror{argument[ 0]}", arguments[0].toString());
            window.parent.info("onerror{argument[ 1]}", arguments[1].toString());
            window.parent.info("onerror{argument[ 2]}", arguments[2].toString());
            return true;
        }
    }
}

