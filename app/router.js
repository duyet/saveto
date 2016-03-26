var Router = require('koa-router');

var root_router = new Router();
var helper_router = new Router();

var page_router = require('./page/router');
var url_router = require('./url/router');
var note_router = require('./note/router');
var user_router = require('./user/router');
var api_router = require('./api/router');

var controller = require('./controller');
var user_controller = require('./user/controller');

root_router
	// Static page
	.use('', page_router.routes(), page_router.allowedMethods())
	.use('', url_router.routes(), url_router.allowedMethods())
	.use('', user_router.routes(), user_router.allowedMethods())
	
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
	
	.all('/:collection/edit', user_controller.authed, controller.updateURL)
	.all('/:collection/delete', user_controller.authed, controller.deleteURL)
	
	// Rss feed
	.get('/rss', controller.RSS)

	// Helper 
	.get('/click', controller.click)
	.get('/go/:alias', controller.shortenUrl)
	.get('/:alias', controller.shortenUrl)

module.exports = root_router;
