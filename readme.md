bayesian
========

gae integration:
https://github.com/SpringSource/spring-security/blob/7edb1089a80ea7a29adb6d01c091e6fa55d61b39/samples/gae/gae.gradle


Data Sources
=========
http://jmatchparser.sourceforge.net/factbook/


js quiz examples
=========
http://jsfiddle.net/3kpFV/
http://www.fatihacet.com/lab/jQuiz/


XSLT Examples
=========
http://stackoverflow.com/questions/8337145/optimization-of-xslt-using-identity-transform

TODO:
=========
Use real data
Darken chart as more datapoints are added
	https://github.com/iros/d3.chart.horizontal-legend
Add legend
	http://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
use json2html on calibrate.html
	http://www.json2html.com/
	https://github.com/moappi/jquery.json2html
Remove outlying data points (monaco, vatican)
expand graph on click


Range slider:

/*

<div class="range"></div>
<div class="range-slider area-slider"></div>

function areaSliderUpdate( event, ui ) {
	if( ui ) {
		$('.area-slider').prev('div').html(formatNumber(ui.values[0]) + "km<sup>2</sup> - " + formatNumber(ui.values[1]) + "km<sup>2</sup>");
	} else {
		$('.area-slider').prev('div').html(formatNumber($( '.area-slider:visible' ).slider( 'values', 0 )) + "km<sup>2</sup> - "  + $( '.area-slider:visible' ).slider( 'values', 1 ) + "km<sup>2</sup>");
	}
}


...



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

...

			//var lows = $('.range-slider').map(function() { return $(this).slider( 'values', 0 ) }).get();
			//var highs = $('.range-slider').map(function() { return $(this).slider( 'values', 1 ) }).get();

*/
