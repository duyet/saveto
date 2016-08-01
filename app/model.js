var mongoose = require('./db');

// User
exports.User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String,
    created: { type: Date, default: new Date() },
    access_token: String,
    api_token: String
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
    // Review type: none, image, markdown, gif
    review_type: { type: String, default: 'none' },
    review_raw_url: { type: String, default: '' },

    // Collection type: url, note, image, markdown, gif
    type: { type: String, default: 'url' },

    // Note data
    note_content: { type: String, default: '' },
    note_color: { type: String, default: '' },

    // Status 
    status: { type: String, default: 'active' },
    deleted: { type: Boolean, default: false },
    deleted_date: { type: Date },

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

// Til
var TilSchema = new mongoose.Schema({
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
exports.Til = mongoose.model('Til', TilSchema);

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
    path: String,
    event: String,
    header: mongoose.Schema.Types.Mixed
});

exports.QueryLog = mongoose.model('QueryLog', {
    user_id: String,
    created: { type: Date, default: new Date() },
    ip: String,
    raw_query: String,
    query: String,
    path: String,
    header: mongoose.Schema.Types.Mixed
});

// Auth token
var TokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'access_token', enum: ['api_token', 'access_token', 'reset_token'] },
    token: String,
    expired: { type: Number, default: -1 }, // -1 mean will never exprired 
    active: { type: Boolean, default: true }
});
exports.Token = mongoose.model('App_Token', TokenSchema);


exports.SystemConfig = mongoose.model('System_Config', {
    key: { type: String },
    value: { type: mongoose.Schema.Types.Mixed },
});