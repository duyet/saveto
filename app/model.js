var mongoose = require('./db');

exports.User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String,
    created: { type: Date, default: new Date() },
    access_token: String
});

exports.Collection = mongoose.model('Collection', {
    url: String,
    title: String,
    host: String,
    user_id: String,
    alias: String, // Shorten
    meta: Object,
    click: { type: Number, default: 0 },
    click_via_alias: { type: Number, default: 0 },
    vote: { type: Number, default: 0 },
    tags: Array,
    created: { type: Date, default: new Date() },
    last_update: { type: Date, default: new Date() },
    is_public: { type: Boolean, default: true }
});

exports.Setting = mongoose.model('Setting', {
    user_id: String,
    last_change: Date,
    language: String,
    reset_access_token: String,
    timezone: String,
    offline: Boolean
})

exports.UserLog = mongoose.model('UserLog', {
    user_id: String,
    created: { type: Date, default: new Date() },
    ip: String,
    event: String,
    path: String
});