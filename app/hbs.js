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
hbs.registerHelper('url_tracker', function(url, url_id) {
    return '/click?u=' + encodeURIComponent(url) + '&url_id=' + url_id;
});

// ======================
// {{json var}}
hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

// ======================
// {{equal var1 var2}}
hbs.registerHelper('equal', function(var1, var2, context) {
    if(var1 == var2) {
        return context.fn(this);
    }
    
    return context.inverse(this);
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
            jspath = '/public/lib/' + page[i].substr(1);
        } else if (page[i].substr(0, 1) == '@') {
            jspath = '//' + page[i].substr(2);
        } else {
            jspath = '/public/js/' + page[i];
        }

        result.push('<script type="text/javascript" src="' + jspath + '.js"></script>');
    }

    return new hbs.SafeString(result.join('\n'));
});

hbs.registerHelper('custom_css_by_page', function(page) {
    if (!page) return '';
    if (!Array.isArray(page)) page = [page];

    var result = [];
    for (var i in page) {
        var csspath = '';
        if (page[i].substr(0, 1) == '@') {
            // is lib
            csspath = '/public/lib/' + page[i].substr(1);
        } else if (page[i].substr(0, 2) == '//') {
            csspath = '//' + page[i].substr(2);
        } else {
            csspath = '/public/css/' + page[i];
        }

        result.push('<link rel="stylesheet" type="text/css" href="' + csspath + '.css" />');
    }

    return new hbs.SafeString(result.join('\n'));
});

// ========================
// Raw
hbs.registerHelper('raw', function(options) {
    return options.fn();
});

// =========================
// CDN 
// {{ js_cdn './local.js' '//cdn.com/local.js' }}
hbs.registerHelper('js_cdn', function(is_production, local, cdn) {
    var html = '<script type="text/javascript" src="%s"></script>';
    var result = '';

    if (!is_production || is_production != true)  
        result = html.replace('%s', local);
    else 
        result = html.replace('%s', cdn);

    return new hbs.SafeString(result);
});

hbs.registerHelper('css_cdn', function(is_production, local, cdn) {
    var html = '<link rel="stylesheet" type="text/css" href="%s" />';
    var result = '';

    if (!is_production || is_production != true)  
        result = html.replace('%s', local);
    else 
        result = html.replace('%s', cdn);

    return new hbs.SafeString(result);
});

// =========================
// Random header 
// {{ random_header }}


hbs.registerHelper('random_header', function() {
    function rand (bg) {
        return bg[Math.floor(Math.random()*bg.length)];
    }

    var bg_image = rand(['triangle.png', 'circle.png', 'carrot.png', 'big-blue.png']);
    var bg_color = rand(['#e3a21a', '#00aba9', '#FFCC00', '#2d89ef', '#da532c', '#9f00a7', '#ffc40d', '#47ad66']);
    var result = `style="background-color: ${bg_color}; /* background-image: url(/public/img/header-bg/${bg_image})" */`;

    return new hbs.SafeString(result);
});

// ================
// Note fa icon
hbs.registerHelper('note_icon', function(language) {
    var result = '';
    var icon = '';

    switch(language) {
        case 'ace/mode/html':
            icon = 'html5'
            break;
        default:
            icon = 'sticky-note-o';
    }

    if (!icon) return result;
    result = `<i class="fa fa-${icon}"></i>`;
    return new hbs.SafeString(result);
});


hbs.registerHelper('trimString', function(passedString, length) {
    length = length || 150
    var theString = passedString.substring(0,length);
    return new hbs.SafeString(theString)
});
