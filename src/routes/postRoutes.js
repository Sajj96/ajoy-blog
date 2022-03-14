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
                  posts
                });
              });
        } else {
            con.query("select * from posts where status = 0",(err, posts) => {
                if (err) throw err;
            
                res.render('post', {
                  title: 'Ajoy Blog',
                  page_title: 'Posts',
                  posts
                });
              });
        }
    });

    postRoutes.route('/create')
    .get((req, res) => {
        res.render('create_post', {
            title: 'Ajoy Blog',
            page_title: 'Create Post',
        });
    })
    .post((req, res) => {
        var post = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            status: req.body.status
        }
        con.query('INSERT INTO posts SET ?', post, function (error, results, fields) {
            if (error) {
                req.flash("error", "Something went wrong while creating a post!");
                res.redirect("/posts/create");
            }

            req.flash("success", "Post created successfully!");
            res.redirect("/posts/create");
        });
    });

    return postRoutes;
}

module.exports = routes;