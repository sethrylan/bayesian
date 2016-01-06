package org.lenition.servlet;

import com.google.gson.Gson;
import org.apache.commons.io.IOUtils;
import org.lenition.singleton.FactbookQuiz;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.io.IOException;

/**
 * ReST resource for factbook questions.
 */
@Path("factbook")
public class FactbookServlet {

    /**
     * Returns JSON representation of factbook questions.
     * @param n number of questions
     * @return factbook questions in JSON
     */
    @GET
    @Path("questions")
    @Produces(MediaType.APPLICATION_JSON)
    public String question(@DefaultValue("30") @QueryParam("n") int n) {
        return (new Gson()).toJson(FactbookQuiz.INSTANCE.getQuestions(n).questions);
    }

}
