// usersSetup.js

require('dotenv').config();
const { Client, Pool } = require('pg');
const bcrypt = require('bcrypt');

// PostgreSQL config for table creation
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// SQL to create the users table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    verify_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires BIGINT,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
  );
`;

// Create the table
async function createUsersTable() {
  try {
    await client.connect();
    await client.query(createTableQuery);
    console.log('✅ users table created successfully.');
  } catch (err) {
    console.error('❌ Error creating users table:', err);
  } finally {
    await client.end();
  }
}

// User-related database functions

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


// Export functions
module.exports = {
  createUsersTable,
  findUserByUsername,
  findUserByVerifyToken,
  markUserVerified};
