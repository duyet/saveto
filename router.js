var router = require('koa-router')();

router
	.get('/', function *(next) {
		this.body = "Hihi";
	})
	.get('/api/*', function *(next) {
		this.body = { message: 'Hi, bye!' };
	})


module.exports = router;