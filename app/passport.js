var passport = require('koa-passport');

var user = {
    id: 1,
    username: 'test'
}

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    done(null, user)
})

var LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
    // retrieve user ...
    if (username === 'test' && password === 'test') {
        done(null, user)
    } else {
        done(null, false)
    }
}))


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
