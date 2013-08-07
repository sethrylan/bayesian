
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

/*
 *  Main quiz function. Parameters progressPixels and answers must be defined.
 */
$(function(){
	var totalQuestions = $('.questionContainer').size();
	var currentQuestion = 0;
	$questions = $('.questionContainer');
	$questions.hide();
	$($questions.get(currentQuestion)).fadeIn();
	

	/*
	$( "#area-slider" ).slider({
		range: true,
		min: 0,
		max: 7000000,
		values: [ 2000000, 5000000 ],
		slide: function( event, ui ) {
			var values = ui.values;
			$("span").text(values[0] + " - " + values[1] );
		}
	});
	*/

	var jQuiz = {
		finish: function() {
			jQuiz.userAnswers = [];						
			
			var lows = $('input[name$="low"]').map(function() { return $(this).val() }).get();
			var highs = $('input[name$="high"]').map(function() { return $(this).val() }).get();
			var confidences = $('input[name$="confidence"]').map(function() { return $(this).val() }).get();
			
			assert((highs.length === lows.length) && (lows.length === confidences.length), "Answer sizes must match.");
			
			for (var i = 0; i < highs.length; i++) {
				var userAnswer = { 
					n: i + 1,
					low: lows[i],
					high: highs[i],
					confidence: confidences[i]
				};

				jQuiz.userAnswers.push(userAnswer);
			}						
			
			//$('#progress').width(300);
			//$('#progressContainer').hide();
			var results = jQuiz.checkAnswers();
			var resultSet = '';
			var trueCount = 0;
			for (var i = 0, ii = results.length; i < ii; i++){
				if (results[i] == true) trueCount++;
				resultSet += '<div> Question ' + (i + 1) + ' is ' + results[i] + '</div>'
			}
			resultSet += '<div class="totalScore">Your total score is ' + parseInt(trueCount * (100/totalQuestions), 10) + ' / 100</div>'
			$('#resultContainer').html(resultSet).show();
			$('.buttonContainer').hide();

		},
		checkAnswers: function() {					
			var resultArr = [];
			for (var key in this.userAnswers) {		
				var userAnswer = this.userAnswers[key];
				var correctAnswer = answers['q' + userAnswer.n];
				var result = false;
				//alert("answer is " + correctAnswer + "; low is " + userAnswer.low + "; high is " + userAnswer.high);
				if (userAnswer.low <= correctAnswer && correctAnswer <= userAnswer.high) {
					result = true;
				}
				resultArr.push(result);
			}
			return resultArr;
		},
		init: function(){
			$('.next').click(function(){		
				if ($('.answers > input:visible').filter(function() { return !this.value;}).length > 0 || $(this).hasClass('disabled')) {
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
