$(document).ready(function() {
    $('.table-log .logCreated').each(function() {
        var time = $(this).data('created');
        if (time) $(this).text(moment(time).fromNow());
    });
});
