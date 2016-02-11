var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db);
mongoose.set('debug', true);

module.exports = mongoose;