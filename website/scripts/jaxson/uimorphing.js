OpsReference.delegate(window, "onload", function() {
                 representationManager.initialize();
             });

RepresentationManager = {
    initialize : function() {
        if (typeof(representations) == "undefined") {
            document.getElementsByTagName("body")[0].innerHTML = "You are using the Representation Morphing pattern, but have not defined a <i>representations</i> variable"
                + "<br/>--please use code similar to the following"
                + "<br/>&nbsp;<b><br/>&lt;script&gt;var representations = { example : { /* implement whatever you need for serialization */ }};&lt;/script&gt;"
                + "<br/>...later in HTML page define a div element with the identifier example.."
                + "<br />&lt;div id='example'&gt;..Define elements used for serialization..&lt;/div&gt;</b>";
        }
        else {
            for( var representation in representations) {
                var element = document.getElementById(representation);
                if (element != null) {
                    representations[representation].__element = element;
                }
                else {
                    throw new Error("HTML Element (" + representation + ") does not exist");
                }
            }
        }
    },
    iterateHtml : {
        get : function(userMethods, startingElement) {
            globals.info("representationManager.iterateHtmlForm.get", "started");
            var obj = new Object();
            
            if (userMethods.getPreProcess) {
                userMethods.getPreProcess(obj, startingElement);
            }
            var recursive = function(obj, userMethods, element) {
                globals.info("representationManager.iterateHtmlForm.get.recursive{element}", "Element id(" + element.name + ")");
                if (element.nodeType == 1) {
                    var canGetProcessElement = true;
                    if( userMethods.canGetProcessElement) {
                        canGetProcess = userMethods.canGetProcessElement( element);
                    }
                    if( canGetProcessElement) {
                        if (element.nodeName.toLowerCase() == "input" &&
                            element.type.toLowerCase() == "radio") {
                            if (element.checked == true) {
                                obj[element.name] = element.value;
                            }
                            else if (obj[element.name] == null) {
                                obj[element.name] = "";
                            }
                        }
                        else if (element.nodeName.toLowerCase() == "input" &&
                                 element.type.toLowerCase() == "checkbox") {
                            if (element.checked == true) {
                                obj[element.name] = "true";
                            }
                            else {
                                obj[element.name] = "false";
                            }
                        }
                        else if (element.nodeName.toLowerCase() == "input" ||
                                 element.nodeName.toLowerCase() == "select" ||
                                 element.nodeName.toLowerCase() == "textarea") {
                            if (element.name) {
                                obj[element.name] = element.value;
                            }
                        }
                        else if( element.nodeName.toLowerCase() == "span" ||
                                element.nodeName.toLowerCase() == "div") {
                            if( element.id) {
                                obj[ element.id] = element.innerHTML;
                            }
                        }
                    }
                    if (userMethods["get_" + element.id]) {
                        userMethods["get_" + element.id](obj, element);
                    }
                    for (var i = 0; i < element.childNodes.length; i ++) {
                        recursive(obj, userMethods, element.childNodes[i]);
                    }
                }
            }
            recursive(obj, userMethods, startingElement);
            globals.info("representationManager.iterateHtmlForm.get{obj}", Ops.singleSerialize(obj));
            if (userMethods.getPostProcess) {
                userMethods.getPostProcess(obj, startingElement);
            }
            return obj;
        },
        set : function(obj, userMethods, startingElement) {
            if (userMethods.setPreProcess) {
                userMethods.setPreProcess(obj, startingElement);
            }
            var recursive = function(obj, userMethods, element) {
                if (element.nodeType == 1) {
                    var canSetProcessElement = true;
                    if( userMethods.canSetProcessElement) {
                        canSetProcess = userMethods.canSetProcessElement( element);
                    }
                    if( canSetProcessElement) {
                        if (element.nodeName.toLowerCase() == "input" &&
                            element.type.toLowerCase() == "radio") {
                            if (obj[element.name]) {
                                if (element.value == obj[element.name]) {
                                    element.checked = true;
                                }
                                else {
                                    element.checked = false;
                                }
                            }
                        }
                        else if (element.nodeName.toLowerCase() == "input" &&
                                 element.type.toLowerCase() == "checkbox") {
                            if (element.name) {
                                if (obj[element.id] == "true") {
                                    element.checked = true;
                                }
                                else if (obj[element.id] == "false") {
                                    element.checked = false;
                                }
                            }
                        }
                        else if (element.nodeName.toLowerCase() == "input" ||
                                 element.nodeName.toLowerCase() == "select" ||
                                 element.nodeName.toLowerCase() == "textarea") {
                            if (element.name && obj[element.id]) {
                                element.value = obj[element.id];
                            }
                        }
                        else if( element.nodeName.toLowerCase() == "div" ||
                                element.nodeName.toLowerCase() == "span") {
                            if (obj[element.id]) {
                                element.innerHTML = obj[element.id];
                            }
                        }
                    }
                    if (userMethods["set_" + element.id]) {
                        userMethods["set_" + element.id](obj, element);
                    }
                    for (var i = 0; i < element.childNodes.length; i ++) {
                        recursive(obj, userMethods, element.childNodes[i]);
                    }
                }
            }
            recursive(obj, userMethods, startingElement);
            if (userMethods.setPostProcess) {
                userMethods.setPostProcess(obj, startingElement);
            }
        }
    },
    interateElements : function(element, callback) {
        if (typeof(representations[element.id]) != "undefined") {
            globals.info("representationManager.iterateElements", "found element");
            callback(element);
        }
        else {
            if (element.parentNode == null) {
                globals.info("representationManager.iterateElements", "did not find element");
                return;
            }
            else {
                representationManager.interateElements(element.parentNode, callback);
            }
        }
        
    },
    getState : function(element) {
        if( typeof( element) == "string") {
            RepresentationManager.getState( document.getElementById( element));
        }
        else {
            var retval = null;
            this.interateElements(element,
                                  function(element) {
                                      retval = RepresentationManager.iterateHtml.get(representations[element.id], element);
                                  });
            return retval;
        }
    },
    setState : function(obj, element) {
        if( typeof( element) == "string") {
            RepresentationManager.setState( obj, document.getElementById( element));
        }
        else {
            this.interateElements(element,
                                  function(element) {
                                      RepresentationManager.iterateHtml.set(obj, representations[element.id], element);
                                  });
        }
    }
}



function JSONRepresentation(element, url) {
    this.url = url;
    var parentRef = this;
    this.request = new Asynchronous(
        {
            onComplete : function(xmlhttp) {
                var obj = eval( xmlhttp.responseText);
                representationManager.setState( obj, parentRef.element);
            }
        });
    this.element = element;
}

JSONRepresentation.prototype.get = function() {
    this.request.post(
        this.url, ConvertToJSON(representationManager.getState(this.element)));
}

JSONRepresentation.prototype.set = function() {
    
}

function FlexBox(parentIdentifier) {
    if (typeof(parentIdentifier) == "string") {
        this.parentIdentifier = document.getElementById(parentIdentifier);
    }
    else {
        this.parentIdentifier = parentIdentifier;
    }
    this.table = document.createElement("table");
    this.table.border = 1;
    var tablerow = this.table.insertRow(-1);
    var tempArray = new Array();
    for( var c1 = 0; c1 < this.parentIdentifier.childNodes.length; c1 ++) {
        tempArray[ c1] = this.parentIdentifier.childNodes[c1];
    }
    for (var c1 = 0; c1 < tempArray.length; c1 ++) {
        var child = tempArray[c1];
        if (child.nodeName.toLowerCase() == "div") {
            var cell = tablerow.insertCell(-1);
            cell.appendChild(child);
            if( child.id) {
                cell.id = child.id;
            }
        }
    }
    this.parentIdentifier.appendChild(this.table);
}

FlexBox.prototype.setCharacteristics = function(characteristics) {
    this.characteristics = characteristics;
}

FlexBox.prototype.setContentCallback = function( cbContent) {
    this.cbContent = cbContent;
}

FlexBox.prototype.update = function() {
    var row = this.table.rows[0];
    var totalCells = row.cells.length;
    var availableLength = document.body.clientWidth;
    for( var index in this.characteristics) {
        this.characteristics[ index].cols = 0;
    }
    var Increment;
    if( this.characteristics.updateAlgorithm) {
        Increment = this.characteristics.updateAlgorithm;
    }
    else {
        Increment = function( ref) {
            var takenWidth = 0;
            for( var index in ref.characteristics) {
                takenWidth += ref.characteristics[ index].cols * ref.characteristics[ index].width;
            }
            var didIncrement = false;
            for( var index in ref.characteristics) {
                var obj = ref.characteristics[ index];
                if((takenWidth + obj.width) < availableLength) {
                    if( obj.maxCols) {
                        if( obj.cols < obj.maxCols) {
                            obj.cols ++;
                            didIncrement = true;
                        }
                    }
                    else {
                        obj.cols ++;
                        didIncrement = true;
                    }
                }
            }
            if( didIncrement) {
                Increment(ref);
            }
        }
    }
    Increment(this);
    for (var c1 = 0; c1 < row.cells.length; c1 ++) {
        if( row.cells[ c1].id) {
            var id = row.cells[ c1].id;
            if (this.characteristics[id] && this.characteristics[id].width) {
                row.cells[ c1].width = this.characteristics[ id].width * this.characteristics[ id].cols;
                if( this.cbContent && this.cbContent.updateContent) {
                    this.cbContent.updateContent( row.cells[ c1], row.cells[ c1].childNodes[ 0],
                                                 this.characteristics[ id].cols, this.characteristics[ id]);
                }
            }
        }
    }
}

var DynamicIterator = {
    lastElem : null,
    floatingIframe : null,
    parentRow : null,
    initialize : function(floatingIframeID, parentRowID) {
        this.floatingIframe = document.getElementById(floatingIframeID);
        this.parentRow = document.getElementById(parentRowID);
        this.doLayout();
        this.getMoreRootElements( 0);
    },
    doLayout : function() {
        this.floatingIframe.style.width = document.body.clientWidth - 4;
        this.floatingIframe.style.height = document.body.clientHeight - 104;
    },
    highlightItem : function (elem) {
        if (this.lastElem != null) {
            this.shrinkElement( this.lastElem);
        }
        this.expandElement( elem);
        this.lastElem = elem;
        this.fetch( elem.refElemInfo, false);
    },
    currOffset : 0,
    shiftArrayElements : function( offset) {
        this.currOffset = this.currOffset + offset;
        if( this.currOffset < 0) {
            this.getMoreRootElements( -1);
            this.currOffset = 0;
        }
        else if((this.currOffset + this.parentRow.cells.length) >= this.arrElements.length) {
            this.getMoreRootElements( 1);
            this.currOffset = this.arrElements.length - this.parentRow.cells.length;
        }
        for( var counter = 1; counter < (this.parentRow.cells.length - 1); counter ++) {
            this.parentRow.cells[ counter].innerHTML = this.arrElements[ this.currOffset + counter - 1].text;
            this.parentRow.cells[ counter].refElemInfo = this.arrElements[ this.currOffset + counter - 1];
        }
    },
    arrElements : new Array(),
    associateElements : function( arrElements) {
        this.arrElements = arrElements;
        this.shiftArrayElements( 0);
    },
    intervalId : 0,
    startIteration : function(direction) {
        this.intervalId = Thread.startThread( function( direc) {
                               DynamicIterator.shiftArrayElements( direc);
                           }, direction, 500);
    },
    stopIteration : function() {
        Thread.endThread( this.intervalId);
    },
    activateItem : function( elem) {
        this.fetch( elem.refElemInfo, true);
    },
    // Default empty implementations
    expandElement : function(elem) { },
    shrinkElement : function(elem) { },
    fetch : function( refElemInfo, isActivate) { },
    getMoreRootElements : function( direction) { }
};

