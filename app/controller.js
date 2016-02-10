var fs = require('fs');
var path = require('path');
var passport = require('koa-passport');

// ================================
// Page
exports.home = function*(next) {
    yield this.render('page/home');
};

exports.about = function*(next) {
    yield this.render('page/about');
};

exports.faq = function*(next) {
    yield this.render('page/faq');
};

// ================================
// Auth
exports.github = function * (next) {
	yield passport.authenticate('github', {
        successRedirect: '/login?success=1&next=/',
        failureRedirect: '/login?e=1'
    })
};

exports.githubCallback = function * (next) {
	passport.authenticate('github', { failureRedirect: '/login' });
	// Successful authentication, redirect home.
    this.redirect('/');
};

exports.login = function*(next) {
    var success = (this.request.query.hasOwnProperty('success') && this.request.query.success == '1') ? true : false;
    if (success) {
        var next = '/'
        if (this.request.query.hasOwnProperty('next')) {
            next = this.request.query.next;
        }

        yield this.render('page/redirect', {
            next: next
        });
        return;
    }

    var error = (this.request.query.hasOwnProperty('e') && this.request.query.e == '1') ? true : false;
    yield this.render('page/login', {
        error: error,
        success: success
    });
};

exports.loginAction = function*(next) {
	var returnTo = this.session.returnTo || '/';

    yield passport.authenticate('local', {
        successRedirect: '/login?success=1&next=' + returnTo,
        failureRedirect: '/login?e=1'
    })
};

//Middleware: authed
exports.authed = function * (next){
  if (this.req.isAuthenticated()){
    yield next;
  } else {
  	//Set redirect path in session
    this.session.returnTo = this.session.returnTo || this.req.url;
    this.redirect('/login');
  }
};

exports.register = function*(next) {
	yield this.render('page/register');
};

exports.forgot = function*(next) {

};

exports.logout = function*(next) {
	this.logout();
	this.redirect('/');
};

exports.me = function*(next) {
    yield this.render('page/me', {user: this.req.user});
};

// ================================
// Helper
exports.click = function*(next) {

};
