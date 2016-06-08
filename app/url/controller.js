var utils = require('../utils');
var model = require('../model');

exports.tag = function*(next) {
	var tag = '' + this.params.tag;
	var urls = yield model.Collection.find({ tags: { $in : [ tag ] } }).sort('-created').exec();

    yield this.render('url/tag', {
    	tag: tag,
    	urls: urls,
    	title: tag,
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput.min',
            '@copy/dist/copy.min',
            '@gifffer/build/gifffer.min',
            'hbs',
            'tag'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput'
        ]
    });
};

exports.viewAddURL = function * (next) {
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


exports.viewURL = function*(next) {
    var throw_notfound = function(ctx) { return utils.e404(ctx, 'not found') };
    if (! utils.isUserID('' + this.params.id)) return yield throw_notfound(this);

    var url = null; 
    url = yield model.Collection.findById('' + this.params.id).exec();
    if (!url) return yield throw_notfound(this);

    url.view_counter += 1;
    url.save();

    return yield this.render('url/viewURL', {
        user: this.req.user,
        collection: url,
        title: url.title || '',
        meta: url.meta || {},
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
    var collection_id = this.params.id || '';
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
    if (utils.isUserID('' + this.params.id)) {
        remove = yield model.Collection.remove({
            _id: '' + this.params.id
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
