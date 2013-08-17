package org.lenition.singleton;

import com.google.gson.Gson;
import org.apache.commons.lang3.ArrayUtils;
import org.lenition.domain.Factbook;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.*;
import java.util.logging.Logger;

public enum Quiz {

    INSTANCE;                           // must be first listed member in an enum
    private Factbook factbook;
    private Random random = new Random(System.currentTimeMillis());
    private String[] cd = {};           // category distribution
    private static final Logger log = Logger.getLogger(Quiz.class.getName());
    private final Map<String, Integer> weightedCategories = new HashMap<String, Integer>() {{
        put("area", 5);
        put("population", 5);
        put("gdpPerCapita", 5);
        put("healthExpenditure", 5);
        put("gini", 5);
    }};
    private static String[] EXCLUDED_IDS = {
        "um", // United States Pacific Island Wildlife Refuges
        "wf", // Wallis and Futuna
        "bq", // Navassa Island
        "at", // Ashmore and Cartier Islands
        "kt", // Christmas Island
        "ck", // Cocos (Keeling) Islands
        "cr", // Coral Sea Islands
        "ne", // Niue
        "nf", // Norfolk Island
        "cq", // Northern Mariana Islands
        "tl", // Tokelau
        "tb", // Saint Barthelemy
        "dx", // Dhekelia
        "jn", // Jan Mayen
        "je", // Jersey
        "ip", // Clipperton Island
        "sb", // Saint Pierre and Miquelon
        "io", // British Indian Ocean Territory
        "sh", // Saint Helena, Ascension, and Tristan da Cunha
        "bv", // Bouvet Island
        "fs", // French Southern and Antarctic Lands
        "hm", // Heard Island and McDonald Islands
        "nc", // New Caledonia
        "wq" // Wake Island
    };

    Quiz() {
        // Read factbook data
        Reader reader = new InputStreamReader(Quiz.class.getClassLoader().getResourceAsStream("factbook-countries.json"));
        Factbook.FactbookContainer o = (new Gson()).fromJson(reader, Factbook.FactbookContainer.class);
        factbook = o.factbook;

        // Create probability array for categories
        List<String> cdList = new ArrayList<String>();
        for(Map.Entry<String, Integer> weightedCategory : weightedCategories.entrySet()) {
            cdList.addAll(Collections.nCopies(weightedCategory.getValue(), weightedCategory.getKey()));
        }
        cd = cdList.toArray(new String[]{});
    }

    public String getQuestions(final int numberOfQuestions) {
        Gson gson = new Gson();
        int index = 0;

        org.lenition.domain.Quiz quiz = new org.lenition.domain.Quiz();
        while(index < numberOfQuestions) {
            org.lenition.domain.Quiz.Question q = new org.lenition.domain.Quiz.Question();
            Factbook.Value[] values = null;
            Factbook.Country[] countries;
            do {
                q.category = getRandomCategory();
                countries = this.getRandomCountries();

                switch (q.category) {
                    case "area":
                        q.text = String.format("%s is bigger than %s.", countries[0].name, countries[1].name);
                        values = ArrayUtils.toArray(countries[0].area, countries[1].area);
                        break;
                    case "population":
                        q.text = String.format("%s has more people than %s.", countries[0].name, countries[1].name);
                        values = ArrayUtils.toArray(countries[0].population, countries[1].population);
                        break;
                    case "gdpPerCapita":
                        q.text = String.format("%s has higher GDP (PPP) per capita than %s.", countries[0].name, countries[1].name);
                        values = ArrayUtils.toArray(countries[0].gdpPerCapita, countries[1].gdpPerCapita);
                        break;
                    case "healthExpenditure":
                        q.text = String.format("%s has higher health expenditure %s.", countries[0].name, countries[1].name);
                        values = ArrayUtils.toArray(countries[0].healthExpenditure, countries[1].healthExpenditure);
                        break;
                    case "gini":
                        q.text = String.format("%s has more people than %s.", countries[0].name, countries[1].name);
                        values = ArrayUtils.toArray(countries[0].gini, countries[1].gini);
                        break;
                    default:
                        log.info("No such feedback category.");
                        break;
                }
            } while(values[0].value == null || values[1].value == null );

//            System.out.println("values[0].value == null ? " + String.valueOf(values[0].value == null));
//            System.out.println("values[1].value == null ? " + String.valueOf(values[1].value == null));
//
//            System.out.println("Category: " + q.category);
//            System.out.println("Countries: " + countries[0].name + ", " + countries[1].name);
//            System.out.println("Values: " + values[0].value + ", " + values[1].value);
//            System.out.println("Texts: " + values[0].text + ", " + values[1].text);


            q.hint = String.format("%s: %s<br>%s: %s", countries[0].name, values[0].text, countries[1].name, values[1].text);
            q.fact = String.valueOf(values[0].value.compareTo(values[1].value) > 0);
            q.feedback = String.format(" {\"category\": \"%s\", \"values\": [{\"name\": \"%s\",\"value\": %d},{\"name\": \"%s\",\"value\": %d}]}",
                    q.category, countries[0].name, values[0].value.intValue(), countries[1].name, values[1].value.intValue());
            q.options = getBooleanOptions();

            quiz.questions = ArrayUtils.add(quiz.questions, q);
            index++;
        }

        System.out.println("quiz.questions.length:" + quiz.questions.length);
        return gson.toJson(quiz);
    }

    /**
     * Returns a randomly selected category based on their weighted probability
     * @return a random category
     */
    private String getRandomCategory() {
//        return cd[random.nextInt(cd.length)];
        return "area";
    }

    /**
     * Returns a two different, randomly selected countries, neither of which is from the excluded list
     * @return two random countries
     */
    public Factbook.Country[] getRandomCountries() {
        Factbook.Country countryOne, countryTwo;
        do {
            countryOne = factbook.countries[random.nextInt(factbook.countries.length)];
            countryTwo = factbook.countries[random.nextInt(factbook.countries.length)];
        } while( countryOne == countryTwo);

        return ArrayUtils.toArray(countryOne, countryTwo);
    }

    /**
     * Returns a randomly selected country not in the excluded list
     * @return a random country
     */
    private Factbook.Country getRandomCountry() {
        Factbook.Country country;
        do {
            country = factbook.countries[random.nextInt(factbook.countries.length)];
        } while(ArrayUtils.contains(EXCLUDED_IDS, country.id));
        return country;
    }

    private String[] getBooleanOptions() {
            return ArrayUtils.toArray("true", "false");
    }

}
