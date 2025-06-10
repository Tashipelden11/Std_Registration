// createSelfFundingTable.js

require('dotenv').config();
const { Client } = require('pg');

// PostgreSQL connection config using environment variables
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
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
  try {
    await client.connect();
    await client.query(createTableQuery);
    console.log('✅ self_funding_students table created successfully.');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  } finally {
    await client.end();
  }
}

module.exports = createTable;

