var Router = require('koa-router');
var controller = require('./controller');
var user_controller = require('../user/controller');

var url_router = new Router();

url_router
	.all('/add', controller.viewAddURL)
	.all('/trend', controller.trend)

	// View URL and alias
	.get('/:id/view', controller.viewURL)
	.get('/quick/:id', controller.viewURL)
	.get('/view/:id', controller.viewURL)
	.get('/q/:id', controller.viewURL)

	.get('/t/:tag', controller.tag)

	// Update URL
	.all('/:id/edit', user_controller.authed, controller.updateURL)
	.all('/:id/delete', user_controller.authed, controller.deleteURL)

module.exports = url_router;