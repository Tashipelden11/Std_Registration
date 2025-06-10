const express = require('express');
const cookieParser = require('cookie-parser'); // import cookie-parser
const session = require('express-session'); 
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const path = require('path');
const app = express(); // <== app initialized AFTER imports

require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});


const createGovernmentTable = require('./Models/gov_stdModel');
const createSelfFundingTable = require('./Models/self_stdModels');
const { createUsersTable } = require('./Models/user');

// Create all tables when app starts
async function start() {
  try {
    await createGovernmentTable();
    await createSelfFundingTable();
    await createUsersTable();

    console.log('✅ All tables created successfully.');
    // Then you can start your express app or server here
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  }
}
start();
// View engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Your routes go below...

// Middleware setup
app.use(cookieParser());
// Session config
app.use(session({
  store: new pgSession({
    pool: pool,                 // 🔁 use your shared pg Pool instance
    tableName: 'session'        // default table name, can change if needed
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false               // set to true if using HTTPS in production
  }
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

