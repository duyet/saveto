var mongoose = require('./db');

exports.User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String
});
