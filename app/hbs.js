var hbs = require('koa-hbs');
var validator = require('validator');
// var intl = require('intl');
// var HandlebarsIntl = require('handlebars-intl');

// ==================
// Register the Helpers. See: http://formatjs.io/handlebars/
// HandlebarsIntl.registerWith(Handlebars);

// ==================
// {{link text url}}
hbs.registerHelper('link', function(text, url) {
    text = hbs.Utils.escapeExpression(text);
    url = hbs.Utils.escapeExpression(url);

    var result = '<a href="' + url + '">' + text + '</a>';

    return new hbs.SafeString(result);
});

// ====================
// {{url_tracker "text" "http://google.com"}}
hbs.registerHelper('url_tracker', function(text, url) {
    if (!text) text = url;

    text = hbs.Utils.escapeExpression(text);
    url = '/click?u=' + hbs.Utils.escapeExpression(url);

    var result = '<a href="' + url + '">' + text + '</a>';

    return new hbs.SafeString(result);
});

// ======================
// {{json var}}
hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

// ======================
// {{custom_script_by_page 'custom'}}
hbs.registerHelper('custom_script_by_page', function(page) {
    if (!page) return '';
    if (!Array.isArray(page)) page = [page];

    var result = [];
    for (var i in page) {
        var jspath = '';
        if (page[i].substr(0, 1) == '@') {
            // is lib
            jspath = 'lib/' + page[i].substr(1);
        } else {
            jspath = 'js/' + page[i];
        }

        result.push('<script type="text/javascript" src="/public/' + jspath + '.js"></script>');
    }

    return new hbs.SafeString(result.join('\n'));
});

hbs.registerHelper('custom_css_by_page', function(page) {
    if (!page) return '';
    if (!Array.isArray(page)) page = [page];

    var result = [];
    for (var i in page) {
        var jspath = '';
        if (page[i].substr(0, 1) == '@') {
            // is lib
            jspath = 'lib/' + page[i].substr(1);
        } else {
            jspath = 'css/' + page[i];
        }

        result.push('<link rel="stylesheet" type="text/css" href="/public/' + jspath + '.css" />');
    }

    return new hbs.SafeString(result.join('\n'));
});

// ========================
// Raw
hbs.registerHelper('raw', function(options) {
    return options.fn();
});
