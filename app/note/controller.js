var sanitize = require('mongo-sanitize');

var utils = require('../utils');
var model = require('../model');

exports.home = function*(next) {
	var user = this.req.user;
	if (!user._id) user  = utils.guestUserObject;
	
    yield this.render('note/home', {
    	user: user,
        custom_script: [
        	'@ace-builds/src-min-noconflict/ace',
        	'note'
        ],
        custom_css: [
        ]
    });
};

exports.add = function*(next) {
	var user_id = this.request.body.user_id || '';
	var access_token = this.request.body.access_token || '';

    // TODO: poor security, JWT instead of
	if (!utils.checkAccessTokenUID(user_id, access_token)) 
        return api_error(this, 'access deny');

    var note_content = sanitize(this.request.body.note_content || '');
    if (!note_content) return this.body = 'note content empty.'

    var note_title = this.request.body.note_title || utils.noteTitleGenerator();
    var is_private = !!this.request.body.is_private;

    var collection = new model.Note();
    collection.title = note_title;
    collection.content = note_content;
    collection.user_id = user_id;
    collection.is_guest = utils.is_guest(user_id, access_token);
    collection.delete_token = utils.getDeleteToken();
    collection.tags = [];
    collection.language = '';
    collection.is_public = !is_private;
    collection.created = new Date();

    var result = yield collection.save();
    if (result && result._id) this.redirect('/note/' + result._id);
    else return yield exports.home(next);
}

exports.view = function*(next) {
    var throw_notfound = function(ctx) { return utils.e404(this, 'not found'); };
    
    if (! utils.isUserID('' + this.params.note_id)) return yield throw_notfound(this);

    var note = null; 
    note = yield model.Note.findById('' + this.params.note_id).exec();
    if (!note) return yield throw_notfound(this);

    note.view_counter += 1;
    note.save();

    return yield this.render('note/view', {
        user: this.req.user,
        note: note,
        title: note.title || '',
        
        custom_script: [
            '@ace-builds/src-min-noconflict/ace',
            '@moment/min/moment.min',
            '@handlebars/handlebars.min',
            'hbs',
            'note-view'
        ],
        custom_css: [
        	'note'
        ]
    });
}