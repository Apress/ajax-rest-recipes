function CounterHack() {
    this.counter = 0;
}

function ClientCommunicator() {
    this.baseURL = null;
    this._delegated = null;
    this.username = null;
    this.password = null;
    this.listen = null;
    this.doLoop = false;
    this.callDelay = 500;
    this.preferredTypes = "text/xml";
    this.index = this.instanceCount.counter;
    this.instances[this.index] = this;
    this.instanceCount.counter ++;
    this.versionTracker = 0;
    this.doLoop = false;
    this.waitingForAnswer = false;
}

function PrivateLoop(index) {
    var thisRef = ClientCommunicator.prototype.instances[index];
    var thisIndex = index;
    
    var server2Client = new Asynchronous();
    server2Client.settings = {
        onComplete : function(xmlhttp) {
            if (status == 200) {
                try {
                    var status = xmlhttp.getResponseHeader("X-Status");
                    if( status == "finished") {
                        thisRef.doLoop = false;
                    }
                }
                catch( e) {
                    //
                }
            }
            if (thisRef.listen != null) {
                thisRef.listen(xmlhttp);
            }
            thisRef.waitingForAnswer = false;
        }
    };
    server2Client.settings.headers = { "Accept": thisRef.preferredTypes};
    server2Client.username = thisRef.username;
    server2Client.password = thisRef.password;
    try {
        server2Client.get(thisRef.baseURL);
        thisRef.waitingForAnswer = true;
    }
    catch( e) {
        debugger;
    }
}

function RepeatingLoop() {
    var timeout = ClientCommunicator.prototype.waitTime;
    var didAtLeastOne = false;
    for (var c1 = 0; c1 < ClientCommunicator.prototype.instanceCount.counter; c1 ++) {
        if (ClientCommunicator.prototype.instances[c1].waitingForAnswer == false &&
            ClientCommunicator.prototype.instances[c1].doLoop == true) {
            PrivateLoop(c1);
            didAtLeastOne = true;
        }
    }
    if (didAtLeastOne == true) {
        timeout = 500;
    }
    window.setTimeout("RepeatingLoop()", timeout);
}

// Start the repeating loop right away
window.setTimeout("RepeatingLoop()", ClientCommunicator.prototype.waitTime);

function ClientCommunicator_start() {
    if (this.baseURL != null) {
        this.doLoop = true;
    }
    else {
        throw new Error("Must specify baseURL before starting communications");
    }
}

function ClientCommunicator_send(postData) {
    var client2Server = new Asynchronous
    client2Server.username = this.username;
    client2Server.password = this.password;
    var thisReference = this;
    client2Server.settings = {
        onComplete : function(xmlhttp) {
            if (xmlhttp.status != 200) {
                throw new Error("Post resulted in error (" + xmlhttp.status + ") error text (" + xmlhttp.statusText + ")");
            }
            thisReference.waitingForAnswer = false;
            thisReference.doLoop = true;
        }
    }
    client2Server.post(this.baseURL, postData);
}

function ClientCommunicator_doRedirection() {
    var client2Server = new Asynchronous
    client2Server.username = this.username;
    client2Server.password = this.password;
    var thisReference = this;
    var server2Client = new Asynchronous();
    client2Server.settings = {
        onComplete : function(xmlhttp) {
            if (xmlhttp.status == 201) {
                try {
                    thisReference.baseURL = xmlhttp.getResponseHeader("Location");
                }
                catch( e) {
                }
            }
            else if (xmlhttp.status != 200) {
                throw new Error("Post resulted in error (" + xmlhttp.status + ") error text (" + xmlhttp.statusText + ")");
            }
        }
    }
    client2Server.get(this.baseURL);
}

function ClientCommunicator_end() {
    this.doLoop = false;
}

ClientCommunicator.prototype.start = ClientCommunicator_start;
ClientCommunicator.prototype.end = ClientCommunicator_end;
ClientCommunicator.prototype.send = ClientCommunicator_send;
ClientCommunicator.prototype.doRedirection = ClientCommunicator_doRedirection;
ClientCommunicator.prototype.instances = new Array();
ClientCommunicator.prototype.instanceCount = new CounterHack();
ClientCommunicator.prototype.waitTime = 1000;
