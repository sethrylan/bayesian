package org.lenition.domain;

import com.google.gson.Gson;
import org.lenition.servlet.FactbookServlet;

import java.io.InputStreamReader;
import java.io.Reader;

import static org.junit.Assert.*;

public class DomainTest {

    @org.junit.Test
    public void TestDeserialization() {
        Gson gson = new Gson();
        Reader reader = new InputStreamReader(FactbookServlet.class.getClassLoader().getResourceAsStream("factbook-countries.json"));

        assertNotNull(reader);

        FactbookContainer o = gson.fromJson(reader, FactbookContainer.class);

        assertNotNull(o.factbook);
        assertNotNull(o.factbook.countries);
        assertTrue(o.factbook.countries.size() > 0);
    }


}