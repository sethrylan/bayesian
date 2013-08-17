package org.lenition.singleton;

import com.google.gson.Gson;
import org.apache.commons.lang3.ArrayUtils;
import org.lenition.domain.Factbook;
import org.lenition.domain.Quiz;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

public enum Questionnaire {

    INSTANCE;
    Factbook factbook;

    private static final Logger log = Logger.getLogger(Questionnaire.class.getName());

    Map<String, Integer> categoryWeights = new HashMap<String, Integer>() {{
        put("area", 5);
        put("population", 5);
        put("gdpPerCapita", 5);
        put("healthExp", 5);
        put("gini", 5);
    }};

    Questionnaire() {
        Reader reader = new InputStreamReader(Questionnaire.class.getClassLoader().getResourceAsStream("factbook-countries.json"));
        Factbook.FactbookContainer o = (new Gson()).fromJson(reader, Factbook.FactbookContainer.class);
        factbook = o.factbook;
    }

    public String getQuiz(int numberOfQuestions) {
        Gson gson = new Gson();
        int index = 0;

        Quiz quiz = new Quiz();
        while(index < numberOfQuestions) {
            Quiz.Question q = new Quiz.Question();
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
