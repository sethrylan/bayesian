
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
		chart.draw(dataTable, options);
	}
}

function confidenceSliderUpdate(event, ui) {
	if( ui ) {
		$('.confidence-slider').prev('div').html("Confidence: " + ui.value + "%");
	} else {
		$('.confidence-slider').prev('div').html("Confidence: " + $( '.confidence-slider:visible' ).slider('value') + "%");
	}
}

/*
 *  Main quiz function.
 */
$(function(){

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
	$('.confidence-slider').trigger('update');
	
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
		},
		init: function() {
			// create empty array for responses
			jQuiz.responses = [];
			
			drawChartSidebar(jQuiz.calibrationData());
			
			// define next button behaviour
			$('#next').click(function(){		
				if ( !$('.answers > .boolean > a:visible').hasClass('selected') 
					||  $('.answers > input:visible').filter(function() { return !this.value;}).length > 0 
					|| $(this).hasClass('disabled')) {
					// if all inputs are not provided or link is diabled, do not proceed
					return false;
				}
								
				// disable next button to prevent double-clicking
				$(this).addClass('disabled');
				
				jQuiz.addResponse();
				drawChartSidebar(jQuiz.calibrationData());
				
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
						if( currentQuestion == totalQuestions-1 ) {
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
		showFeedback: function() {
		
			$('#feedbackContainer').show();
			var canvas = document.getElementById('feedbackCanvas');
			var context = canvas.getContext('2d');			
			canvas.width = $('#feedbackCanvas').width();
			canvas.height = $('#feedbackCanvas').height();
			context.clear();
			
			var scale = canvas.width;
			var feedbackString = $($questions.get(currentQuestion-1)).children('.feedback').text();
			var feedback = $.parseJSON(feedbackString);
			
			for( i = 0; i < feedback.length; i++ ) {
				var name = feedback[i].name;
				var area = feedback[i].area;
				var scaledArea = area / scale;
				var centerX = (canvas.width / 4) * (2*i + 1);
				var centerY = .50 * canvas.height;
				var radius = Math.sqrt(scaledArea)/Math.sqrt(Math.PI);
				
				context.fillStyle = '#2F4F4F';
				context.fillCircle(centerX, centerY, radius);
				
				context.font = '10px Verdana';
				context.fillStyle = '#000000';
				context.fillTextArc(name, centerX, centerY, radius + 20, (7/6)*Math.PI, Math.PI/name.length);				
				
				context.fillStyle = '#2F4F4F';
				context.font = '12px Verdana';
				context.fillText(formatNumber(area) + "km²", centerX - (26 + 2 * area.toString().length), centerY + radius + 20);
			}
		},
		calibrationData: function() {
			var data = [['Confidence', 'Ideal', 'Actual']];
			for(i = 50; i<=100; i+=10) {
				var total = 0;
				var correct = 0;
				$.each(jQuiz.responses, function() {
					if (this.confidence == i) {
						total += 1;
						correct += (this.correct ? 1 : 0);
					}
				});
				data.push([i, i, (total == 0 ? i : correct/total*100)]);
			}
			return google.visualization.arrayToDataTable(data);
		}
	};
	jQuiz.init();
})
