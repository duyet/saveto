var utils = require('../utils');
var model = require('../model');

exports.tag = function*(next) {
	var tag = '' + this.params.tag;
	var urls = yield model.Collection.find({ tags: { $in : [ tag ] } });

    yield this.render('url/tag', {
    	tag: tag,
    	urls: urls,
        custom_script: [
            '@moment/min/moment.min',
            '@clipboard/dist/clipboard.min',
            '@handlebars/handlebars.min',
            '@AlertifyJS/build/alertify.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput.min',
            '@copy/dist/copy.min',
            'hbs',
            'tag'
        ],
        custom_css: [
            '@AlertifyJS/build/css/alertify.min',
            '@AlertifyJS/build/css/themes/default.min',
            '@bootstrap-tagsinput/dist/bootstrap-tagsinput'
        ]
    });
};
