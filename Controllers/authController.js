const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../Config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const saltRounds = 10;

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Render login form
exports.getLogin = (req, res) => {
  let message = null;
  if (req.query.verified === 'success') {
    message = 'Email verified successfully! You can now log in.';
  } else if (req.query.verified === 'fail') {
    message = 'Invalid or expired verification link.';
  }
  res.render('pages/login', { message });
};

// Handle login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase().replace(/"/g, '');

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (!user) return res.render('pages/login', { message: 'Invalid credentials!' });

    if (!user.is_verified) {
      return res.render('pages/login', { message: 'Please verify your email first.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('pages/login', { message: 'Invalid credentials!' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Redirect based on role
    return user.role === 'admin'
      ? res.redirect('/admin/dashboard')
      : res.redirect('/user/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('pages/login', { message: 'Error during login.' });
  }
};

// Render signup form
exports.getSignup = (req, res) => {
  res.render('pages/signup', { message: null });
};

// Handle signup
// Handle signup
exports.postSignup = async (req, res) => {
  const { username, email, password, confirmPassword, role, adminCode } = req.body;
  const cleanEmail = email.trim().toLowerCase().replace(/"/g, '');

  if (!username || !email || !password || !confirmPassword || !role) {
    return res.render('pages/signup', { message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.render('pages/signup', { message: 'Passwords do not match' });
  }

  if (role === 'admin' && adminCode !== process.env.ADMIN_SECRET_CODE) {
    return res.render('pages/signup', { message: 'Invalid admin code' });
  }

  try {
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (existingUser) {
      return res.render('pages/signup', { message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = jwt.sign({ email: cleanEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await db.none(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
      [username, cleanEmail, hashedPassword, role]
    );

    const verificationLink = `http://localhost:${process.env.PORT}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"Sherubtse Auth" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: 'Verify your email',
      html: `<h3>Hello ${username},</h3><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`,
    });

    res.render('pages/signup', { message: 'Signup successful! Check your email to verify.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.render('pages/signup', { message: 'Error during signup.' });
  }
};


// Email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    await db.none(
      'UPDATE users SET is_verified = true, verify_token = null WHERE email = $1',
      [email]
    );

    res.redirect('/login?verified=success');
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect('/login?verified=fail');
  }
};

