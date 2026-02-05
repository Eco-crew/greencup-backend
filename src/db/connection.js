const mysql = require('mysql2/promise');

// Create the connection to database
async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
  });

  // A simple SELECT query
  try {
    const [results, fields] = await connection.query(
      'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45'
    );

    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  } catch (err) {
    console.log(err);
  }

  // Using placeholders
  try {
    const [results] = await connection.query(
      'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
      ['Page', 45]
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
