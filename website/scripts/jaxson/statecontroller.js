function GenerateUniqueIdentifer() {
    var splitLocation = location.href.split( "#");
    return splitLocation[ 0] + Math.floor( Math.random() * 10000);
}


var StateNavigatorHash = {
    username: null,
    password: null,
    postURL: null,

    constPageStateHeader : "X-Page-State",
    constResourceStateContentType : "application/xml",
    constURLStateIdentifier : "/state",
    
    constStateTag : "state",
    constHtmlPageStateTag : "html-page",

    onLoadState : function( status, responseXML) { },
    extractFormData : function( element, objData) {
        if( element.nodeType == 1) {
            if( element.nodeName == "form") {
                objData.formId = element.attributes.getNamedItem( "id").nodeValue;
                objData.formNode = document.forms[ objData.formId];
            }
            else if( element.nodeName == "element") {
                if( objData.formNode != null) {
                    var elementIdentifier = element.attributes.getNamedItem( "id").nodeValue;
                    if( element.childNodes[ 0] != null) {
                        var elementValue = element.childNodes[ 0].nodeValue;
                        objData.formNode.elements[ elementIdentifier].value = elementValue;
                    }
                }
            }
        }
    },
    loadForm : function( xmlState) {
        this.verify = this.extractFormData;
        var objData = new Object();
        XMLIterateElements( this, objData, xmlState);
    },
    extractUserData : function( element, objData) {
        if( element.nodeType == 1) {
            if( element.nodeName == this.constHtmlPageStateTag) {
                objData.foundElement = element;
            }
        }
    },
    loadState : function() {
        if( location.hash != null) {
            var asynch = new Asynchronous();
            var thisReference = this;
            asynch.openCallback = function( xmlhttp) {
                if( location.hash.length == 0) {
                    xmlhttp.setRequestHeader( thisReference.constPageStateHeader, "none");
                }
                else {
                    xmlhttp.setRequestHeader( thisReference.constPageStateHeader, location.hash.slice(1));
                }
                xmlhttp.setRequestHeader( "Accept", thisReference.constResourceStateContentType);
            }
            var xmlhttp = asynch._xmlhttp;
            asynch.complete = function( status, statusText, responseText, responseXML) {
                try {
                    eval( "var stateResponse = " + responseText);
                    thisReference.onLoadState( status, stateResponse);
                    location.replace( location.pathname + "#" + xmlhttp.getResponseHeader( thisReference.constPageStateHeader));
                }
                catch( e) { 
                    //window.alert( e.description);
                }
            }
            asynch.username = this.username;
            asynch.password = this.password;
            var splitLocation = location.href.split( "#");
            asynch.get( splitLocation[ 0] + this.constURLStateIdentifier);
        }
    },
    extractLink : function( element, objData) {
        if( element.nodeType == 1) {
            if( element.nodeName == "link") {
                var attr = element.attributes.getNamedItem( "id");
                if( attr.nodeValue == "redirect") {
                    objData.redirectURL = element.attributes.getNamedItem("href").nodeValue;
                }
            }
        }
    },
    onSaveState : function() {
        return "";
    },
    saveForm : function( form) { 
        this.postURL = form.action;
        var buffer = "";
        buffer += "<form id=\"" + form.name + "\" >\n";
        for( var i = 0; i < form.elements.length; i++) {
            if( form.elements[ i].type != "submit" && form.elements[ i].type != "reset") {
                buffer += "<element id='" + form.elements[i].name + "' type='" +
                                form.elements[ i].type + "'>" +
                                form.elements[ i].value + "</element>\n";
            }
        }
        buffer += "</form>\n";
        return buffer;
    },
    saveState : function( newURL) {
        var buffer = this.onSaveState()
        var request = new Asynchronous();
        var thisReference = this;
        var oldPath = location.pathname;
        request.openCallback = function( xmlhttp) {
            if( location.hash.length == 0) {
                xmlhttp.setRequestHeader( thisReference.constPageStateHeader, "none");
            }
            else {
                xmlhttp.setRequestHeader( thisReference.constPageStateHeader, location.hash.slice(1));
            }
        }
        var xmlhttp = request._xmlhttp;
        var tempNewURL = newURL;
        request.complete = function( status, statusText, responseText, responseXML) {
            if(status == 200) {
                var splitLocation = location.href.split( "#");
                location.replace( oldPath + "#" + xmlhttp.getResponseHeader( thisReference.constPageStateHeader));
                location.href = tempNewURL;
            }
        }
        request.username = this.username;
        request.password = this.password;
        var splitLocation = location.href.split( "#");
        request.post( splitLocation[ 0] + this.constURLStateIdentifier, this.constResourceStateContentType, buffer.length, buffer);
        return false;
    }
}


var StateNavigatorWindowName = {
    username: null,
    password: null,
    postURL: null,

    constPageStateHeader : "X-Page-State",
    constPageWindowName  : "X-Page-Window-Name",
    constPageOriginalURL : "X-Page-Original-URL",
    constPageWindowNamePrefix : "StateController",
    constResourceStateContentType : "application/xml",
    constURLStateIdentifier : "/state",
    
    constStateTag : "state",
    constHtmlPageStateTag : "html-page",

    verifyWindowName : function() {
        if( window.name.length == 0 ||
            window.name.indexOf( thisReference.constPageWindowNamePrefix) == -1) {
            window.name = GenerateUniqueIdentifer();
        }
    },
    
    onLoadState : function( status, responseXML) { },
    extractFormData : function( element, objData) {
        if( element.nodeType == 1) {
            if( element.nodeName == "form") {
                objData.formId = element.attributes.getNamedItem( "id").nodeValue;
                objData.formNode = document.forms[ objData.formId];
            }
            else if( element.nodeName == "element") {
                if( objData.formNode != null) {
                    var elementIdentifier = element.attributes.getNamedItem( "id").nodeValue;
                    if( element.childNodes[ 0] != null) {
                        var elementValue = element.childNodes[ 0].nodeValue;
                        objData.formNode.elements[ elementIdentifier].value = elementValue;
                    }
                }
            }
        }
    },
    loadForm : function( xmlState) {
        this.verify = this.extractFormData;
        var objData = new Object();
        XMLIterateElements( this, objData, xmlState);
    },
    extractUserData : function( element, objData) {
        if( element.nodeType == 1) {
            if( element.nodeName == this.constHtmlPageStateTag) {
                objData.foundElement = element;
            }
        }
    },
    loadState : function() {
        if( location.hash != null) {
            var asynch = new Asynchronous();
            var thisReference = this;
            asynch.openCallback = function( xmlhttp) {
                if( location.hash.length == 0) {
                    xmlhttp.setRequestHeader( thisReference.constPageStateHeader, "none");
                }
                else {
                    xmlhttp.setRequestHeader( thisReference.constPageStateHeader, location.hash.slice(1));
                }
                xmlhttp.setRequestHeader( "Accept", thisReference.constResourceStateContentType);
                thisReference.verifyWindowName();
                xmlhttp.setRequestHeader( thisReference.constPageWindowName, window.name);
            }
            var xmlhttp = asynch._xmlhttp;
            asynch.complete = function( status, statusText, responseText, responseXML) {
                thisReference.verify = thisReference.extractUserData;
                var objData = new Object();
                XMLIterateElements( thisReference, objData, responseXML);
                if( objData.foundElement) {
                    thisReference.onLoadState( status, objData.foundElement);
                }
                location.replace( location.pathname + "#" + xmlhttp.getResponseHeader( thisReference.constPageStateHeader));
            }
            asynch.username = this.username;
            asynch.password = this.password;
            var splitLocation = location.href.split( "#");
            asynch.get( splitLocation[ 0] + this.constURLStateIdentifier);
        }
    },
    extractLink : function( element, objData) {
        if( element.nodeType == 1) {
            if( element.nodeName == "link") {
                var attr = element.attributes.getNamedItem( "id");
                if( attr.nodeValue == "redirect") {
                    objData.redirectURL = element.attributes.getNamedItem("href").nodeValue;
                }
            }
        }
    },
    onSaveState : function() {
        return "";
    },
    saveForm : function( form) { 
        this.postURL = form.action;
        var buffer = "";
        buffer += "<form id=\"" + form.name + "\" >\n";
        for( var i = 0; i < form.elements.length; i++) {
            if( form.elements[ i].type != "submit" && form.elements[ i].type != "reset") {
                buffer += "<element id='" + form.elements[i].name + "' type='" +
                                form.elements[ i].type + "'>" +
                                form.elements[ i].value + "</element>\n";
            }
        }
        buffer += "</form>\n";
        return buffer;
    },
    saveState : function( newURL) {
        var buffer = "<" + this.constStateTag + ">";
        buffer += "<" + this.constHtmlPageStateTag + ">\n";
        buffer += this.onSaveState()
        buffer += "</" + this.constHtmlPageStateTag + ">\n";
        buffer += "</" + this.constStateTag + ">";
        var request = new Asynchronous();
        var thisReference = this;
        var oldPath = location.pathname;
        request.openCallback = function( xmlhttp) {
            if( location.hash.length == 0) {
                xmlhttp.setRequestHeader( thisReference.constPageStateHeader, "none");
            }
            else {
                xmlhttp.setRequestHeader( thisReference.constPageStateHeader, location.hash.slice(1));
            }
            thisReference.verifyWindowName();
            xmlhttp.setRequestHeader( thisReference.constPageWindowName, window.name);
        }
        var xmlhttp = request._xmlhttp;
        var tempNewURL = newURL;
        request.complete = function( status, statusText, responseText, responseXML) {
            if(status == 200) {
                var splitLocation = location.href.split( "#");
                location.replace( oldPath + "#" + xmlhttp.getResponseHeader( thisReference.constPageStateHeader));
                location.href = tempNewURL;
            }
        }
        request.username = this.username;
        request.password = this.password;
        var splitLocation = location.href.split( "#");
        request.post( splitLocation[ 0] + this.constURLStateIdentifier, this.constResourceStateContentType, buffer.length, buffer);
        return false;
    }
}

/*
function StateController() {
    this.username = null;
    this.password = null;
    this.postURL = null;
}

// *****************************************************************
// Loading of state
function StateController_OnLoadState(status, statusText, responseText, responseXML) {
}

function StateController_LoadForm( form) {
    // Abbreviated for clarity
}

function StateController_LoadState() {
    if( location.hash != null) {
        var asynch = new Asynchronous();
        var thisReference = this;
        asynch.openCallback = function( xmlhttp) {
            if( location.hash.length == 0) {
                xmlhttp.setRequestHeader( thisReference.constPageStateHeader, "none");
            }
            else {
                xmlhttp.setRequestHeader( thisReference.constPageStateHeader, location.hash.slice(1));
            }
        }
        var xmlhttp = asynch._xmlhttp;
        asynch.complete = function( status, statusText, responseText, responseXML) {
            thisReference.onLoadState( status, statusText, responseText, responseXML);
            location.replace( location.pathname + "#" + xmlhttp.getResponseHeader( thisReference.constPageStateHeader));
        }
        asynch.username = this.username;
        asynch.password = this.password;
        asynch.get( location.href + "/state");
    }
}

// *****************************************************************
// Saving of state

function StateController_Verify( element) {
    if( element.nodeType == 1) {
        if( element.nodeName == "link") {
            var attr = element.attributes.getNamedItem( "id");
            if( attr.nodeValue == "redirect") {
                this._redirectURL = element.attributes.getNamedItem("href").nodeValue;
            }
        }
    }
}

function StateController_OnSaveState() {
    return "";
}

function StateController_SaveForm( form) {
    this.postURL = form.action;
    var buffer = "";
    buffer += "<form id=\"" + form.name + "\" >\n";
    for( var i = 0; i < form.elements.length; i++) {
        buffer += "<element id='" + form.elements[i].name + "' type='" +
                            form.elements[ i].type + "'>" +
                            form.elements[ i].value + "</element>\n";
    }
    buffer += "</form>\n";
    return buffer;
}

function StateController_SaveState() {
    var buffer = "<state>";
    if( location.hash != null) {
        if( location.hash.length > 0) {
            buffer += "<hash id='" + location.hash.slice(1) + "' />";
        }
        else {
            buffer += "<hash id='none' />";
        }
    }
    buffer += "<link href='" + location.pathname + "' />\n";
    buffer += "<html-page>\n";
    buffer += this.onSaveState()
    buffer += "</html-page>\n";
    buffer += "</state>";
    var request = new Asynchronous();
    var thisReference = this;
    request.openCallback = function( xmlhttp) {
        if( location.hash.length == 0) {
            xmlhttp.setRequestHeader( thisReference.constPageStateHeader, "none");
        }
        else {
            xmlhttp.setRequestHeader( thisReference.constPageStateHeader, location.hash.slice(1));
        }
    }
    var oldPath = location.pathname;
    var xmlhttp = request._xmlhttp;
    request.complete = function( status, statusText, responseText, responseXML) {
        if((status == 200 || status == 201) && responseXML != null) {
            thisReference._redirectURL = "";
            XMLIterateElements( thisReference, responseXML);
            location.replace( oldPath + "#" + xmlhttp.getResponseHeader( thisReference.constPageStateHeader));
            location.href = thisReference._redirectURL;
        }
    }
    request.username = this.username;
    request.password = this.password;
    request.post( this.postURL, this.constResourceStateContentType, buffer.length, buffer);
    return false;
}

StateController.prototype.saveState = StateController_SaveState;
StateController.prototype.onSaveState = StateController_OnSaveState;

StateController.prototype.loadState = StateController_LoadState;
StateController.prototype.onLoadState = StateController_OnLoadState;

StateController.prototype.verify = StateController_Verify;
StateController.prototype.saveForm = StateController_SaveForm;
StateController.prototype.loadForm = StateController_LoadForm;

StateController.prototype.constPageStateHeader = "X-Page-State";
StateController.prototype.constResourceStateContentType = "application/ajax-state";
 */


