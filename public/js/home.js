$(document).ready(function() {
    // Compile template
    var feedItemSource = $("#feeditem").html();
    var editItemSource = $("#edititem").html();
    var feedItemTemplate = Handlebars.compile(feedItemSource);
    var editItemTemplate = Handlebars.compile(editItemSource);

    var isInitial = false;
    $(".feed").bind("DOMSubtreeModified", function() {
        initial();
    });


    var lasted_url_item = null;
    var feed_per_page = 10;
    // Load timeline
    function loadFeed(start_at, limit) {
        var conditions = {};
        if (window['is_user_feed_only'] != void 0)
            conditions = {user_id: force_userid || app.user._id || ''};

        if (start_at) 
            conditions = $.extend(conditions, {
                created: { $lt: start_at }
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
            $('.load-more').text('more');
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
        }

        var data = {
            url: url,
            user_id: app.user._id,
            access_token: app.user.access_token
        };

        $.post(app.api_endpoint + '/collection', data, function(data) {
            if (data) {
                $('#quick-url').val('');
                $('.feed').prepend(feedItemTemplate({
                    urls: [data],
                    user: app.user
                }));
            }
        }).fail(function() {
            alert('ops, try again.')
        });
    });

    function initial() {
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

        // Edit form 
        $('.url-item .editBtn').click(function(e) {
            var data = $(this).data('item');
            if (data) alertify.itemEditBox(data);
            else alertify.message('Ops, error!');
        });

        // ======================
        // Break 
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
        clipboard.on('error', function(e) {
            alertify.message("ops, using right click > copy.");
        });
    }

    if (!alertify.itemEditBox) {
        //define a new dialog
        alertify.dialog('itemEditBox', function() {
            return {
                main: function(data) {
                    this.set('title', 'edit');
                    this.setting('item', data);
                    this.setting('frameless', true);
                    
                    this.setContent(editItemTemplate({item: data}))
                },
                setup: function() {
                    return {
                        buttons: [
                            {
                                text: 'Save',
                                className: alertify.defaults.theme.ok,
                                key: 9,
                                attrs:{attribute:'value'},
                            
                            }, 
                            // {
                            //     text: 'Cancel',
                            //     key: 27,
                            //     invokeOnClose: true,
                            //     className: alertify.defaults.theme.cancel
                            // }
                        ],
                        focus: {
                            element: 0
                        },
                        options: {
                            resizable: true,
                            modal: false
                        },
                        padding : !1,
                     overflow: !1,
                    };
                },
                build: function() {
                    this.elements.body.style.minHeight = '500px';
                },
                callback: function(e) {
                    console.log(e)
                }
            }
        });
    }


});
