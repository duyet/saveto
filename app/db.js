var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db);

module.exports = mongoose;