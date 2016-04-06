var mongoose = require('./db');

// User
exports.User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String,
    created: { type: Date, default: new Date() },
    access_token: String
});

// Application
var ApplicationSchema = new mongoose.Schema({
    user_id: String,
    app_name: String,
    app_id: String,
    secret_key: String,
    access_token: String,
    created: { type: Date, default: new Date() },
    last_update: { type: Date, default: new Date() },
    is_active: { type: Boolean, default: true },
    is_remove: { type: Boolean, default: false },
});
ApplicationSchema.index({ app_id: 1 }, { unique: true });
exports.Application = mongoose.model('Application', ApplicationSchema);

exports.ApplicationLog = mongoose.model('ApplicationLog', {
    app_id: String,
    created: { type: Date, default: new Date() },
});

// URL 
var URLSchema = new mongoose.Schema({
    url: String,
    title: String,
    host: String,
    user_id: String,
    is_guest: Boolean,
    delete_token: String,
    alias: String, // Shorten
    meta: Object,
    
    view_counter: { type: Number, default: 0 }, // Preview page
    click: { type: Number, default: 0 },
    click_via_alias: { type: Number, default: 0 },
    
    vote: { type: Number, default: 0 },
    tags: Array,
    created: { type: Date, default: new Date() },
    last_update: { type: Date, default: new Date() },
    is_public: { type: Boolean, default: true },

    // features
    review_type: { type: String, default: 'none' },
    review_raw_url: { type: String, default: '' },
});
URLSchema.index({ alias: 1 }, { unique: true });
exports.Collection = mongoose.model('URL', URLSchema);

// Note
var NoteSchema = new mongoose.Schema({
    title: String,
    content: String,
    user_id: String,
    is_guest: Boolean,
    delete_token: String,
    alias: String, // Shorten
    language: String, // Shorten
    
    view_counter: { type: Number, default: 0 }, // Preview page
    click: { type: Number, default: 0 },
    click_via_alias: { type: Number, default: 0 },
    
    vote: { type: Number, default: 0 },
    tags: Array,
    created: { type: Date, default: new Date() },
    last_update: { type: Date, default: new Date() },
    is_public: { type: Boolean, default: true },
});
exports.Note = mongoose.model('Note', NoteSchema);

// User settings
exports.Setting = mongoose.model('Setting', {
    user_id: String,
    last_change: Date,
    language: String,
    reset_access_token: String,
    timezone: String,
    offline: Boolean
})

// User log
exports.UserLog = mongoose.model('UserLog', {
    user_id: String,
    created: { type: Date, default: new Date() },
    ip: String,
    event: String,
    path: String
});