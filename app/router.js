var Router = require('koa-router');

var root_router = new Router();
var api_router = new Router();

var controller = require('./controller');

// Api endpoint
api_router
	.get('/', function *(next) { this.body = { message: '/' }; })
	.get('/ping', function *(next) { this.body = { message: 'pong' }; })
	.all('/:path', function *(next) { this.body = { message: 'Nothing at /' + this.params.path }; })

root_router
	.use('/api/v1', api_router.routes(), api_router.allowedMethods())
	
	.get('/', controller.home)
	.get('/about', controller.about)
	.get('/faq', controller.faq)

	// Auth
	.get('/login', controller.login)
	.post('/login', controller.loginAction)
	
	.get('/register', controller.register)
	.get('/logout', controller.logout)
	.get('/forgot', controller.forgot)
	.get('/me', controller.me)

	// Helper 
	.get('/click', controller.click)

module.exports = root_router;