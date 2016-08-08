var Router = require('koa-router');
var controller = require('./controller');

var api_router = new Router();

api_router
	.get('/', function *(next) { this.body = { message: '/' }; })
	.get('/ping', controller.ping)
	.get('/url/parser', controller.urlParser)
	.post('/url', controller.newURL) 
	.post('/note', controller.newNote) 
	.all('/url', controller.URL)
	.all('/url/:id', controller.URLItem)
	.all('/report/:id', controller.reportItem)
	.all('/:path', function *(next) { this.body = { message: 'Nothing at /' + this.params.path }; })

module.exports = api_router;