$(document).ready(function() {
    var feedItemSource = $("#feeditem").html();
    var feedItemTemplate = Handlebars.compile(feedItemSource);

    var last_url_item = null;

    // Quick by auto submit
    if (__auto_submit) return doAdd();

    // Trigger
    $('#quickForm').on('submit', doAdd);

    // Add new 
    function doAdd(e) {
        !e || e.preventDefault();

        if (!app.user || !app.user._id || !app.user.access_token) {
            return alertify.error('ops, not login?');
        }

        var title = $('#title').val();
        var url = $('#url').val();
        var error = false;

        if (!url) error = true;
        else if (isURL && !isURL(url)) {
            url = 'http://' + url;
            if (!isURL(url)) error = true;
        }
        if (error) {
            $('.url-input').addClass('has-danger');
            return;
        }

        var uid = window.app.user && window.app.user._id ? window.app.user._id : '';

        var data = {
            url: url || '',
            title: title || '',
            user_id: uid,
            access_token: app.user.access_token
        };

        if (last_url_item != null) {
            // Update new title and url
            if (data.title && data.title.length && data.url.length) {
                last_url_item.title = data.title;
                last_url_item.url = data.url;
                updateUrlItem(data);
            }
        }

        $.post(app.api_endpoint + '/collection', data, function(data) {
            if (data) {

                last_url_item = data;

                data.is_loading = true;
                $('#addResult').prepend(feedItemTemplate({
                    urls: [data],
                    user: app.user
                })).slideDown();

                initialFeedScript();

                fetchUrlData(url, function(err, data_fetched) {
                    if (err || !data_fetched) {
                        console.log('error e', err, data_fetched, data_fetched.length)

                        $('.fa.fa-spinner.fa-pulse').hide();
                        return;
                    }

                    // Update data
                    data = $.extend(data, data_fetched);
                    data.is_loading = false;
                    if (title) data.title = title; // override by user

                    // Sync back server
                    updateUrlItem(data);

                    var newrender = feedItemTemplate({
                        urls: [data],
                        user: app.user
                    });
                    $('#item-' + data._id).html($(newrender).html());
                });
            }
        }).fail(function() {
            alertify.error('ops, try again.');
            if (!app.user || !app.user._id) alertify.error('please login');
        });
    }

    function fetchUrlData(url, cb) {
        $.get(app.base_url + 'api/v1/url/parser', {
            url: url
        }, function(data) {
            url_fetched = data;
            if (cb) cb(null, data);
        }).error(function() {
            console.log('error parse ', url)
            if (cb) cb('error parser', {});
            url_fetched = {};
        })
    }

    function updateUrlItem(item) {
        if (!item || !item._id) return false;

        var data = $.extend(item, {
            user_id: app.user._id,
            access_token: app.user.access_token
        });

        $.post(app.api_endpoint + '/collection/' + item._id, data, function(result) {
            
        }).error(function() {
            alert('Can not sync')
        });
    }

    function initialFeedScript() {
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

        // Clipboard 
        var clipboard = new Clipboard('.short_url_item');
        clipboard.on('success', function(e) {
            if (ctrlPressed) {
                window.location = e.text;
                return true;
            }

            alertify.message("Copied!");
        });
        clipboard.on('error', function(e) {
            alertify.message("ops, using right click > copy.");
        });
    }
});
