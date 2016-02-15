$(document).ready(function() {
    // Compile template
    var feedItemSource = $("#feeditem").html();
    var editItemSource = $("#edititem").html();
    var feedItemTemplate = Handlebars.compile(feedItemSource);
    var editItemTemplate = Handlebars.compile(editItemSource);

    var updateFormDialog = null;

    var isInitial = false;
    var lasted_url_item = null;
    var feed_per_page = 10;
    // Load timeline
    function loadFeed(start_at, limit) {
        var conditions = {};
        conditions.is_public = 1;

        if (window['is_user_feed_only'] != void 0) {
            conditions = {
                user_id: force_userid || app.user._id || '',
                is_public: { $in : [0, 1] }
            };
        }

        if (start_at)
            conditions = $.extend(conditions, {
                created: {
                    $lt: start_at
                }
            });

        var limit = limit || feed_per_page;

        $.get(app.api_endpoint + '/collection', {
            conditions: JSON.stringify(conditions),
            limit: limit,
            sort: '-created'
        }, function(data) {
            lasted_url_item = data.slice(-1).pop();
            if (data) $('.feed').append(feedItemTemplate({
                urls: data,
                user: app.user
            }));
            initialFeedScript();
            $('.load-more').text('more');
            if (!data.length) $('.load-more').text('');
        });
    }

    if ($('.feed').text().trim() == '') {
        $('.load-more').text('loading ...');
    }

    // Load 
    loadFeed(null, 5);
    $('.load-more').click(function() {
        if (lasted_url_item) loadFeed(lasted_url_item.created, 5);
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
            return;
        }

        var data = {
            url: url,
            user_id: app.user._id,
            access_token: app.user.access_token
        };


        $.post(app.api_endpoint + '/collection', data, function(data) {
            if (data) {
                $('#quick-url').val('');

                data.is_loading = true;
                $('.feed').prepend(feedItemTemplate({
                    urls: [data],
                    user: app.user
                }));

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

                    // Sync back server
                    updateUrlItem(data);

                    var newrender = feedItemTemplate({
                        urls: [data],
                        user: app.user
                    });
                    $('#item-' + data._id).html($(newrender).html());
                    initialFeedScript();
                });
            }
        }).fail(function() {
            alertify.error('ops, try again.');
            if (!app.user || !app.user._id) alertify.error('please login');
        });
    });

    function fetchUrlData(url, cb) {
        $.get(app.base_url + 'helper/v1/parser', {
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
        if (!item) return false;

        var data = $.extend(item, {
            user_id: app.user._id,
            access_token: app.user.access_token
        });

        $.post(app.api_endpoint + '/collection/' + item._id, data, function(result) {
            console.log(result);
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

        // Edit form 
        $('.url-item .editBtn').click(function(e) {
            // TODO: Open modal to edit 

            e.preventDefault();
            var data = $(this).data('item');
            if (data) {
                updateFormDialog = alertify.itemEditBox(data, app.user, function(box) {
                    var root = $(box.elements.body);
                });
            }
            else alertify.message('Ops, error!');
        });
    }

    if (!alertify.itemEditBox) {
        //define a new dialog
        alertify.dialog('itemEditBox', function() {
            return {
                main: function(data, user, callback) {
                    this.set('title', 'edit');
                    this.setting('item', data);
                    this.setting('frameless', true);

                    if (callback) callback(this);

                    this.setContent(editItemTemplate({
                        item: data,
                        user: user
                    }))
                },
                setup: function() {
                    return {
                        buttons: [{
                            text: 'Save',
                            className: alertify.defaults.theme.ok,
                            key: 9,
                            attrs: {
                                attribute: 'value'
                            },

                        }, ],
                        focus: {
                            element: 0
                        },
                        options: {
                            resizable: true,
                            modal: false,
                            transition: 'flipx'
                        }
                    };
                },
                build: function() {
                    this.elements.body.style.minHeight = '430px';
                    this.elements.content.style.padding = '5px 0';
                    this.elements.content.style.overflow = 'hidden';
                }
            }
        });
    }


});
