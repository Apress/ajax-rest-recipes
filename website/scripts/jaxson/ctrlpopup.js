
/******************************************
* Popup Box- By Jim Silver @ jimsilver47@yahoo.com
* Visit http://www.dynamicdrive.com/ for full source code
* This notice must stay intact for use
******************************************/

var ns4=document.layers
var ie4=document.all
var ns6=document.getElementById&&!document.all

//drag drop function for NS 4////
/////////////////////////////////

var dragswitch=0
var nsx
var nsy
var nstemp

function drag_dropns(name){
    if (!ns4)
        return
    temp=eval(name)
    temp.captureEvents(Event.MOUSEDOWN | Event.MOUSEUP)
    temp.onmousedown=gons
    temp.onmousemove=dragns
    temp.onmouseup=stopns
}

function gons(e){
    temp.captureEvents(Event.MOUSEMOVE)
    nsx=e.x
    nsy=e.y
}
function dragns(e){
    if (dragswitch==1) {
        temp.moveBy(e.x-nsx,e.y-nsy)
        return false
    }
}

function stopns(){
    temp.releaseEvents(Event.MOUSEMOVE)
}

//drag drop function for ie4+ and NS6////
/////////////////////////////////


function drag_drop(e){
    if (ie4&&dragapproved) {
        crossobj.style.left=tempx+event.clientX-offsetx
        crossobj.style.top=tempy+event.clientY-offsety
        return false
    } else if (ns6&&dragapproved) {
        crossobj.style.left=tempx+e.clientX-offsetx+"px"
        crossobj.style.top=tempy+e.clientY-offsety+"px"
        return false
    }
}

function initializedrag(e){
    crossobj=ns6? document.getElementById("showimage") : document.all.showimage
    var firedobj=ns6? e.target : event.srcElement
    var topelement=ns6? "html" : document.compatMode && document.compatMode!="BackCompat"? "documentElement" : "body"
    while (firedobj.tagName!=topelement.toUpperCase() && firedobj.id!="dragbar") {
        firedobj=ns6? firedobj.parentNode : firedobj.parentElement
    }

    if (firedobj.id=="dragbar") {
        offsetx=ie4? event.clientX : e.clientX
        offsety=ie4? event.clientY : e.clientY

        tempx=parseInt(crossobj.style.left)
        tempy=parseInt(crossobj.style.top)

        dragapproved=true
        document.onmousemove=drag_drop
    }
}
document.onmouseup=new Function("dragapproved=false")

////drag drop functions end here//////

function hidebox(){
    crossobj=ns6? document.getElementById("showimage") : document.all.showimage
    if (ie4||ns6)
        crossobj.style.visibility="hidden"
    else if (ns4)
        document.showimage.visibility="hide"
}


/*
<div id="showimage" style="position:absolute;width:250px;left:250px;top:0px;visibility:hidden;">
    <table border="0" width="250" bgcolor="#000080" cellspacing="0" cellpadding="2">
        <tr>
            <td width="100%">
                <table border="0" width="100%" cellspacing="0" cellpadding="0"
                    height="36px">
                    <tr>
                        <td id="dragbar" style="cursor:hand; cursor:pointer" width="100%" onMousedown="initializedrag(event)">
                            <ilayer width="100%" onSelectStart="return false">
                            <layer width="100%" onMouseover="dragswitch=1;if (ns4) drag_dropns(showimage)" onMouseout="dragswitch=0">
                                <font face="Verdana"
                                        color="#FFFFFF"><strong><small>Pattern Details</small></strong></font>
                            </layer>
                            </ilayer>
                        </td>
                        <td style="cursor:hand"><a href="#" onClick="hidebox();return false"><img src="close.gif" width="16px"
                                    height="14px" border="0"></a></td>
                    </tr>
                    <tr>
                        <td width="100%" bgcolor="#FFFFFF" style="padding:4px" colspan="2" id="inject">
                            <!-- PUT YOUR CONTENT BETWEEN HERE -->

                            Testing 1 2 3
                            <!-- END YOUR CONTENT HERE -->

                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>

document.getElementById( "showimage").style.visibility = "visible";
    document.getElementById( "showimage").style.top = "105px";
    document.getElementById( "showimage").style.left ="105px";
    document.getElementById( "inject").innerHTML =
    document.getElementById( "txt" + element.title).innerHTML;
    
*/