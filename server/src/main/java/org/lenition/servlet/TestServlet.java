package org.lenition.servlet;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("test")
public class TestServlet {

    @GET
    @Produces(MediaType.APPLICATION_XML)
    public String test() {
        return "<person><name>Jane Doe</name><age>30</age></person>";
    }

}
