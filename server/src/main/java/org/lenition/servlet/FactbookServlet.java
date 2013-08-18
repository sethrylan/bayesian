package org.lenition.servlet;

import com.google.gson.Gson;
import org.lenition.singleton.FactbookQuiz;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

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
        return convertStreamToString(FactbookServlet.class.getClassLoader().getResourceAsStream("factbook-countries.json"));
    }

    /**
     * Returns JSON representation of factbook questions
     * @param n number of questions
     * @return factbook questions in JSON
     */
    @GET
    @Path("questions")
    @Produces(MediaType.APPLICATION_JSON)
    public String question(@QueryParam("n") int n) {
        return (new Gson()).toJson(FactbookQuiz.INSTANCE.getQuestions(n));
    }

    static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

}
