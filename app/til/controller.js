var sanitize = require('mongo-sanitize');
var marked = require('marked');
var Renderer = require('marked-sanitized')(marked.Renderer);
var slug = require('slug');

// Synchronous highlighting with highlight.js
marked.setOptions({
    renderer: new Renderer(),
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    },
    sanitize: false, // Ignore HTML input
    gfm: true, // Enable GitHub flavored markdown.
    tables: true
});

var utils = require('../utils');
var model = require('../model');

exports.home = function*(next) {
    var user = this.req.user;
    if (!user || !user._id) user = utils.guestUserObject;

    yield this.render('note/home', {
        user: user,
        custom_script: [
            '@ace-builds/src-min-noconflict/ace',
            '@ace-builds/src-min-noconflict/ext-modelist',
            'note'
        ],
        custom_css: [
            'note'
        ]
    });
};

exports.edit = function*(next) {
    var user = this.req.user;
    var note_id = '' + this.params.note_id;

    if (!user || !user._id) return yield utils.e404(this, 'please login');
    if (!utils.isUserID(note_id)) return yield utils.e404(this, 'invalid note');

    var note = yield model.Note.findOne({ _id: note_id, user_id: user._id }).exec();
    if (!note) return yield utils.e404(this, 'invalid note');

    yield this.render('note/edit', {
        user: user,
        note: note,
        custom_script: [
            '@ace-builds/src-min-noconflict/ace',
            '@ace-builds/src-min-noconflict/ext-modelist',
            'note'
        ],
        custom_css: [
            'note'
        ]
    });
};

exports.update = function*(next) {
    var user = this.req.user;
    var til_id = '' + this.params.til_id;

    if (!user || !user._id) return yield utils.e404(this, 'please login');
    if (!this.request.body.user_id || this.request.body.user_id != user._id) return yield utils.e404(this, 'access deny');
    if (!utils.isUserID(til_id)) return yield utils.e404(this, 'invalid note');

    var note = yield model.Til.findOne({ _id: til_id, user_id: user._id }).exec();
    if (!note) return yield utils.e404(this, 'not found');

    var note_content = sanitize(this.request.body.note_content || '');
    if (!note_content) return this.body = 'note content empty.'


    var note_title = this.request.body.note_title || utils.noteTitleGenerator();
    var note_language = this.request.body.language || '';
    var is_private = this.request.body.is_private == 'true' || false;

    note.title = note_title;
    note.content = note_content;
    note.tags = [];
    note.language = note_language;
    note.is_public = !is_private;
    note.last_update = new Date();

    var result = yield note.save();
    if (result && result._id) this.redirect('/note/' + result._id);
    else return yield exports.home(next);
};


exports.all = function*(next) {
    var uid = 0;
    if (this.req.user && this.req.user._id) uid = this.req.user._id;

    var limit = 30;
    var cond = { user_id: uid };

    var posts = yield model.Til.find().limit(limit).sort('-created').exec();

    return yield this.render('til/all', {
        user: this.req.user,
        posts: posts,
        custom_script: [
            '@moment/min/moment.min',
        ],
        custom_css: [
            'note',
            'til'
        ]
    })
}

exports.delete_via_token = function*(next) {
    var token = '' + this.params.delete_token;
    if (!token) return yield utils.e404(this, 'invalid token', 456);
    var deleted = yield model.Note.remove({ delete_token: token }).exec();

    return yield utils.e404(this, 'deleted ' + (deleted) + ' note!', 200);
}

exports.add = function*(next) {
    var user = this.req.user;
    if (!user || !user._id) return yield utils.e404(this, 'please login', 609);

    if (this.method === 'POST') {

        var user_id = this.request.body.user_id || '';
        var access_token = this.request.body.access_token || '';

        // TODO: poor security, JWT instead of
        if (!utils.checkAccessTokenUID(user_id, access_token))
            return utils.e404(this, 'not found');

        var note_content = sanitize(this.request.body.note_content || '');
        if (!note_content) return this.body = 'note content empty.'

        var note_title = this.request.body.note_title || utils.noteTitleGenerator();
        var note_language = this.request.body.language || '';
        var is_private = this.request.body.is_private == 'true' || false;

        var til = new model.Til();
        til.title = note_title;
        til.alias = slug(note_title);
        til.content = note_content;
        til.user_id = user_id;
        til.is_guest = utils.is_guest(user_id, access_token);
        til.delete_token = utils.getDeleteToken();
        til.tags = [];
        til.language = note_language;
        til.is_public = !is_private;
        til.created = new Date();

        var result = yield til.save();
        if (result && result._id) this.redirect('/til/' + result.alias);
        else return yield exports.add(next);

        return;
    }

    yield this.render('til/add', {
        user: user,
        custom_script: [
            '@ace-builds/src-min-noconflict/ace',
            '@ace-builds/src-min-noconflict/ext-modelist',
            '@marked/lib/marked',
            'til'
        ],
        custom_css: [
            'note',
            'til'
        ]
    });
}

exports.view = function*(next) {
    var throw_notfound = function(ctx) {
        return utils.e404(ctx, 'not found');
    };

    var note = null;
    if (!utils.isUserID('' + this.params.til_id)) 
        note = yield model.Til.findOne({alias: this.params.til_id}).exec();
    else
        note = yield model.Til.findOne({_id: this.params.til_id}).exec();

    if (!note) return yield throw_notfound(this);

    note.view_counter += 1;
    note.save();

    var custom_script = [];

    var is_markdown = true;
    var content = marked(note.content || '');
    
    return yield this.render('til/view', {
        user: this.req.user,
        note: note,
        content_render: content,
        title: note.title || '',
        is_markdown: is_markdown,

        custom_script: custom_script,
        custom_css: [
            'note',
            'til',
            'note-markdown',
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.2.0/styles/default.min'
        ]
    });
}

exports.raw = function*(next) {
    var throw_notfound = function(ctx) {
        ctx.code = 404;
        ctx.body = 'not found';
    }

    if (!utils.isUserID('' + this.params.note_id)) return throw_notfound(this);

    var note = null;
    note = yield model.Note.findById('' + this.params.note_id).exec();
    if (!note) return throw_notfound(this);

    note.view_counter += 1;
    note.save();

    this.set('Access-Control-Allow-Origin', '*');
    this.set('Content-Type', 'text/plain; charset=utf-8')
    this.set('Strict-Transport-Security', 'max-age=31536000');
    this.set('X-Content-Type-Options', 'nosniff');
    this.set('X-Frame-Options', 'deny');
    this.set('X-XSS-Protection', '1; mode=block');

    if (this.request.query['dl'] && '1' == this.request.query['dl']) {
        this.set('Content-Type', 'application/force-download');
        this.set('Content-Disposition', 'attachment; filename="' + note.title + '"')
    }

    this.body = note.content;
}
