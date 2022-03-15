const express = require("express");
const passport = require("passport");
const bcrypt = require('bcrypt');

const authRoutes = express.Router();

function routes(con) {
    authRoutes.route('/signup')
    .get((req, res) => {
        res.render('auth/register', {
            page_title: 'Sign up',
            success: req.flash("success"),
            error: req.flash("error"),
            user: req.user
        });
    })
    .post((req, res) => {
        var post = {
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        }
        
        if(req.body.password !== req.body.confirm_password) {
            req.flash("error", "Passwords do not much!");
            res.render('auth/register', {
                page_title: 'Sign up',
                success: req.flash("success"),
                error: req.flash("error"),
                user: req.user
            });
        } else {
            con.query("select * from users where username = ? and email = ?",[post.username, post.email], (err, user) => {
                user.forEach(x => {
                    if(x.username == post.username) {
                        req.flash("error", "Username already taken!");
                              res.render('auth/register', {
                                page_title: 'Sign up',
                                success: req.flash("success"),
                                error: req.flash("error"),
                                user: req.user
                              });
                    } else if(x.email == post.email) {
                        req.flash("error", "Email already taken!");
                              res.render('auth/register', {
                                page_title: 'Sign up',
                                success: req.flash("success"),
                                error: req.flash("error"),
                                user: req.user
                              });
                    } else {
                        con.query('INSERT INTO users SET ?', post, function (error, results, fields) {
                            if (error) {
                              req.flash("error", "Something went wrong while saving user!");
                              res.render('auth/register', {
                                page_title: 'Sign up',
                                success: req.flash("success"),
                                error: req.flash("error"),
                                user: req.user
                              });
                            }
                
                            req.login(req.body, () => {
                                res.render('index', {
                                    user: req.user
                                });
                            });
                        });
                    }
                })
            })
        }
    });

    authRoutes.route('/signin')
    .get((req, res) => {
        res.render('auth/login', {
            success: req.flash("success"),
            error: req.flash("error"),
            user: req.user
        });
    })
    .post((req, res, next) => {
        passport.authenticate('local', function(err, user, info){
            if (err) { return next(err); }
    
            if (!user) { 
                req.flash("error", "Incorrect username or password");
                return res.render('auth/login', {
                    success: req.flash("success"),
                    error: req.flash("error"),
                    user: req.user
                }); 
            }
    
            req.login(user, function(err) {
              if (err) { return next(err); }
              return res.render('index', {
                user: req.user
              });
            });
        })(req, res, next);
    });

    authRoutes.route('/logout').get((req, res) => {
        req.logout();
        res.render('index',{
            user: req.user
        });
    });

    return authRoutes;
}

module.exports = routes;