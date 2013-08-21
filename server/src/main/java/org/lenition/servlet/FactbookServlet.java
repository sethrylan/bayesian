package org.lenition.servlet;

import com.google.gson.Gson;
import org.apache.commons.io.IOUtils;
import org.lenition.singleton.FactbookQuiz;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;

/**
 * ReST resource for factbook questions
 */
@Path("factbook")
public class FactbookServlet {

    /**
     * Returns JSON representation of factbook country data
     * @return  factbook countries in JSON
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String factbook() {
        try {
            return IOUtils.toString(FactbookServlet.class.getClassLoader().getResourceAsStream("factbook-countries.json"), "UTF-8");
        } catch (IOException e) {
            e.printStackTrace();
            return "{ \"error\" : \"Could not find factbook\" }";
        }
    }

    /**
     * Returns JSON representation of factbook questions
     * @param n number of questions
     * @return factbook questions in JSON
     */
    @GET
    @Path("questions")
    @Produces(MediaType.APPLICATION_JSON)
    public String question(@DefaultValue("30") @QueryParam("n") int n) {
        return (new Gson()).toJson(FactbookQuiz.INSTANCE.getQuestions(n));
    }

}
