package org.lenition.servlet;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@Path("/")
public class JsonDataStoreServlet {

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String test() {
        return "persistence";
    }

    @PUT
    @Produces(MediaType.APPLICATION_XML)
    @Consumes(MediaType.APPLICATION_JSON)
    public Entity put(Map<String, String> map) {

        // see https://developers.google.com/appengine/docs/java/gettingstarted/usingdatastore
        // https://developers.google.com/appengine/docs/java/datastore/entities
        for (String key : map.keySet()) {
            String value = map.get(key).trim();
            if (value.length()>0 && value.length()<450) {  // Short String - store as is
//                movieEntity.setProperty(key, value);
            } else if (value.length()>=450) {              // Long String - convert to text
//                movieEntity.setProperty(key, new Text(value));
            }
        }

        return new Entity("test");

    }

}
