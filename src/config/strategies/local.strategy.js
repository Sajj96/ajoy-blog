const passport = require('passport');
const { Strategy } = require('passport-local');
const mysql = require("mysql");
const bcrypt = require('bcrypt');

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
            con.query("select * from users where username = ?",[username],(err, user) => {
                if (err) throw err;
                
                user.forEach(x => {
                    if(user.length > 1 && bcrypt.compareSync(password, x.password)) {
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                })
            });
        } catch (error) {
            done(error, false);
        }
    }));
}

module.exports = localStrategy;