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
            'hbs',
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

// ===============================
// Collection
exports.updateURL = function*(next) {
    // process action
    if (this.method === 'POST') {
        var _id = this.request.body._id || '';

        var collection = yield model.Collection.findById('' + _id).exec();
        if (!collection) return this.body = 'something went wrong.';

        if (collection.user_id != this.req.user._id)
            return this.body = 'access deny';

        var data = this.request.body;
        var error = null;

        if (data.title) collection.title = data.title;
        if (data.is_public && data.is_public == 'true') collection.is_public = data.is_public;
        else collection.is_public = false;

        if (!error && data.alias && !utils.checkURLAlias(data.alias))
            error = 'alias not accept';

        if (!error) {
            var query = yield model.Collection.findOne({
                _id: {
                    $ne: _id
                },
                alias: data.alias
            }).exec();
            if (query) error = 'alias already exist.';
        }

        if (!error) {
            collection.alias = data.alias;
        }
        collection.save();

        return yield this.render('collection/updateURL', {
            success: !error ? 'update success' : null,
            error: error,
            user: this.req.user,
            item: collection,
            request: this.request
        })
    }

    // [get] Render page
    var collection_id = this.params.collection || '';
    if (!utils.isUserID(collection_id)) return utils.e404(this, 'not found');

    var collection = yield model.Collection.findById(collection_id).exec();
    if (!collection) return utils.e404(this, 'not found');

    yield this.render('collection/updateURL', {
        user: this.req.user,
        item: collection
    })
}

exports.deleteURL = function*(next) {
    var remove = null;
    if (utils.isUserID('' + this.params.collection)) {
        remove = yield model.Collection.remove({
            _id: '' + this.params.collection
        }).exec();
    }

    var message = remove ? 'delete success' : 'delete fail';
    if (this.is('application/*')) return yield this.body = message;

    return yield this.render('utils/message', {
        message: message,
        header: '',
        hide_home_link: false
    });
}

exports.viewURL = function*(next) {
    var throw_notfound = function(ctx) { return utils.e404(ctx, 'not found') };
    if (! utils.isUserID('' + this.params.collection)) return yield throw_notfound(this);

    var collection = null; 
    collection = yield model.Collection.findById('' + this.params.collection).exec();
    if (!collection) return yield throw_notfound(this);

    collection.view_counter += 1;
    collection.save();

    return yield this.render('collection/viewURL', {
        user: this.req.user,
        collection: collection,
        title: collection.title || '',
        meta: collection.meta || {},
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@marked/marked.min',
            '@copy/dist/copy.min',
            'hbs',
            'viewurl'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput'
        ]
    });
}

exports.addURL = function * (next) {
    var action = this.request.query;
    if (action.auto && action.auto == '1') {

    }

    if (action.quick_result && action.quick_result == '1') {
        return yield this.body = { title: action.title, url: action.url };
    }

    return yield this.render('collection/addURLForm', {
        user: this.req.user,
        data: action,
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput.min',
            'hbs',
            'add'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min'
        ]
    });
}

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


