// Pmx for HTTP analysis. See: http://docs.keymetrics.io/docs/pages/http/
// require('pmx').init({
//   http          : true,  // HTTP analysis
//   network       : true,  // Network monitoring at the application level
//   ports         : true,  // Shows which ports your app is listening on (default: false)
// });

var http = require('http');
var path = require('path');
var koa = require('koa');
var middlewares = require('koa-middlewares');
var staticCache = require('koa-static-cache');
var serve = require('koa-static-folder');
var passport = require('koa-passport');
var hbs = require('koa-hbs');
var flash = require('koa-flash');
var helmet = require('koa-helmet');

var config = require('./app/config');
var router = require('./app/router');
var db = require('./app/db');

if (true === config.maintain) {
	var server = http.createServer(function (req, res) {
		var stream = require('fs').createReadStream('views/utils/maintain.html');
		stream.pipe(res);
	});
	server.listen(config.port);
	console.info("Listen on http://localhost:%s", config.port);
	return;
}

var app = koa(); // initial koa application

app.keys = [config.secret_key, 'i like a boss']; // Key server
app.proxy = true; // active proxy
app.context.db = db; // Database

// Middlewares
app.use(middlewares.compress());
app.use(middlewares.favicon());
app.use(middlewares.rt());
app.use(middlewares.logger());
app.use(middlewares.conditional());
app.use(middlewares.etag());
app.use(middlewares.bodyParser({
	limit: '5mb'
}));
app.use(middlewares.session({
	store: middlewares.RedisStore()
}));
middlewares.onerror(app);
app.use(flash({ key: config.secret_key }));
app.use(helmet());

app.context.viewpath = path.join(__dirname, 'views');
app.context.assetspath = path.join(__dirname, 'public');
app.use(serve('./public'));
app.use(staticCache(app.context.assetspath, {
	buffer: true,
	maxAge: 365 * 24 * 60 * 60,
	dir: '/public'
}));

// View
require('./app/hbs');
app.context.viewExtName = '.html';
app.use(hbs.middleware({
	viewPath: app.context.viewpath,
	partialsPath: ['partials', 'handlebars', 'note', 'til'].map(function(t) { return app.context.viewpath + '/' + t; }),
	extname: app.context.viewExtName,
	defaultLayout: 'index'
}));

// passport 
var passport = require('./app/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(function* (next) {
	this.state.config = config.view;
	this.state.request = this.request;

	this.state.is_production = false;
	if (this.request.hostname != '127.0.0.1' && this.request.hostname != 'localhost')
		this.state.is_production = true;

	var user = this.req.user || {};
	if (user.password) user.password = '';
	this.state.user = user;

	yield next;
});

// Router
app
	.use(router.routes())
	.use(router.allowedMethods());

// Start application
app = module.exports = http.createServer(app.callback());
if (!module.parent) {
	app.listen(config.port);
	console.info("Listen on http://localhost:%s", config.port);
}
