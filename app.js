const express = require('express');
const dotenv = require('dotenv').config(); 
const path = require('path');
const app = express();
const auth = require('./auth'); 
const passport = require('passport');
const session = require('express-session');
const PORT = process.env.PORT || 3009; 

// Middleware function for login authorization
function isLoggedin(req, res, next) {
    // Check if user is logged in, if not send 401 Unauthorized status
    req.user ? next() : res.sendStatus(401); 
}

// Serve static files from 'Public' directory
app.use(express.static(path.join(__dirname, 'Public')));

// Initialize session middleware
app.use(session({
    secret: 'keyboard cat', // Secret used to sign the session ID cookie
    resave: false, // Do not save session if unmodified
    saveUninitialized: true, // Save new sessions
    cookie: { secure: false } // Cookie settings (not secure in this example)
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Route for homepage
app.get('/', (req, res) => {
    res.sendFile('index.html'); 
});

// Route for initiating Google OAuth2 authentication
app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

// Callback URL for Google OAuth2 authentication
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected', // Redirect to protected route upon successful authentication
        failureRedirect: '/auth/google/failure' // Redirect to failure route upon authentication failure
    })
);

// Protected route, requires authentication
app.get('/auth/protected', isLoggedin, (req, res) => {
    let name = req.user.displayName; // Retrieve user's display name
    res.send(`Hello ${name}`); // Send greeting message
});

// Route for handling Google authentication failure
app.get('/auth/google/failure', (req, res) => {
    res.send('Something went wrong'); // Send error message
});

// Logout route
app.use('/auth/logout', (req, res) => {
    req.session.destroy(); // Destroy the session
    res.send('Goodbye'); // Send goodbye message
});

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`); 
});
