// ****************************************************************
var mixinConventionTestManager = {
    didInitialize : false,
    initialize : function() {
        if (!this.didInitialize) {
            // Add the UI for the tests
            // Wire the tests
            testManager.setTestCases(testsToRun);
            // Generate the UI for the tests
            var buffer = '<table>' +
                '<tr><td><h2>Available Tests</h2></td><td></td></tr>' +
                '<tr><td><input onclick="testManager.runAll()" type="button" value="Run All Tests" /></td><td></td></tr>' +
                '<tr><td>Test</td><td>Status</td></tr>';
            
            for( func in this.tests) {
                if (func.toString() != 'extend' && func.toString() != 'proxy') {
                    buffer += '<tr><td><input onclick="testManager.' + func.toString() +
                        '()" type="button" value="Test ' + func.toString() +
                        '" /></td><td id="status' + func.toString() + '">Not run</td></tr>';
                }
            }
            buffer += '</table><hr />' +
                '<table border="1">' +
                '<tr><td><h2>Trace output</h2></td></tr>' +
                '<tr><td id="traceoutput"></td></tr>' +
                '</table>';
            document.getElementById("unittestoutput").innerHTML = buffer;
            setJsUnitTracer(new jsUnitTraceGenerator("traceoutput"));
            for( func in this.tests) {
                if (func.toString() != 'extend' && func.toString() != 'proxy') {
                    OpsValue.proxy(this, func.toString(),
                              new Function("toCall", "args",
                                           "this.currFunction = 'status" + func.toString() + "';" +
                                           "this._didFinish = false;" +
                                           "toCall.apply( this, args);" +
                                           "if( !this._didFinish) { this.success(); }" +
                                           "this.currFunction = '';"));
                    //"try { toCall.apply( this, args); } catch( e) { this.failed(); this.currFunction = ''; return;}" +
                }
            }
            OpsValue.proxy(this, "failed", function(toCall, args) {
                          this._didFinish = true;
                          var newArg = new Array();
                          newArg.push(this.currFunction);
                          toCall.apply(this, newArg);
                      });
            OpsValue.proxy(this, "success", function(toCall, args) {
                          this._didFinish = true;
                          var newArg = new Array();
                          newArg.push(this.currFunction);
                          toCall.apply(this, newArg);
                      });
            OpsValue.proxy(this, "waiting", function(toCall, args) {
                          this._didFinish = true;
                          var newArg = new Array();
                          newArg.push(this.currFunction);
                          toCall.apply(this, newArg);
                      });
        }
    }
}

OpsReference.mixin(testManager, mixinConventionTestManager);
var element = document.getElementById("unittestoutput");
var failed = false;
if (!element || typeof(testsToRun) == "undefined") {
    document.write("<hr>");
    if (!element) {
        document.write("Could not find an HTML element with name <i>unittestoutput</i><br />");
        document.write("Please include the script conventiontest.js after declaring the <i>unittestoutput</i> HTML element<br />");
    }
    if (typeof(testsToRun) == "undefined") {
        document.write("Could not find the declared variable <i>testsToRun</i><br />");
        document.write("Please declare <i>testsToRun</i> after declaring the <i>unittestoutput</i> HTML element<br />");
    }
    document.write("You could use the following HTML<br />");
    document.write("<pre>&lt;script language='JavaScript'&gt;<br/>");
    document.write("var testsToRun = {<br />");
    document.write("    // Start JavaScript code for test cases here</br>");
    document.write("    testPlainVanilla : function() {<br/>");
    document.write("    }<br />");
    document.write("};</br>");
    document.write("&lt;/script&gt;<br />");
    document.write("&lt;div id='unittestoutput'&gt;&lt;/div&gt;<br />");
    document.write("&lt;script language='JavaScript' src='/[location]/conventiontest.js'&gt;&lt;/script&gt;<br /></pre>");
    failed = true;
}

if (!failed) {
    testManager.initialize();
}

//''

