$(document).ready(function() {


    $sources = $('.csl-entry');
    $citations = $('.cite');

    /*
    $sources.attr('id', function( arr ) {
        return 'source-' + arr;
    });
    */

    $.each( $citations, function( key, citation ) {

        var source = $sources.filter(function(index) {
            return $(this).attr('id') == citation.title;
        });
        
        $(this).attr('title', source.html());
        $(this).text('[' + $sources.index(source) + ']');

    });


    $( '.cite' ).tooltip({
        hide: { duration: 4000 },
        content: function() {
            return $(this).attr('title');
        }
    });
        
});
