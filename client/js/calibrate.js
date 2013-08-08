
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

function areaSliderUpdate( event, ui ) {
	//$('span').html(formatNumber(ui.values[0]) + "km<sup>2</sup> - " + formatNumber(ui.values[1]) + "km<sup>2</sup>");
	//$('input[name="low"]:visible').val(ui.values[0]);
	//$('input[name="high"]:visible').val(ui.values[1]);

    $('span').html( formatNumber($( '.area-slider:visible' ).slider( 'values', 0 )) + "km<sup>2</sup> - "  + $( '.area-slider:visible' ).slider( 'values', 1 ) + "km<sup>2</sup>");
	//$('input[name="low"]:visible').val($( ".area-slider:visible" ).slider( "values", 0 ));
	//$('input[name="high"]:visible').val($( ".area-slider:visible" ).slider( "values", 1 ));
}

/*
 *  Main quiz function.
 */
$(function(){

	$( ".area-slider" ).slider({
		range : true,
		min : 0,
		max : 7000000,
		values : [ 2000000, 5000000 ],
		step : 100,
		slide : areaSliderUpdate
	});
	
	$('.area-slider').slider().bind({
		update : areaSliderUpdate
	});
	$('.area-slider').trigger('update');
	
	var totalQuestions = $('.questionContainer').size();
	var currentQuestion = 0;
	var progressPixels = $('#progressContainer').width()/totalQuestions;
	$questions = $('.questionContainer');
	$questions.hide();
	$($questions.get(currentQuestion)).fadeIn();
	
	var jQuiz = {
		finish: function() {
			jQuiz.userAnswers = [];						
			
			var facts = $('div.fact').map(function() { return parseInt($(this).text()) }).get();
			var lows = $('.range-slider').map(function() { return $(this).slider( 'values', 0 ) }).get();
			var highs = $('.range-slider').map(function() { return $(this).slider( 'values', 1 ) }).get();
			var confidences = $('input[name="confidence"]').map(function() { return $(this).val() }).get();
			
			assert((highs.length === lows.length) && (lows.length === confidences.length), "Answer sizes must match.");
			
			for (var i = 0; i < highs.length; i++) {
				var userAnswer = { 
					low: lows[i],
					high: highs[i],
					confidence: confidences[i],
					fact: facts[i]
				};

				jQuiz.userAnswers.push(userAnswer);
			}				
			//alert(JSON.stringify(jQuiz.userAnswers));
			
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
				var result = false;
				//alert(userAnswer.low + " <= " + userAnswer.fact + " : " + (userAnswer.low <= userAnswer.fact));
				if (userAnswer.low <= userAnswer.fact && userAnswer.fact <= userAnswer.high) {
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
						$('.area-slider').trigger('update');
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
