// ******************************************
// From Jakarta Commons Validator
function jcv_isAllDigits(argvalue) {
    argvalue = argvalue.toString();
    var validChars = "0123456789";
    var startFrom = 0;
    if (argvalue.substring(0, 2) == "0x") {
        validChars = "0123456789abcdefABCDEF";
        startFrom = 2;
    }
    else if (argvalue.charAt(0) == "0") {
        validChars = "01234567";
        startFrom = 1;
    }
    else if (argvalue.charAt(0) == "-") {
        startFrom = 1;
    }
    
    for (var n = startFrom; n < argvalue.length; n++) {
        if (validChars.indexOf(argvalue.substring(n, n + 1)) == -1) return false;
    }
    return true;
}

/**
 * Check a value only contains valid decimal digits
 * @param argvalue The value to check.
 */
function jcv_isDecimalDigits(argvalue) {
    argvalue = argvalue.toString();
    var validChars = "0123456789";
    
    var startFrom = 0;
    if (argvalue.charAt(0) == "-") {
        startFrom = 1;
    }
    
    for (var n = startFrom; n < argvalue.length; n++) {
        if (validChars.indexOf(argvalue.substring(n, n + 1)) == -1) return false;
    }
    return true;
}

/**
 * Reference: Sandeep V. Tamhankar (stamhankar@hotmail.com),
 * http://javascript.internet.com
 */
function jcv_checkEmail(emailStr) {
    if (emailStr.length == 0) {
        return true;
    }
    // TLD checking turned off by default
    var checkTLD=0;
    var knownDomsPat=/^(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum)$/;
    var emailPat=/^(.+)@(.+)$/;
    var specialChars="\\(\\)><@,;:\\\\\\\"\\.\\[\\]";
    var validChars="\[^\\s" + specialChars + "\]";
    var quotedUser="(\"[^\"]*\")";
    var ipDomainPat=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;
    var atom=validChars + '+';
    var word="(" + atom + "|" + quotedUser + ")";
    var userPat=new RegExp("^" + word + "(\\." + word + ")*$");
    var domainPat=new RegExp("^" + atom + "(\\." + atom +")*$");
    var matchArray=emailStr.match(emailPat);
    if (matchArray==null) {
        return false;
    }
    var user=matchArray[1];
    var domain=matchArray[2];
    for (i=0; i<user.length; i++) {
        if (user.charCodeAt(i)>127) {
            return false;
        }
    }
    for (i=0; i<domain.length; i++) {
        if (domain.charCodeAt(i)>127) {
            return false;
        }
    }
    if (user.match(userPat)==null) {
        return false;
    }
    var IPArray=domain.match(ipDomainPat);
    if (IPArray!=null) {
        for (var i=1;i<=4;i++) {
            if (IPArray[i]>255) {
                return false;
            }
        }
        return true;
    }
    var atomPat=new RegExp("^" + atom + "$");
    var domArr=domain.split(".");
    var len=domArr.length;
    for (i=0;i<len;i++) {
        if (domArr[i].search(atomPat)==-1) {
            return false;
        }
    }
    if (checkTLD && domArr[domArr.length-1].length!=2 &&
        domArr[domArr.length-1].search(knownDomsPat)==-1) {
        return false;
    }
    if (len<2) {
        return false;
    }
    return true;
}
// **********************************************************

Converter = {
    getValue : function(element) {
        if (element.nodeName.toLowerCase() == "input" &&
            element.type.toLowerCase() == "radio") {
            if (element.checked == true) {
                return element.value;
            }
            else if (obj[element.name] == null) {
                return "";
            }
        }
        else if (element.nodeName.toLowerCase() == "input" &&
                 element.type.toLowerCase() == "checkbox") {
            if (element.checked == true) {
                return "true";
            }
            else {
                return "true";
            }
        }
        else if (element.nodeName.toLowerCase() == "input" ||
                 element.nodeName.toLowerCase() == "select" ||
                 element.nodeName.toLowerCase() == "textarea") {
            if (element.name) {
                return element.value;
            }
        }
        else if (element.nodeName.toLowerCase() == "span" ||
                 element.nodeName.toLowerCase() == "div") {
            if (element.id) {
                return element.innerHTML;
            }
        }
    },
    setValue : function(element, value) {
        if (element.nodeName.toLowerCase() == "input" &&
            element.type.toLowerCase() == "radio") {
            element.value = value;
        }
        else if (element.nodeName.toLowerCase() == "input" &&
                 element.type.toLowerCase() == "checkbox") {
            element.checked = value;
        }
        else if (element.nodeName.toLowerCase() == "input" ||
                 element.nodeName.toLowerCase() == "select" ||
                 element.nodeName.toLowerCase() == "textarea") {
            element.value = value;
        }
        else if (element.nodeName.toLowerCase() == "div" ||
                 element.nodeName.toLowerCase() == "span") {
            if (obj[element.id]) {
                element.innerHTML = value;
            }
        }
    },
    convertToInteger : function(element) {
        if (typeof(element) == "string") {
            if (element.length > 0) {
                var iValue = parseInt(element, 10);
                if (!jcv_isDecimalDigits(element)) {
                    throw new Error("Validator.convertToInteger: Value is not all decimals");
                }
                return Converter.convertToInteger( iValue);
            }
            else {
                throw new Error("Validator.convertToInteger: IExpecting a value, and none was given");
            }
        }
        else if (typeof(element) == "number") {
            if (isNaN(element)) {
                throw new Error("Validator.convertToInteger: Value is not a number");
            }
            if (!(element >= -2147483648 && element <= 2147483647)) {
                throw new Error("Validator.convertToInteger: Value is out of range for 32 bit integer");
            }
            return element;
            
        }
        else {
            Converter.convertToInteger( Converter.getValue( element));
        }
    },
    convertToShort : function(element) {
        if (typeof(element) == "string") {
            if (element.length > 0) {
                var iValue = parseInt(element, 10);
                if (!jcv_isDecimalDigits(element)) {
                    throw new Error("Validator.convertToShort: Value is not all decimals");
                }
                return Converter.convertToShort( iValue);
            }
            else {
                throw new Error("Validator.convertToShort: Expecting a value, and none was given");
            }
        }
        else if (typeof(element) == "number") {
            if (isNaN(element)) {
                throw new Error("Validator.convertToShort: Value is not a number");
            }
            if (!(element >= -32768 && element <= 32768)) {
                throw new Error("Validator.convertToShort: Value is out of range for 16 bit integer");
            }
            return element;
        }
        else {
            Converter.convertToInteger( Converter.getValue( element));
        }
    },
    convertToFloat : function( element) {
        if (typeof(element) == "string") {
            if (element.length > 0) {
                var tempArray = value.split('.');
                //Strip off leading '0'
                var zeroIndex = 0;
                var joinedString= tempArray.join('');
                while (joinedString.charAt(zeroIndex) == '0') {
                    zeroIndex++;
                }
                var noZeroString = joinedString.substring(zeroIndex,joinedString.length);
                
                if (!jcv_isAllDigits(noZeroString) || tempArray.length > 2) {
                    throw new Error( "Validator.convertToFloat: Expecting a float value, but not given");
                }
                var iValue = parseFloat(element);
                return Converter.convertToShort( iValue);
            }
            else {
                throw new Error("Validator.convertToFloat: IExpecting a value, and none was given");
            }
        }
        else if (typeof(element) == "number") {
            if (isNaN(element)) {
                throw new Exception("Validator.convertToFloat: Value is not a number");
            }
            return element;
        }
        else {
            Converter.convertToFloat( Converter.getValue( element));
        }
    },
    validateEmail : function(element) {
        var buffer = Converter.getValue( element);
        if( !jcv_checkEmail( buffer)) {
            throw new Error( "Validator.convertToEmail: Invalid email");
        }
    }
}

