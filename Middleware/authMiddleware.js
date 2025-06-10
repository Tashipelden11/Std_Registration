// authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../Config/db');

// Middleware to check if the user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) {
    console.log('❌ No token found in cookies');
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const cleanEmail = decoded.email.trim().toLowerCase();

    // Fetch user from DB based on email in token
    const user = await db.oneOrNone('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (!user) {
      console.log('❌ No user found with email:', cleanEmail);
      return res.redirect('/login');
    }

    req.user = user; // Attach user to request object
    next();
  } catch (err) {
    console.error('🔥 Authentication error:', err);
    return res.redirect('/login');
  }
};

// Middleware to check if the user has admin role
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    console.log('❌ Access denied: User is not admin');
    return res.status(403).send('Access denied: Admins only');
  }
};

// Middleware to check if the user has regular user role
exports.isUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    return next();
  } else {
    console.log('❌ Access denied: User is not regular user');
    return res.status(403).send('Access denied: Users only');
  }
};

// Middleware to prevent authenticated users from accessing login/signup pages
exports.redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Redirect based on role stored in token
    return res.redirect(decoded.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  } catch (err) {
    // Invalid or expired token — proceed to login/signup
    next();
  }
};
// Middleware to validate student type in routes
exports.validateStudentType = (req, res, next) => {
  let { type } = req.params;

  // Normalize route value
  if (type === 'self-funded') type = 'self';

  const validTypes = ['government', 'self'];
  if (!validTypes.includes(type)) {
    console.log('❌ Invalid student type in URL:', type);
    return res.status(400).send('Invalid student type');
  }

  req.params.type = type; // Clean it for downstream use
  next();
};
