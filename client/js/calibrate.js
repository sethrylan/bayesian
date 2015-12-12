

// fiddle example: http://jsfiddle.net/um78o3ev/6/

Highcharts.setOptions({
    chart: {
        style: {
            fontFamily: 'Verdana, Helvetica, Arial, sans-serif'
        }
    }
});

var getOverconfidenceSeries = function() {
    return {
        name: 'overconfident',
        fillOpacity: 0.2,
        color: '#FF9900',
        data: [ [50, 0, 50],
                [60, 0, 60],
                [70, 0, 70],
                [80, 0, 80],
                [90, 0, 90],
                [100, 0, 100]]
    };
};

var getUnderconfidenceSeries = function () {
    return {
        name: 'underconfident',
        fillOpacity: 0.2,
        color: '#9370DB',
        data: [ [50, 50, 100],
                [60, 60, 100],
                [70, 70, 100],
                [80, 80, 100],
                [90, 90, 100],
                [100, 100, 100]]
    };
};

var confidenceChart = new Highcharts.Chart({
    chart: {
      type: 'areasplinerange',
      zoomType: 'x',
      renderTo: 'confidenceChartContainer',
      spacing: [15,15,15,15],
      alignTicks: false
    },

    credits : {
      enabled: false
    },

    title: {
      text: ''
    },

    xAxis: {
      type: 'linear',
      title: {
        text: 'reported confidence'
      }
    },

    yAxis: [
      { // primary axis
        min: 50,
        max: 100,
        title: {
          text: '% correct'
        }
      },
      { // secondary axis for number of questions
        min: 0,
        max: 20,
        title: null,
        // hide ticks and labels
        opposite: true,
        lineWidth: 0,
        minorGridLineWidth: 0,
        gridLineColor: 'transparent',
        labels: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0
      }
    ],

    tooltip: {
      crosshairs: true,
      shared: true,
      formatter: function() {
        var point;
        this.points.forEach( function(element) {
          if (element.series.name === 'confidence') {
            point = element.point;
          }
        });
        if (point) {
            console.log(point);
          var difference = (point.high - point.low);
          if (!point.total || point.total === 0) {
            return 'no answers';
          } else if (difference === 0) {
            return 'perfectly confident!';
          } else {
              return (difference > 0 ? 'over' : 'under') + 'confident by ' + Math.abs(point.high - point.low) + ' % points<br>';
          }
        }
      }
    },

    legend: {
      enabled: true,
      itemStyle: {'fontSize': '10px', 'fontWeight':'normal'}
    },

    series: [
      {
        name: 'confidence',
        fillOpacity: 0.1,
        color: 'grey',
        showInLegend: false,
        data: [ [50, 50, 50],
                [60, 60, 60],
                [70, 70, 70],
                [80, 80, 80],
                [90, 90, 90],
                [100, 100, 100]]
      },
      getUnderconfidenceSeries(),
      getOverconfidenceSeries(),
      {
            name: '#answers',
            type: 'spline',
            yAxis: 1,
            data: [ ],
            tooltip: {
                valueSuffix: ' mm'
            },
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            color: 'grey'
      }
    ]
});

var getPointFormat = function(category) {
    switch (category) {
        case 'area':
            return '{point.y:.1f} km2'
        case 'population':
            return '{point.y} people'
        case 'gdpPerCapita':
            return '${point.y} per person'
        case 'healthExpenditure':
            return '{point.y:.1f}% of GDP'
        case 'gini':
            return '{point.y:.1f} Gini coefficient'
        case 'lifeExpectancy':
            return '{point.y:.1f} years'
        default:
            console.error("No such feedback category.");
            return;
    }
}

function drawConfidenceChart(confidenceSeriesData) {
    confidenceChart.series[0].setData(confidenceSeriesData);
    confidenceChart.series[3].setData(confidenceSeriesData);
}

function drawFeedbackChart(dataTable) {
    $("#largeChart").empty();

}

// (function($){
//     // see https://github.com/chitacan/anatomy-of-backbonejs/blob/master/lesson_6/server/public/javascripts/TodoApp.js
//     var n = defaultNumQuestions;
//     if(get('n')) {
//         n = get('n');
//     }
//     var url = questionsUrl + '?n=' + n;

//     var questionDom = $('#backboneQuestions');

//     var Question = Backbone.Model.extend();

//     var QuestionView = Backbone.View.extend({
//         template: _.template('<h3 class=<% print(status) %>>' + 
//             '<input type=checkbox ' +
//             '<% if (status == "complete") print("checked") %>/>' +
//             '<%= text %></h3>'),

//         events: {
//             'change input': 'toggleStatus'
//         },

//         initialize: function() {
//             this.model.on('change', this.render, this);
//             // this.model.on('destroy', this.remove, this);
//         },

//         render: function() {
//             var attr = this.model.toJSON();
//             this.$el.html( this.template(attr) );
//             return this;
//         },

//         remove: function() {
//             // remove elements from DOM
//         }
//     });

//     var QuestionList = Backbone.Collection.extend({
//         url: url,
//         model: Question,
//         parse: function(data) {
//             return data.questions;
//         }
//     });

//     var QuestionListView = Backbone.View.extend({
//         initialize: function() {
//             this.collection.on('reset', this.render, this);
//             this.collection.on('add', this.addOne, this);
//         },
//         render: function() {
//             this.collection.forEach(this.addOne, this);
//             questionDom.append(this.$el);
//             console.log("collection view render complete");

//         },
//         addOne: function(questionItem) {
//             var questionView = new QuestionView({model: questionItem});
//             this.$el.append(questionView.render().el);
//         }
//     });

//     // var question = new Question();
//     // var questionView = new QuestionView({model: question});

//     var questionList        = new QuestionList();
//     var questionListView    = new QuestionListView({collection: questionList});

//     questionList.on('change', function() {
//         questionsView.render();
//     });

//     questionList.fetch();
// })(jQuery);


/*
 *  Main quiz function.
 */
$(document).ready(function() {
    /* Insert questions in HTML */
    var n = defaultNumQuestions;
    if(get('n')) {
        n = get('n');
    }
    var url = questionsUrl + '?n=' + n;

    /*
     * $JQuery.ajax used instead of $.getJSON(questionsUrl, function(data){...});
     * to have access to async parameter without using  $.ajaxSetup({ async: false });
     * global configuration.
     */
    $.ajax({
        url: url,
        dataType: 'json',
        async: false,
        success: function(data) {
          var questions = [];
          $.each(data.questions, function(key, q) {
            $('#progressContainer').after(
              '<div class="questionContainer radius hide">' +
                '<div class="question">' + q.text +
                  '<a href="#" class="hint" title="' + q.hint + '">[ hint ]</a>' +
                '</div>' +
                '<div class="fact hide">' + q.fact + '</div>' +
                '<div class="feedback hide">' + JSON.stringify(q.feedback) + '</div>' +
                '<div class="answers">' +
                  '<div class="options">' +
                    '<a href="#" data-confidence="100" data-option="true">' + " 100% true" + '</a>' +
                    '<a href="#" data-confidence="90" data-option="true">' + " 90%" + '</a>' +
                    '<a href="#" data-confidence="80" data-option="true">' + " 80%" + '</a>' +
                    '<a href="#" data-confidence="70" data-option="true">' + " 70%" + '</a>' +
                    '<a href="#" data-confidence="60" data-option="true">' + " 60%" + '</a>' +
                    '<a href="#" data-confidence="50" data-option="true">' + " 50%" + '</a>' +
                    // '<br><br>' +
                    '<a href="#" data-confidence="50" data-option="false">' + " 50%" + '</a>' +
                    '<a href="#" data-confidence="60" data-option="false">' + " 60%" + '</a>' +
                    '<a href="#" data-confidence="70" data-option="false">' + " 70%" + '</a>' +
                    '<a href="#" data-confidence="80" data-option="false">' + " 80%" + '</a>' +
                    '<a href="#" data-confidence="90" data-option="false">' + " 90%" + '</a>' +
                    '<a href="#" data-confidence="100" data-option="false">' + " 100% false" + '</a>' +
                  '</div>' +
                '</div>' +
              '</div>');
            });
        }
    });

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

    var totalQuestions = $('.questionContainer').size();
    var currentQuestion = 0;
    var progressPixels = $('#progressContainer').width()/totalQuestions;
    $questions = $('.questionContainer');
    $questions.hide();
    $($questions.get(currentQuestion)).fadeIn();

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
            // create empty array for responses
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

                var fact = $('.questionContainer:visible > .fact').text();
                var responseOption = $(this).data('option').toString();
                var responseConfidence = $(this).data('confidence');
                var hinted = $('.questionContainer:visible > .question > .hint').hasClass('visited');

                jQuiz.addResponse(fact, responseOption, responseConfidence, hinted);

                drawConfidenceChart(jQuiz.getConfidenceSeriesData());

                $($questions.get(currentQuestion)).fadeOut(300, function() {
                    // advance question index
                    currentQuestion = currentQuestion + 1;
                    jQuiz.showFeedback();
                    if( currentQuestion === totalQuestions ) {
                        // if on last question, finish quiz
                        jQuiz.finish();
                    } else {
                        $($questions.get(currentQuestion)).fadeIn(300);
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
                index: currentQuestion,
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
        showFeedback: function() {
            $('#feedbackContainer').show();

            var feedbackString = $($questions.get(currentQuestion-1)).children('.feedback').text();
            var feedback = $.parseJSON(feedbackString);

            $('#feedbackChartContainer').highcharts({
                chart: {
                    type: 'column',
                    renderTo: 'feedbackChartContainer',
                    spacing: [15,15,15,15]
                },
                credits: {
                  enabled: false
                },
                title: {
                    text: 'Last Question : ' + feedback.category,
                    style: {'fontSize': '12px' }
                },
                subtitle: {
                    text: 'Source: <a href="https://www.cia.gov/library/publications/the-world-factbook/">World Factbook</a>',
                    style: {'fontSize': '8px' }
                },
                plotOptions: {
                  series: {
                    animation: {
                        duration: 300
                    }
                  }
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: null
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: getPointFormat(feedback.category)
                },
                series: [{
                    data: [
                        [feedback.values[0].name, feedback.values[0].value],
                        [feedback.values[1].name, feedback.values[1].value]
                    ]
                }]
            });
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
    jQuiz.init();
})
