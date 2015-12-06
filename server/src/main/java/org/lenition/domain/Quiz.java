package org.lenition.domain;

/**
 * FactbookQuiz domain object.
 */
public class Quiz {
    public Question[] questions;

    /**
     * Quiz question object.
     */
    public static class Question {
        public String category;
        public String text;
        public String hint;
        public String fact;
        public Feedback feedback;
        public String[] options;
    }
}

