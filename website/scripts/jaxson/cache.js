var CacheController = {
    _cache : new Array(),
    prefetch : function( url) { },
    didNotFindETagError : function( url) { },    
    getCachedURL : function( url) {
        var func = function( status, statusText, responseText, responseXML) { }
        CacheController.getURL( url, func, true);
    },        
    getURL : function( url, complete, calledFromCache) {
        var asynchronous = new Asynchronous();
        asynchronous.openCallback = function( xmlhttp) {
            var obj = CacheController._cache[ url];
            if( obj != null) {
                xmlhttp.setRequestHeader( "If-None-Match", obj.ETag);
                xmlhttp.setRequestHeader( "Pragma", "no-cache");
                xmlhttp.setRequestHeader( "Cache-Control", "no-cache");
            }
        }
        asynchronous.userComplete = complete;
        asynchronous.complete = function( status, statusText, responseText, responseXML) {
            if( status == 200) {
                try {
                    var foundetag = this._xmlhttp.getResponseHeader( "ETag");
                    if( foundetag != null) {
                        CacheController._cache[ url] = {
                            ETag : foundetag,
                            Status : status,
                            StatusText : statusText,
                            ResponseText : responseText,
                            ResponseXML : responseXML
                        };
                    }
                    else {
                        CacheController.didNotFindETagError( url);
                    }
                }
                catch( exception) {
                    CacheController.didNotFindETagError( url);
                }
                this.userComplete( status, statusText, responseText, responseXML);
            }
            else if( status == 304) {
                var obj = CacheController._cache[ url];
                if( obj != null) {
                    this.userComplete( 304, obj.StatusText, 
                        obj.ResponseText, obj.ResponseXML);
                }
                else {
                    throw new Error( "Server indicated that this data is in the cache, but it does not seem to be");
                }
            }
            else {
                this.userComplete( status, statusText, responseText, responseXML);
            }
        }
        asynchronous.get( url);
        if( calledFromCache != true) {
            CacheController.prefetch( url);
        }
    }
}



