package org.lenition.singleton;

import com.google.gson.Gson;
import org.apache.commons.lang3.ArrayUtils;
import org.lenition.domain.Factbook;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

public enum Quiz {

    INSTANCE;
    Factbook factbook;

    private static final Logger log = Logger.getLogger(Quiz.class.getName());

    Map<String, Integer> categoryWeights = new HashMap<String, Integer>() {{
        put("area", 5);
        put("population", 5);
        put("gdpPerCapita", 5);
        put("healthExp", 5);
        put("gini", 5);
    }};

    Quiz() {
        Reader reader = new InputStreamReader(Quiz.class.getClassLoader().getResourceAsStream("factbook-countries.json"));
        Factbook.FactbookContainer o = (new Gson()).fromJson(reader, Factbook.FactbookContainer.class);
        factbook = o.factbook;
    }

    public String getQuiz(int numberOfQuestions) {
        Gson gson = new Gson();
        int index = 0;

        org.lenition.domain.Quiz quiz = new org.lenition.domain.Quiz();
        while(index < numberOfQuestions) {
            org.lenition.domain.Quiz.Question q = new org.lenition.domain.Quiz.Question();
            q.category = getRandomCategory();
            switch (q.category) {
                case "area":

                    Factbook.Country[] countries = this.getRandomCountries();
                    q.text = String.format("%s is bigger than %s.", countries[0].name, countries[1].name);
                    q.hint = String.format("%s: %s<br>%s: %s", countries[0].name, countries[0].area.text, countries[1].name, countries[1].area.text);
//                    q.fact =
//                    q.feedback;
//                    q.hint;
//                    q.options;
                    break;
                case "population":
                    break;
                case "gdpPerCapita":
                    break;
                case "healthExp":
                    break;
                case "gini":
                    break;
                default:
                    log.info("No such feedback category.");
                    break;
            }

            ArrayUtils.add(quiz.questions, q);
            index++;
        }


        return gson.toJson(quiz);
    }

    public Factbook.Country[] getRandomCountries() {
        //TODO
        return ArrayUtils.toArray(factbook.countries[0], factbook.countries[1]);
    }


    public String getRandomCategory() {
        //TODO
        return "area";
    }

}
