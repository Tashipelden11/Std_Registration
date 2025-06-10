const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const {
  isAuthenticated,
  isAdmin,
  validateStudentType,
} = require('../Middleware/authMiddleware'); // ✅ Correct path & imports

// Dashboard
router.get('/dashboard', isAuthenticated, isAdmin, adminController.getDashboard);

// Government students page
router.get('/government-students', isAuthenticated, isAdmin, adminController.getGovernmentStudents);

// Self-funded students page
router.get('/self-funded-students', isAuthenticated, isAdmin, adminController.getSelfFundedStudents);

// Edit student (by type/id)
router.get('/edit-student/:type/:id', isAuthenticated, isAdmin, validateStudentType, adminController.getEditStudent);
router.post('/editStudent/:type/:id', isAuthenticated, isAdmin, validateStudentType, adminController.postEditStudent);

// Approve/Disapprove
router.post('/approve/:type/:id', isAuthenticated, isAdmin, validateStudentType, adminController.approveStudent);
router.post('/disapprove/:type/:id', isAuthenticated, isAdmin, validateStudentType, adminController.disapproveStudent);

module.exports = router;
