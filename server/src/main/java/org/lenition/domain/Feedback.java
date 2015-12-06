package org.lenition.domain;

/**
 * Feedback object.
 */
public class Feedback {
    public String category;
    public NameValue[] values;

    public Feedback(String category, NameValue[] values) {
        this.category = category;
        this.values = values;
    }
}
