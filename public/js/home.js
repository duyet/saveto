$(document).ready(function() {
    Handlebars.registerHelper('fromNow', function(context, block) {
        if (!window.moment) return context;
        return moment(context).fromNow();
    });

    Handlebars.registerHelper('tracker_link', function(url, url_id) {
        return '/click?u=' + url + '&url_id=' + url_id;
    });

    Handlebars.registerHelper('shorten_url', function(alias, block) {
        if (!alias) return '';
        var result = '<a href="'+ app.basepath + '/' + alias 
            + '" title="Shorten URL, click to copy" '
            + 'data-alias="'+ alias +'">/'+ alias +'</a>';

        return new Handlebars.SafeString(result);
    });

    var source = $("#feeditem").html();
    var feeditemTemplate = Handlebars.compile(source);

    // Load timeline
    $.get(app.api_endpoint + '/collection', {
        limit: 10,
        sort: '-created'
    }, function(data) {
        if (data) $('.feed').html(feeditemTemplate({urls: data}));
    });

    // Add new
    $('#quickForm').on('submit', function(e) {
        e.preventDefault();

        var url = $('#quick-url').val();
        var error = false;

        if (!url) error = true;
        else if (isURL && !isURL(url)) {
            url = 'http://' + url;
            if (!isURL(url)) error = true;
        }
        if (error) {
            $('.quick-url-input').addClass('has-danger');
        }

        var data = {
        	url: url,
        	user_id: app.user._id,
        	access_token: app.user.access_token
        };

        $.post(app.api_endpoint + '/collection', data, function(data) {
        	if (data) {
        		$('#quick-url').val('');
                $('.feed').prepend(feeditemTemplate({urls: [data]}));
        	}
        }).fail(function() {
            alert('ops, try again.')
        });
    });
});
