$(document).ready(function() {
    Handlebars.registerHelper('fromNow', function(context, block) {
        if (!window.moment) return context;
        return moment(context).fromNow();
    });

    Handlebars.registerHelper('tracker_link', function(url, url_id) {
        return '/click?u=' + url + '&url_id=' + url_id;
    });

    Handlebars.registerHelper('is_of', function(uid, user, opts) {
        if (!uid || !user || !user._id || uid != user._id) 
            return opts.inverse(this);
        else 
            return opts.fn(this);
    });

    Handlebars.registerHelper('shorten_url', function(alias, block) {
        if (!alias) return '';
        var data_url = app.basepath + '/' + alias;
        var result = '<a href="javascript:;" '
            + 'class="short_url_item" '
            + 'data-toggle="tooltip" '
            + 'title="Shorten URL, click to copy. \nCtrl + Click to go." '
            + 'data-clipboard-text="'+ data_url +'" '
            + 'data-alias="'+ alias +'">/'+ alias +'</a>';

        return new Handlebars.SafeString(result);
    });

    // Compile template
    var source = $("#feeditem").html();
    var feeditemTemplate = Handlebars.compile(source);

    var isInitial = false;
    function initial () {
        // Tooltip
        $('[data-toggle="tooltip"]').tooltip();

        // Detect Ctrl press
        $(document).keydown(function(e) {
            if (e.which == '17') ctrlPressed = true;
        });
        $(document).keyup(function() {
            ctrlPressed = false;
        });
        var ctrlPressed = false;

        if (isInitial) return;
        isInitial = true;

        // Clipboard 
        var clipboard = new Clipboard('.short_url_item');
        clipboard.on('success', function(e) {
            if (ctrlPressed) {
                window.location = e.text;
                return true;
            }

            alertify.message("Copied!");
        });
    }

    $(".feed").bind("DOMSubtreeModified", function() {
        initial();
    });

    // Load timeline
    $.get(app.api_endpoint + '/collection', {
        limit: 10,
        sort: '-created'
    }, function(data) {
        if (data) $('.feed').html(feeditemTemplate({urls: data, user: app.user}));
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
