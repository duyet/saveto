var Router = require('koa-router');
var controller = require('./controller');

var note_router = new Router();

note_router
	.get('/', controller.home)

module.exports = note_router;