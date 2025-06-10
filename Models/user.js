const pool = require('../Config/db'); // Adjust path if needed
const bcrypt = require('bcrypt');

async function findUserByUsername(username) {
  try {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
  } catch (error) {
    console.error('DB Error in findUserByUsername:', error);
    throw error;
  }
}

async function findUserByVerifyToken(token) {
  try {
    const res = await pool.query('SELECT * FROM users WHERE verify_token = $1', [token]);
    return res.rows[0];
  } catch (error) {
    console.error('DB Error in findUserByVerifyToken:', error);
    throw error;
  }
}

async function markUserVerified(userId) {
  try {
    await pool.query(
      `UPDATE users SET is_verified = true, verify_token = NULL WHERE id = $1`,
      [userId]
    );
  } catch (error) {
    console.error('DB Error in markUserVerified:', error);
    throw error;
  }
}

async function setResetPasswordToken(userId, token, expires) {
  try {
    await pool.query(
      `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3`,
      [token, expires, userId]
    );
  } catch (error) {
    console.error('DB Error in setResetPasswordToken:', error);
    throw error;
  }
}

async function findUserByResetToken(token) {
  try {
    const res = await pool.query(
      `SELECT * FROM users WHERE reset_password_token = $1`,
      [token]
    );
    return res.rows[0];
  } catch (error) {
    console.error('DB Error in findUserByResetToken:', error);
    throw error;
  }
}

async function updatePassword(userId, newPassword) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2`,
      [hashedPassword, userId]
    );
  } catch (error) {
    console.error('DB Error in updatePassword:', error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  } catch (error) {
    console.error('DB Error in findUserByEmail:', error);
    throw error;
  }
}

async function createUser({ username, email, password, role, verifyToken }) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const res = await pool.query(
      `INSERT INTO users (username, email, password, role, verify_token, is_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [username, email, hashedPassword, role, verifyToken]
    );

    return res.rows[0];
  } catch (error) {
    console.error('DB Error in createUser:', error);
    throw error;
  }
}

module.exports = {
  findUserByUsername,
  findUserByVerifyToken,
  markUserVerified,
  setResetPasswordToken,
  findUserByResetToken,
  updatePassword,
  findUserByEmail,
  createUser,
};
