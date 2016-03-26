var Router = require('koa-router');
var controller = require('./controller');

var user_router = new Router();

user_router
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

	.get('/app', controller.authed, controller.application)
	.all('/app/new', controller.authed, controller.newApp)
	.all('/app/:app_id', controller.authed, controller.newApp)
	.all('/app/delete/:app_id', controller.authed, controller.deleteApp)
	.all('/app/active/:app_id', controller.authed, controller.activeApp)

module.exports = user_router;