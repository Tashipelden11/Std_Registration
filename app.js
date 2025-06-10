const express = require('express');
const cookieParser = require('cookie-parser'); // import cookie-parser
const session = require('express-session'); 
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const path = require('path');
const app = express(); // <== app initialized AFTER imports

require('dotenv').config();



// View engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Your routes go below...

// Middleware setup
app.use(cookieParser());
// Session config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));



// Make user info available in all views/routes
app.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  } else {
    req.user = null;
  }
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.render('landing', { user: null });
});
// ✅ Add logout just below or above the line above
app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
  } else {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  }
});

