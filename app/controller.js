var fs = require('fs');
var path = require('path');
var passport = require('koa-passport');

var model = require('./model');
var utils = require('./utils');

// ================================
// Page
exports.home = function*(next) {
    yield this.render('page/home', {
        custom_script: [
            '@tether/dist/js/tether.min', 
            '@bootstrap/dist/js/bootstrap', 
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            'home'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/bootstrap.min'
        ]
    });
};

exports.about = function*(next) {
    yield this.render('page/about');
};

exports.faq = function*(next) {
    yield this.render('page/faq');
};

exports.help = function*(next) {
    yield this.render('page/help');
};

exports.contact = function*(next) {
    yield this.render('page/contact');
};

exports.changelog = function*(next) {
    yield this.render('page/changelog');
};

exports.apiDeveloper = function*(next) {
    yield this.render('page/apiDeveloper');
};

exports.more = function*(next) {
    var lists = [
        { url: '/about', title: 'about quick project' },
        { url: '/faq', title: 'faq' },
        { url: '/api', title: 'api access' },
        { url: '/help', title: 'help' },
        { url: '/contact', title: 'contact us' },
        { url: '/changelog', title: 'changelog' },
    ];
    yield this.render('page/more', {lists: lists});
};

exports.explore = function*(next) {
    var q = (this.request.query.hasOwnProperty('q')) ? this.request.query.q : '';
    var collections = yield model.Collection.find({}).exec();

    yield this.render('page/explore', {
        collections: collections
    });
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
    utils.userLog(this.req.user, this.request, 'user_logout');
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
    var me = this.req.user || {};
    if (me.email) me.md5_mail = utils.md5(me.mail);

    yield this.render('page/me', {
        me: me,
        custom_script: ['me']
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

    var request = this.request;
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
            utils.userLog(auth_user, request, 'change_password');
        });
        success_message = 'success';
    }
    
    yield this.render('page/mePassword', {
        error_message: error_message,
        success_message: success_message
    });
};

exports.accessTokenReset = function * (next) {
    var accessToken = utils.accessTokenGenerator();
    var that = this;
    model.User.update(
        {'username': this.req.user.username}, 
        {access_token: accessToken}, function (err, doc) {
            console.log('Update access_token', err, doc);
            utils.userLog(that.req.user, that.request, 'reset_access_token');
    });

    this.req.user.access_token = accessToken;
    this.body = { access_token: accessToken };
}

exports.meInfo = function * (next) {
    yield this.render('page/meInfo', {
        me: this.req.user
    });
}

exports.meLog = function * (next) {
    var perPage = 50
    , page = Math.max(0, parseInt(this.request.query.page) || 0)

    var skip = this.request.query.skip || '';

    var builder = model.UserLog.find({user_id: this.req.user._id})
        .sort({created: -1})
        .limit(perPage)
        .skip(perPage * page)

    var logs = yield builder.exec();

    yield this.render('page/meLog', {
        me: this.req.user,
        page: page,
        prePageNumber: (page - 1 >= 0 ? page - 1 : 0),
        nextPageNumber: page + 1,
        logs: logs
    });
}

exports.setting = function * (next) {
    yield this.render('page/setting', {
        me: this.req.user
    });
}


// ================================
// Helper
exports.click = function*(next) {
    var url = this.request.query.u || '';
    var url_id = this.request.query.url_id || '';

    if (!url || !url_id) return this.body = 'ops!';
    var collection = yield model.Collection.findOne({_id: url_id}).exec();
    if (!collection) return this.body = 'Not found.';

    // Update click couter 
    collection.click += 1;
    collection.save();

    this.redirect(url);
};

exports.shortenUrl = function*(next) {
    alias = this.params.alias || '';

    console.log('alas: ', alias)

    var collection = yield model.Collection.findOne({alias: alias}).exec();
    if (!collection) return this.body = 'Not found.';

    console.log(collection)

    // Update click couter 
    collection.click += 1;
    collection.save();

    this.redirect(collection.url);
};