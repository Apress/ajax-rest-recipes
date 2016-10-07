//////////////////////////////////////////////////
//  <JavaScript RSS Reader>         //
//  (c) 2003 Premshree Pillai       //
//  Written on: 07/06/03 (dd/mm/yy)     //
//  http://www.qiksearch.com/       //
//////////////////////////////////////////////////

function readRSS(URI) {
    if (window.ActiveXObject) {
        var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        while (xmlDoc.readyState != 4) document.write('Loading...');
    }
    else if (document.implementation && document.implementation.createDocument)
        xmlDoc = document.implementation.createDocument("", "doc", null);
    xmlDoc.load(URI);
    items = xmlDoc;
    
    function verify() {if (xmlDoc.readyState != 4) return false;}
    
    function formatRSS() {
        var items_count=items.getElementsByTagName('item').length;
        var pubDate=new Array(), date=new Array, link=new Array(), title=new Array(), description=new Array(), guid=new Array();
        
        for (var i=0; i < items_count; i++) {
            if (items.getElementsByTagName('item')[i].getElementsByTagName('pubDate').length == 1)
                pubDate[i] = items.getElementsByTagName('item')[i].getElementsByTagName('pubDate')[0];
            if (items.getElementsByTagName('item')[i].getElementsByTagName('dc:date').length == 1)
                date[i] = items.getElementsByTagName('item')[i].getElementsByTagName('dc:date')[0];
            if (items.getElementsByTagName('item')[i].getElementsByTagName('link').length == 1)
                link[i] = items.getElementsByTagName('item')[i].getElementsByTagName('link')[0];
            if (items.getElementsByTagName('item')[i].getElementsByTagName('guid').length == 1)
                guid[i] = items.getElementsByTagName('item')[i].getElementsByTagName('guid')[0];
            if (items.getElementsByTagName('item')[i].getElementsByTagName('title').length == 1)
                title[i] = items.getElementsByTagName('item')[i].getElementsByTagName('title')[0];
            if (items.getElementsByTagName('item')[i].getElementsByTagName('description').length == 1)
                description[i] = items.getElementsByTagName('item')[i].getElementsByTagName('description')[0];
        }
        
        if ((description.length == 0) && (title.length == 0)) return false;
        
        document.write('<html><head><title>' + xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue + '</title></head><body>');
        document.write('<span style="font-family:verdana,arial,helvetica; font-size:8pt">');
        document.write('<center><a href="rss-reader.htm"><h3>[Go Back]</h3></a></center>');
        document.write('<center><a href="' + xmlDoc.getElementsByTagName('link')[0].firstChild.nodeValue + '"><h2>' + xmlDoc.getElementsByTagName('description')[0].firstChild.nodeValue + '</h2></a></center>');
        var ws=/\S/;
        
        for (var i=0; i < items_count; i++) {
            var pubDate_w, title_w, link_w;
            pubDate_w = (pubDate.length > 0) ?pubDate[i].firstChild.nodeValue: "<i>Date NA</i>";
            if (document.all)
                title_w = (title.length > 0) ?title[i].text: "<i>Untitled</i>";
            else
                title_w = (title.length > 0) ?title[i].firstChild.nodeValue: "<i>Untitled</i>";
            
            link_w = (link.length > 0) ?link[i].firstChild.nodeValue: "";
            if (link.length == 0) link_w = (guid.length > 0) ?guid[i].firstChild.nodeValue: "";
            if (title.length > 0) title_w = (!ws.test(title_w)) ?"<i>Untitled</i>": title_w;
            if (pubDate.length == 0) pubDate_w = (date.length > 0) ?date[i].firstChild.nodeValue: "<i>Date NA</i>";
            document.write('<a href="' + link_w + '"><b>' + title_w + '</b></a> <b>[' + pubDate_w + ']</b><br>');
            if (description.length > 0)
                document.write('<font size="-1">' + description[i].firstChild.nodeValue + '</font><hr noshade><br>');
        }
        document.write('</span></body></html>');
    }
    
    if (typeof(xmlDoc) != "undefined") {
        if (window.ActiveXObject) formatRSS();
        else xmlDoc.onload = formatRSS;
    }
}

function checkString() {
    var loc=document.location.href.split("?")
    if (loc.length > 1) {
        URI = loc[1].split("=");
        if (URI.length > 1) {
            var retURI="";
            for (var i=1; i < URI.length; i++) retURI += URI[i];
            try {readRSS(unescape(retURI));}
            catch(e) {}
        }
    }
}
</script>

    < script language = "JavaScript" >
//////////////////////////////////////////////////
//  <JavaScript Atom Parser>        //
//  (c) 2004 Premshree Pillai       //
//  Written on: 29/01/03            //
//  http://www.qiksearch.com/       //
//////////////////////////////////////////////////
    
    function parseAtom(URI) {
    if (window.ActiveXObject) {
        var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        while (xmlDoc.readyState != 4) document.write('Loading...');
    }
    else if (document.implementation && document.implementation.createDocument)
        xmlDoc = document.implementation.createDocument("", "doc", null);
    xmlDoc.load(URI);
    items = xmlDoc;
    
    function verify() {if (xmlDoc.readyState != 4) return false;}
    
    function formatAtom() {
        var items_count=items.getElementsByTagName('entry').length;
        var title = new Array(), link = new Array(), author = new Array(), dates = new Array();
        
        for (var i=0; i < items_count; i++) {
            title[i] = items.getElementsByTagName('entry')[i].getElementsByTagName('title')[0];
            link[i] = items.getElementsByTagName('entry')[i].getElementsByTagName('link')[0].getAttribute('href');
            dates[i] = items.getElementsByTagName('issued')[i];
            author[i] = items.getElementsByTagName('name')[i];
        }
        
        document.write('<html><head><title>' + xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue + '</title><style type="text/css">body{font-family:Trebuchet MS,arial,verdana,helvetica; font-size:10pt} a{color:#0033CC} a:hover{color:#0066FF} li{list-style:square}</style></head><body>');
        document.write('<center><a href="atom-parser.htm"><h4>[Go Back]</h4></a></center>');
        document.write('<center><a href="' + xmlDoc.getElementsByTagName('link')[0].getAttribute('href') + '"><h2>' + xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue + '&mdash;' + xmlDoc.getElementsByTagName('tagline')[0].firstChild.nodeValue + '</h2></a></center>');
        var ws=/\S/;
        
        document.write('<ul>');
        for (var i=0; i < items_count; i++) {
            document.write('<li><a href="' + link[i] + '">' + title[i].firstChild.nodeValue + '</a> (by <b>' + author[i].firstChild.nodeValue + '</b>)</li>');
        }
        document.write('</ul></body></html>');
    }
    
    if (typeof(xmlDoc) != "undefined") {
        if (window.ActiveXObject) formatAtom();
        else xmlDoc.onload = formatAtom;
    }
}

function checkString() {
    var loc = document.location.href.split("?")
    if (loc.length > 1) {
        URI = loc[1].split("=");
        if (URI.length > 1) {
            var retURI="";
            for (var i=1; i < URI.length; i++) retURI += URI[i];
            try { parseAtom(unescape(retURI)); }
            catch(e) { }
        }
    }
}
</script>



function anonymous() {
    var origFunc = (function (element) {
        document.getElementById(element).innerHTML = "failed";
        this.isRunning = false;
        throw new Error("Test failed");
    });
    var proxyFunc = (function (toCalls, args) {
        this._didFinish = true;
        var newArg = new Array();
        newArg.push(this.currFunction);
        info("failed", this.failed.toString());
        toCalls.apply(this, newArg);
    });
    args = new Array(); for (var c1 = 0; c1 < arguments.length; c1++) {
        args.push(arguments[0]);
    }
    args.push(origFunc);
    args.push(arguments);
    proxyFunc.apply(this, args);
}
