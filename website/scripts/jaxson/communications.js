/*function FactoryXMLHttpRequest() {
 if( window.XMLHttpRequest) {
 return new XMLHttpRequest();
 }
 else if( window.ActiveXObject) {
 return new ActiveXObject("Microsoft.XMLHTTP");
 }
 }*/
if (window.XMLHttpRequest) {
    FactoryXMLHttpRequest = function() {
        return new XMLHttpRequest();
    }
}
else if (window.ActiveXObject) {
    FactoryXMLHttpRequest = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

// **************************************************************


// **************************************************************
function Asynchronous_call(request) {
    var instance = this;
    var instRequest = request;
    if (! this.settings) {
        throw new Error("Settings is not defined, please define it when instantiating the type");
    }
    if (this.xmlhttp.readyState != 4 && this.xmlhttp.readyState != 0) {
        throw new Error("Currently active request cannot continue");
    }
    this.xmlhttp.open(request.action, request.url, true, this.settings.username, this.settings.password);
    globals.info("Asynchronous_call", "Opening request " + request.url);
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
    if (this.cache.processAndBreakBeforeRequest(this.xmlhttp, request, this.settings) == true) {
        globals.info("Asynchronous_call", "Retrieved data from cache for request " + instance.settings.url);
        this.xmlhttp.abort();
        return;
    }
    this.isBusy = true;
    this.xmlhttp.onreadystatechange = function() {
        if (instance.xmlhttp.readyState == 4) {
            globals.info("Asynchronous_call", "Received data for request " + instance.settings.url);
            if (instance.cache.processAndBreakAfterRequest(instance.xmlhttp, instRequest, instance.settings) == true) {
                return;
            }
            instance.beforeComplete();
            try {
                instance.settings.onComplete(instance.xmlhttp, instRequest.userData);
                this.isBusy = false;
            }
            catch (e) {
                globals.errorHandler(e);
            }
            instance.afterComplete();
        }
        globals.info("Asynchronous_call", "xmlhttp.readyState (" + instance.xmlhttp.readyState + ")");
    }
    try {
        this.xmlhttp.send(request.data);
    }
    catch( e) {
        globals.errorHandler(e);
    }
}

function DefaultProcessAndBreakBeforeRequest(xmlhttp, request, settings) {
    return false;
}

function DefaultProcessAndBreakAfterRequest(xmlhttp, request, settings) {
    return false;
}

// **************************************************************
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
function QueuedHttpRequest_get(strurl) {
    this.queue.push({ action : "GET", url: strurl});
}

function QueuedHttpRequest_put(strurl, inpdata) {
    this.queue.push(
        { action : "PUT", url : strurl, data : inpdata.data,
            headers : { "Content-type" : inpdata.mimetype, "Content-Length" : inpdata.length}});
}

function QueuedHttpRequest_delete(strurl) {
    this.queue.push({ action : "DELETE", url: strurl});
}

function QueuedHttpRequest_post(strurl, inpdata) {
    this.queue.push(
        { action : "POST", url : strurl, data : inpdata.data,
            headers : { "Content-type" : inpdata.mimetype, "Content-Length" : inpdata.length}});
}

function QueuedHttpRequest_start() {
    if (!this.canProcess) {
        this.canProcess = true;
        window.setTimeout(this.repeatingLoop.bind(this), this.timeout);
    }
}

function QueuedHttpRequest_stop() {
    this.canProcess = false;
}

function QueuedHttpRequest_RepeatingLoop() {
    if (this.canProcess) {
        if (this.queue.length > 0 && !(this.xmlhttp.readyState != 4 && this.xmlhttp.readyState != 0)) {
            this.call(this.queue.shift());
        }
        if (this.queue.length > 0 || !(this.xmlhttp.readyState != 4 && this.xmlhttp.readyState != 0)) {
            window.setTimeout(this.repeatingLoop.bind(this), this.timeout);
        }
    }
}

// **************************************************************
function FifoHttpRequest_get(strurl, inpData) {
    this.queue.push({ action : "GET", url: strurl, userData: inpData.userData});
    this.fifoCall();
}

function FifoHttpRequest_put(strurl, inpdata) {
    this.queue.push(
        { action : "PUT", url : strurl, data : inpdata.data, userData: inpData.userData,
            headers : { "Content-type" : inpdata.mimetype, "Content-Length" : inpdata.length}});
    this.fifoCall();
}

function FifoHttpRequest_delete(strurl, inpdata) {
    this.queue.push({ action : "DELETE", url: strurl, userData: inpData.userData});
    this.fifoCall();
}

function FifoHttpRequest_post(strurl, inpdata) {
    this.queue.push(
        { action : "POST", url : strurl, data : inpdata.data, userData: inpData.userData,
            headers : { "Content-type" : inpdata.mimetype, "Content-Length" : inpdata.length}});
    this.fifoCall();
}

function FifoHttpRequest_call() {
    if (this.queue.length > 0 && (this.xmlhttp.readyState == 4 || this.xmlhttp.readyState == 0)) {
        var request = this.queue.shift();
        window.setTimeout(this.call.bind(this, request), 250);
    }
}

// **************************************************************
function Asynchronous(userSettings) {
    this.xmlhttp = new FactoryXMLHttpRequest();
    this.isBusy = false;
    this.userSettings = userSettings;
}

Asynchronous.prototype.beforeComplete = function() { }
Asynchronous.prototype.afterComplete = function() { }
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
        retval.del = HttpRequest_delete;
        retval.post = HttpRequest_get;
        return retval;
    },
    getSynchronous : function() {
        var retval = this.getCommon();
        retval.call = Synchronous_call;
        return retval;
    },
    getAsynchronous : function() {
        return new Asynchronous();
    },
    getCachedAsynchronous : function() {
        var retval = new Asynchronous();
        retval.cache.processAndBreakBeforeRequest = CachedProcessAndBreakBeforeRequest;
        retval.cache.processAndBreakAfterRequest = CachedProcessAndBreakAfterRequest;
        return retval;
    },
    getValidatingAsynchronous : function() {
        var retval = new Asynchronous();
        retval.cache.processAndBreakBeforeRequest = HTTPValProcessAndBreakBeforeRequest;
        retval.cache.processAndBreakAfterRequest = HTTPValProcessAndBreakAfterRequest;
        return retval;
    },
    getQueuedAsynchronous : function() {
        var retval = new Asynchronous();
        retval.queue = new Array();
        retval.timeout = 1000;
        retval.get = QueuedHttpRequest_get;
        retval.post = QueuedHttpRequest_post;
        retval.del = QueuedHttpRequest_delete;
        retval.put = QueuedHttpRequest_put;
        retval.start = QueuedHttpRequest_start;
        retval.stop = QueuedHttpRequest_stop;
        retval.repeatingLoop = QueuedHttpRequest_RepeatingLoop;
        return retval;
    },
    getCachedQueuedAsynchronous : function() {
        var retval = FactoryHttp.getQueuedAsynchronous();
        retval.cache.processAndBreakBeforeRequest = CachedProcessAndBreakBeforeRequest;
        retval.cache.processAndBreakAfterRequest = CachedProcessAndBreakAfterRequest;
        return retval;
    },
    getFifoAsynchronous : function() {
        var retval = new Asynchronous();
        retval.queue = new Array();
        retval.get = FifoHttpRequest_get;
        retval.post = FifoHttpRequest_post;
        retval.del = FifoHttpRequest_delete;
        retval.put = FifoHttpRequest_put;
        retval.fifoCall = FifoHttpRequest_call;
        retval.afterComplete = FifoHttpRequest_call;
        return retval;
    },
    getCachedFifoAsynchronous : function() {
        var retval = FactoryHttp.getFifoAsynchronous();
        retval.cache.processAndBreakBeforeRequest = CachedProcessAndBreakBeforeRequest;
        retval.cache.processAndBreakAfterRequest = CachedProcessAndBreakAfterRequest;
        return retval;
    },
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
var CacheController = {
    _cache : new Array()
}

function CachedProcessAndBreakBeforeRequest(xmlhttp, request, settings) {
    if (request.action == "GET") {
        var obj = CacheController._cache[settings.url];
        if (obj != null) {
            var fakeXMLHttp = {
                status : 200,
                statusText : obj.StatusText,
                responseText : obj.ResponseText,
                responseXML : obj.ResponseXML
            };
            try {
                settings.onComplete(fakeXMLHttp, obj.UserData);
            }
            catch (e) {
                globals.errorHandler(e);
                return false
            }
            return true;
        }
    }
    return false;
}

function CachedProcessAndBreakAfterRequest(xmlhttp, request, settings) {
    if (xmlhttp.status == 200 && request.action == "GET") {
        CacheController._cache[settings.url] = {
            Status : xmlhttp.status,
            StatusText : xmlhttp.statusText,
            ResponseText : xmlhttp.responseText,
            ResponseXML : xmlhttp.responseXML,
            UserData : request.userData
        };
    }
    return false;
}

// ***************************************************************
var HttpValidationCacheController = {
    _cache : new Array(),
    didNotFindETagError : function(url) { }
}

function HTTPValProcessAndBreakBeforeRequest(xmlhttp, request, settings) {
    if (request.action == "GET") {
        var obj = HttpValidationCacheController._cache[url];
        if (obj != null) {
            this.xmlhttp.setRequestHeader("If-None-Match", obj.ETag);
            this.xmlhttp.setRequestHeader("Pragma", "no-cache");
            this.xmlhttp.setRequestHeader("Cache-Control", "no-cache");
        }
    }
    return false;
}

function HTTPValProcessAndBreakAfterRequest(xmlhttp, request, settings) {
    if (xmlhttp.status == 200 && request.action == "GET") {
        if (xmlhttp.status == 200) {
            try {
                var foundetag = xmlhttp.getResponseHeader("ETag");
                if (foundetag != null) {
                    HttpValidationCacheController._cache[url] = {
                        ETag : foundetag,
                        Status : xmlhttp.status,
                        StatusText : xmlhttp.statusText,
                        ResponseText : xmlhttp.responseText,
                        ResponseXML : xmlhttp.responseXML
                    };
                }
                else {
                    HttpValidationCacheController.didNotFindETagError(url);
                }
            }
            catch( exception) {
                HttpValidationCacheController.didNotFindETagError(url);
            }
        }
        else if (status == 304) {
            var obj = HttpValidationCacheController._cache[url];
            if (obj != null) {
                var fakeXMLHttp = {
                    status : 200,
                    statusText : obj.StatusText,
                    responseText : obj.ResponseText,
                    responseXML : obj.ResponseXML
                };
                try {
                    settings.onComplete(fakeXMLHttp);
                    return true;
                }
                catch (e) {
                    globals.errorHandler(e);
                }
            }
            else {
                throw new Error("Server indicated that this data is in the cache, but it does not seem to be");
            }
        }
    }
    return false;
}

// ***************************************************************
function UniqueURL(url) {
    this.asynchronous = null;
    this.baseURL = url;
    this.uniqueURL = null;
    this.haveIt = function() { }
}

UniqueURL.prototype.getIt = function() {
    var instance = this;
    this.asynchronous = FactoryHttp.getAsynchronous();
    this.asynchronous.settings = {
        onComplete : function(xmlhttp) {
            if (xmlhttp.status == 201) {
                instance.uniqueURL = xmlhttp.getResponseHeader("Location");
                instance.haveIt();
            }
        }
    }
    this.asynchronous.get(this.baseURL);
}

UniqueURL.prototype.postIt = function(inpData) {
    var instance = this;
    this.asynchronous = FactoryHttp.getAsynchronous();
    this.asynchronous.settings = {
        onComplete : function(xmlhttp) {
            if (xmlhttp.status == 201) {
                instance.uniqueURL = xmlhttp.getResponseHeader("Location");
                instance.haveIt();
            }
        }
    }
    this.asynchronous.post(this.baseURL, inpData);
}


