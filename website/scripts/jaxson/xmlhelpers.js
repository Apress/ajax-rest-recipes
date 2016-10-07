function XMLIterateElements( objVerify, objData, element) {
    objVerify.verify( element, objData);
    for( var i = 0; i < element.childNodes.length; i ++) {
        XMLIterateElements( objVerify, objData, element.childNodes[ i]);
    }
}

function HTMLIterator( element) {
    if( navigator.appName == "Microsoft Internet Explorer") {
        return element.innerHTML;
    }
    else {
        var buffer = "";
        if( element.nodeType == 1) {
            buffer +="<" + element.nodeName + " ";
            for( var i = 0; i < element.attributes.length; i ++) {
                var attr = element.attributes[ i];
                var name = attr.name.toLowerCase();
                // This if is necessary because Microsoft Internet Explorer has the habit of
                // outputting all elements, this is not a wrong behavior, just tedious
                if(!(name.charAt( 0) == 'o' && name.charAt( 1) == 'n') &&
                   attr.value != null && !(typeof(attr.value) == "string" && attr.value.length == 0)) {
                    if( new String( element[ attr.name]).toLowerCase() == "undefined") {
                        buffer += attr.name + "=\"" + attr.value + "\" ";
                    }
                    else {                                
                        buffer += attr.name + "=\"" + element[ attr.name] + "\" ";
                    }
                }
            }
            buffer += ">";
            // If this is a textarea node, then inject the value directly
            if( element.nodeName.toLowerCase() == "textarea") {
                buffer += element.value;
            }
            else {
                for( var i = 0; i < element.childNodes.length; i ++) {
                    buffer += HTMLIterator( element.childNodes[ i]);
                }
            }
            buffer += "</" + element.nodeName + ">";
        }
        else if( element.nodeType == 3) {
            buffer += element.nodeValue;
        }
        else {
            throw new Error( "HTMLIterator element not implemented");
        }
        return buffer;
    }
}
