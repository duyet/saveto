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
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@copy/dist/copy.min',
            'hbs',
            'home'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min'
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
    if (this.params.topic) {
        var topic = this.params.topic;
        var rules = /^[a-z0-9-_]+$/i

        if (!rules.test(topic)
            || !utils.isFileExists(
                path.join(this.viewpath,
                    'page/help/' + topic + this.viewExtName)))
                        return yield this.render('page/help/404');
        return yield this.render('page/help/' + this.params.topic, {
            custom_script: ['help']
        });
    }

    yield this.render('page/help/index');
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

exports.todo = function*(next) {
    yield this.render('page/todo');
};

exports.more = function*(next) {
    var lists = [{
        url: '/about',
        title: 'about quick project'
    }, {
        url: '/faq',
        title: 'faq'
    }, {
        url: '/api',
        title: 'api access'
    }, {
        url: '/help',
        title: 'help'
    }, {
        url: '/contact',
        title: 'contact us'
    }, {
        url: '/todo',
        title: 'todo list'
    }, {
        url: '/changelog',
        title: 'changelog'
    }, ];
    yield this.render('page/more', {
        lists: lists
    });
};

exports.explore = function*(next) {
    var q = (this.request.query.hasOwnProperty('q')) ? this.request.query.q : '';
    var collections = yield model.Collection.find({}).exec();

    yield this.render('page/explore', {
        collections: collections
    });
};

// ===============================
// Collection
exports.updateURL = function*(next) {
    // process action
    if (this.method === 'POST') {
        var _id = this.request.body._id || '';

        var collection = yield model.Collection.findById('' + _id).exec();
        if (!collection) return this.body = 'something went wrong.';

        if (collection.user_id != this.req.user._id)
            return this.body = 'access deny';

        var data = this.request.body;
        var error = null;

        if (data.title) collection.title = data.title;
        if (data.is_public && data.is_public == 'true') collection.is_public = data.is_public;
        else collection.is_public = false;

        if (!error && data.alias && !utils.checkURLAlias(data.alias))
            error = 'alias not accept';

        if (!error) {
            var query = yield model.Collection.findOne({
                _id: {
                    $ne: _id
                },
                alias: data.alias
            }).exec();
            if (query) error = 'alias already exist.';
        }

        if (!error) {
            collection.alias = data.alias;
        }
        collection.save();

        return yield this.render('page/updateURL', {
            success: !error ? 'update success' : null,
            error: error,
            user: this.req.user,
            item: collection,
            request: this.request
        })
    }

    // [get] Render page
    var collection_id = this.params.collection || '';
    if (!utils.isUserID(collection_id)) return e404(this, 'not found');

    var collection = yield model.Collection.findById(collection_id).exec();
    if (!collection) return e404(this, 'not found');

    yield this.render('page/updateURL', {
        user: this.req.user,
        item: collection
    })
}

exports.deleteURL = function*(next) {
    var remove = null;
    if (utils.isUserID('' + this.params.collection)) {
        remove = yield model.Collection.remove({
            _id: '' + this.params.collection
        }).exec();
    }

    var message = remove ? 'delete success' : 'delete fail';
    if (this.is('application/*')) return yield this.body = message;

    return yield this.render('utils/message', {
        message: message,
        header: '',
        hide_home_link: false
    });
}

exports.viewURL = function*(next) {
    var throw_notfound = function(ctx) { return e404(ctx, 'not found') };
    if (! utils.isUserID('' + this.params.collection)) return yield throw_notfound(this);

    var collection = yield model.Collection.findById('' + this.params.collection).exec();
    if (!collection) return yield throw_notfound(this);

    collection.view_counter += 1;
    collection.save();

    return yield this.render('page/viewURL', {
        user: this.req.user,
        collection: collection,
        title: collection.title || '',
        meta: collection.meta || {},
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@marked/marked.min',
            '@copy/dist/copy.min',
            'hbs',
            'viewurl'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min'
        ]
    });
}

exports.addURL = function * (next) {
    var action = this.request.query;
    if (action.auto && action.auto == '1') {

    }

    if (action.quick_result && action.quick_result == '1') {
        return yield this.body = { title: action.title, url: action.url };
    }

    return yield this.render('page/addURLForm', {
        user: this.req.user,
        data: action,
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            'hbs',
            'add'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min'
        ]
    });
}

exports.RSS = function * (next) {
    var collections = yield model.Collection.find({}).limit(300).sort('-created').exec();
    
    this.set('Content-Type', 'text/xml');
    return yield this.render('page/rss', {
        collections: collections,
        update: new Date(),
    });
}

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
    if (this.req.isAuthenticated()) {
        // Authenticated, why still here?
        return this.redirect('/');
    }

    var success = (this.request.query.hasOwnProperty('success') && this.request.query.success == '1') ? true : false;
    if (success) {
        var next = this.session.returnTo || '/';
        if (this.request.query.hasOwnProperty('next')) {
            next = this.request.query.next;
        }

        yield this.render('utils/redirect', {
            next: next
        });
        return;
    }

    var next = (this.request.query.hasOwnProperty('next')) ? this.request.query.next : this.req.headers['referer'] || '/';
    this.session.returnTo = next;

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
    if (this.req.isAuthenticated()) {
        // Authenticated, why still here?
        return this.redirect('/');
    }

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

    yield this.render('page/mePassword', {
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
    yield this.render('page/meInfo', {
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

    yield this.render('page/meLog', {
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

exports.setting = function*(next) {
    this.render('page/setting', {
        me: this.req.user
    });
}

exports.userPage = function*(next) {
    var username = this.params.username || '';
    var user_data = yield model.User.findOne({
        username: username
    }).exec();

    if (!user_data) return yield e404(this, 'user not found');

    yield this.render('page/user', {
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



// ================================
// Helper
exports.click = function*(next) {
    var url = this.request.query.u || '';
    var url_id = this.request.query.url_id || '';

    if (!url || !url_id) return this.body = 'ops!';
    var collection = yield model.Collection.findOne({
        _id: url_id
    }).exec();
    if (!collection) return this.body = 'Not found.';

    // Update click couter
    collection.click += 1;
    collection.save();

    this.redirect(url);
};

exports.shortenUrl = function*(next) {
    alias = this.params.alias || '';

    var collection = yield model.Collection.findOne({
        alias: alias
    }).exec();
    if (!collection) return this.body = 'Not found.';

    // Update click couter
    collection.click += 1;
    collection.click_via_alias += 1;
    collection.save();

    this.redirect(collection.url);
};

function e404(ctx, message) {
    return ctx.render('utils/404', {
        message: message
    });
}
