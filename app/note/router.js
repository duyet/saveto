var Router = require('koa-router');
var controller = require('./controller');

var note_router = new Router();

note_router
	.get('/', controller.home)
	.post('/add', controller.add)
	.all('/:note_id', controller.view)

module.exports = note_router;