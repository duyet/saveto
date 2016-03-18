var Router = require('koa-router');
var controller = require('./controller');

var note_router = new Router();

note_router
	.get('/', controller.home)
	.get('/all', controller.all)
	.post('/add', controller.add)
	.all('/edit/:note_id', controller.edit)
	.all('/delete/:delete_token', controller.delete_via_token)
	.all('/raw/:note_id', controller.raw)
	.get('/:note_id', controller.view)
	.post('/:note_id', controller.update)

module.exports = note_router;