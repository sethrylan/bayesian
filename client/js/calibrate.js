
/*
 *  Main quiz function.
 */
(function($){

    // handle variables defined in html to take advantage of jekyll environment variables
    var n = defaultNumQuestions;
    if(get('n')) {
        n = get('n');
    }
    var url = questionsUrl + '?n=' + n;

    var Question = Backbone.Model.extend({
        urlRoot: url
    });

    var Questions = Backbone.Collection.extend({
        url: url,
        model: Question,
        parse: function(data) {
            return data.questions;
        }
    });

    var QuestionsView = Backbone.View.extend({
        el: '#questionListContainer',
        // initialize: function() {
        //     this.collection.on('reset', this.render, this);
        //     this.collection.on('add', this.addOne, this);
        // },
        render: function () {
            var that = this;
            var template = _.template($('#questions-template').html());
            that.$el.html(template({questions:questions.models}));
            jQuiz.init();
        }
    });

    var questions = new Questions();

    questions.fetch({
        success: function(questions, response) {
            questionsView = new QuestionsView({model: questions});
            questionsView.render();
        }
    });

    var jQuiz = {
        postStats: function() {            // Build and post telemetry data
            this.stats.client = {};
            this.stats.client.platform = navigator.platform;
            this.stats.client.userAgent = navigator.userAgent;
            this.stats.client.systemLanguage = navigator.systemLanguage;
            this.stats.client.gmtOffset = new Date().getTimezoneOffset();
            this.stats.client.screenResolution = screen.width + '×' + screen.height;
            this.stats.client.platform = navigator.platform;
            this.stats.client.platform = navigator.platform;

            this.stats.finishDate = (new Date()).toISOString();
            this.stats.responses = this.responses;
            $.ajax({
                url: jdsUrl,
                type: 'PUT',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                crossDomain: true,
                data: JSON.stringify(this.stats),
                failure: function(data) {
                    console.error("data failed to upload: " + JSON.stringify(this.stats));
                }
            });
        },
        init: function() {
            $('.hint').qtip({
                hide: {
                    fixed: true,
                    delay: 300
                },
                content: function() {
                    return $(this).attr('title');
                },
                style: {
                    classes: 'qtip-light qtip-shadow'
                }
            });

            $('.hint').mouseover( function() {
                $(this).addClass('visited');
            });

            $( ".options > a" )
                .button()
                .click(function( event ) {
                    event.preventDefault();
                    $(this).addClass('selected');
                    $(this).siblings('.selected').removeClass('selected');
                    $(this).siblings('input[type=text]').val($(this).text());
            });
            // create empty array for responses
            jQuiz.currentQuestion = 0;
            var progressPixels = $('#progressContainer').width()/questions.length;
            $questions = $('.questionContainer');
            // $questions.hide();
            $($questions.get(this.currentQuestion)).fadeIn();

            jQuiz.responses = [];
            jQuiz.stats = {
                "startDate": (new Date()).toISOString()
            };

            $('.options > a').click(function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                }

                // disable button to prevent double-clicking
                $(this).addClass('disabled');

                var fact = questions.at(jQuiz.currentQuestion).get('fact');
                var responseOption = $(this).data('option').toString();
                var responseConfidence = $(this).data('confidence');
                var hinted = $('.questionContainer:visible > .question > .hint').hasClass('visited');

                jQuiz.addResponse(fact, responseOption, responseConfidence, hinted);

                drawConfidenceChart(jQuiz.getConfidenceSeriesData());

                $($questions.get(jQuiz.currentQuestion)).fadeOut(300, function() {
                    jQuiz.showFeedback(jQuiz.currentQuestion);
                    // advance question index
                    jQuiz.currentQuestion = jQuiz.currentQuestion + 1;
                    if( jQuiz.currentQuestion === questions.length ) {
                        // if on last question, finish quiz
                        jQuiz.finish();
                    } else {
                        $($questions.get(jQuiz.currentQuestion)).fadeIn(300);
                    }
                });

                var el = $('#progress');
                el.width(el.width() + progressPixels + 'px');
            });
        },
        finish: function() {
            /*
            var resultDiv = '';
            var trueCount = 0;
            for (var key in this.responses) {
                var response = this.responses[key];
                if (response.correct) {
                    trueCount++;
                }
            }
            resultDiv += '<div class="totalScore">Your total score is ' + parseInt(trueCount * (100/totalQuestions), 10) + ' / 100</div>'
            $('#resultContainer').html(resultDiv).show();
            */
            this.postStats();
        },
        addResponse: function(fact, responseOption, responseConfidence, hinted) {
            var response = {
                index: this.currentQuestion,
                response: responseOption,
                confidence: responseConfidence,
                fact: fact,
                correct: (fact === responseOption),
                hinted: hinted
            };
            jQuiz.responses.push(response);
        },
        popResponse: function() {
            jQuiz.responses.pop();
        },
        showFeedback: function(questionIndex) {

            $('#feedbackContainer').show();

            var feedback = questions.at(questionIndex).get('feedback');
            var isCorrect = this.responses[questionIndex].correct;
            drawFeedbackChart(feedback, isCorrect);

        },
        getConfidenceSeriesData: function() {
            data = [];

            for(i = 50; i<=100; i+=10) {
                var total = 0;
                var correct = 0;
                $.each(jQuiz.responses, function() {
                    if (this.confidence === i) {
                        total += 1;
                        correct += (this.correct ? 1 : 0);
                    }
                });
                data.push( {x:i, high:i, low:(total === 0 ? i : correct/total*100), y:total, total:total});
            }
            return data;
        }
    };
})(jQuery);
