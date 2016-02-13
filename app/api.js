var utils = require('./utils');
var model = require('./model');

function check_access(user_id, access_token) {
	// TODO: poor security, JWT instead of
	var user_id = user_id || '';
	var access_token = access_token || '';
	if (!user_id || !utils.isUserID(user_id) || !access_token) return api_error(this, 'access deny');

	var user = model.User.find({
	    _id: user_id,
	    access_token: access_token
	}).exec();

	if (!user) return false;
	return true;
}

exports.collection = function*(next) {
    var user = this.req.user || {};

    switch (this.method) {
        case 'GET':
            var max_result = 30;

            var conditions = {};
            var query = this.request.query;
            if (query.conditions) {
                conditions = JSON.parse(query.conditions);
            }
            var builder = model.Collection.find(conditions);

            ['limit', 'skip', 'sort'].forEach(function(key) {
                // hack for limit 
                query['limit'] = query['limit'] || max_result;

                if (query[key]) {
                    if ('limit' === key) query[key] = Math.min((parseInt(query[key]) || 10), max_result);

                    builder[key](query[key]);
                }
            });

            this.body = yield builder.exec();
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
	if (!check_access(user_id, access_token)) 
        return api_error(this, 'access deny');

    var url = this.request.body.url || '';
    if (!utils.isURL(url)) return api_error(this, 'URL is invalid.');

    var parser = utils.parseURL(url);

    var collection = new model.Collection();
    collection.url = url;
    collection.title = (parser && parser.host) ? parser.host : url;
    collection.alias = utils.aliasGenerator();
    collection.user_id = user_id || '';
    collection.click = 0;
    collection.vote = 0;
    collection.tags = [];
    collection.created = new Date();

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
			if (!check_access(user_id, access_token)) 
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
			if (!check_access(this.request.body.user_id, this.request.body.access_token)) 
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
