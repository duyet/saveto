'use strict';

/**
 * All system config params.
 * 
 * @module Config
 * @author duyetdev
 * @copyright saveto.co
 */

/**
 * Application version
 *
 * @type    {string}
 * @required
 * @readOnly
 */
var version = require('../package.json').version;

/**
 * Debug mode.
 *
 * @type    {boolean}
 * @default false
 * @public
 */
var debug = false;


/**
 * Application config
 * @type {Object}
 * @namespace
 * @constructor
 * @static
 */
var config = {
    /**
     * Server maintain status
     *
     * @type    {boolean}
     * @default false
     */
    maintain: false,

    /**
     * API Status 
     *
     * @type    {boolean}
     * @default false
     */
    api_status: true,
    
    /**
     * MongoDB database connection string.
     * @type {String}
     */
    db: 'mongodb://127.0.0.1:27017/quick-dev',

    /**
     * System version
     * @type {string}
     */
    version: version,

    /**
     * Debug mode
     * @type {boolean}
     */ 
    debug: debug || process.env.NODE_ENV !== 'production',
    
    /**
     * Application port
     * @type {number}
     * @required
     */
    port: process.env.PORT || 6969,
    
    /**
     * Secret key
     * @type {String}
     * @required
     */
    secret_key: '-duyetdev-quick-',

    /**
     * Cookie maxAge
     * @type {Number}
     * @default 604800000
     */
    cookieMaxAge: 604800000,
    
    /**
     * Application config 
     * @type {Object}
     * @memberOf Application config
     */
    app: {
        link: {
            /**
             * Min length of URL slug
             * @type {Number}
             * @default 3
             */
            alias_min: 3,

            /**
             * Max length of URL slug
             * @type {Number}
             * @default 6
             */
            alias_length: 6,
        },
        collection: {

        },
        note: {
            
        }
    },

    /**
     * View config 
     * @type {Object}
     * @memberOf Application config
     */
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

        // Facebook AppId for share, like, comments, ... 
        fbAppId: '942271679216102',
        fbLike: true,
        fbSave: true,
        fbSend: true,

        // Server
        version: version,
        
        // javascript config 
        js_config: {
            base_url: '/',
            api_endpoint: '/api/v1'
        }
    }
};

/**
 * Config module
 * @export Config
 */
module.exports = config;
