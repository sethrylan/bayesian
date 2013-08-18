package org.lenition.functional;

import org.junit.Test;

import static com.jayway.restassured.RestAssured.expect;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;

public class FactbookServletTest {

    @Test
    public void testQuestionsSize() {
        final int parameter = 10;
        expect().
            body("questions.size", equalTo(parameter)).
            when().
            get("/factbook/questions?n={n}", String.valueOf(parameter));
    }

    @Test
    public void testNonNullFields() {
        final int parameter = 100;
        expect().
            body("questions", not(containsString(" null"))).
            when().
            get("/factbook/questions?n={n}", String.valueOf(parameter));
    }
}
