const express = require('express');
const router = express.Router();

const authController = require('../Controllers/authController');
const adminController = require('../Controllers/adminController'); // ✅ Added this line
const authMiddleware = require('../Middleware/authMiddleware');

// Landing page
router.get('/', (req, res) => {
  res.render('pages/landing');
});

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Signup routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

// Email verification
router.get('/verify-email', authController.verifyEmail);


// Dashboards
router.get('/admin/dashboard',
  authMiddleware.isAuthenticated,
  authMiddleware.isAdmin,
  adminController.getDashboard // <- This matches your export
);

router.get('/user/dashboard',
  authMiddleware.isAuthenticated,
  (req, res) => {
    res.render('pages/user-home', { user: req.user });
  }
);

module.exports = router;
