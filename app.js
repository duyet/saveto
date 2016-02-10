var http = require('http');
var path = require('path');
var koa = require('koa');
var middlewares = require('koa-middlewares');
var staticCache = require('koa-static-cache');
var serve = require('koa-static-folder');
var passport = require('koa-passport');
var hbs = require('koa-hbs');

var config = require('./app/config');
var router = require('./app/router');
var db = require('./app/db');

var app = koa(); // initial koa application

app.keys = ['duyetdev-quick', 'i like a boss']; // Key server
app.context.db = db; // Database

// Middlewares
app.use(middlewares.compress());
app.use(middlewares.favicon());
app.use(middlewares.rt());
app.use(middlewares.logger());
app.use(middlewares.bodyParser());
app.use(middlewares.session({
	store: middlewares.RedisStore()
}));
middlewares.onerror(app);

app.context.viewpath = path.join(__dirname, 'views');
app.context.assetspath = path.join(__dirname, 'public');
app.use(serve('./public'));
app.use(staticCache(app.context.assetspath, {
	maxAge: 365 * 24 * 60 * 60
}));

// View
require('./app/hbs');
app.use(hbs.middleware({
  viewPath: app.context.viewpath,
  partialsPath: app.context.viewpath + '/partials',
  extname: '.html',
  defaultLayout: 'index'
}));

// passport 
var passport = require('./app/passport');
app.use(passport.initialize());
app.use(passport.session());

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
