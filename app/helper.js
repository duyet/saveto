var event = require('co-event');
var MetaInspector = require('node-metainspector');

exports.parser = function*(next) {
    var url = this.request.query.url || '';
    if (!url) return this.body = {};

    var client = new MetaInspector(url, {
        timeout: 5000
    });

    client.fetch();

    var e;
    while (e = yield event(client)) {
        switch (e.type) {
            case 'fetch':
                if (!e.args[0]) return this.body = {};

                return this.body = {
                    title: e.args[0].title || '',
                    url: e.args[0].url || '',
                    host: e.args[0].host || '',
                    meta: {
                        parsedUrl: e.args[0].parsedUrl || {},
                        author: e.args[0].author || '',
                        keywords: e.args[0].keywords || [],
                        description: e.args[0].description || '',
                        image: e.args[0].image || '',
                        ogTitle: e.args[0].ogTitle || '',
                        ogDescription: e.args[0].ogDescription || '',
                    }
                };
                break;

            case 'error':
            default:
                return this.body = {};
                break;
        }
    }
}
