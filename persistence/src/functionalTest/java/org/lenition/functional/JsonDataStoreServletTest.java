package org.lenition.functional;

import org.junit.Test;

import static com.jayway.restassured.RestAssured.expect;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;

public class JsonDataStoreServletTest {

    @Test
    public void testAllowOriginHeaders() {
        expect().
                header("Access-Control-Allow-Origin", "*").
                when().
                get("/");
    }
}
