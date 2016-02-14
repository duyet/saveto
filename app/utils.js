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

exports.isUserID = function(s) {
    return validator.isMongoId(s);
}

exports.accessTokenGenerator = function() {
    return randomstring.generate({
        length: 32,
        charset: 'alphabetic'
    });
}

exports.parseURL = function(u, parseQueryString, slashesDenoteHost) {
    return url.parse(u, parseQueryString, slashesDenoteHost);
}

exports.aliasGenerator = function(len) {
    len = len || config.alias_length;
    return randomstring.generate({
        length: len,
        charset: 'alphabetic'
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

    log.save();
}

exports.checkURLAlias = function(alias) {
    var min_length = config.alias_min || 3;
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