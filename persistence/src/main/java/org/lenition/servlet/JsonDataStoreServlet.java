package org.lenition.servlet;

import com.google.appengine.api.datastore.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.UUID;

@Path("/")
public class JsonDataStoreServlet {

    private static final String DEFAULT_ENTITY_KIND = "default";
    private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    private Gson gson = new Gson();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getDefault() {
        return this.get(DEFAULT_ENTITY_KIND);
    }

    @GET
    @Path("{entity}")
    @Produces(MediaType.APPLICATION_JSON)
    public String get(@PathParam("entity") String entity) {
        return gson.toJson("success");
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public String putDefault(String json) {
        return this.put(DEFAULT_ENTITY_KIND, json);
    }

    @PUT
    @Path("{entity}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public String put(@PathParam("entity") String entity, String json) {

        System.out.println("json = " + json);
        /*
        see https://developers.google.com/appengine/docs/java/gettingstarted/usingdatastore
        https://developers.google.com/appengine/docs/java/datastore/entities
        */

        Key entityKey = KeyFactory.createKey(entity, UUID.randomUUID().toString());
        Entity quizEntity = new Entity(entityKey);

        // See example code at http://google-gson.googlecode.com/svn-history/r550/trunk/gson/src/test/java/com/google/gson/functional/MapTest.java
        Type mapTypeToken = new TypeToken<Map<String,Object>>(){}.getType();
        Map<String, Object> map = gson.fromJson(json, Map.class);
        for(String key : map.keySet()) {
            System.out.println(key + " : " + map.get(key).toString());
        }

        for (String key : map.keySet()) {
            quizEntity.setProperty(key, map.get(key));
//            String value = map.get(key).trim();
//            if (value.length() > 0 && value.length() < 450) {  // Short String - store as is
//                quizEntity.setProperty(key, value);
//            } else if (value.length()>=450) {              // Long String - convert to text
//                quizEntity.setProperty(key, new Text(value));
//            }
        }
        Key persistedKey = datastore.put(quizEntity);
        return gson.toJson(persistedKey);
    }
}
