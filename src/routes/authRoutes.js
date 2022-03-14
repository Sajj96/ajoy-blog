const express = require("express");
const passport = require("passport");

const authRoutes = express.Router();

function routes(con) {
    authRoutes.route('/signup').post((req, res) => {
        var post = {
            username: req.body.username,
            password: req.body.password
        }
        con.query('INSERT INTO users SET ?', post, function (error, results, fields) {
            if (error) {
              res.json({error: "Something went wrong while saving user!"});
            }

            req.login(req.body, () => {
                res.redirect('/auth/profile');
            });
        });
    })
    .get((req, res) => {
        res.render('auth/register');
    })

    authRoutes.route('/profile').get((req, res) => {
        res.json(req.user);
    });

    authRoutes.route('/signin')
    .get((req, res) => {
        res.render('auth/login');
    })
    .post((req, res, next) => {
        passport.authenticate('local', function(err, user, info){
            if (err) { return next(err); }
    
            if (!user) { 
                req.flash("error", "Incorrect username or password");
                return res.redirect('/'); 
            }
    
            req.login(user, function(err) {
              if (err) { return next(err); }
              return res.redirect('/customer/list');
            });
        })(req, res, next);
    });

    authRoutes.route('/logout').get((req, res) => {
        req.logout();
        res.redirect('/');
    });

    return authRoutes;
}

module.exports = routes;