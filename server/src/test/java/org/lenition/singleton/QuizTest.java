package org.lenition.singleton;

import com.google.gson.Gson;
import org.lenition.domain.Quiz;

import static org.junit.Assert.assertTrue;

public class QuizTest {

    @org.junit.Test
    public void testGetQuestions() {
        Gson gson = new Gson();
        for(int i = 1; i <= 40; i++) {
            Quiz quiz = FactbookQuiz.INSTANCE.getQuestions(i);
            String json = (new Gson()).toJson(quiz);
            System.out.println(json);
            Quiz quiz2 = gson.fromJson(json, org.lenition.domain.Quiz.class);
            assertTrue(quiz2.questions.length == i);
        }
    }
}
