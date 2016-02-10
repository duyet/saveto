var Router = require('koa-router');

var router = new Router();
var api = new Router();

// Api endpoint
api
	.get('/', function *(next) { this.body = { message: '/' }; })
	.get('/ping', function *(next) { this.body = { message: 'pong' }; })
	.all('*', function *(next) { this.body = { message: 'Hi, bye!' }; })

router
	.use('/api/v1', api.routes(), api.allowedMethods())
	.get('/', function *(next) {
		this.body = "Hihi";
	})
	
module.exports = router;