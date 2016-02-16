var Router = require('koa-router');

var root_router = new Router();
var api_router = new Router();
var helper_router = new Router();

var controller = require('./controller');
var api = require('./api');
var helper = require('./helper');

// Api endpoint
// ==> <host>/api/v1
api_router
	.get('/', function *(next) { this.body = { message: '/' }; })
	.get('/ping', api.ping)
	.post('/collection', api.newURL) // TODO: Check auth 
	.all('/collection', api.collection)
	.all('/collection/:id', api.collectionItem)
	.all('/:path', function *(next) { this.body = { message: 'Nothing at /' + this.params.path }; })

// ==> <host>/helper/v1
helper_router
	.get('/parser', helper.parser)

root_router
	.use('/api/v1', api_router.routes(), api_router.allowedMethods())
	.use('/helper/v1', helper_router.routes(), helper_router.allowedMethods())
	
	.get('/', controller.home)
	.get('/about', controller.about)
	.get('/explore', controller.explore)
	.get('/faq', controller.faq)
	.get('/help', controller.help)
	.get('/help/:topic', controller.help)
	.get('/contact', controller.contact)
	.get('/changelog', controller.changelog)
	.get('/api', controller.apiDeveloper)
	.get('/more', controller.more)

	// Collection
	.all('/add', controller.addURL)
	.get('/:collection/view', controller.viewURL)
	.all('/:collection/edit', controller.authed, controller.updateURL)
	.all('/:collection/delete', controller.authed, controller.deleteURL)
	
	// Rss feed
	.get('/rss', controller.RSS)

	// Auth
	.get('/auth/github', controller.github)
	.get('/auth/github/callback', controller.githubCallback)

	.get('/login', controller.login)
	.post('/login', controller.loginAction)
	
	.get('/register', controller.register)
	.post('/register', controller.registerAction)
	
	.get('/logout', controller.logout)
	.get('/forgot', controller.forgot)
	.get('/forgot', controller.forgot)

	.get('/u', function*() { this.redirect('/') })
	.get('/u/:username', controller.authed, controller.userPage)

	.get('/me', controller.authed, controller.me)
	.get('/me/reset_access_token', controller.authed, controller.accessTokenReset)
	.get('/me/password', controller.authed, controller.mePassword)
	.post('/me/password', controller.authed, controller.mePasswordAction)
	.get('/me/info', controller.authed, controller.meInfo)
	.get('/me/log', controller.authed, controller.meLog)
	.get('/setting', controller.authed, controller.setting)


	// Helper 
	.get('/click', controller.click)
	.get('/:alias', controller.shortenUrl)

module.exports = root_router;