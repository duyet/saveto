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

    view: {
    	title: 'Quick',
    	ga: 'UAxxxx',
    	version: version,
    	js_config: {
    		base_url: '/',
    		api_endpoint: '/api/v1'
    	}
    }
};

module.exports = config;