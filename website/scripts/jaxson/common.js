// Please note that some of the coding techniques have been copied and modified from
// prototype.js. I advise those readers who do not know about prototype.js to further
// further investigate prototype.js at the URL
// Global object that defines some common handlers and definitions
var globals = {
    state : new Object(),
    errorHandler : function(e) {
    },
    info : function( section, msg) {}
}

Navigation = {
    findChild : function(element, childid) {
        if (typeof(element) == "string") {
            return Navigation.findChild(document.getElementById(element), childid);
        }
        else {
            if (element.nodeType == 1) {
                if (element.id == childid) {
                    return element;
                }
                for (var i = 0; i < element.childNodes.length; i ++) {
                    var retval = Navigation.findChild(element.childNodes[i], childid);
                    if (retval) {
                        return retval;
                    }
                }
            }
            return null;
        }
    }
}

Helpers = {
    hide: function() {
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (typeof(arguments[i]) == "string") {
                element = document.getElementById(arguments[0]);
            }
            element.style.display = 'none';
        }
    },
    
    show: function() {
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (typeof(arguments[i]) == "string") {
                element = document.getElementById(arguments[0]);
            }
            element.style.display = '';
        }
    }
}

// ***************************
// Inspired/Copied from prototype.js
Array.prototype.each = function(iterator) {
    var index = 0;
    for( var counter = 0; counter < this.length; counter ++) {
        iterator( this[ counter]);
    }
}

var $A = Array.from = function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) {
        return iterable.toArray();
    } else {
        var results = [];
        for (var i = 0; i < iterable.length; i++)
            results.push(iterable[i]);
        return results;
    }
}

Function.prototype.bind = function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
        return __method.apply(object, args.concat($A(arguments)));
    }
}
// ***************************


function AssignMethod(instance, funcIdentifier, newFunc) {
}

function GetPrototypeObject(obj, callback) {
    if (typeof(obj.constructor) == "function") {
        var funcMatch = /function\s(.*)\(/;
        var result = obj.constructor.toString().match(funcMatch);
        if (result != null) {
            if (typeof(callback) == "function") {
                var iterobj;
                if (typeof(result[1]) == "string") {
                    eval("var prototypePropery  = " + result[1] + ".prototype;");
                    callback(prototypePropery , result[1]);
                }
            }
        }
    }
}

function Delegate() {
    this.delegates = new Array();
}

Delegate.prototype.invoke = function(parent, args) {
    for (var counter = 0; counter < this.delegates.length; counter++) {
        this.delegates[counter].apply(parent, args);
    }
}

Delegate.prototype.add = function() {
    for (var c1 = 0; c1 < arguments.length; c1 ++) {
        this.delegates.push(arguments[c1]);
    }
}

function Overloaded() {
    this.overloaded = new Array();
}

Overloaded.prototype.invoke = function(parent, args) {
    for (var counter = 0; counter < this.overloaded.length; counter++) {
        if (this.overloaded[counter].paramCount == args.length) {
            this.overloaded[counter].func.apply(parent, args);
        }
    }
}

Overloaded.prototype.add = function() {
    for (var c1 = 0; c1 < arguments.length; c1 ++) {
        this.overloaded.push({ paramCount: ParamCount(arguments[c1]), func: arguments[c1]});
    }
}

var OpsReference = {
    mixin : function(copyTo, copyFrom, forceCopy) {
        for (property in copyFrom) {
            if ((copyTo[property] && forceCopy) || !copyTo[property]) {
                copyTo[property] = copyFrom[property];
            }
        }
    },
    delegate : function(instance, funcIdentifier, newFunc) {
        if (instance[funcIdentifier] && instance[funcIdentifier].delegates) {
            instance[funcIdentifier].delegates.add(newFunc);
        }
        else {
            instance[funcIdentifier] = function() {
                var thisfunc = funcInstance;
                thisfunc.delegates.invoke(this, arguments);
            }
            var funcInstance = instance[funcIdentifier];
            funcInstance.delegates = new Delegate();
            if (arguments.length > 2) {
                for (var c1 = 2; c1 < arguments.length; c1 ++) {
                    funcInstance.delegates.add(arguments[c1]);
                }
            }
        }
    },
    overloaded : function(instance, funcIdentifier) {
        instance[funcIdentifier] = function() {
            var thisfunc = funcInstance;
            thisfunc.overloaded.invoke(this, arguments);
        }
        var funcInstance = instance[funcIdentifier];
        funcInstance.overloaded = new Overloaded();
        if (arguments.length > 2) {
            for (var c1 = 2; c1 < arguments.length; c1 ++) {
                funcInstance.overloaded.add(arguments[c1]);
            }
        }
    },
    proxy : function (obj, method_name, proxy_function) {
        var orig = obj[method_name];
        obj[method_name] = function() {
            var args = new Array();
            for (var c1 = 0; c1 < arguments.length; c1++) {
                args.push(arguments[c1]);
            }
            args.push(orig);
            args.push(arguments);
            proxy_function.apply(this, args)
        };
    }
};

// ************************************************************************
var OpsValue = {
    mixin : function(copyTo, copyFrom, forceCopy) {
        var copiedFrom = eval(OpsValue.singleSerialize(copyFrom));
        for (property in copyFrom) {
            if ((copyTo[property] && force) || !copyTo[property]) {
                copyTo[property] = copiedFrom[property];
            }
        }
    },
    proxy : function(instance, funcIdentifier, newFunc) {
        if (!instance[funcIdentifier]) {
            throw new Error("You are attempting to proxy a method that does not exist on this object (" + funcIdentifier + ")");
        }
        var proxyPrototype = function() {
            var origFunc = __orig;
            var proxyFunc = __proxy;
            var args = new Array();
            for (var c1 = 0; c1 < arguments.length; c1 ++) {
                args.push(arguments[0]);
            }
            args.push(origFunc);
            args.push(arguments);
            return proxyFunc.apply(this, args);
        }
        instance[funcIdentifier]  = Generics.expand(proxyPrototype,
                                                    {
                                                        __orig: instance[funcIdentifier],
                                                        __proxy: newFunc
                                                    });
    },
    delegate : function(instance, funcIdentifier, newFunc) {
        var delegatePrototype = function() {
            var func1 = __replace1;
            var func2 = __replace2;
            func1.apply(this, arguments);
            func2.apply(this, arguments);
        }
        var origFunc;
        if (!instance[funcIdentifier]) {
            origFunc = function() { };
        }
        else {
            origFunc = instance[funcIdentifier];
        }
        
        instance[funcIdentifier] = Generics.expand(delegatePrototype,
                                                   {
                                                       __replace1 : origFunc,
                                                       __replace2 : newFunc
                                                       
                                                   });
    },
    overloaded : function(instance, funcIdentifier, newFunc) {
        var overloadedPrototype = function() {
            var embeddedFunc = __embedded;
            var overloadedFunc = __newFunc;
            
            if (arguments.length == __paramCount) {
                overloadedFunc.apply(this, arguments);
            }
            else if (typeof(embeddedFunc) == "function") {
                embeddedFunc.apply(this, arguments);
            }
        }
        var origFunc;
        if (!instance[funcIdentifier]) {
            origFunc = function() { };
        }
        else {
            origFunc = instance[funcIdentifier];
        }
        
        instance[funcIdentifier] = Generics.expand(overloadedPrototype,
                                                   {
                                                       __embedded : origFunc,
                                                       __newFunc : newFunc,
                                                       __paramCount : ParamCount(newFunc)
                                                   });
    },
    singleSerialize : function(item) {
        switch (typeof(item)) {
            case "boolean":
                return item.toString();
            case "function":
                return item.toString();
            case "number":
                return item.toString();
                break;
            case "object":
                return OpsValue.serialize(item);
            case "string":
                return item;
        }
    },
    serialize : function(obj, callbacks) {
        var buffer = "{";
        var comma = function() {
            comma = function() {
                return ",";
            }
            return "";
        }
        var quoteProperties = "";
        var canProcessFilter = function(property, obj, propertyIdentifier) { return true; }
        var functionPropertyCallback = function(property, value, callingStack) {
        }
        var callingStack;
        if (typeof(arguments[2]) == "undefined") {
            callingStack = new Array();
            callingStack.push("cls");
        }
        else {
            callingStack = arguments[2];
        }
        if (callbacks) {
            if (callbacks.canProcessFilter) {
                canProcessFilter = callbacks.canProcessFilter;
            }
            if (callbacks.functionPropertyCallback) {
                functionPropertyCallback = callbacks.functionPropertyCallback;
            }
            if (callbacks.variablename) {
                callingStack.pop();
                callingStack.push(callbacks.variablename);
            }
            if (callbacks.quoteProperties) {
                if (callbacks.quoteProperties == true) {
                    quoteProperties = "\"";
                }
            }
        }
        for( property in obj) {
            if (canProcessFilter(obj[property], obj, property)) {
                switch (typeof(obj[property])) {
                    case "boolean":
                        buffer += comma() + quoteProperties + property + quoteProperties + ":" + object[property];
                        break;
                    case "function":
                        buffer += comma() + quoteProperties + property + quoteProperties + ":" + obj[property].toString();
                        callingStack.push(property);
                        functionPropertyCallback(obj[property], obj, property, callbacks, callingStack);
                        callingStack.pop();
                        break;
                    case "number":
                        buffer += comma() + quoteProperties + property + quoteProperties + ":" + obj[property];
                        break;
                    case "object":
                        callingStack.push(property);
                        buffer += comma() + quoteProperties + property + quoteProperties + ":" + OpsValue.serialize(obj[property], callbacks, callingStack);
                        callingStack.pop();
                        break;
                    case "string":
                        buffer += comma() + quoteProperties + property + quoteProperties + ":" + obj[property];
                        break;
                }
            }
        }
        buffer += "}";
        return buffer;
    },
    htmlSerialize : function(element) {
        //var scriptBuffer = "";
        var Recursive = function(element) {
            var buffer = "";
            if (element.nodeType == 1) {
                buffer += "<" + element.nodeName + " ";
                var didGenerateValue = false;
                for (var i = 0; i < element.attributes.length; i ++) {
                    var attr = element.attributes[i];
                    var name = attr.name.toLowerCase();
                    if (name.charAt(0) == 'o' && name.charAt(1) == 'n') {
                        //if (typeof(attr.value) == "string") {
                        //  buffer += attr.name + "=\"" + attr.value + "\" ";
                        //}
                    }
                    else if (attr.value != null && !(typeof(attr.value) == "string" && attr.value.length == 0)) {
                        if (new String(element[attr.name]).toLowerCase() == "undefined") {
                            buffer += attr.name + "=\"" + attr.value + "\" ";
                        }
                        else {
                            buffer += attr.name + "=\"" + element[attr.name] + "\" ";
                        }
                    }
                    if (attr.name.toLowerCase() == "value") {
                        didGenerateValue = true;
                    }
                }
                if (element.nodeName.toLowerCase() == "input" && !didGenerateValue) {
                    buffer += "value=\"" + element.value + "\" ";
                }
                //if (element.onclick) {
                //  scriptBuffer += "var " + element.id + "_onclick = " + element.onclick;
                //  buffer += "value=\"" + element.id + "_onclick()\"";
                //}
                buffer += ">";
                if (element.nodeName.toLowerCase() == "textarea") {
                    buffer += element.value;
                }
                else {
                    for (var i = 0; i < element.childNodes.length; i ++) {
                        buffer += Recursive(element.childNodes[i]);
                    }
                }
                buffer += "</" + element.nodeName + ">";
            }
            else if (element.nodeType == 3) {
                buffer += element.nodeValue;
            }
            return buffer;
            
        }
        var buffer = ""
        for (var i = 0; i < element.childNodes.length; i ++) {
            buffer += Recursive(element.childNodes[i]);
        }
        return buffer;
    },
    serializeCGI : function(obj) {
        var buffer = "";
        var comma = function() {
            comma = function() {
                return "&";
            }
            return "";
        }
        for( property in obj) {
            switch (typeof(obj[property])) {
                case "boolean":
                    buffer += comma() + property + "=" + object[property];
                    break;
                case "number":
                    buffer += comma() + property + "=" + obj[property];
                    break;
                case "object":
                    OpsValue.serializeCGI(obj[property]);
                    break;
                case "string":
                    buffer += comma() + property + "=" + obj[property];
                    break;
            }
        }
        return buffer;
    }
};

Serializer = { };

if (navigator.appName == 'Netscape') {
    Serializer.toSource = function(obj) {
        return obj.toSource();
    }
}
else {
    Serializer.toSource = function(obj) {
        return OpsValue.serialize(obj,
                             {
                                 currProcessedObject : null,
                                 iterPrototype : null,
                                 canProcessFilter: function(property, currObj, propertyIdentifier) {
                                     if (this.currProcessed != currObj) {
                                         GetPrototypeObject(currObj, function(prototype) {
                                                                this.iterPrototype = prototype;
                                                            });
                                         this.currProcessed = currObj;
                                         
                                     }
                                     if (typeof(iterPrototype) == "object") {
                                         for( prototypeIdentifier in iterPrototype) {
                                             if (prototypeIdentifier == propertyIdentifier) {
                                                 return false;
                                             }
                                         }
                                     }
                                     return true;
                                 }
                             });
    }
}

Serializer.toSourceInstance = function(obj) {
    return OpsValue.serialize(obj);
}

Serializer.toSourceState = function(obj) {
    return OpsValue.serialize(obj,
                         {
                             canProcessFilter: function(property, obj, propertyIdentifier) {
                                 if (typeof(property) == "function") {
                                     return false;
                                 }
                                 else {
                                     return true;
                                 }
                             }
                         });
}

Serializer.toSourceJSON = function(obj) {
    return OpsValue.serialize(obj,
                         {
                             quoteProperties : true,
                             canProcessFilter: function(property, obj, propertyIdentifier) {
                                 if (typeof(property) == "function") {
                                     return false;
                                 }
                                 else {
                                     return true;
                                 }
                             }
                         });
}

Serializer.toSourceCGI = function( obj) {
    return OpsValue.serialize( obj,
                         {
                             
                         });
}
Serializer.toSourceVariable = function(obj, declVar, isGlobal) {
    var funcValueBuffer = "";
    var toexec = "";
    if (typeof(isGlobal) != "undefined" && isGlobal == true) {
        toexec += " ";
    }
    else {
        toexec += "var ";
    }
    toexec += declVar + " = " +
        OpsValue.serialize(obj, {
                          variablename : declVar,
                          functionPropertyCallback : function(property, obj, propertyIdentifier, callbacks, callingStack) {
                              for( funcprop in property) {
                                  if (funcprop != "prototype") {
                                      var funcbuffer = "";
                                      if (typeof(property[funcprop]) == "object") {
                                          funcbuffer = OpsValue.serialize(property[funcprop], callbacks, callingStack);
                                      }
                                      else {
                                          funcbuffer = property[funcprop].toString();
                                      }
                                      var buildBuffer = "";
                                      for (var c1 = 0; c1 < callingStack.length; c1 ++) {
                                          buildBuffer += callingStack[c1] + ".";
                                      }
                                      buildBuffer += funcprop;
                                      funcValueBuffer += buildBuffer + "=" + funcbuffer + ";"
                                  }
                              }
                              
                          }
                      }) + "; " + funcValueBuffer + "";
    return toexec;
    
}

Serializer.toSourceOO = function(obj, variableIdentifier, isGlobal, overrideType) {
    var toexec = "var __Factory = function() {";
    var funcValueBuffer = "";
    var iterobj;
    var objType;
    GetPrototypeObject(obj, function(prototype, typeIdentifier) {
                           iterobj = prototype;
                           objType = typeIdentifier;
                           
                       });
    serialized = OpsValue.serialize(obj,
                               {
                                   variablename : variableIdentifier,
                                   canProcessFilter: function(property, obj, propertyIdentifier) {
                                       if (typeof(iterobj) == "object") {
                                           for( prototypeIdentifier in iterobj) {
                                               if (prototypeIdentifier == propertyIdentifier) {
                                                   return false;
                                               }
                                           }
                                       }
                                       return true;
                                   },
                                   functionPropertyCallback : function(property, obj, propertyIdentifier, callbacks, callingStack) {
                                       for( funcprop in property) {
                                           if (funcprop != "prototype") {
                                               var funcbuffer = "";
                                               if (typeof(property[funcprop]) == "object") {
                                                   funcbuffer = OpsValue.serialize(property[funcprop], callbacks, callingStack);
                                               }
                                               else {
                                                   funcbuffer = property[funcprop].toString();
                                               }
                                               var buildBuffer = "";
                                               for (var c1 = 0; c1 < callingStack.length; c1 ++) {
                                                   buildBuffer += callingStack[c1] + ".";
                                               }
                                               buildBuffer += funcprop;
                                               funcValueBuffer += buildBuffer + "=" + funcbuffer + ";"
                                           }
                                       }
                                       
                                   }
                               });
    toexec += "var serialized = " + serialized + ";";
    if (typeof(overrideType) == "string") {
        toexec += "var retval = new " + overrideType + "();";
    }
    else {
        toexec += "var retval = new " + objType + "();";
    }
    toexec += "OpsReference.mixin( retval, serialized, true);";
    toexec += "return retval; };";
    if (typeof(isGlobal) != "undefined" && isGlobal == true) {
        toexec += " ";
    }
    else {
        toexec += "var ";
    }
    toexec += variableIdentifier + " = __Factory();";
    toexec += funcValueBuffer;
    toexec += "delete __Factory;";
    return toexec;
    
}
// ************************************************************************
var Generics = {
    expand : function(toProcess, itemsToInject) {
        var bufferToProcess = OpsValue.singleSerialize(toProcess);
        //info( "Generics.expand{toProcess}", bufferToProcess);
        for( itemToReplace in itemsToInject) {
            //info( "Generics.expand{itemToReplace}", itemToReplace);
            var recurFind = function(startIndex) {
                var offset = bufferToProcess.indexOf(itemToReplace, startIndex);
                if (offset == -1) {
                    return;
                }
                var left = bufferToProcess.slice(0, offset);
                //info( "Generics.expand{left}", left);
                var right = bufferToProcess.slice(offset + itemToReplace.length);
                //info( "Generics.expand{right}", right);
                var middle = OpsValue.singleSerialize(itemsToInject[itemToReplace]);
                //info( "Generics.expand{middle}", middle);
                bufferToProcess = left + middle + right;
                //info( "Generics.expand{bufferToProcess}", bufferToProcess);
                offset ++;
                recurFind(offset);
            }
            recurFind(0);
        }
        var genBuffer = "var cls = " + bufferToProcess + ";";
        //info( "Generics.expand{genBuffer}", genBuffer);
        eval(genBuffer);
        return cls;
    }
}

// *********************************************************************
var URLEngine = {
    splitApart : function() {
        this.docURL = location.href;
        //this.docURL = document.URL;
        var leadSlashes = this.docURL.indexOf("//");
        var delResource = this.docURL.substring(leadSlashes + 2, this.docURL.length);
        
        var nextSlash = delResource.indexOf("/");
        
        this.domain = delResource.substring(0, nextSlash);
        var portOffset = this.domain.indexOf( ":");
        if( portOffset != -1) {
            this.domain = this.domain.substring( 0, portOffset);
            this.port = this.domain.substring( portOffset + 1, this.domain.length).valueOf();
        }
        else {
            this.port = 80;
        }
        this.completeQueryURL = delResource.substring( nextSlash, delResource.length);
        var questionMarkOffset = this.completeQueryURL.indexOf( "?");
        if( questionMarkOffset == -1) {
            this.request = this.completeQueryURL;
            this.queryString = "";
        }
        else {
            this.request = this.completeQueryURL.substring( 0, questionMarkOffset);
            this.queryString = this.completeQueryURL.substring( questionMarkOffset + 1,
                                                               this.completeQueryURL.length);
        }
        this.requestChunks = this.request.split( "/");
        this.requestChunks = this.requestChunks.slice( 1, this.requestChunks.length);
    }
};

URLEngine.splitApart();
// *********************************************************************
// From: http://www.radicalcongruency.com/20060511-javascript-doubly-linked-list

function LinkedList() {
    this.firstNode = null;
    this.lastNode = null;
    this.next = null;
    this.prev = null;
}

LinkedList.prototype.insertAfter = function( node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    
    if (node.next == null) {
        this.lastNode = newNode;
    }
    else {
        node.next.prev = newNode;
    }
    node.next = newNode;
}

LinkedList.prototype.insertBefore = function (node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    
    if (node.prev == null) {
        this.firstNode = newNode;
    }
    else {
        node.prev.next = newNode;
    }
    node.prev = newNode;
}

LinkedList.prototype.insertBeginning = function (newNode) {
    if (this.firstNode == null) {
        this.firstNode = newNode;
        this.lastNode  = newNode;
        newNode.prev = null;
        newNode.next = null;
    }
    else {
        this.insertBefore(this.firstNode, newNode)
    }
}

LinkedList.prototype.insertEnd = function (newNode) {
    if (this.lastNode == null) {
        this.insertBeginning(newNode);
    }
    else {
        this.insertAfter(this.lastNode, newNode);
    }
}

LinkedList.prototype.remove = function (node) {
    if (node.prev == null) {
        this.firstNode = node.next;
    }
    else {
        node.prev.next = node.next;
    }
    
    if (node.next == null) {
        this.lastNode = node.prev;
    }
    else {
        node.next.prev = node.prev;
    }
    
    delete node;
}
// *********************************************************************

function ThreadObject() {
    this.obj = null;
    this.data = null;
    this.intervalId = null;
    this.isUsed = false;
}

ThreadObject.prototype.makeCall = function() {
    if( typeof( this.obj) == "function") {
        this.obj( this.data);
    }
    else if( typeof( this.obj) == "object") {
        this.obj.run( this.data);
    }
}

var Thread = {
    threadObjects : new Array(),
    startThread : function( obj, data, time) {
        for( var c1 = 0; c1 < this.threadObjects.length; c1 ++) {
            if( !this.threadObjects[ c1].isUsed) {
                this.threadObjects[ c1].isUsed = true;
                this.threadObjects[ c1].data = data;
                this.threadObjects[ c1].obj = obj;
                this.threadObjects[ c1].intervalId =
                    window.setInterval( "Thread.threadObjects[ " + c1 + "].makeCall()", time);
                return this.threadObjects[ c1].intervalId;
            }
        }
        throw new Error( "Could not start a thread");
    },
    endThread : function( intervalId) {
        for( var c1 = 0; c1 < this.threadObjects.length; c1 ++) {
            if( this.threadObjects[ c1].intervalId == intervalId) {
                window.clearInterval( intervalId);
                this.threadObjects[ c1].isUsed = false;
            }
        }
    }
}

function InitializeThreads( maxThreads) {
    Thread.threadObjects = new Array();
    for( var c1 = 0; c1 < maxThreads; c1 ++) {
        Thread.threadObjects.push( new ThreadObject());
    }
}

InitializeThreads( 30);

// *********************************************************************
// Source: http://www.quirksmode.org/js/cookies.html
function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

// *********************************************************************
function el( id) {
    return document.getElementById( id);
}


// From prototype.js
/*Object.extend = function(destination, source) {
    for (property in source) {
        destination[property] = source[property];
    }
    return destination;
}

if (!window.Element) {
    var Element = new Object();
}
*/
/*
Object.extend(Element, {
  visible: function(element) {
    return $(element).style.display != 'none';
  },
  
  toggle: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      Element[Element.visible(element) ? 'hide' : 'show'](element);
    }
  },

  hide: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      element.style.display = 'none';
    }
  },
  
  show: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      element.style.display = '';
    }
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
  },

  update: function(element, html) {
    $(element).innerHTML = html.stripScripts();
    setTimeout(function() {html.evalScripts()}, 10);
  },
  
  getHeight: function(element) {
    element = $(element);
    return element.offsetHeight;
  },
  
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).include(className);
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).add(className);
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).remove(className);
  },
  
  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        Element.remove(node);
    }
  },
  
  empty: function(element) {
    return $(element).innerHTML.match(/^\s*$/);
  },
  
  scrollTo: function(element) {
    element = $(element);
    var x = element.x ? element.x : element.offsetLeft,
        y = element.y ? element.y : element.offsetTop;
    window.scrollTo(x, y);
  },
  
  getStyle: function(element, style) {
    element = $(element);
    var value = element.style[style.camelize()];
    if (!value) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css.getPropertyValue(style) : null;
      } else if (element.currentStyle) {
        value = element.currentStyle[style.camelize()];
      }
    }

    if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
      if (Element.getStyle(element, 'position') == 'static') value = 'auto';

    return value == 'auto' ? null : value;
  },
  
  setStyle: function(element, style) {
    element = $(element);
    for (name in style)
      element.style[name.camelize()] = style[name];
  },
  
  getDimensions: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'display') != 'none')
      return {width: element.offsetWidth, height: element.offsetHeight};
    
    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = '';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = 'none';
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },
  
  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (window.opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return;
    element._overflow = element.style.overflow;
    if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
      element.style.overflow = 'hidden';
  },

  undoClipping: function(element) {
    element = $(element);
    if (element._overflow) return;
    element.style.overflow = element._overflow;
    element._overflow = undefined;
  }
});

var Toggle = new Object();
Toggle.display = Element.toggle;
*/
/*--------------------------------------------------------------------------*/
/*
Abstract.Insertion = function(adjacency) {
  this.adjacency = adjacency;
}

Abstract.Insertion.prototype = {
  initialize: function(element, content) {
    this.element = $(element);
    this.content = content.stripScripts();
    
    if (this.adjacency && this.element.insertAdjacentHTML) {
      try {
        this.element.insertAdjacentHTML(this.adjacency, this.content);
      } catch (e) {
        if (this.element.tagName.toLowerCase() == 'tbody') {
          this.insertContent(this.contentFromAnonymousTable());
        } else {
          throw e;
        }
      }
    } else {
      this.range = this.element.ownerDocument.createRange();
      if (this.initializeRange) this.initializeRange();
      this.insertContent([this.range.createContextualFragment(this.content)]);
    }

    setTimeout(function() {content.evalScripts()}, 10);
  },
  
  contentFromAnonymousTable: function() {
    var div = document.createElement('div');
    div.innerHTML = '<table><tbody>' + this.content + '</tbody></table>';
    return $A(div.childNodes[0].childNodes[0].childNodes);
  }
}

var Insertion = new Object();

Insertion.Before = Class.create();
Insertion.Before.prototype = Object.extend(new Abstract.Insertion('beforeBegin'), {
  initializeRange: function() {
    this.range.setStartBefore(this.element);
  },
  
  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.parentNode.insertBefore(fragment, this.element);
    }).bind(this));
  }
});

Insertion.Top = Class.create();
Insertion.Top.prototype = Object.extend(new Abstract.Insertion('afterBegin'), {
  initializeRange: function() {
    this.range.selectNodeContents(this.element);
    this.range.collapse(true);
  },
  
  insertContent: function(fragments) {
    fragments.reverse(false).each((function(fragment) {
      this.element.insertBefore(fragment, this.element.firstChild);
    }).bind(this));
  }
});

Insertion.Bottom = Class.create();
Insertion.Bottom.prototype = Object.extend(new Abstract.Insertion('beforeEnd'), {
  initializeRange: function() {
    this.range.selectNodeContents(this.element);
    this.range.collapse(this.element);
  },
  
  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.appendChild(fragment);
    }).bind(this));
  }
});

Insertion.After = Class.create();
Insertion.After.prototype = Object.extend(new Abstract.Insertion('afterEnd'), {
  initializeRange: function() {
    this.range.setStartAfter(this.element);
  },
  
  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.parentNode.insertBefore(fragment,
        this.element.nextSibling);
    }).bind(this));
  }
});

*/

