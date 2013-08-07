
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
 *  Main quiz function. Parameters numQuestions, progressPixels and answers must be defined.
 */
$(function(){
	var jQuiz = {
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
				if ($('.answers > input:visible').filter(function() { return !this.value;}).length > 0) {
					// if all inputs are not provided, do not proceed
					return false;
				}
				$(this).parents('.questionContainer').fadeOut(500, function(){
					$(this).next().fadeIn(500);
				});
				var el = $('#progress');
				el.width(el.width() + progressPixels + 'px');
			});
			$('.finish').click(function(){				
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
				resultSet += '<div class="totalScore">Your total score is ' + parseInt(trueCount * (100/numQuestions), 10) + ' / 100</div>'
				$('#resultContainer').html(resultSet).show();
			})
		}
	};
	jQuiz.init();
})
