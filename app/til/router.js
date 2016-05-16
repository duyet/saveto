var Router = require('koa-router');
var controller = require('./controller');

var til_router = new Router();

til_router
	.get('/', controller.all)
	.get('/all', controller.all)
	.all('/add', controller.add)
	.all('/new', controller.add)
	.all('/edit/:note_id', controller.edit)
	.all('/delete/:delete_token', controller.delete_via_token)
	.all('/raw/:note_id', controller.raw)
	.get('/:til_id', controller.view)
	.post('/:til_id', controller.update)

module.exports = til_router;