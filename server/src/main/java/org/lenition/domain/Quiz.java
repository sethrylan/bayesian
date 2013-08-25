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
        public String feedback;
        public String[] options;
    }
}

