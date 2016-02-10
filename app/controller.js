var fs = require('fs');
var path = require('path');
var passport = require('koa-passport');

// ================================
// Page
exports.home = function*(next) {
    yield this.render('page/home');
};

exports.about = function*(next) {
    yield this.render('page/about');
};

exports.faq = function*(next) {
    yield this.render('page/faq');
};

// ================================
// Auth
exports.login = function*(next) {
    yield this.render('page/login');
};

exports.loginAction = function*(next) {
    passport.authenticate('local')
};

exports.register = function*(next) {

};

exports.forgot = function*(next) {

};

exports.logout = function*(next) {

};

exports.me = function*(next) {

};

// ================================
// Helper
exports.click = function*(next) {

};
