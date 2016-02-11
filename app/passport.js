var process = require('process');
var passport = require('koa-passport');
var model = require('./model');
var utils = require('./utils');

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    model.User.findById(id, function(err, user) {
        done(err, user);
    });
})

var LocalStrategy = require('passport-local').Strategy
passport.use('login', new LocalStrategy({passReqToCallback : true}, function(req, username, password, done) {
    
    model.User.findOne({
            'username': username
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
            return done(null, user);
        })
}));

passport.use('register', new LocalStrategy({passReqToCallback : true}, function(req, username, password, done) {
    console.log(req);
        
    findOrCreateUser = function() {

        // find a user in Mongo with provided username
        model.User.findOne({
            'username': username
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

                // save the user
                newUser.save(function(err) {
                    if (err) {
                        console.log('Error in Saving user: ' + err);
                        throw err;
                    }
                    console.log('User Registration succesful');
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
        // User.findOrCreate({
        //     githubId: profile.id
        // }, function(err, user) {
        //     return done(err, user);
        // });
    }
));

// var FacebookStrategy = require('passport-facebook').Strategy
// passport.use(new FacebookStrategy({
//         clientID: 'your-client-id',
//         clientSecret: 'your-secret',
//         callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/facebook/callback'
//     },
//     function(token, tokenSecret, profile, done) {
//         // retrieve user ...
//         done(null, user)
//     }
// ))

// var TwitterStrategy = require('passport-twitter').Strategy
// passport.use(new TwitterStrategy({
//         consumerKey: 'your-consumer-key',
//         consumerSecret: 'your-secret',
//         callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/twitter/callback'
//     },
//     function(token, tokenSecret, profile, done) {
//         // retrieve user ...
//         done(null, user)
//     }
// ))

// var GoogleStrategy = require('passport-google-auth').Strategy
// passport.use(new GoogleStrategy({
//         clientId: 'your-client-id',
//         clientSecret: 'your-secret',
//         callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback'
//     },
//     function(token, tokenSecret, profile, done) {
//         // retrieve user ...
//         done(null, user)
//     }
// ))

module.exports = passport;
