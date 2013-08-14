package org.lenition.domain;

import java.math.BigDecimal;
import java.util.List;

public class Factbook {
    List<Country> countries;
}

class Country {
    String name;
    String id;
    String history;
    String misc;
    Value area;
    Value gdp;
    Value gdpPerCapita;
    Value gini;
    Value population;
    Value populationGrowthRate;
    Value birthRate;
    Value deathRate;
    Value netMigrationRate;
    Value healthExpenditure;

}

class Value {
    BigDecimal value;
    long rank;
    String text;
}

