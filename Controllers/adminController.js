const db = require('../Config/db');

// Map student types to DB table and redirect paths
const tableMap = {
  government: {
    table: 'government_students',
    redirectUrl: '/admin/government-students',
  },
  self: {
    table: 'self_funding_students',
    redirectUrl: '/admin/self-funded-students',
  },
};

// GET - Admin Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const selfFundingStudents = await db.any('SELECT * FROM self_funding_students ORDER BY createdat DESC');
    const governmentStudents = await db.any('SELECT * FROM government_students ORDER BY createdat DESC');

    const totalStudents = selfFundingStudents.length + governmentStudents.length;

    const recentActivities = [
      { type: 'add', description: 'Added a new student', date: '2025-06-07' },
      { type: 'approve', description: 'Approved a student application', date: '2025-06-06' },
      { type: 'delete', description: 'Deleted a student record', date: '2025-06-05' }
    ];

    // ✅ Use a proper dashboard view (separate from student list)
    res.render('pages/government-students', {
      selfFundingStudents,
      governmentStudents,
      summary: { totalStudents },
      recentActivities,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).send("Server error");
  }
};

// GET - Government-Funded Students Page
exports.getGovernmentStudents = async (req, res) => {
  try {
    const governmentStudents = await db.any('SELECT * FROM government_students ORDER BY createdat DESC');
    res.render('pages/government-students', { governmentStudents });
  } catch (err) {
    console.error("Error fetching government-students:", err);
    res.status(500).send("Server error");
  }
};

// GET - Self-Funded Students Page
exports.getSelfFundedStudents = async (req, res) => {
  try {
    const selfFundedStudents = await db.any('SELECT * FROM self_funding_students ORDER BY createdat DESC');
    res.render('pages/self-funded-students', { selfFundedStudents });
  } catch (err) {
    console.error("Error fetching self-funded-students:", err);
    res.status(500).send("Server error");
  }
  
};

// POST - Approve Student
exports.approveStudent = async (req, res) => {
  const { id, type } = req.params;
  const studentType = tableMap[type];
  if (!studentType) return res.status(400).send("Invalid student type");

  try {
    await db.none(`UPDATE ${studentType.table} SET status = $1 WHERE id = $2`, ['Approved', id]);
    res.redirect(studentType.redirectUrl);
  } catch (err) {
    console.error(`Error approving ${type} student:`, err);
    res.status(500).send("Server error");
  }
};

// POST - Disapprove Student
exports.disapproveStudent = async (req, res) => {
  const { id, type } = req.params;
  const studentType = tableMap[type];
  if (!studentType) return res.status(400).send("Invalid student type");

  try {
    await db.none(`UPDATE ${studentType.table} SET status = $1 WHERE id = $2`, ['Disapproved', id]);
    res.redirect(studentType.redirectUrl);
  } catch (err) {
    console.error(`Error disapproving ${type} student:`, err);
    res.status(500).send("Server error");
  }
};

// GET - Show Edit Student Form
exports.getEditStudent = async (req, res) => {
  const { id, type } = req.params;
  const studentType = tableMap[type];
  if (!studentType) return res.status(400).send("Invalid student type");

  try {
    const student = await db.oneOrNone(`SELECT * FROM ${studentType.table} WHERE id = $1`, [id]);
    if (!student) return res.status(404).send("Student not found");

    res.render('pages/editStudents', { student, type });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Server error");
  }
};

// POST - Update Student
exports.postEditStudent = async (req, res) => {
  const { id, type } = req.params;
  const { name, studentno, program, year, status } = req.body;

  const studentType = tableMap[type];
  if (!studentType) return res.status(400).send("Invalid student type");

  try {
    await db.none(
      `UPDATE ${studentType.table}
       SET name = $1, studentno = $2, program = $3, semester = $4, status = $5
       WHERE id = $6`,
      [name, studentno, program, year, status, id]
    );
    res.redirect(studentType.redirectUrl);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).send("Server error");
  }
};
