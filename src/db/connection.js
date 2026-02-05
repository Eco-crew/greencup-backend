const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true
});

// Create the connection to database
async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  // A simple SELECT query
  try {
    const [results, fields] = await connection.query(
      'SELECT * FROM partners'
    );

    console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  } catch (err) {
    console.log(err);
  }

  // Using placeholders
  try {
    const [results] = await connection.query(
      'SELECT * FROM contracts WHERE daily_cup_quantity >= ?',
      [300]
    );

    console.log(results);
  } catch (err) {
    console.log(err);
  }
}

init();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10, // 동시에 열리는 최대 연결 수
//   queueLimit: 0,       // 대기열 제한 (0 = 무제한)

// });

// module.exports = pool;
