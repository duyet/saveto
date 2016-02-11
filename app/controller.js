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
exports.github = function*(next) {
    yield passport.authenticate('github', {
        successRedirect: '/login?success=1&next=/',
        failureRedirect: '/login?e=1'
    })
};

exports.githubCallback = function*(next) {
    passport.authenticate('github', {
        failureRedirect: '/login'
    });
    // Successful authentication, redirect home.
    this.redirect('/');
};

exports.login = function*(next) {
    var success = (this.request.query.hasOwnProperty('success') && this.request.query.success == '1') ? true : false;
    if (success) {
        var next = this.session.returnTo || '/';
        if (this.request.query.hasOwnProperty('next')) {
            next = this.request.query.next;
        }

        yield this.render('page/redirect', {
            next: next
        });
        return;
    }

    var error = (this.request.query.hasOwnProperty('error') && this.request.query.error == '1') ? true : false;
    yield this.render('page/login', {
        error: error,
        error_message: this.flash.error 
    });
};

exports.loginAction = function*(next) {
    var returnTo = this.session.returnTo || '/';

    yield passport.authenticate('login', {
        successRedirect: '/login?success=1&next=' + returnTo,
        failureRedirect: '/login?error=1'
    })
};

exports.register = function*(next) {
    var success = (this.request.query.hasOwnProperty('success') && this.request.query.success == '1') ? true : false;
    if (success) {
        var next = this.session.returnTo || '/';
        if (this.request.query.hasOwnProperty('next')) {
            next = this.request.query.next;
        }

        yield this.render('page/redirect', {
            next: next
        });
        return;
    }

    var error = (this.request.query.hasOwnProperty('error') && this.request.query.error == '1') ? true : false;
    yield this.render('page/register', {
        error: error,
        error_message: this.flash.error
    });
};

exports.registerAction = function*(next) {
    var returnTo = this.session.returnTo || '/';

   	var err = false;
    if (!this.request.body['username']) err = true;
    if (!this.request.body['password'] || this.request.body['password'].length < 6) err = true;
    if (!this.request.body['repassword']) err = true;
    if (this.request.body['password'] != this.request.body['repassword']) err = true;

    if (err == true) return this.redirect('/register?error=1');

    yield passport.authenticate('register', {
        successRedirect: '/register?success=1&next=' + returnTo,
        failureRedirect: '/register?error=1'
    })
};

exports.forgot = function*(next) {

};

exports.logout = function*(next) {
    this.logout();
    this.redirect('/');
};


// Middleware: authed
exports.authed = function*(next) {
    if (this.req.isAuthenticated()) {
        yield next;
    } else {
        //Set redirect path in session
        this.session.returnTo = this.session.returnTo || this.req.url;
        this.redirect('/login');
    }
};

exports.me = function*(next) {
    yield this.render('page/me', {
        me: this.req.user
    });
};

// ================================
// Helper
exports.click = function*(next) {

};
