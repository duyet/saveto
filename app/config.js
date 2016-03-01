'use strict';

/**
 * Module dependencies.
 */

var version = require('../package.json').version;

var config = {
    db: 'mongodb://127.0.0.1:27017/quick-dev',
    version: version,
    debug: process.env.NODE_ENV !== 'production',
    port: process.env.PORT || 6969,
    secret_key: '-duyetdev-quick-',
    alias_min: 3,
    alias_length: 6,

    view: {
        title: 'Quick',
        appName: 'Quick',
        description: 'Quick bookmark collection, shorten URL.',
        author: 'duyetdev.com',
        ga: '',
        version: version,
        js_config: {
            base_url: '/',
            api_endpoint: '/api/v1'
        }
    },

    email: {
        from: 'ahihi.club@gmail.com',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        html: '',
        text: ''
    },
    mail_server: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: false,
        auth: {
            XOAuth2: {
                user: 'ahihi.club@gmail.com',
                clientId: '1082924614593-p2hdi1pab4t412p7dp8e0480bqggb28v.apps.googleusercontent.com',
                clientSecret: 'xktmHH8aKiYLi75Ejit13W5U',
              }
        },
        aws: {
            accessKeyId: '',
            secretAccessKey: 'AkhXjDcb3TnbuFKW+zUFmayiJ2z37xYPpvxXcwDGXuia'
        }
    }
};

module.exports = config;
