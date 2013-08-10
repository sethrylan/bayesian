
/*  
 *  Register [enter] keypress as default action
 */
$("input").keypress(function (e) {
	if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
		$('.buttonContainer > a:visible').click();
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
			jQuiz.responses = [];						
			
			var facts = $('div.fact').map(function() { return ($(this).text() == "true" ? true : false) }).get();
			var booleanResponses = $('.boolean > input[type=text]').map(function() { return ($(this).text() == "true" ? true : false) }).get();
			var confidences = $('.confidence-slider').map(function() { return $(this).slider( 'value' ) }).get();

			//assert((facts.length === booleanResponses.length) && (booleanResponses.length === confidences.length), "Answer sizes must match.");
			
			for (var i = 0; i < facts.length; i++) {
				var response = {
					index: i,
					response: booleanResponses[i],
					confidence: confidences[i],
					fact: facts[i],
					correct: (facts[i] == booleanResponses[i])
				};

				jQuiz.responses.push(response);
			}				
			//alert(JSON.stringify(jQuiz.responses));
			
			//var results = jQuiz.checkAnswers();
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
			$('.buttonContainer').hide();
		},
		init: function(){
			$('.next').click(function(){		
				if ( !$('.answers > .boolean > a:visible').hasClass('selected') 
					||  $('.answers > input:visible').filter(function() { return !this.value;}).length > 0 
					|| $(this).hasClass('disabled')) {
					// if all inputs are not provided or link is diabled, do not proceed
					return false;
				}
				$(this).addClass('disabled');
				$($questions.get(currentQuestion)).fadeOut(500, function() {
					currentQuestion = currentQuestion + 1;
					if( currentQuestion == totalQuestions ){
						$('#feedbackContainer').hide();
						jQuiz.finish();
					} else {
						$($questions.get(currentQuestion)).fadeIn(500);
						$('.confidence-slider').trigger('update');
						$('.next').removeClass('disabled')
						if( currentQuestion == totalQuestions-1 ) {
							$('.next').text('| Finish |');
						}
						
						$('#feedbackContainer').show();
						var canvas = document.getElementById('feedbackCanvas');			
						canvas.width = $('#feedbackContainer').width();
						var context = canvas.getContext('2d');
						clearCanvas(canvas, context);
						
						var scale = canvas.width;
						var str = $($questions.get(currentQuestion-1)).children('.feedback').text();
						var json = $.parseJSON(str);
						
						for( i = 0; i < 2; i++ ) {
							var name = json[i].name;
							var area = json[i].area;
							var scaledArea = area / scale;
							var centerX = (canvas.width / 3) * (i + 1);
							var centerY = .66 * canvas.height;
							var radius = Math.sqrt(scaledArea)/Math.sqrt(Math.PI);

							drawCircle(context, centerX, centerY, radius, '#2F4F4F');
							
							context.fillStyle = '#C0D9D9';
							context.font="10px Verdana";
							context.fillText(name, centerX - 20, centerY);
							context.fillText(formatNumber(area) + "km2", centerX - 20, centerY + 20);
						}
						
					}
				});

				var el = $('#progress');
				el.width(el.width() + progressPixels + 'px');
			});			
		}
	};
	jQuiz.init();
})
