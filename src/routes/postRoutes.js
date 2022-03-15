const express = require('express');

const postRoutes = express.Router();

function routes(con) {
    postRoutes.route('/')
    .get((req, res) => {
        if(req.user) {
            con.query("select * from posts",(err, posts) => {
                if (err) throw err;
            
                res.render('post', {
                  title: 'Ajoy Blog',
                  page_title: 'Posts',
                  posts,
                  user: req.user
                });
              });
        } else {
            con.query("select * from posts where status = 0",(err, posts) => {
                if (err) throw err;
            
                res.render('post', {
                  title: 'Ajoy Blog',
                  page_title: 'Posts',
                  posts,
                  user: req.user
                });
              });
        }
    });

    postRoutes.route('/create')
    .get((req, res) => {
       if(req.user) {
        res.render('create_post', {
            title: 'Ajoy Blog',
            page_title: 'Create Post',
            user: req.user
        });
       } else {
        res.render('auth/login', {
            title: 'Ajoy Blog',
            page_title: 'Login',
            user: req.user
        });
       }
    })
    .post((req, res) => {
        const date  = new Date();
        const currentDayOfMonth = ('0' + date.getUTCDate()).slice(-2);
        const currentMonth = ('0' + (date.getUTCMonth()+1)).slice(-2); 
        const currentYear = date.getUTCFullYear();
  
        const dateString = currentYear + "-" + (currentMonth) + "-" + currentDayOfMonth;
        var post = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            status: req.body.status,
            posted_by: req.user.id,
            created_at: dateString
        }
        con.query('INSERT INTO posts SET ?', post, function (error, results, fields) {
            if (error) {
                req.flash("error", "Something went wrong while creating a post!");
                res.render("create_post", {
                    title: 'Ajoy Blog',
                    page_title: 'Create Post',
                    success: req.flash("success"),
                    error: req.flash("error"),
                    user: req.user
                });
            }

            req.flash("success", "Post created successfully!");
            res.render("create_post", {
                title: 'Ajoy Blog',
                page_title: 'Create Post',
                success: req.flash("success"),
                error: req.flash("error"),
                user: req.user
            });
        });
    });

    return postRoutes;
}

module.exports = routes;