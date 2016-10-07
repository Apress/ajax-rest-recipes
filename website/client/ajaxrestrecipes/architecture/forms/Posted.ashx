<% @ webhandler language="C#" class="Posted" %>

using System;
using System.Collections;
using System.Web;

public class Posted : IHttpHandler {
    public bool IsReusable {
        get {
            return true;
        }
    }
    
    /// Processes the XMLHttpRequest and returns a response XML
public void ProcessRequest(HttpContext ctx) {
    ctx.Response.ContentType = "text/html";
    ctx.Response.Write("<HTML><BODY>You wrote <b>" + ctx.Request["example"] + "</b></BODY></HTML>");
}
}


