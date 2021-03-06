const express = require("express");
const path = require("path");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const flash = require("req-flash");

const app = express();
const port = process.env.PORT || 3000;
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ajoy_blog",
});

con.connect(function (err) {
  if (err) throw err;
});
const postRouter = require("./src/routes/postRoutes")(con);
const authRouter = require("./src/routes/authRoutes")(con);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "ajoy_blog_123",
    keys: ["ajoy_blog_123"],
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "/public/")));

require('./src/config/passport.js')(app);

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use("/posts", postRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
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

app.get("/about", (req, res) => {
  res.render("about", {
    user: req.user,
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    user: req.user,
  });
});

app.get("**", (req, res) => {
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

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
