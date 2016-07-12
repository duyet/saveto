var fs = require('fs');
var path = require('path');
var passport = require('koa-passport');

var model = require('./model');
var utils = require('./utils');

// ================================
// Page
exports.home = function*(next) {
    yield this.render('collection/home', {
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput.min',
            '@copy/dist/copy.min',
            '@gifffer/build/gifffer.min',
            'hbs',
            'colorPicker',
            'home'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput'
        ]
    });
};

exports.explore = function*(next) {
    var q = (this.request.query.hasOwnProperty('q')) ? this.request.query.q : '';
    var collections = yield model.Collection.find({}).exec();

    yield this.render('page/explore', {
        collections: collections
    });
};

exports.RSS = function * (next) {
    var collections = yield model.Collection.find({}).limit(300).sort('-created').exec();
    
    this.set('Content-Type', 'text/xml');
    return yield this.render('page/rss', {
        collections: collections,
        update: new Date(),
    });
}

// ================================
// Helper
exports.click = function*(next) {
    var url = this.request.query.u || '';
    var url_id = this.request.query.url_id || '';

    if (!url || !url_id) return this.body = 'ops!';
    var collection = yield model.Collection.findOne({
        _id: url_id
    }).exec();
    if (!collection) return this.body = 'Not found.';

    // Update click couter
    collection.click += 1;
    collection.save();

    this.redirect(url);
};

exports.shortenUrl = function*(next) {
    alias = this.params.alias || '';

    var collection = yield model.Collection.findOne({
        alias: alias
    }).exec();
    if (!collection) return this.body = 'Not found.';

    // Update click couter
    collection.click += 1;
    collection.click_via_alias += 1;
    collection.save();

    this.redirect(collection.url);
};


