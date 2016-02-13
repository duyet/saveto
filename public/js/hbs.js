if (!Handlebars) throw new Error('Handlebars is required.');

Handlebars.registerHelper('fromNow', function(context, block) {
    if (!window.moment) return context;
    return moment(context).fromNow();
});

Handlebars.registerHelper('tracker_link', function(url, url_id) {
    return '/click?u=' + encodeURIComponent(url) + '&url_id=' + url_id;
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

Handlebars.registerHelper('shorten_url', function(alias, block) {
    if (!alias) return '';
    var data_url = app.basepath + '/' + alias;
    var result = '<a href="javascript:;" ' + 'class="short_url_item" ' + 'data-toggle="tooltip" ' + 'title="Shorten URL, click to copy. \nCtrl + Click to go." ' + 'data-clipboard-text="' + data_url + '" ' + 'data-alias="' + alias + '">/' + alias + '</a>';

    return new Handlebars.SafeString(result);
});
