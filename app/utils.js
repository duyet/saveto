var bcrypt = require('bcrypt-nodejs');

// Password check
exports.isValidPassword = function(user, password) {
    return bcrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
exports.createHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}