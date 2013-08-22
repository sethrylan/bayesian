package org.lenition.servlet;

import com.google.appengine.api.datastore.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * A class for storing generic JSON data in the GAE datastore
 */
@Path("/")
public class JsonDataStoreServlet {

    private static final String DEFAULT_ENTITY_KIND = "default";
    private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    private Gson gson = new Gson();

    /**
     * Retrieves default entities
     * @return default entities as JSON
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getDefault() {
        return this.get(DEFAULT_ENTITY_KIND);
    }

    /**
     * Retrieves entities
     * @param kind type entity
     * @return entites as JSON
     */
    @GET
    @Path("{kind}")
    @Produces(MediaType.APPLICATION_JSON)
    public String get(@PathParam("kind") String kind) {
        Query query = new Query(kind);
        List results = datastore.prepare(query).asList(FetchOptions.Builder.withDefaults());
        return gson.toJson(results);
    }

    /**
     * Stores JSON as default entity in datastore
     * @param json data to store
     * @return presisted key of stored object
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public String putDefault(String json) {
        return this.put(DEFAULT_ENTITY_KIND, json);
    }

    /**
     * Stores JSON in datastore
     * @param kind type of entity to store as
     * @param json data to store
     * @return presisted key of stored object
     */
    @PUT
    @Path("{kind}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public String put(@PathParam("kind") String kind, String json) {

        System.out.println("json = " + json);

        Key entityKey = KeyFactory.createKey(kind, UUID.randomUUID().toString());
        Entity entity = new Entity(entityKey);

        // See example code at http://google-gson.googlecode.com/svn-history/r550/trunk/gson/src/test/java/com/google/gson/functional/MapTest.java
        // Supported types: https://developers.google.com/appengine/docs/java/datastore/entities
        Type mapTypeToken = new TypeToken<Map<String,Object>>(){}.getType();
        Map<String, Object> map = gson.fromJson(json, mapTypeToken);
        for (String key : map.keySet()) {
            System.out.println(key + " : " + map.get(key).toString() + " : " + map.get(key).getClass());
            Object value = map.get(key);
            if(value instanceof String) {
                if (((String)value).length() > 0 && ((String)value).length() < 450) {
                    entity.setProperty(key, value);
                } else if (((String)value).length()>=450) {
                    entity.setProperty(key, new Text((String)value));
                }
            } else {
                entity.setProperty(key, new Text(gson.toJson(value)));
            }
        }
        Key persistedKey = datastore.put(entity);
        return gson.toJson(persistedKey);
    }
}
