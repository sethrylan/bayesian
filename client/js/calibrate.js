var questionsUrl = "http://bayesian-calibration.appspot.com/factbook/questions";
//var questionsUrl = 'http://localhost:8080/factbook/questions';
var jdsUrl = "http://persistence.bayesian-calibration.appspot.com/";
//var jdsUrl = "http://localhost:8080/stats/";

function confidenceSliderUpdate(event, ui) {
    if( ui ) {
        $('.confidence-slider').prev('div').html("Confidence: " + ui.value + "%");
    } else {
        $('.confidence-slider').prev('div').html("Confidence: " + $( '.confidence-slider:visible' ).slider('value') + "%");
    }
}

var margin = {top: 20, right: 10, bottom: 30, left: 30},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;
var svg, x, y, xAxis, yAxis, line, area, tooltip;

function updateSidebarChart(dataTable) {

    var data = tableToJson(dataTable);
    data.forEach(function(d) {
        d["ideal"]= +d["ideal"];
        d["actual"] = +d["actual"];
    });
    
    /* 
    // Resize y-axis
    yAxis = d3.svg.axis().scale(y).orient("left").ticks(7);
    y.domain([
        d3.min(data, function(d) { return Math.min(d["ideal"], d["actual"]); }),
        d3.max(data, function(d) { return Math.max(d["ideal"], d["actual"]); })
    ]);
    svg.select("g.y.axis").call(yAxis);
    */
    
    svg.datum(data);
    svg.selectAll("#clip-below > path")
        .transition()
        .duration(150)
        .attr("d", area.y0(height));

    svg.select("#clip-above > path")
        .transition()
        .duration(150)
        .attr("d", area.y0(0));

    svg.select("path.area.above")
        .transition()
        .duration(150)
        .attr("d", area.y0(function(d) { return y(d["actual"]); }));

    svg.select("path.area.below")
        .transition()
        .duration(150)
        .attr("d", area);

    svg.select("path.line")
        .transition()
        .duration(150)
        .attr("d", line);
}

function drawSidebarChart(dataTable) {		
    $("#sidebarChart").empty();
    drawDifferenceChart(dataTable,  "#sidebarChart", margin, width, height)
}

function drawLargeChart(dataTable) {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
        
    $("#largeChart").empty();
    drawDifferenceChart(dataTable,  "#largeChart", margin, width, height)
}

function drawDifferenceChart(dataTable, element, margin, width, height) {

    x = d3.scale.linear().range([0, width]);
    y = d3.scale.linear().range([height, 0]);

    xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(4);
    yAxis = d3.svg.axis().scale(y).orient("left").ticks(7);

    // Interpolation at https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate
    // see also http://www.dashingd3js.com/svg-paths-and-d3js
    line = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(d.confidence); })
        .y(function(d) { return y(d["ideal"]); });

    // Note: there is some undershoot in basis interpolate. Cardinal has some overshoot.
    area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(d.confidence); })
        .y1(function(d) { return y(d["ideal"]); });

    svg = d3.select(element)
        .append("svg:svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // see tooltip example at http://bl.ocks.org/biovisualize/1016860
    tooltip = d3.select("body")
        .append("div")
        .attr("id", "chart-tooltip")
        .attr("class", "radius")
        .style("visibility", "hidden")
        .text("");

    var data = tableToJson(dataTable);
    data.forEach(function(d) {
    // make all data positive, if necessary
    //	d["ideal"]= +d["ideal"];
    //	d["actual"] = +d["actual"];
    });

    x.domain(d3.extent(data, function(d) { return d.confidence; }));  
    y.domain([
        d3.min(data, function(d) { return Math.min(d["ideal"], d["actual"]); }),
        d3.max(data, function(d) { return Math.max(d["ideal"], d["actual"]); })
    ]);

    svg.datum(data);
    
    svg.append("clipPath")
        .attr("id", "clip-below")
    .append("path")
        .attr("d", area.y0(height));

    svg.append("clipPath")
        .attr("id", "clip-above")
    .append("path")
        .attr("d", area.y0(0));

    svg.append("path")
        .attr("class", "area above")
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d["actual"]); }))
        .on("mouseover", function(){ tooltip.text("underconfidence"); return tooltip.style("visibility", "visible"); })
        .on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden"); });

    svg.append("path")
        .attr("class", "area below")
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area)
        .on("mouseover", function(){ tooltip.text("overconfidence"); return tooltip.style("visibility", "visible"); })
        .on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden"); });

    svg.append("path")
        .attr("class", "line")
        .attr("d", line);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    .append("text")
        .attr("x", width)
        .attr("dy", "-.71em")
        .style("text-anchor", "end")
        .text("reported confidence");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("% correct");

        /* 
    // create legend
    svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0," + height + ")")
        //.call(xAxis)
    .append("text")
        .attr("x", width)
        .attr("dy", "3em")
        .style("text-anchor", "end")
        .text("Underconfidence");
        */

}


/*
 *  Main quiz function.
 */
$(document).ready(function() {
    
    /* Insert questions in HTML */        
    var n = 30;
    if(get('n')) {
        n = get('n');
    }
    questionsUrl += '?n=' + n;

    /* 
     * $JQuery.ajax used instead of $.getJSON(questionsUrl, function(data){...});
     * to have access to async parameter without using  $.ajaxSetup({ async: false });
     * global configuration.
     */
    $.ajax({
        url: questionsUrl,
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
                '<div class="feedback hide">' + q.feedback + '</div>' +
                '<div class="answers">' + 
                  '<div class="confidence"></div>' +
                  '<div class="confidence-slider"></div>' +
                  '<div class="options">' +
                    '<a href="#">' + q.options[0] + '</a>' +
                    '<a href="#">' + q.options[1] + '</a>' +
                    '<input type="text" class="hide"/>' +
                  '</div>' +
                '</div>' +
              '</div>');
            });        
        }
    });
    
    $.getJSON(questionsUrl, function(data) {
      var questions = [];
     
      $.each(data.questions, function(key, q) {
          $('#progressContainer').after(
              '<div class="questionContainer radius hide">' + 
                '<div class="question">' + q.text +
                  '<a href="#" class="hint" title="' + q.hint + '">[ hint ]</a>' +
                '</div>' +
                '<div class="fact hide">' + q.fact + '</div>' + 
                '<div class="feedback hide">' + q.feedback + '</div>' +
                '<div class="answers">' + 
                  '<div class="confidence"></div>' +
                  '<div class="confidence-slider"></div>' +
                  '<div class="options">' +
                    '<a href="#">' + q.options[0] + '</a>' +
                    '<a href="#">' + q.options[1] + '</a>' +
                    '<input type="text" class="hide"/>' +
                  '</div>' +
                '</div>' +
              '</div>');
      });
    });


    // Register [enter] keypress as default action
    $('*').keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $('#next').click();
            return false;
        } else {
            return true;
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

    $( ".options > a" )
        .button()
        .click(function( event ) {
            event.preventDefault();
            $(this).addClass('selected');
            $(this).siblings('.selected').removeClass('selected');
            $(this).siblings('input[type=text]').val($(this).text());
    });
    
    $( ".confidence-slider" ).slider({
        min : 50,
        max : 100,
        value : 50,
        step : 10,
        slide : confidenceSliderUpdate
    });
    
    $('.confidence-slider').slider().bind({
        update : confidenceSliderUpdate
    });
    
    var totalQuestions = $('.questionContainer').size();
    var currentQuestion = 0;
    var progressPixels = $('#progressContainer').width()/totalQuestions;
    $questions = $('.questionContainer');
    $questions.hide();
    $($questions.get(currentQuestion)).fadeIn();

    var jQuiz = {
        init: function() {
            // create empty array for responses
            jQuiz.responses = [];
            jQuiz.stats = { 
                "startDate": (new Date()).toISOString()
            }; 
            
            drawSidebarChart(jQuiz.calibrationData());

            $('.confidence-slider').trigger('update');

            // Back Button
            $('#back').click(function() {
                if ( $(this).hasClass('disabled')) {
                    // if link is diabled, then do not proceed
                    return false;
                }

                $(this).addClass('disabled');
                $('#next').addClass('disabled');

                jQuiz.popResponse();
                updateSidebarChart(jQuiz.calibrationData());
                
                $($questions.get(currentQuestion)).fadeOut(300, function() {					
                    currentQuestion = currentQuestion - 1;
                    $($questions.get(currentQuestion)).fadeIn(300);
                    $('.confidence-slider').trigger('update');
                    $('#next').removeClass('disabled')
                    $('#next').text('Next >>');
                    $('#feedbackContainer').hide();
                    if( currentQuestion != 0 ) {
                        $('#back').removeClass('disabled')
                    }
                });
                var el = $('#progress');
                el.width(el.width() - progressPixels + 'px');
            });
            
            $('.options > a').click(function(){
                $('#next').click();
            });
            
            // Next Buttom
            $('#next').click(function(){		
                if ( !$('.answers > .options > a:visible').hasClass('selected') 
                    ||  $('.answers > input:visible').filter(function() { return !this.value;}).length > 0 
                    || $(this).hasClass('disabled')) {
                    // if all inputs are not provided or link is diabled, do not proceed
                    return false;
                }
                                
                // disable next button to prevent double-clicking
                $(this).addClass('disabled');
                $('#back').addClass('disabled');
                
                jQuiz.addResponse();
                updateSidebarChart(jQuiz.calibrationData());
                
                $($questions.get(currentQuestion)).fadeOut(300, function() {
                    // advance question index
                    currentQuestion = currentQuestion + 1;
                    
                    if( currentQuestion == totalQuestions ) {
                        // if on last question, finish quiz
                        $('#feedbackContainer').hide();
                        jQuiz.finish();
                    } else {
                        $($questions.get(currentQuestion)).fadeIn(300);
                        $('.confidence-slider').trigger('update');
                        $('#next').removeClass('disabled')
                        $('#back').removeClass('disabled')

                        if( currentQuestion == totalQuestions - 1 ) {
                            $('#next').text('| Finish |');
                        }
                        jQuiz.showFeedback();
                    }
                });

                var el = $('#progress');
                el.width(el.width() + progressPixels + 'px');				
            });			
        },        
        finish: function() {
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
            $('#next').hide();
            $('#back').hide();
            $('#sidebarChart').hide();
            drawLargeChart(jQuiz.calibrationData());
            
            // Build and post telemetry data
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
        addResponse: function() {
            var fact = $('.questionContainer:visible > .fact').text();
            var optionResponse = $('.options:visible > input[type=text]').val();
            var confidence = $('.answers:visible > .confidence-slider').slider( 'value' );
            
            var response = {
                index: currentQuestion,
                response: optionResponse,
                confidence: confidence,
                fact: fact,
                correct: (fact == optionResponse)
            };
            jQuiz.responses.push(response);			
        },
        popResponse: function() {
            jQuiz.responses.pop();
        },
        showFeedback: function() {
            $('#feedbackContainer').show();
            var canvas = document.getElementById('feedbackCanvas');
            var context = canvas.getContext('2d');			
            canvas.width = $('#feedbackCanvas').width();
            canvas.height = $('#feedbackCanvas').height();
            context.clear();
            
            var feedbackString = $($questions.get(currentQuestion-1)).children('.feedback').text();
            var feedback = $.parseJSON(feedbackString);
            
            for( i = 0; i < feedback.values.length; i++ ) {
                var name = feedback.values[i].name;
                var formattedValue, radius;
                switch(feedback.category) {
                    case "area":
                        var area = feedback.values[i].value;
                        var scaledArea = area / canvas.width;
                        formattedValue = formatNumber(area) + "km²";
                        radius = Math.sqrt(scaledArea)/Math.sqrt(Math.PI);
                        break;
                    case "population":
                        var population = feedback.values[i].value;
                        var scaledPopulation = (population/70000000) * canvas.width;
                        formattedValue = formatNumber(population) + " people";
                        radius = Math.sqrt(scaledPopulation)/Math.sqrt(Math.PI);					
                        break;
                    case "gdpPerCapita":
                        var gpc = feedback.values[i].value;
                        var scaledGpc = (gpc/2000) * canvas.width;
                        formattedValue = "$" + formatNumber(gpc);
                        radius = Math.sqrt(scaledGpc)/Math.sqrt(Math.PI);					
                        break;
                    case "healthExpenditure":
                        var exp = feedback.values[i].value;
                        var scaledExp = (exp) * canvas.width;
                        formattedValue = exp + "%";
                        radius = Math.sqrt(scaledExp)/Math.sqrt(Math.PI);					
                        break;
                    case "gini":
                        var gini = feedback.values[i].value;
                        var scaledGini = gini/3 * canvas.width;
                        formattedValue = gini.toString();
                        radius = Math.sqrt(scaledGini)/Math.sqrt(Math.PI);					
                        break;
                    default:
                        console.error("No such feedback category.");
                        return;
                }

                var centerX = (canvas.width / 4) * (2*i + 1);
                var centerY = .50 * canvas.height;
                
                context.fillStyle = '#007BA7';
                context.fillCircle(centerX, centerY, radius);
                
                context.fillStyle = '#2F4F4F';
                context.font = '10px monospace';
                context.fillText(name, centerX - name.length * 3, centerY - (radius + 10));			
                // uncomment for country text to appear in arc around circle    
                //context.fillTextArc(name, centerX, centerY, radius + 20, (7/6)*Math.PI, Math.PI/name.length);				
                
                context.fillStyle = '#2F4F4F';
                context.font = '10px monospace';
                context.fillText(formattedValue, centerX - formattedValue.length * 3, centerY + radius + 20);
            }
        },
        calibrationData: function() {
            var dataTable = [['confidence', 'ideal', 'actual']];
            for(i = 50; i<=100; i+=10) {
                var total = 0;
                var correct = 0;
                $.each(jQuiz.responses, function() {
                    if (this.confidence == i) {
                        total += 1;
                        correct += (this.correct ? 1 : 0);
                    }
                });
                dataTable.push([i, i, (total == 0 ? i : correct/total*100)]);
            }
            return dataTable;
        }
    };
    jQuiz.init();
})
