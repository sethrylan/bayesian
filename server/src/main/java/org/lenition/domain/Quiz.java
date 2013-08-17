package org.lenition.domain;

public class Quiz {
    public Question[] questions;

    public static class Question {
        public String category;
        public String text;
        public String hint;
        public String fact;
        public String feedback;
        public String[] options;
    }
}

