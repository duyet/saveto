var event = require('co-event');
var MetaInspector = require('node-metainspector');

var utils = require('../utils');
var model = require('../model');

exports.urlParser = function*(next) {
    var url = this.request.query.url || '';
    if (!url) return this.body = {};

    var client = new MetaInspector(url, {
        timeout: 5000
    });

    client.fetch();

    var e;
    while (e = yield event(client)) {
        switch (e.type) {
            case 'fetch':
                if (!e.args[0]) return this.body = {};

                return this.body = {
                    title: e.args[0].title || '',
                    url: e.args[0].url || '',
                    host: e.args[0].host || '',
                    meta: {
                        parsedUrl: e.args[0].parsedUrl || {},
                        author: e.args[0].author || '',
                        keywords: e.args[0].keywords || [],
                        description: e.args[0].description || '',
                        image: e.args[0].image || '',
                        ogTitle: e.args[0].ogTitle || '',
                        ogDescription: e.args[0].ogDescription || '',
                    }
                };
                break;

            case 'error':
            default:
                return this.body = {};
                break;
        }
    }
}

exports.collection = function*(next) {
    var user = this.req.user || {};

    switch (this.method) {
        case 'GET':
            var max_result = 30;

            var conditions = {};
            conditions.is_public = true;

            var query = this.request.query;
            if (query.conditions) {
                conditions = JSON.parse(query.conditions);
            }
            var uid = query.uid || '';
            if (!uid.length && user && user._id) uid = user._id; 

            var builder = model.Collection.find(conditions);

            ['limit', 'skip', 'sort'].forEach(function(key) {
                // hack for limit 
                query['limit'] = query['limit'] || max_result;

                if (query[key]) {
                    if ('limit' === key) query[key] = Math.min((parseInt(query[key]) || 10), max_result);

                    builder[key](query[key]);
                }
            });

            var result = yield builder.exec();

            // Remove another userid, or remove all
            for (var i in result) {
                if (!uid.length || uid != result[i].user_id) {
                    result[i].user_id = ''; // remove
                }
            }
            this.body = result;

            break;

        case 'POST':

        case 'PUT':

        case 'DELETE':
        default:
            this.body = 'Not found';
    }
}

exports.newURL = function*(next) {
	var user_id = this.request.body.user_id || '';
	var access_token = this.request.body.access_token || '';

    // TODO: poor security, JWT instead of
	if (!utils.checkAccessTokenUID(user_id, access_token)) 
        return api_error(this, 'access deny');

    var url = this.request.body.url || '';
    if (!utils.isURL(url)) return api_error(this, 'URL is invalid.');

    var parser = utils.parseURL(url);

    var title = this.request.body.title || (parser && parser.host) ? parser.host : utils.getTilteFromUrl(url);

    var collection = new model.Collection();
    collection.url = url;
    collection.title = title;
    collection.host = (parser && parser.host) ? parser.host : '';
    collection.alias = utils.aliasGenerator();
    collection.user_id = user_id || '';
    collection.is_guest = utils.is_guest(user_id, access_token);
    collection.delete_token = utils.getDeleteToken();
    collection.tags = [];
    collection.created = new Date();
    collection.review_type = utils.reviewType(url);
    collection.review_raw_url = utils.getReviewRawUrl(url);

    // collection.is_github_markdown_raw = utils.isGithubMarkdownRaw(url);

    collection.save();
    this.body = collection;
}

exports.collectionItem = function*(next) {
    var id = this.params.id || '';
    if (!id.length || !utils.isUserID(id)) {
        return api_error(this, 'not found', 404);
    }

    switch (this.method) {
        case 'POST':
        case 'PUT':
			var user_id = this.request.body.user_id || '';
			var access_token = this.request.body.access_token || '';

		    // TODO: poor security, JWT instead of
			if (!utils.checkAccessTokenUID(user_id, access_token)) 
		        return api_error(this, 'access deny');

            var data_update = {};
            var body = this.request.body;
            ['url', 'alias', 'title', 'host', 'meta'].forEach(function(key) {
                if (body.hasOwnProperty(key)) {
                    data_update[key] = body[key];
                }
            });
            // Last update
            data_update.last_update = new Date();

            var result = yield model.Collection.update({
                    _id: id,
                    user_id: user_id
                }, {
                    $set: data_update
                })
                .exec();

            if (!result) return api_error(this, 'error, try again');

            this.body = result;
            break;

        case 'DELETE':
			if (!utils.checkAccessTokenUID(this.request.body.user_id, this.request.body.access_token)) 
                return api_error(this, 'access deny');

        	var remove = yield model.Collection.remove({
	            _id: '' + id
	        }).exec();

	        if (!remove) {
	        	this.status = 400;
	        	this.body = { message: 'delete failt' };
	        } else {
	        	this.body = { message: 'success' };
	        }
	        break;


        case 'GET':
        default:
            var collection = yield model.Collection.find({
                _id: id
            })
            if (collection.length === 0) {
                return api_error(this, 'not found', 404);
            }

            this.body = yield collection;
            break;
    }
}

exports.ping = function*() {
    this.body = 'pong';
}

function api_error(ctx, message, code) {
    ctx.status = code || 400;
    ctx.body = {
        message: message,
        code: code || 400
    };
}
