$(document).ready(function() {
    // Compile template
    var feedItemSource = $("#feeditem").html();
    var feedItemTemplate = Handlebars.compile(feedItemSource);

    var newrender = feedItemTemplate({
        urls: feeds,
        user: app.user
    });
    $('.feed').html(newrender);

    initialFeedScript();

    var clipboard = null;

    function updateUrlItem(item) {
        if (!item) return false;

        var data = $.extend(item, {
            user_id: app.user._id,
            access_token: app.user.access_token
        });

        $.post(app.api_endpoint + '/url/' + item._id, data, function(result) {
            alertify.message('synced');
        }).error(function() {
            alertify.error('sync is currently experiencing problems');
        });
    }

    function initialFeedScript() {
        // Tooltip
        $('[data-toggle="tooltip"]').tooltip();

        // Share
        $('.share-this').click(function() {
            var share_url = $(this).data('url');
            alertify.prompt("share this via URL", share_url).set('onok', function(closeEvent) {
                if (0 == closeEvent.index) {
                    copy(share_url, function(err) {
                        if (!err) return alertify.message("Copied!");   
                    });
                }
            });
        });

        // Detect Ctrl press
        $(document).keydown(function(e) {
            if (e.which == '17') ctrlPressed = true;
        });
        $(document).keyup(function() {
            ctrlPressed = false;
        });
        var ctrlPressed = false;

        // Clipboard 
        if (clipboard != null) clipboard.destroy();
        clipboard = new Clipboard('.short_url_item');
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

        $('.tags .update-tags').click(function(e) {
            e.preventDefault();
            var _id = $(this).data('url-id');
            if (!_id) return alert('something went wrong!');

            var item = $( '#item-' + _id);

            var p = $(item).find('.list-tags').hide();
            
            var inputTags = $(item).find('.input-tags');
            if (inputTags) {
                inputTags.show();
                var form_row = inputTags.find('input');
                if (form_row) {
                    $(form_row).tagsinput({
                        maxTags: 3,
                        maxChars: 8,
                        trimValue: true,
                        confirmKeys: [13, 44]
                    });

                    $(form_row).on('itemAdded itemRemoved', function() {
                        var data = $(item).data('raw');
                        data.tags = $(this).tagsinput('items');

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
            }
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
