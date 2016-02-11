var fs = require('fs');
var path = require('path');
var passport = require('koa-passport');

var model = require('./model');
var utils = require('./utils');

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
    if (!this.request.body['username']) this.flash.error = 'username is required';
    else if (!this.request.body['email']) this.flash.error = 'email is required';
    else if (!this.request.body['password'] || this.request.body['password'].length < 6) this.flash.error = 'password is required (len > 5)';
    else if (!this.request.body['repassword']) this.flash.error = 're-password is required';
    else if (this.request.body['password'] != this.request.body['repassword']) this.flash.error = 're-password not match password';

    if (this.flash.error) err = true;
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

exports.mePassword = function*(next) {
    yield this.render('page/mePassword', {
        error_message: this.flash.error_message,
        success_message: this.flash.success_message
    });
};

exports.mePasswordAction = function*(next) {
    var error_message = null;
    var success_message = null;

    var req = this.request.body || {};
    var auth_user = this.req.user;

    if (!req || !auth_user) error_message = 'error, try again';
    else if (!req.current_password) error_message = 'require current password';
    else if (!req.new_password) error_message = 'require new password';
    else if (!req.re_password || req.re_password != req.new_password) 
        error_message = 're-password not match new password';
    else if (!utils.isValidPassword(auth_user, req.current_password))
        error_message = 'current password was wrong';
    
    if (!error_message) {
        var newPassword = utils.createHash(req.new_password);
        model.User.update({'username': auth_user.username}, {password: newPassword}, function (err, doc) {
            console.log('Update password', err, doc);
        });
        success_message = 'success';
    }
    
    yield this.render('page/mePassword', {
        error_message: error_message,
        success_message: success_message
    });
};


// ================================
// Helper
exports.click = function*(next) {

};
