var url = require('url');
var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var md5 = require('md5');
var randomstring = require('randomstring');
var validator = require('validator');

var config = require('./config');
var model = require('./model');

// Password check
exports.isValidPassword = function(user, password) {
    return bcrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
exports.createHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

exports.md5 = function(s) {
    return md5(s);
}

exports.isURL = function(s) {
    return validator.isURL(s, {
        require_protocol: true
    });
}

exports.isID = function(s) {
    return validator.isMongoId(s);
}

exports.isUserID = function(s) {
    return validator.isMongoId(s);
}

exports.accessTokenGenerator = function() {
    return randomstring.generate({
        length: 32,
        charset: 'alphabetic'
    });
}
exports.appAccessTokenGenerator = function() {
    return randomstring.generate({
        length: 32,
        charset: 'alphabetic'
    });
}

exports.getDeleteToken = function() {
    return randomstring.generate({
        length: 16,
        charset: 'alphabetic'
    });
}

exports.parseURL = function(u, parseQueryString, slashesDenoteHost) {
    return url.parse(u, parseQueryString, slashesDenoteHost);
}

exports.aliasGenerator = function(len) {
    len = len || config.app.link.alias_length;
    return randomstring.generate({
        length: len,
        charset: 'alphanumeric'
    });
}

exports.appSecretKeyGenerator = function(len) {
    len = len || 15;
    return randomstring.generate({
        length: len,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
    });
}

exports.appIdGenerator = function(len) {
    len = len || 15;
    return randomstring.generate({
        length: len,
        charset: 'numeric'
    });
}

exports.noteTitleGenerator = function(len) {
    return randomstring.generate({
        length: len || 32,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
    });
}

// Userlog
exports.userLog = function(user, req, event_name) {
    if (!user || !user._id) return false;
    if (!req) return false;

    var log = new model.UserLog();
    log.user_id = user._id;
    log.created = new Date();
    log.event = event_name;
    log.ip = req.ip || '';
    log.path = req.path || '';
    log.header = {};

    var headers = ['x-requested-with', 'accept-language', 'referer', 'user-agent'];
    var key = '', i = 0; 
    for (; key = headers[i++];) {
        if (req.header[key]) log.header[key] = req.header[key] || '';
    }
    
    log.save();
}

exports.queryLog = function(user, req, raw_query, query) {
    if (!req) return false;

    var log = new model.QueryLog();
    log.user_id = user ? user._id || '-' : '-';
    log.created = new Date();
    log.raw_query = raw_query || '';
    log.query = query || '';
    log.ip = req.ip || '';
    log.path = req.path || '';
    log.header = {};

    var headers = ['x-requested-with', 'accept-language', 'referer', 'user-agent'];
    var key = '', i = 0; 
    for (; key = headers[i++];) {
        if (req.header[key]) log.header[key] = req.header[key] || '';
    }
    
    log.save();

    console.info('LOG: Save query log ', query);
}

exports.checkURLAlias = function(alias) {
    var min_length = config.app.link.alias_min || 3;
    var test = /^[0-9A-Z_-]+$/i;
    var black_list = [
        'me', 'admin', 'system', 'mod', 'login', 'register',
        'duyetdev', 'user', 'validate', 'quick', 'goto',
        'hihi', 'download', 'shutdown', 'shutup', 'xxxx'
    ];

    alias = '' + (alias || '');
    alias = alias.trim();
    if (alias.length < min_length) return false;

    if (!test.test(alias)) return false;
    if (black_list.indexOf(alias) > -1) return false;

    return true;
}

exports.userDefaultSetting = function() {
    return {
        language: 'en',
        reset_access_token: 'every_login',
        timezone: '7',
        offline: false
    };
}

exports.isFileExists = function(file_path) {
    return fs.existsSync(file_path);
}

exports.isGithubMarkdownRaw = function(url_path) {
    if (!url_path) return false;

    var parse = exports.parseURL(url_path);
    console.log(parse);
    if (parse && ('raw.githubusercontent.com' === parse.host || 'gist.githubusercontent.com' === parse.host)) {
        if (url_path.slice(-3) == '.md')
            return true;
    }
    if (parse && 'github.com' === parse.host && url_path.indexOf('blob') > -1) {
        if (url_path.slice(-3) == '.md')
            return true;
    }

    return false;
}

exports.getYoutubeID = function(url_path) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url_path.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return '';
    }
}

exports.isYouTubeEmbedURL = function (url_path) {
    return '//www.youtube.com/embed/' + exports.getYoutubeID(url_path);
}

exports.isYouTubeURL = function(url_path) {
    if (!url_path) return false;
    url_path = '' + url_path;

    var r = /(youtube\.com|youtu\.be)/i;
    if (!r.test(url_path)) return false;
    if (exports.getYoutubeID(url_path) == '') return false;

    return true;
}

exports.reviewType = function(url_path) {
    if (!url_path) return 'none';

    // is markdown
    if (exports.isGithubMarkdownRaw(url_path)) return 'markdown';
    if (exports.isYouTubeURL(url_path)) return 'youtube';

    // More check

    return 'none';
}

exports.getReviewRawUrl = function(url_path) {
    if (exports.reviewType(url_path) == 'markdown')
        return exports.getGithubMarkdownUrl(url_path);
    else if (exports.reviewType(url_path) == 'youtube')
        return exports.isYouTubeEmbedURL(url_path);

    // Default
    return url_path;
}

exports.getGithubMarkdownUrl = function(url_path) {
    if (!url_path) return '';

    var parse = exports.parseURL(url_path);
    if (parse && 'github.com' === parse.host && url_path.indexOf('blob') > -1) {
        url_path = url_path.replace('github.com', 'raw.githubusercontent.com');
        url_path = url_path.replace('blob/', '');
    }

    return url_path;
}

exports.getTilteFromUrl = function(url_path) {
    if (!url_path) return '';

    var parse = exports.parseURL(url_path);
    if (!parse) return url_path;

    var title = url_path;
    if ('raw.githubusercontent.com' === parse.host) {
        title = title.replace('http://', '');
        title = title.replace('https://', '');
        title = title.replace('raw.githubusercontent.com', '');
        title = title.replace('gist.githubusercontent.com', '');
    }

    return title;
}

exports.guestUserObject = {
    _id: '-',
    email: '-',
    name: 'guest',
    access_token: '-',
    is_guest: true
}

exports.is_guest = function(user_id, access_token) {
    if (!user_id || !access_token) return false;
    if (user_id == '-' && access_token == '-') return true;
    return false;
}


exports.checkAccessTokenUID = function(user_id, access_token) {
    // TODO: poor security, JWT instead of
    var user_id = user_id || '';
    var access_token = access_token || '';

    console.log('user_id, access_token', user_id, access_token);

    if (user_id == '-' && access_token == '-') return true; // Guest

    if (!user_id || !exports.isUserID(user_id) || !access_token) return false;

    var user = model.User.find({
        _id: user_id,
        access_token: access_token
    }).exec();

    if (!user) return false;
    return true;
}

exports.e404 = function (ctx, message, code) {
    return ctx.render('utils/404', {
        message: message,
        code: code || 404
    });
}
