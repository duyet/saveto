var sanitize = require('mongo-sanitize');
var marked = require('marked');

var utils = require('../utils');
var model = require('../model');

exports.home = function*(next) {
    var user = this.req.user;
    if (!user || !user._id) user  = utils.guestUserObject;

    var lasted_notes = yield model.Note.find({}).sort('-created').limit(4).exec();
    
    yield this.render('note/home', {
        user: user,
        lasted_notes: lasted_notes,
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

exports.edit = function * (next) {
    var user = this.req.user;
    var note_id = '' + this.params.note_id;
    
    if (!user || !user._id) return yield utils.e404(this, 'please login');
    if (! utils.isUserID(note_id)) return yield utils.e404(this, 'invalid note');

    var note = yield model.Note.findOne({_id: note_id, user_id: user._id}).exec();
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

exports.update = function * (next) {
	var user = this.req.user;
    var note_id = '' + this.params.note_id;
    
    if (!user || !user._id) return yield utils.e404(this, 'please login');
    if (!this.request.body.user_id || this.request.body.user_id != user._id) return yield utils.e404(this, 'access deny');
    if (! utils.isUserID(note_id)) return yield utils.e404(this, 'invalid note');

    var note = yield model.Note.findOne({_id: note_id, user_id: user._id}).exec();
    if (!note) return yield utils.e404(this, 'not found');
	
    var note_content = sanitize(this.request.body.note_content || '');
    if (!note_content) return this.body = 'note content empty.'


    var note_title = this.request.body.note_title || utils.noteTitleGenerator();
    var note_language = this.request.body.language || '';
    var is_private = !!this.request.body.is_private;

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


exports.all = function * (next) {
    if (!this.req.user || !this.req.user._id) return yield utils.e404(this, 'please login');

    var limit = 30;
    var notes = yield model.Note.find({ user_id: this.req.user._id }).limit(limit).sort('-created').exec();

    return yield this.render('note/all', {
        user: this.req.user,
        notes: notes,
        custom_script: [
            '@moment/min/moment.min',
        ],
        custom_css: [
            'note'
        ] 
    })
}

exports.delete_via_token = function * (next) {
    var token = '' + this.params.delete_token;
    if (!token) return yield utils.e404(this, 'invalid token', 456);
    var deleted = yield model.Note.remove({ delete_token: token }).exec();

    return yield utils.e404(this, 'deleted '+ (deleted) +' note!', 200);
}

exports.add = function*(next) {
	var user_id = this.request.body.user_id || '';
	var access_token = this.request.body.access_token || '';

    // TODO: poor security, JWT instead of
	if (!utils.checkAccessTokenUID(user_id, access_token)) 
        return utils.e404(this, 'not found');

    var note_content = sanitize(this.request.body.note_content || '');
    if (!note_content) return this.body = 'note content empty.'

    var note_title = this.request.body.note_title || utils.noteTitleGenerator();
    var note_language = this.request.body.language || '';
    var is_private = !!this.request.body.is_private;

    var collection = new model.Note();
    collection.title = note_title;
    collection.content = note_content;
    collection.user_id = user_id;
    collection.is_guest = utils.is_guest(user_id, access_token);
    collection.delete_token = utils.getDeleteToken();
    collection.tags = [];
    collection.language = note_language;
    collection.is_public = !is_private;
    collection.created = new Date();

    var result = yield collection.save();
    if (result && result._id) this.redirect('/note/' + result._id);
    else return yield exports.home(next);
}

exports.view = function*(next) {
    var throw_notfound = function(ctx) { return utils.e404(ctx, 'not found'); };
    
    if (! utils.isUserID('' + this.params.note_id)) return yield throw_notfound(this);

    var note = null; 
    note = yield model.Note.findById('' + this.params.note_id).exec();
    if (!note) return yield throw_notfound(this);

    note.view_counter += 1;
    note.save();

	var custom_script = [];

    var is_markdown = false;
    if (note.language == '' || ['ace/mode/text', 'ace/mode/markdown'].indexOf(note.language) > -1) {
    	is_markdown = true;
    	note.content = marked(note.content);
    } else {
    	custom_script.push('@ace-builds/src-min-noconflict/ace');
    	custom_script.push('@ace-builds/src-min-noconflict/ext-static_highlight');
    }

    custom_script.push(
	    '@moment/min/moment.min',
	    '@handlebars/handlebars.min',
	    'hbs',
	    'note-view');

    return yield this.render('note/view', {
        user: this.req.user,
        note: note,
        title: note.title || '',
        is_markdown: is_markdown,
        
        custom_script: custom_script,
        custom_css: [
        	'note'
        ]
    });
}
