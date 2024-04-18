const express = require('express');
const dotenv = require('dotenv').config()
const path = require('path');
const app = express();
const auth = require('./auth')
const passport = require('passport')
const session = require('express-session')
const PORT = process.env.PORT || 3009


//login authourization
function isLoggedin (req, res, next) {
    req.user ? next() : res.sendStatus(401)
}

app.use(express.static(path.join(__dirname, 'Public')))

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })); 

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.sendFile('index.html')
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
}));


app.get('/auth/protected', isLoggedin, (req, res) => {
    let name = req.user.displayName
    res.send(`Hello ${name}`)
}); 

app.get('/auth/google/failure',  (req, res) => {
    res.send('something went wrong')
}); 

app.use('/auth/logout', (req, res) => {
    req.session.destroy()
    res.send('Goodbye')
});

//listen on port
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});