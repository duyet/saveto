var Router = require('koa-router');

var root_router = new Router();
var helper_router = new Router();
var page_router = require('./page/router');
var note_router = require('./note/router');
var api_router = require('./api/router');

var controller = require('./controller');

root_router
	// Static page
	.use('', page_router.routes(), page_router.allowedMethods())
	
	// Api
	.use('/api/v1', api_router.routes(), api_router.allowedMethods())
	.use('/helper/v1', helper_router.routes(), helper_router.allowedMethods())
	
	// Note
	.use('/note', note_router.routes(), note_router.allowedMethods())
	
	.get('/', controller.home)
	.get('/explore', controller.explore)

	// Collection
	.all('/add', controller.addURL)
	.get('/:collection/view', controller.viewURL)
	.get('/quick/:collection', controller.viewURL)
	.get('/view/:collection', controller.viewURL)
	.get('/q/:collection', controller.viewURL)
	
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
	.get('/settings', controller.authed, controller.settings)

	// Helper 
	.get('/click', controller.click)
	.get('/go/:alias', controller.shortenUrl)
	.get('/:alias', controller.shortenUrl)

module.exports = root_router;
