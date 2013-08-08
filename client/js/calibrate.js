
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

function formatNumber(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

			assert((facts.length === booleanResponses.length) && (booleanResponses.length === confidences.length), "Answer sizes must match.");
			
			for (var i = 0; i < facts.length; i++) {
				var response = {
					response: booleanResponses[i],
					confidence: confidences[i],
					fact: facts[i]
				};

				jQuiz.responses.push(response);
			}				
			//alert(JSON.stringify(jQuiz.responses));
			
			var results = jQuiz.checkAnswers();
			var resultSet = '';
			var trueCount = 0;
			for (var i = 0, ii = results.length; i < ii; i++){
				if (results[i] == true) trueCount++;
				resultSet += '<div> Question ' + (i + 1) + ' is ' + (results[i] ? "correct" : "incorrect") + '</div>'
			}
			resultSet += '<div class="totalScore">Your total score is ' + parseInt(trueCount * (100/totalQuestions), 10) + ' / 100</div>'
			$('#resultContainer').html(resultSet).show();
			$('.buttonContainer').hide();
		},
		checkAnswers: function() {					
			var resultArr = [];
			for (var key in this.responses) {		
				var response = this.responses[key];
				var result = false;
				if (response.fact == response.response) {
					result = true;
				}
				/* for range responses:
				alert(response.low + " <= " + response.fact + " : " + (response.low <= response.fact));
				if (response.low <= response.fact && response.fact <= response.high) {
					result = true;
				}
				*/
				resultArr.push(result);
			}
			return resultArr;
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
						jQuiz.finish();
					} else {
						$($questions.get(currentQuestion)).fadeIn(500);
						$('.confidence-slider').trigger('update');
						$('.next').removeClass('disabled')
						if( currentQuestion == totalQuestions-1 ) {
							$('.next').text('| Finish |');
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
