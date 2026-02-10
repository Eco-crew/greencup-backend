const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true, // 현재 사용 가능한 '연결(connection)'이 없으면, 다른 연결이 반환될 때까지 요청 대기(Queue). false면 즉시 오류 발생시킴
  connectionLimit: 10, // 커넥션풀에서 동시에 유지할 수 있는 최대 연결 수. 기본값 10
  maxIdle: 10, // idle 상태로 유지할 수 있는 (사용 중이 아니지만 풀에 남겨둘 수 있는) 최대 연결 수. 기본값은 'connectionLimit'과 동일
  idleTimeout: 60000, // 연결이 유휴(idle) 상태로 유지될 수 있는 시간. 기본값 60000ms = 60초. 이 시간이 되면 연결이 자동 종료(destroy)될 수 있음
  queueLimit: 0, // 풀에 사용 가능한 연결이 없을 때, 대기 큐에 쌓일 수 있는 요청의 최대 개수. 기본값 0 (제한 없이 무제한 대기 가능)
  enableKeepAlive: true, // MySQL 서버와의 TCP 연결에 Keep-Alive를 활성화할지 여부. O/S 레벨에서 TCP Keep-Alive packet을 주기적으로 전송해서 끊김 예방
  keepAliveInitialDelay: 0, // TCP Keep-Alive packet을 언제부터 보내기 시작할지 시간(ms) 설정. 기본값 0 (연결 생성 직후 바로 활성화하고 O/S 기본값 사용)
});

// 커넥션풀 대신 일반 커넥션을 생성해서 사용할 경우 아래 코드 사용
/* 
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
*/

// DB 설정 및 연결 테스트
/* 
async function dbTest() {
  const connection = await pool.getConnection(); // 일반 커넥션 사용하려면 이 문장 주석 처리

  try {
    const [results] = await connection.query(
      'SELECT * FROM contracts WHERE daily_cup_quantity >= ?',
      [300]
    );

    console.log(results);
    connection.release();
  } catch (err) {
    console.log(err);
  }
}

dbTest();
 */

async function getConnection() {
  return await pool.getConnection();
}

module.exports = { getConnection, pool };
