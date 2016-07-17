if (!Handlebars) throw new Error('Handlebars is required.');

Handlebars.registerHelper('fromNow', function(context, block) {
    if (!window.moment) return context;
    return moment(context).fromNow();
});

Handlebars.registerHelper('tracker_link', function(url, url_id) {
    return app.basepath + '/click?u=' + encodeURIComponent(url) + '&url_id=' + url_id;
});

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

Handlebars.registerHelper('url', function(context) {
    return encodeURIComponent(context);
});

Handlebars.registerHelper('is_of', function(uid, user, opts) {
    if (!uid || !user || !user._id || user._id == '-' || uid != user._id)
        return opts.inverse(this);
    else
        return opts.fn(this);
});

Handlebars.registerHelper('is_review', function(reviewType, opts) {
    if (reviewType != '' && reviewType != 'none')
        return opts.fn(this);
    else
        return opts.inverse(this);
});

Handlebars.registerHelper('link_icon', function(host) {
    var result = '';

    var host_icons = {
        'github': 'github'
    };

    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('shorten_url', function(alias, block) {
    if (!alias) return '';
    var data_url = app.basepath + '/' + alias;
    var result = '<a href="javascript:;" ' + 'class="short_url_item" ' + 'data-toggle="tooltip" ' + 'title="Shorten URL, click to copy. \nCtrl + Click to go." ' + 'data-clipboard-text="' + data_url + '" ' + 'data-alias="' + alias + '">/' + alias + '</a>';

    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('resize_w', function(resize_w, url) {
    if (typeof url == 'object') { // not defined
        url = resize_w;
        resize_w = 300; // default
    }

    var result = '//images1-focus-opensocial.googleusercontent.com/gadgets/proxy?resize_w=' 
        + resize_w +'&container=focus&url=' + encodeURIComponent(url);
    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('resize_h', function(resize_h, url) {
    if (typeof url == 'object') { // not defined
        url = resize_h;
        resize_h = 300; // default
    }

    var result = '//images1-focus-opensocial.googleusercontent.com/gadgets/proxy?resize_h='
        + resize_h +'&container=focus&url=' + encodeURIComponent(url);
    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('img_proxy', function(url) {
    var result = '//images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=' 
        + encodeURIComponent(url);
    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('icon_markdown', function(class_css) {
    class_css = (' class="' +class_css + '"') || '';
    return new Handlebars.SafeString('<svg aria-hidden="true" '+ class_css + ' height="16" role="img" version="1.1" viewBox="0 0 16 16" width="16"><path d="M14.85 3H1.15C0.52 3 0 3.52 0 4.15v7.69C0 12.48 0.52 13 1.15 13h13.69c0.64 0 1.15-0.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11L7 11V8l-1.5 1.92L4 8v3H2V5h2l1.5 2 1.5-2 2 0V11zM11.99 11.5L9.5 8h1.5V5h2v3h1.5L11.99 11.5z"></path></svg></span>');
})

Handlebars.registerHelper('equal', function(var1, var2, context) {
    if(var1 == var2) {
        return context.fn(this);
    }
    
    return context.inverse(this);
});


function nl2br(text) {
    var text = Handlebars.escapeExpression(text);
    var nl2br_regex = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
    return new Handlebars.SafeString(nl2br_regex);
}

Handlebars.registerHelper('nl2br', nl2br);

Handlebars.registerHelper('renderNote', function renderNote (text) {
    // var text = Handlebars.escapeExpression(text);

    var text = nl2br(text);

    if (text.length < 50) text = '<span style="font-size: 2em">' + text + '</span>';
    if (text.length < 30) text = '<span style="font-size: 2.5em">' + text + '</span>';

    return new Handlebars.SafeString(text);
});
