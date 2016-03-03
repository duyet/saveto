var path = require('path');

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

exports.terms = function*(next) {
    yield this.render('page/terms');
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
        url: '/terms',
        title: 'terms of service'
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
