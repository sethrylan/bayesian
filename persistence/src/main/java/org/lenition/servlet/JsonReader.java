package org.lenition.servlet;

import com.google.gson.Gson;
import org.apache.commons.io.IOUtils;

import javax.ws.rs.Consumes;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyReader;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

/**
 * Reader for request with type application/json.
 * @param <T> parameterized type of JSON data
 */
@Provider
@Consumes("application/json")
public class JsonReader<T> implements MessageBodyReader<T> {

    @Override
    public boolean isReadable(Class<?> type,
                              Type genericType,
                              Annotation[] annotations,
                              MediaType mediaType) {
        return true;
    }

    @Override
    public T readFrom(Class<T> type,
                      Type genericType,
                      Annotation[] annotations,
                      MediaType mediaType,
                      MultivaluedMap<String, String> httpHeaders,
                      InputStream entityStream) throws IOException, WebApplicationException {
        // Convert Stream to String
        StringWriter writer = new StringWriter();
        IOUtils.copy(entityStream, writer, "UTF-8");
        String json = writer.toString();

        // if Stream is expected to be a String, then just cast
        if (String.class == genericType) {
            return type.cast(json);
        } else {
            // otherwise deserialize to type
            return new Gson().fromJson(json, genericType);
        }
    }
}
