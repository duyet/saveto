var passport = require('koa-passport');

var model = require('../model');
var utils = require('../utils');
var config = require('../config');

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
    var that = this;
    var success = (this.request.query && this.request.query.success && this.request.query.success == '1') ? true : false;
    if (success) {
        var nextTo = this.session.nextTo || '/';
        if (this.request.query.next && this.request.query.next.length > 0) {
            nextTo = this.request.query.next;
        }

        var setLocalToken = (this.request.query && this.request.query.setLocalToken && this.request.query.setLocalToken == '1') ? true : false;
        if (setLocalToken) {
            model.Token.findOne({ user: this.req.user._id }).exec(function(err, token) {
                if (!err && token) {
                    // Set local token 
                    that.cookies.set('remember_me', token.token, 
                        { signed: true, path: '/', httpOnly: true, maxAge: config.cookieMaxAge }); // 7 days
                }
            })
        }

        yield this.render('utils/redirect', {
            next: nextTo
        });
        return;
    } else {
        if (this.req.isAuthenticated()) {
            // Authenticated, why still here?
            return this.redirect('/');
        }
    }

    var nextTo = (this.request.query && typeof this.request.query.next != undefined) ? this.request.query.next : this.req.headers['referer'] || '/';
    this.session.nextTo = nextTo;

    var error = (typeof this.request.query.error != undefined && this.request.query.error == '1') ? true : false;
    yield this.render('user/login', {
        error: error,
        error_message: this.flash.error
    });
};

exports.loginAction = function*(next) {
    var returnTo = this.session.returnTo || '/';

    yield passport.authenticate('login', {
        successRedirect: '/login?success=1&setLocalToken=1&next=' + returnTo,
        failureRedirect: '/login?error=1'
    })
};

exports.register = function*(next) {
    if (this.req.isAuthenticated()) {
        // Authenticated, why still here?
        return this.redirect('/');
    }

    var success = (typeof this.request.query.success != undefined && this.request.query.success == '1') ? true : false;
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

    var error = (typeof this.request.query.error != undefined && this.request.query.error == '1') ? true : false;
    yield this.render('user/register', {
        error: error,
        error_message: this.flash.error
    });
};

exports.registerAction = function*(next) {
    var returnTo = this.session.returnTo || '/';

    this.flash.error = '';
    if (!this.request.body['username']) this.flash.error = 'username is required';
    else if (!this.request.body['email']) this.flash.error = 'email is required';
    else if (!this.request.body['password'] || this.request.body['password'].length < 6) this.flash.error = 'password is required (len > 5)';
    else if (!this.request.body['repassword']) this.flash.error = 're-password is required';
    else if (this.request.body['password'] != this.request.body['repassword']) this.flash.error = 're-password not match password';

    if (this.flash.error) return this.redirect('/register?error=1');

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

// ==================

exports.me = function*(next) {
    var me = this.req.user || {};
    var error = '';
    if (me.email) me.md5_mail = utils.md5(me.mail);
    var app = yield model.Application.find({ user_id: me._id, is_remove: false }).exec();

    if (true) {
        var token = yield model.Token.findOne({ user: me._id, type: 'api_token' }).exec();
        console.log('token', token)
        if (!token) {
            
            // Update API Token 
            tokenGen = utils.apiAccessTokenGenerator();
            var tokenModel = new model.Token({
                user: me._id, type: 'api_token', token: tokenGen, active: true });
            if (tokenModel.save()) {
                token = tokenModel;
            } else {
                error = 'Can not update API Token.';
            }
        }
    }

    yield this.render('user/me', {
        me: me,
        app: app,
        ApiToken: token,
        api_status: config.api_status,
        error: error,
        custom_script: ['@copy/dist/copy.min', 'me']
    });
};
exports.mePassword = function*(next) {
    yield this.render('user/mePassword', {
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
        model.User.update({
            'username': auth_user.username
        }, {
            password: newPassword
        }, function(err, doc) {
            console.log('Update password', err, doc);
            utils.userLog(auth_user, request, 'change_password');
        });
        success_message = 'success';
    }

    yield this.render('user/mePassword', {
        error_message: error_message,
        success_message: success_message
    });
};

exports.accessTokenReset = function*(next) {
    var accessToken = utils.accessTokenGenerator();
    var that = this;
    model.User.update({
        'username': this.req.user.username
    }, {
        access_token: accessToken
    }, function(err, doc) {
        console.log('Update access_token', err, doc);
        utils.userLog(that.req.user, that.request, 'reset_access_token');
    });

    this.req.user.access_token = accessToken;
    this.body = {
        access_token: accessToken
    };
}

exports.meInfo = function*(next) {
    yield this.render('user/meInfo', {
        me: this.req.user
    });
}

exports.meLog = function*(next) {
    var perPage = 50,
        page = Math.max(0, parseInt(this.request.query.page) || 0)

    var skip = this.request.query.skip || '';

    var builder = model.UserLog.find({
            user_id: this.req.user._id
        })
        .sort({
            created: -1
        })
        .limit(perPage)
        .skip(perPage * page)

    var logs = yield builder.exec();

    yield this.render('user/meLog', {
        me: this.req.user,
        page: page,
        prePageNumber: (page - 1 >= 0 ? page - 1 : 0),
        nextPageNumber: page + 1,
        logs: logs,

        custom_script: [
            '@moment/min/moment.min',
            'melog'
        ]
    });
}

exports.settings = function*(next) {
    yield this.render('user/setting', {
        me: this.req.user
    });
}

exports.userPage = function*(next) {
    var username = this.params.username || '';
    var user_data = yield model.User.findOne({
        username: username
    }).exec();

    if (!user_data) return yield utils.e404(this, 'user not found');

    yield this.render('user/user', {
        user_data: user_data,
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            'hbs',
            'home'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min'
        ]
    });
}

exports.application = function * (next) {
    yield this.render('user/application', {
        me: this.req.user
    });
}

exports.newApp = function * (next) {
    if (this.method === 'POST') {
        var app_id = this.request.body.app_id || '';
        var app_name = this.request.body.appname || '';
        var user_id = this.request.body.user_id || '';

        if (user_id != this.req.user._id) {
            return yield utils.e404(this, 'error. please try again');
        }

        var appApi = null;
        if (app_id) {
            appApi = yield model.Application.findByPk(app_id).exec();
            if (appApi && appApi.user_id != user_id) {
                return yield utils.e404(this, 'access deny');
            }
        } else appApi = new model.Application();
        
        if (appApi) {
            appApi.user_id = user_id;
            appApi.app_name = app_name;
            if (!app_id) appApi.app_id = utils.appIdGenerator(15);
            appApi.secret_key = utils.appSecretKeyGenerator();
            appApi.access_token = utils.appAccessTokenGenerator();
            if (!appApi.save()) {
                return this.body = 'error';
            }

            this.redirect('/me');
            return;       
        }
    }

    var app_id = this.params.app_id || '';

    if (app_id && utils.isID(app_id)) 
        var app = yield model.Application.find({ _id: app_id }).limit(1).exec();

    yield this.render('user/applicationNew', {
        me: this.req.user,
        app: app || ''
    });
}

exports.deleteApp = function * (next) {
    var app_id = this.params.app_id || '';
    if (!utils.isID(app_id)) return yield utils.e404(this, 'something went wrong');
    var app = yield model.Application.find({user_id: this.req.user._id, _id: app_id, is_remove: false}).limit(1).exec();
    if (!app) return this.body = 'App not found!';

    console.info({user_id: this.req.user._id, _id: app_id, is_remove: false}, app);
    app.is_remove = true;
    app.save();
    this.redirect('/me');
    return;       
}

exports.activeApp = function * (next) {
    var app_id = this.params.app_id || '';
    if (!utils.isID(app_id)) return yield utils.e404(this, 'something went wrong');
    var app = yield model.Application.find({user_id: this.req.user._id, _id: app_id, is_remove: false}).exec();
    if (!app) return yield utils.e404(this, 'app not found');

    app.is_active = !app.is_active;
    app.save();
    this.redirect('/me');
    return;       
}