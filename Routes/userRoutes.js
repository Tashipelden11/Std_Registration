const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../Middleware/authMiddleware');
const db = require('../Config/db');

// ✅ Logout route (must be global, not inside a route)
router.get('/logout', (req, res) => {
  res.clearCookie('jwt'); // Clear auth token
  res.redirect('/');      // Redirect to landing page
});

// User dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('pages/user-home', { user: req.user });
});

// Optional home route
router.get('/home', (req, res) => {
  console.log("User from session:", req.user);
  res.render('pages/user-home', { user: req.user });
});

// Registration landing
router.get('/registration', (req, res) => {
  res.render('pages/registration', {
    errorMessage: null,
    registrationType: null,
    student: null
  });
});

// Registration form
router.get(['/register/form', '/register/form/:type'], (req, res) => {
  let rawType = req.params.type || req.query.type;
  if (!rawType) return res.redirect('/user/registration');

  let registrationType = rawType.toLowerCase().trim().replace(/-/g, '_');
  if (!['self_funding', 'government'].includes(registrationType)) {
    registrationType = 'unknown';
  }

  res.render('pages/form', {
    registrationType,
    errorMessage: null,
    student: null
  });
});

// Handle form submission
router.post('/register/submit', async (req, res) => {
  console.log('🔍 Raw form data:', req.body);

  let {
    studentName, cidNo, dateOfBirth, studentNo, program, semester,
    gender, bloodGroup, permanentAddress, presentAddress, phoneNo, registrationType
  } = req.body;

  let normalizedType = (registrationType || '').toLowerCase().trim().replace(/-/g, '_');
  if (!['government', 'self_funding'].includes(normalizedType)) {
    return res.render('pages/form', {
      registrationType: 'unknown',
      errorMessage: 'Invalid registration type. Please select Government or Self-Funding.',
      student: req.body,
      isEdit: false
    });
  }

  const errors = [];
  if (!studentName || !cidNo || !dateOfBirth || !studentNo || !program || !semester || !gender || !permanentAddress || !phoneNo) {
    errors.push("Please fill all required fields.");
  }
  if (!/^\d{11}$/.test(cidNo)) errors.push("CID number must be exactly 11 digits.");
  if (!/^\d{8,}$/.test(phoneNo)) errors.push("Phone number must be at least 8 digits.");

  if (errors.length > 0) {
    return res.render('pages/form', {
      registrationType: normalizedType,
      errorMessage: errors.join(" "),
      student: req.body,
      isEdit: false
    });
  }

  try {
    const existing = await db.oneOrNone(
      `SELECT * FROM government_students WHERE studentno = $1
       UNION
       SELECT * FROM self_funding_students WHERE studentno = $1`,
      [studentNo]
    );

    if (existing) {
      return res.render('pages/form', {
        registrationType: normalizedType,
        errorMessage: '⚠️ This student is already registered!',
        student: req.body,
        isEdit: false
      });
    }

    const tableName = normalizedType === 'government' ? 'government_students' : 'self_funding_students';
    await db.none(
      `INSERT INTO ${tableName} (name, cidno, dateofbirth, studentno, program, semester, gender, bloodgroup,
        permanentaddress, presentaddress, phoneno, registrationtype, createdat, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),'pending')`,
      [studentName, cidNo, dateOfBirth, studentNo, program, semester, gender, bloodGroup,
        permanentAddress, presentAddress, phoneNo, normalizedType]
    );

    res.render('pages/submissionStatus', { status: 'success', studentNo });
  } catch (err) {
    console.error('Error saving registration:', err);
    res.render('pages/submissionStatus', { status: 'error' });
  }
});

module.exports = router;
