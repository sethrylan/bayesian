
/*
var graphData = [['Confidence', 'Ideal', 'Actual'],
				[50,	50, 	45],
				[60,	60, 	51],
				[70,	70, 	62],
				[80,	80, 	73],
				[90,	90,		94],
				[100,	100,	96]];
*/
				
var graphData = [['Confidence', 'Ideal', 'Actual'],
				[50,	50, 	0],
				[60,	60, 	0],
				[70,	70, 	0],
				[80,	80, 	0],
				[90,	90,		0],
				[100,	100,	0]];


/*  
 *  Register [enter] keypress as default action
 */
$("input").keypress(function (e) {
	if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
		$('#next').click();
		return false;
	} else {
		return true;
	}
});


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
			//alert(JSON.stringify(jQuiz.responses));			
			var resultDiv = '';
			var trueCount = 0;
			for (var key in this.responses) {
				var response = this.responses[key];
				if (response.correct) {
					trueCount++;
				}
				resultDiv += '<div> Question ' + (response.index + 1) + ' is ' + (response.correct ? "correct" : "incorrect") + '</div>'
			}
			resultDiv += '<div class="totalScore">Your total score is ' + parseInt(trueCount * (100/totalQuestions), 10) + ' / 100</div>'
			$('#resultContainer').html(resultDiv).show();
			$('#next').hide();
		},
		init: function() {
			// create empty array for responses
			jQuiz.responses = [];
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
			var confidence = $('.questionContainer:visible > .confidence-slider').slider( 'value' );
			
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

		}
	};
	jQuiz.init();
})
