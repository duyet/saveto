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

Handlebars.registerHelper('is_of', function(uid, user, opts) {
    if (!uid || !user || !user._id || uid != user._id)
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

Handlebars.registerHelper('shorten_url', function(alias, block) {
    if (!alias) return '';
    var data_url = app.basepath + '/' + alias;
    var result = '<a href="javascript:;" ' + 'class="short_url_item" ' + 'data-toggle="tooltip" ' + 'title="Shorten URL, click to copy. \nCtrl + Click to go." ' + 'data-clipboard-text="' + data_url + '" ' + 'data-alias="' + alias + '">/' + alias + '</a>';

    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('icon_markdown', function(class_css) {
    class_css = (' class="' +class_css + '"') || '';
    return new Handlebars.SafeString('<svg aria-hidden="true" '+ class_css + ' height="16" role="img" version="1.1" viewBox="0 0 16 16" width="16"><path d="M14.85 3H1.15C0.52 3 0 3.52 0 4.15v7.69C0 12.48 0.52 13 1.15 13h13.69c0.64 0 1.15-0.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11L7 11V8l-1.5 1.92L4 8v3H2V5h2l1.5 2 1.5-2 2 0V11zM11.99 11.5L9.5 8h1.5V5h2v3h1.5L11.99 11.5z"></path></svg></span>');
})