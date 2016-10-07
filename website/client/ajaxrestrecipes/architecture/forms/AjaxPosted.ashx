<% @ webhandler language="C#" class="AjaxPosted" %>

using System;
using System.Collections;
using System.Web;
using System.Web.SessionState;

public class AjaxPosted : IHttpHandler {
    public static string _val;
    
    public bool IsReusable {
        get {
            return true;
        }
    }
    
    /// Processes the XMLHttpRequest and returns a response XML
public void ProcessRequest(HttpContext ctx) {
    ctx.Response.ContentType = "text/html";
    if( ctx.Request.HttpMethod == "POST") {
        //HttpSessionState session = ctx.Session;
        //ctx.Session.Add( "example", ctx.Request[ "example"]);
        _val = ctx.Request[ "example"];
        ctx.Response.Write("<HTML><BODY>You wrote <b>" + ctx.Request["example"] + "</b></BODY></HTML>");
    }
    else if( ctx.Request.HttpMethod == "GET") {
        ctx.Response.Write("<HTML><BODY>You wrote <b>" + _val + "</b></BODY></HTML>");
    }
}
}


