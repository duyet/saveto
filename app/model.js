var mongoose = require('./db');

exports.User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String,
    created: Date,
    access_token: String
});

exports.Collection = mongoose.model('Collection', {
    url: String,
    title: String,
    user_id: String,
    alias: String, // Shorten
    meta: Object,
    click: Number,
    vote: Number,
    tags: Array,
    created: { type: Date, default: new Date() },
    is_public: { type: Boolean, default: true }
});

exports.UserLog = mongoose.model('UserLog', {
    user_id: String,
    created: Date,
    ip: String,
    event: String,
    path: String
});