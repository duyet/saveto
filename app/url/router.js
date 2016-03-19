var Router = require('koa-router');
var controller = require('./controller');

var url_router = new Router();

url_router
	.get('/t/:tag', controller.tag)

module.exports = url_router;