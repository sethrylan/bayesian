package org.lenition.servlet;

import com.google.appengine.api.datastore.*;
import com.google.gson.Gson;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;
import java.util.UUID;

@Path("/")
public class JsonDataStoreServlet {

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String test() {
        return "{ \"persistence\" : \"get\" }";
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public String put(String json) {

        /*
        see https://developers.google.com/appengine/docs/java/gettingstarted/usingdatastore
        https://developers.google.com/appengine/docs/java/datastore/entities
        */

        Key entityKey = KeyFactory.createKey("QuizComplete", UUID.randomUUID().toString());
        Entity quizEntity = new Entity(entityKey);
        Gson gson = new Gson();
        Map map = gson.fromJson(json, Map.class);
        for(Object key : map.keySet()) {
            System.out.println(key.toString() + " : " + map.get(key).toString());
        }

//        jsonArray.
//        for (String key : map.keySet()) {
//            String value = map.get(key).trim();
//            if (value.length() > 0 && value.length() < 450) {  // Short String - store as is
//                quizEntity.setProperty(key, value);
//            } else if (value.length()>=450) {              // Long String - convert to text
//                quizEntity.setProperty(key, new Text(value));
//            }
//        }
        Key persistedKey = datastore.put(quizEntity);
        return "{ \"complete\" : \"" + (persistedKey.isComplete() ? "true" : "false") + "\" }";
    }
}
