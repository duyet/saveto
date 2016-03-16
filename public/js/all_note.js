jQuery(document).ready(function($) {
    // Moment
    if (moment) {
        $('.created').html(moment($('.created').text()).fromNow())
    }
});
