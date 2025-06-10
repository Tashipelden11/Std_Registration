// createSelfFundingTable.js

require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  max: 10,
  idleTimeoutMillis: 30000,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS self_funding_students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    cidno VARCHAR(20),
    dateofbirth DATE,
    studentno VARCHAR(20),
    program VARCHAR(100),
    semester INTEGER,
    gender VARCHAR(10),
    bloodgroup VARCHAR(5),
    permanentaddress TEXT,
    presentaddress TEXT,
    phoneno VARCHAR(20),
    registrationtype VARCHAR(20),
    createdat TIMESTAMP DEFAULT now(),
    status VARCHAR(20) DEFAULT 'pending'
  );
`;

async function createTable() {
  const client = await pool.connect();

  try {
    await client.query(createTableQuery);
    console.log('✅ self_funding_students table created successfully.');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  } finally {
    client.release();
  }
}

// Run when executed directly
if (require.main === module) {
  createTable();
}

module.exports = createTable;
