/**
 * Database module
 * @module DB
 */

var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db);

/**
 * Set DB Debug mode
 */
mongoose.set('debug', config.debug);

module.exports = mongoose;