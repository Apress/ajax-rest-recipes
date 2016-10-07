/*function FactoryXMLHttpRequest() {
 if( window.XMLHttpRequest) {
 return new XMLHttpRequest();
 }
 else if( window.ActiveXObject) {
 return new ActiveXObject("Microsoft.XMLHTTP");
 }
 }*/
if (window.ActiveXObject) {
    FactoryXMLHttpRequest = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}
else if (window.XMLHttpRequest) {
    FactoryXMLHttpRequest = function() {
        return new XMLHttpRequest();
    }
}

// **************************************************************
var CacheController = {
    _cache : new Array(),
}

// **************************************************************
function Asynchronous_call(request) {
    var instance = this;
    if (! this.settings) {
        throw new Error("Settings is not defined, please define it when instantiating the type");
    }
    if (this.xmlhttp.readyState != 4 && this.xmlhttp.readyState != 0) {
        throw new Error("Currently active request cannot continue");
    }
    this.xmlhttp.open(request.action, request.url, true, this.settings.username, this.settings.password);
    globals.info( "Opening request " + request.url);
    if (request.headers) {
        for( defHeader in request.headers) {
            this.xmlhttp.setRequestHeader(defHeader, request.headers[defHeader]);
        }
    }
    if (this.settings.headers) {
        for( defHeader in this.settings.headers) {
            this.xmlhttp.setRequestHeader(defHeader, this.settings.headers[defHeader]);
        }
    }
    this.settings.url = request.url;
    if( this.cache.processAndBreakBeforeRequest( this.settings) == true) {
        globals.info( "Retrieved data from cache for request " + instance.settings.url);
        return;
    }
    this.xmlhttp.onreadystatechange = function() {
        if( instance.xmlhttp.readyState == 4) {
            globals.info( "Received data for request " + instance.settings.url);
            if( instance.cache.processAndBreakAfterRequest( instance.xmlhttp, instance.settings) == true ) {
                return;
            }
            try {
                instance.settings.onComplete(instance.xmlhttp);
            }
            catch (e) {
                globals.errorHandler(e);
            }
        }
    }
    try {
        this.xmlhttp.send(request.data);
    }
    catch( e) {
        globals.errorHandler(e);
    }
}

function DefaultProcessAndBreakBeforeRequest( settings) {
    var obj = CacheController._cache[settings.url];
    if (obj != null) {
        var fakeXMLHttp = {
            status : 200,
            statusText : obj.StatusText,
            responseText : obj.ResponseText,
            responseXML : obj.ResponseXML
        }
        try {
            settings.onComplete(fakeXMLHttp);
        }
        catch (e) {
            globals.errorHandler(e);
            return false
        }
        return true;
    }
    return false;
}

function DefaultProcessAndBreakAfterRequest( xmlhttp, settings) {
    if ( xmlhttp.status == 200) {
        CacheController._cache[settings.url] = {
            Status : xmlhttp.status,
            StatusText : xmlhttp.statusText,
            ResponseText : xmlhttp.responseText,
            ResponseXML : xmlhttp.responseXML
        };
    }
    return false;
}

function HttpRequest_get(strurl) {
    this.call({ action : "GET", url: strurl});
}

function HttpRequest_put(strurl, inpdata) {
    this.call(
        { action : "PUT", url : strurl, data : inpdata.data,
            headers : { "Content-type" : inpdata.mimetype, "Content-Length" : inpdata.length}});
}

function HttpRequest_delete(strurl) {
    this.call({ action : "DELETE", url: strurl});
}

function HttpRequest_post(strurl, inpdata) {
    this.call(
        { action : "POST", url : strurl, data : inpdata.data,
            headers : { "Content-type" : inpdata.mimetype, "Content-Length" : inpdata.length}});
}

// **************************************************************
function Asynchronous(userSettings) {
    this.xmlhttp = new FactoryXMLHttpRequest();
    this.isBusy = false;
    this.userSettings = userSettings;
}

Asynchronous.prototype.get = HttpRequest_get;
Asynchronous.prototype.put = HttpRequest_put;
Asynchronous.prototype.del = HttpRequest_delete;
Asynchronous.prototype.post = HttpRequest_post;
Asynchronous.prototype.call = Asynchronous_call;
Asynchronous.prototype.cache = {
    processAndBreakBeforeRequest : DefaultProcessAndBreakBeforeRequest,
    processAndBreakAfterRequest : DefaultProcessAndBreakAfterRequest
}

// ***************************************************************
FactoryHttp = {
    getCommon : function() {
        var retval = new Object();
        retval.get = HttpRequest_get;
        retval.put = HttpRequest_put;
        retval.del = HttpRequest_del;
        retval.post = HttpRequest_get;
        return retval;
    },
    getSynchronous : function() {
        var retval = this.getCommon();
        retval.call = Synchronous_call;
        return retval;
    },
    getAsynchronous : function() {
        var retval = this.getCommon();
        retval.call = Asynchronous_call;
        return retval;
    }
};

// ***************************************************************
function ConvertToJSON(obj) {
    var buffer = Serializer.toSourceJSON(obj);
    return {
        mimetype : "application/json",
        data : buffer,
        length : data.length
    };
}

// ***************************************************************



