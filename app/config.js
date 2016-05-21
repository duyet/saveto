'use strict';

/**
 * Module dependencies.
 */

var version = require('../package.json').version;

var config = {
    maintain: false,
    
    db: 'mongodb://127.0.0.1:27017/quick-dev',
    version: version,
    debug: process.env.NODE_ENV !== 'production',
    port: process.env.PORT || 6969,
    secret_key: '-duyetdev-quick-',
    
    app: {
        link: {
            alias_min: 3,
            alias_length: 6,
        },
        collection: {

        },
        note: {
            
        }
    },

    view: {
        title: 'Saveto.co',
        appName: 'saveto',
        description: 'Home for the best links on the web',
        author: 'duyetdev.com',
        ga: 'UA-18218315-55',
        version: version,
        js_config: {
            base_url: '/',
            api_endpoint: '/api/v1'
        }
    }
};

module.exports = config;
