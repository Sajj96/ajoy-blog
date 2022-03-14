const passport = require('passport');
const { Strategy } = require('passport-local');
const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ajoy_blog",
});
  
con.connect(function (err) {
    if (err) throw err;
});

function localStrategy() {
    passport.use(new Strategy({
        usernameField: 'username',
        passwordField: 'password'
    }, (username, password, done) => {
        try {
            con.query("select * from users where username = ? and password = ? ",[username, password],(err, user) => {
                if (err) throw err;
    
                if(user.length < 1) {
                    done(null, false);
                } else {
                    done(null, user);
                }
            });
        } catch (error) {
            done(error, false);
        }
    }));
}

module.exports = localStrategy;