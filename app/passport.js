var process = require('process');
var passport = require('koa-passport');
var model = require('./model');
var utils = require('./utils');

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    model.User.findById(id, function(err, user) {
        if (err) done(err, null);

        model.Setting.find({user_id: user._id}, function(err, data) {
            user.setting = data;
            done(err, user);
        });
    });
})

var LocalStrategy = require('passport-local').Strategy
passport.use('login', new LocalStrategy({passReqToCallback : true}, function(req, username, password, done) {
    
    model.User.findOne({
            $or: [ {'username': username} , { 'email': username }]
        },
        function(err, user) {
            if (err) return done(err);

            // User not found
            if (!user) {
                req.flash.error = 'user not found with username = ' + username;
                return done(null, false);
            }

            // Wrong password
            if (!utils.isValidPassword(user, password)) {
                console.log('Invalid Password');
                req.flash.error = 'invalid password';
                return done(null, false);
            }

            // Ok
            utils.userLog(user, req, 'user_login');
            return done(null, user);
        })
}));

passport.use('register', new LocalStrategy({passReqToCallback : true}, function(req, username, password, done) {
    var email = req.body.email;

    findOrCreateUser = function() {
        // find a user in Mongo with provided username
        model.User.findOne({
            $or: [ {'username': username} , { 'email': email }]
        }, function(err, user) {
            // In case of any error return
            if (err) {
                console.log('Error in SignUp: ' + err);
                req.flash.error = err;
                return done(err, false);
            }
            // already exists
            if (user) {
                console.log('User already exists');
                req.flash.error = 'user already exists';
                return done(null, false);  
            } else {
                // if there is no user with that email
                // create the user
                var newUser = new model.User();
                // set the user's local credentials
                newUser.username = username;
                newUser.password = utils.createHash(password);

                newUser.email = req.body.email || '';
                newUser.firstName = username;
                newUser.created = new Date();
                newUser.access_token = utils.accessTokenGenerator();

                // save the user
                newUser.save(function(err) {
                    if (err) {
                        console.log('Error in Saving user: ' + err);
                        throw err;
                    }

                    var setting = new model.Setting(utils.userDefaultSetting());
                    setting.user_id = newUser._id;
                    setting.last_update = new Date();
                    setting.save();

                    console.log('User Registration succesful');
                    utils.userLog(newUser, req, 'user_register');
                    return done(null, newUser);
                });
            }
        });
    }

    process.nextTick(findOrCreateUser);
}));

var GitHubStrategy = require('passport-github').Strategy
passport.use(new GitHubStrategy({
        clientID: 'cc029092e4a9ef007b37',
        clientSecret: '456b1e1f3de91c70401e967dfdc497d3d97a9c47',
        callbackURL: "http://localhost:6969/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile)
        done(null, profile);
    }
));

module.exports = passport;
