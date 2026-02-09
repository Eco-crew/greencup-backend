const { app } = require('./app.js');
const { pool } = require('./src/db/connection'); // MySQL Connection Pool

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.URL}:${PORT}`);
});


// 서버 종료 이벤트 처리
const gracefulShutdown = async () => {
  console.log('Shutting down DB connection pool...');
  await pool.end(); // 커넥션 풀 내에 열려 있는 커넥션 모두 종료
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown); // Ctrl + C로 server.js 종료시
process.on('SIGTERM', gracefulShutdown); // 배포/종료 시그널
