var Router = require('koa-router');
var controller = require('./controller');

var note_router = new Router();

note_router
	.get('/', controller.home)
	.get('/all', controller.all)
	.post('/add', controller.add)
	.all('/delete/:delete_token', controller.delete_via_token)
	.all('/:note_id', controller.view)

module.exports = note_router;