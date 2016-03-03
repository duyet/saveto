var Router = require('koa-router');
var controller = require('./controller');

var api_router = new Router();

api_router
	.get('/', function *(next) { this.body = { message: '/' }; })
	.get('/ping', controller.ping)
	.post('/collection', controller.newURL) // TODO: Check auth 
	.all('/collection', controller.collection)
	.all('/collection/:id', controller.collectionItem)
	.all('/:path', function *(next) { this.body = { message: 'Nothing at /' + this.params.path }; })

module.exports = api_router;