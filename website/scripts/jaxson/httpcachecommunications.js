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
    didNotFindETagError : function(url) { },
}

// **************************************************************
function Asynchronous_call(request, calledFromCache) {
    var instance = this;
    if (! this.settings) {
        throw new Error("Settings is not defined, please define it when instantiating the type");
    }
    if (this.xmlhttp.readyState != 4 && this.xmlhttp.readyState != 0) {
        throw new Error("Currently active request cannot continue");
    }
    this.xmlhttp.open(request.action, request.url, true, this.settings.username, this.settings.password);
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
    // ***************
    var obj = CacheController._cache[url];
    if (obj != null) {
        this.xmlhttp.setRequestHeader( "If-None-Match", obj.ETag);
        this.xmlhttp.setRequestHeader( "Pragma", "no-cache");
        this.xmlhttp.setRequestHeader( "Cache-Control", "no-cache");
    }
    // ***************
    this.settings.url = request.url;
    this.xmlhttp.onreadystatechange = function() {
        if( instance.xmlhttp.readyState == 4) {
            if (instance.xmlhttp.status == 200) {
                try {
                    var foundetag = instance.xmlhttp.getResponseHeader("ETag");
                    if (foundetag != null) {
                        CacheController._cache[url] = {
                            ETag : foundetag,
                            Status : instance.xmlhttp.status,
                            StatusText : instance.xmlhttp.statusText,
                            ResponseText : instance.xmlhttp.responseText,
                            ResponseXML : instance.xmlhttp.responseXML
                        };
                    }
                    else {
                        CacheController.didNotFindETagError(url);
                    }
                }
                catch( exception) {
                    CacheController.didNotFindETagError(url);
                }
                try {
                    instance.settings.onComplete(instance.xmlhttp);
                }
                catch (e) {
                    globals.errorHandler(e);
                }
            }
            else if (status == 304) {
                var obj = CacheController._cache[url];
                if (obj != null) {
                    var fakeXMLHttp = {
                        status : 304,
                        statusText : obj.StatusText,
                        responseText : obj.ResponseText,
                        responseXML : obj.ResponseXML,
                        getResponseHeader : function( label) {
                            return instance.xmlhttp.getResponseHeader( label);
                        },
                        getAllResponseHeaders : function() {
                            return instance.xmlhttp.getAllResponseHeaders();
                        }
                    }
                    try {
                        instance.settings.onComplete(fakeXMLHttp);
                    }
                    catch (e) {
                        globals.errorHandler(e);
                    }
                }
                else {
                    throw new Error("Server indicated that this data is in the cache, but it does not seem to be");
                }
            }
            else {
                try {
                    instance.settings.onComplete(instance.xmlhttp);
                }
                catch (e) {
                    globals.errorHandler(e);
                }
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




