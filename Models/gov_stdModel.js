// createGovernmentTable.js

require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS government_students (
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
  const client = await pool.connect(); // Get a client from the pool

  try {
    await client.query(createTableQuery);
    console.log('✅ government_students table created successfully.');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  } finally {
    client.release(); // Release client back to pool
  }
}

// Only run the function if this file is executed directly
if (require.main === module) {
  createTable();
}

module.exports = createTable;
