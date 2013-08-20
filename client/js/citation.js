$(document).ready(function() {

    // Create lists of sources and citations elements
    $sources = $('.csl-entry');
    $citations = $('.cite');

    // For each citation, find its corresponding source (citation.title -> source.id)
    $.each( $citations, function( key, citation ) {
        var source = $sources.filter(function(index) {
            return $(this).attr('id') == citation.title;
        });
        
        // Set the citation's title (used for tooltip) to the source's content. If text already existed for the citation (such as a page number), it is appended.
        $(this).attr('title', source.html() + $(this).html());

        // Set the citations visible text to the index of the source (plus one for zero-indexed list)
        $(this).text('[' + ($sources.index(source) + 1) + ']');
    });

    $('.cite, .note').qtip({
        hide: {
            fixed: true,
            delay: 300
        },
        content: function() { 
            return $(this).attr('title');
        },
        style: {
            classes: 'qtip-light qtip-shadow'
        }
    });

});
