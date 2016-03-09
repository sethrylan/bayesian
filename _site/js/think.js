
function areaSliderUpdate( event, ui ) {
    if( ui ) {
        $('.area-slider').prev('div').html(formatNumber(ui.values[0]) + "km<sup>2</sup> - " + formatNumber(ui.values[1]) + "km<sup>2</sup>");
    } else {
        $('.area-slider').prev('div').html(formatNumber($( '.area-slider:visible' ).slider( 'values', 0 )) + "km<sup>2</sup> - "  + $( '.area-slider:visible' ).slider( 'values', 1 ) + "km<sup>2</sup>");
    }
}


$(document).ready(function() {

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

            //var lows = $('.range-slider').map(function() { return $(this).slider( 'values', 0 ) }).get();
            //var highs = $('.range-slider').map(function() { return $(this).slider( 'values', 1 ) }).get();


}
