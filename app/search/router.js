var Router = require('koa-router');
var controller = require('./controller');

var search_router = new Router();

search_router
	.get('/', function *(next) { this.body = { message: '/' }; })
	.all('/search', controller.doSearch)

module.exports = search_router;