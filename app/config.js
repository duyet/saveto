'use strict';

/**
 * Module dependencies.
 */

var version = require('../package.json').version;
var debug = false;

var config = {
    // Maintain status 
    maintain: false,
    
    // Database config
    db: 'mongodb://127.0.0.1:27017/quick-dev',

    // System version
    version: version,

    // Debug 
    debug: debug || process.env.NODE_ENV !== 'production',
    
    // Config port
    port: process.env.PORT || 6969,
    
    // Secret key
    secret_key: '-duyetdev-quick-',
    
    // Application config 
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

    // View config 
    view: {
        // Page title
        title: 'saveto',

        // Page logo text
        appName: 'saveto',

        // Application description
        description: 'Home for the best links on the web',
        
        // Meta author
        author: 'duyetdev.com',
        
        // Google Analytics tracking code
        ga: 'UA-18218315-55',

        // Server
        version: version,
        
        // javascript config 
        js_config: {
            base_url: '/',
            api_endpoint: '/api/v1'
        }
    }
};

module.exports = config;
