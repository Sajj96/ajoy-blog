const express = require("express");
const passport = require("passport");
const bcrypt = require('bcrypt');

const authRouter = express.Router();

function routes(con) {
    authRouter.route('/signup')
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
                if (err) throw err;
                if(user.length > 0) {
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
                            } 
                        })
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
                            if(req.user) {
                                con.query("select p.*, u.username from posts p, users u where p.posted_by=u.id",(err, posts) => {
                                  if (err) throw err;
                              
                                  res.render("index", {
                                    success: req.flash("success"),
                                    error: req.flash("error"),
                                    user: req.user,
                                    posts
                                  });
                                });
                              } else {
                                con.query("select p.*, u.username from posts p, users u where p.posted_by=u.id and p.status = ?",0,(err, posts) => {
                                  if (err) throw err;
                              
                                  res.render("index", {
                                    success: req.flash("success"),
                                    error: req.flash("error"),
                                    user: req.user,
                                    posts
                                  });
                                });
                              }
                        });
                    });
                }
            })
        }
    });

    authRouter.route('/signin')
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
                con.query("select p.*, u.username from posts p, users u where p.posted_by=u.id and p.status = ?",0,(err, posts) => {
                  if (err) throw err;
              
                  return res.render("index", {
                    success: req.flash("success"),
                    error: req.flash("error"),
                    user: req.user,
                    posts
                  });
                });
            });
        })(req, res, next);
    });

    authRouter.route('/logout').get((req, res) => {
        req.logout();
        con.query("select p.*, u.username from posts p, users u where p.posted_by=u.id",(err, posts) => {
            if (err) throw err;
        
            res.render("index", {
            success: req.flash("success"),
            error: req.flash("error"),
            user: req.user,
            posts
            });
        });
    });

    return authRouter;
}

module.exports = routes;