
google.load("visualization", "1", {packages:["corechart"]});
function drawChartSidebar(dataTable) {				
    var options = {
        title: 'Calibration Curve',
        chartArea:{ left:40, top:3, width:150, height:160 },
        hAxis: { title: 'Reported Confidence', titleTextStyle: {color: 'black'}, ticks: [50, 60, 70, 80, 90, 100] },
        vAxis: { title: '% Correct',  titleTextStyle: {color: 'black'}, ticks: [20, 30, 40, 50, 60, 70, 80, 90, 100] },
        legend: { position: 'bottom', textStyle: {color: 'blue', fontSize: 10} },
        animation: { duration: 1000, easing: 'out' }
    };

    var chartContainer = document.getElementById('chartContainer');
    if(chartContainer) {
        var chart = new google.visualization.LineChart(chartContainer);
        chart.draw(google.visualization.arrayToDataTable(dataTable), options);
    }
}

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
        .interpolate("linear")
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


/* Insert questions in HTML */        
var url = "http://localhost:8080/factbook/questions?n=5";
$.getJSON(url, function(data) {
  var questions = [];
 
  $.each(data.questions, function(key, q) {
      $('#progressContainer').after(
          '<div class="questionContainer radius hide">' + 
            '<div class="question">' + q.text +
              '<a href="#" title="' + q.hint + '">[ hint ]</a>' +
            '</div>' +
            '<div class="fact hide">' + q.fact + '</div>' + 
            '<div class="feedback hide">' + q.feedback + '</div>' +
            '<div class="answers">' + 
              '<div class="confidence"></div>' +
              '<div class="confidence-slider"></div>' +
              '<div class="boolean">' +
                '<a href="#">' + q.options[0] + '</a>' +
                '<a href="#">' + q.options[1] + '</a>' +
                '<input type="text" class="hide"/>' +
              '</div>' +
            '</div>' +
          '</div>');
  });
});



/*
 *  Main quiz function.
 */
$(function() {

    // Register [enter] keypress as default action
    $('*').keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $('#next').click();
            return false;
        } else {
            return true;
        }
    });

    $( document ).tooltip({
        content: function() {
            return $(this).attr('title');
        }
    });

    $( ".boolean > a" )
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
        finish: function() {
            var resultDiv = '';
            var trueCount = 0;
            for (var key in this.responses) {
                var response = this.responses[key];
                if (response.correct) {
                    trueCount++;
                }
                //resultDiv += '<div> Question ' + (response.index + 1) + ' is ' + (response.correct ? "correct" : "incorrect") + '</div>'
            }
            resultDiv += '<div class="totalScore">Your total score is ' + parseInt(trueCount * (100/totalQuestions), 10) + ' / 100</div>'
            $('#resultContainer').html(resultDiv).show();
            $('#next').hide();
            $('#back').hide();
            $('#sidebarChart').hide();
            drawLargeChart(jQuiz.calibrationData());
        },
        init: function() {
            // create empty array for responses
            jQuiz.responses = [];
            
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
            
            $('.boolean > a').click(function(){
                $('#next').click();
            });
            
            // Next Buttom
            $('#next').click(function(){		
                if ( !$('.answers > .boolean > a:visible').hasClass('selected') 
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
        addResponse: function() {
            var fact = $('.questionContainer:visible > .fact').text();
            var booleanResponse = $('.boolean:visible > input[type=text]').val();
            var confidence = $('.answers:visible > .confidence-slider').slider( 'value' );
            
            var response = {
                index: currentQuestion,
                response: booleanResponse,
                confidence: confidence,
                fact: fact,
                correct: (fact == booleanResponse)
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
