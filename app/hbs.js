hbs = require('koa-hbs');

hbs.registerHelper('link', function(text, url) {
    text = hbs.Utils.escapeExpression(text);
    url = hbs.Utils.escapeExpression(url);

    var result = '<a href="' + url + '">' + text + '</a>';

    return new hbs.SafeString(result);
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
