package org.lenition.domain;

/**
 * Factbook domain object.
 */
public class Factbook {
    
    public Country[] countries;

    /**
     * Container for factbook serialization.
     */
    public static class FactbookContainer {
        public Factbook factbook;
    }

    /**
     * Country object.
     */
    public static class Country {
        public String name;
        public String id;
        public String history;
        public String misc;
        public Value area;
        public Value gdp;
        public Value gdpPerCapita;
        public Value gini;
        public Value population;
        public Value populationGrowthRate;
        public Value birthRate;
        public Value deathRate;
        public Value netMigrationRate;
        public Value healthExpenditure;
        public Value lifeExpectancy;
        public Value totalFertilityRate;
    }

}

