
var sidebarChartSize = { margin : {top: 20, right: 10, bottom: 30, left: 30} };
sidebarChartSize.width = 200 - sidebarChartSize.margin.left - sidebarChartSize.margin.right;
sidebarChartSize.height = 200 - sidebarChartSize.margin.top - sidebarChartSize.margin.bottom;

var largeChartSize = { margin : {top: 20, right: 20, bottom: 30, left: 50} };
largeChartSize.width = 600 - largeChartSize.margin.left - largeChartSize.margin.right;
largeChartSize.height = 400 - largeChartSize.margin.top - largeChartSize.margin.bottom;

var svg, x, y, xAxis, yAxis, line, area, tooltip;

function getOffsets(data) {
    if (!data) {
        return [{offset: "0%", opacity: "1"},
                {offset: "20%", opacity: "1"},
                {offset: "40%", opacity: "1"},
                {offset: "60%", opacity: "1"},
                {offset: "80%", opacity: "1"},
                {offset: "100%", opacity: "1"} ];
    }

    var totalDatapoints = 0;
    $.each(data, function() {
        totalDatapoints += parseInt(this.datapoints);
    });

    var offsets = [];
    var minOpacity = 0, maxOpacity = 0, isAreaVisible = false;
    jQuery.each([50, 60, 70, 80, 90, 100], function() {
        var interval = this;
        var o = {};
        o.offset = (interval - 50) * 2 + "%";
        var intervalDatapoints = 0;
        for(var key in data) {
            if(data[key].confidence == interval) {
                intervalDatapoints = data[key].datapoints;
            }
            if(data[key].ideal != data[key].actual) {
                isAreaVisible = true;
            }
        }
        o.opacity = (intervalDatapoints/totalDatapoints ).toString();
        if (isAreaVisible && o.opacity < minOpacity) {
            minOpacity = o.opacity;
        }
        if (isAreaVisible && o.opacity > maxOpacity) {
            maxOpacity = o.opacity;
        }
        offsets.push(o);
    });

    for(var key in offsets) {
        offsets[key].opacity = normalize(minOpacity, maxOpacity, 0, 1, offsets[key].opacity);
    }
    return offsets;
}

function updateChart(dataTable) {
    var data = tableToJson(dataTable);
    data.forEach(function(d) {
        d["ideal"]= +d["ideal"];
        d["actual"] = +d["actual"];
    });

    var transition = d3.transition()
        .duration(150);

    svg.datum(data);

    /*
    // Resize y-axis
    yAxis = d3.svg.axis().scale(y).orient("left").ticks(7);
    y.domain([
        d3.min(data, function(d) { return Math.min(d["ideal"], d["actual"]); }),
        d3.max(data, function(d) { return Math.max(d["ideal"], d["actual"]); })
    ]);
    svg.select("g.y.axis").call(yAxis);
    */

    var offsets = getOffsets(data);
    transition.each(function() {
       /* svg.selectAll("#clip-below > path")
            .transition()
                .attr("d", area.y0(sidebarChartSize.height));*/

        svg.select("#clip-above > path")
            .transition()
                .attr("d", area.y0(0));

        svg.select("path.area.above")
            .transition()
                .attr("d", area.y0(function(d) { return y(d["actual"]); }));

        svg.select("path.area.below")
            .transition()
                .attr("d", area);

        svg.select("path.line")
            .transition()
                .attr("d", line);

        d3.select("#density-gradient-above").selectAll("stop")
            .data(offsets)
            .transition()
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", "#9370DB")
                .attr("stop-opacity", function(d) { return d.opacity; });

        d3.select("#density-gradient-below").selectAll("stop")
            .data(offsets)
            .transition()
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", "#FF9900")              // Orange Peel
                .attr("stop-opacity", function(d) { return d.opacity; });
        });
}

function drawSidebarChart(dataTable) {
    $("#sidebarChart").empty();
    drawDifferenceChart(dataTable,  "#sidebarChart", sidebarChartSize.margin, sidebarChartSize.width, sidebarChartSize.height);
    updateChart(dataTable);
}

function drawLargeChart(dataTable) {
    $("#largeChart").empty();
    drawDifferenceChart(dataTable,  "#largeChart", largeChartSize.margin, largeChartSize.width, largeChartSize.height);
    updateChart(dataTable);
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

    // x-axis lable
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    .append("text")
        .attr("x", width)
        .attr("dy", "-.71em")
        .style("text-anchor", "end")
        .text("reported confidence");

    // y-axis label
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("% correct");

    var offsets = getOffsets(data);

    svg.append("linearGradient")
        .attr("id", "density-gradient-above")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", x(50)).attr("y1", 0)            // start gradient at x=50
            .attr("x2", x(100)).attr("y2", 0)           // end gradient at x=100
        .selectAll("stop")
            .data(offsets)
        .enter().append("stop")
            .attr("offset", function(d) { return d.offset; })
            .attr("stop-color", "#9370DB")
            .attr("stop-opacity", function(d) { return d.opacity; });

     svg.append("linearGradient")
            .attr("id", "density-gradient-below")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", x(50)).attr("y1", 0)            // start gradient at x=50
            .attr("x2", x(100)).attr("y2", 0)           // end gradient at x=100
        .selectAll("stop")
            .data(offsets)
        .enter().append("stop")
            .attr("offset", function(d) { return d.offset; })
            .attr("stop-color", "#FF9900")              // Orange Peel
            .attr("stop-opacity", function(d) { return d.opacity; });

    // create legend
    $(element).after("<svg xmlns='http://www.w3.org/2000/sv' version='1.1' height=35 id='sidebarLegend'>" +
                        "<defs>" +
                            "<linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='0%'>" +
                                "<stop offset='0%' style='stop-color:#9370DB;stop-opacity:0' />" +
                                "<stop offset='100%' style='stop-color:#9370DB;stop-opacity:1' />" +
                            "</linearGradient>" +
                            "<linearGradient id='grad2' x1='0%' y1='0%' x2='100%' y2='0%'>" +
                                "<stop offset='0%' style='stop-color:#FF9900;stop-opacity:0' />" +
                                "<stop offset='100%' style='stop-color:#FF9900;stop-opacity:1' />" +
                            "</linearGradient>" +
                        "</defs>" +
                        "<rect width='100' height='12' x='50' y='0' fill='url(#grad1)'/>" +
                        "<rect width='100' height='12' x='50' y='16' fill='url(#grad2)'/>" +
                        "<text fill='black' font-size='10' font-family='sans-serif' x='65' y='9'>underconfident</text>" +
                        "<text fill='black' font-size='10' font-family='sans-serif' x='68' y='25'>overconfident</text>" +
                        "<text fill='black' font-size='10' font-family='sans-serif' x='155' y='12'>more</text>" +
                        "<text fill='black' font-size='10' font-family='sans-serif' x='155' y='22'>answers</text>" +
                        "<text fill='black' font-size='10' font-family='sans-serif' x='23' y='12'>fewer</text>" +
                        "<text fill='black' font-size='10' font-family='sans-serif' x='13' y='22'>answers</text>" +
                    "</svg>");

}


/*
 *  Main quiz function.
 */
$(document).ready(function() {

    /* Insert questions in HTML */
    var n = defaultNumQuestions;
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

    $( ".confidence-slider" ).slider({
        min : 50,
        max : 100,
        value : 50,
        step : 10
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

            drawSidebarChart(jQuiz.calibrationData());

            $('.confidence-slider').trigger('update');

            $('.options > a').click(function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                }

                // disable button to prevent double-clicking
                $(this).addClass('disabled');

                jQuiz.addResponse();
                updateChart(jQuiz.calibrationData());

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
                        jQuiz.showFeedback();
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
            $('#sidebarChart').hide();
            $('#sidebarLegend').hide();
            drawLargeChart(jQuiz.calibrationData());
            this.postStats();
        },
        addResponse: function() {
            var fact = $('.questionContainer:visible > .fact').text();
            var optionResponse = $('.options:visible > input[type=text]').val();
            var confidence = $('.answers:visible > .confidence-slider').slider( 'value' );
            var hinted = $('.questionContainer:visible > .question > .hint').hasClass('visited');

            var response = {
                index: currentQuestion,
                response: optionResponse,
                confidence: confidence,
                fact: fact,
                correct: (fact == optionResponse),
                hinted: hinted
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
                        var scaledGini = (gini - 25)/3 * canvas.width;
                        formattedValue = gini.toString();
                        radius = Math.sqrt(scaledGini)/Math.sqrt(Math.PI);
                        break;
                    case "lifeExpectancy":
                        var lifeExp = feedback.values[i].value;
                        var scaledLifeExp = (lifeExp - 30)/3 * canvas.width;
                        formattedValue = lifeExp + " years";
                        radius = Math.sqrt(scaledLifeExp)/Math.sqrt(Math.PI);
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
            var dataTable = [['confidence', 'ideal', 'actual', 'datapoints']];
            for(i = 50; i<=100; i+=10) {
                var total = 0;
                var correct = 0;
                $.each(jQuiz.responses, function() {
                    if (this.confidence == i) {
                        total += 1;
                        correct += (this.correct ? 1 : 0);
                    }
                });
                dataTable.push([i, i, (total == 0 ? i : correct/total*100), total]);
            }
            return dataTable;
        }
    };
    jQuiz.init();
})
