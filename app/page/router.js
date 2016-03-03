var Router = require('koa-router');
var controller = require('./controller');

var note_router = new Router();

note_router
	.get('/about', controller.about)
	.get('/faq', controller.faq)
	.get('/help', controller.help)
	.get('/help/:topic', controller.help)
	.get('/contact', controller.contact)
	.get('/changelog', controller.changelog)
	.get('/todo', controller.todo)
	.get('/terms', controller.terms)
	.get('/api', controller.apiDeveloper)
	.get('/more', controller.more)

module.exports = note_router;