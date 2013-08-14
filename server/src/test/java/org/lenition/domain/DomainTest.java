package org.lenition.domain;

import com.google.gson.Gson;
import org.lenition.servlet.FactbookServlet;

import static org.junit.Assert.*;

public class DomainTest {

    @org.junit.Test
    public void TestDeserialization() {
        Gson gson = new Gson();
        String json = convertStreamToString(FactbookServlet.class.getClassLoader().getResourceAsStream("factbook-countries.json"));

        assertNotNull(json);
        assertFalse(json.isEmpty());

        FactbookContainer o = gson.fromJson(json,FactbookContainer.class);

        assertNotNull(o.factbook);
        assertNotNull(o.factbook.countries);
        assertTrue(o.factbook.countries.size() > 0);
    }

    static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }


}
