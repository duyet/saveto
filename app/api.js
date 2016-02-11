var utils = require('./utils');
var model = require('./model');

exports.collection = function *(next) {
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
			
			['limit', 'skip', 'sort'].forEach(function(key){
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

exports.newURL = function * (next) {
	// TODO: poor security, JWT instead of
	var user_id = this.request.body.user_id || '';
	var access_token = this.request.body.access_token || '';
	if (!user_id || !utils.isUserID(user_id) || !access_token) return api_error(this, 'access deny');
	
	var user = yield model.User.find({_id: user_id, access_token: access_token}).exec();
	if (!user) return api_error(this, 'access deny');

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

exports.collectionItem = function *(id, next) {
	if(id === "" + parseInt(id, 10)){
		var collection = yield model.Collection.find({}, {
			'skip': id - 1,
			'limit': 1
		});

		if (collection.length === 0) {
			this.throw(404, 'book with id = ' + id + ' was not found');
		}

		this.body = yield collection;
	}
}

exports.ping = function *() {
	this.body = 'pong';
}

function api_error (ctx, message) {
	ctx.status = 400;
	ctx.body = { message: message };
}