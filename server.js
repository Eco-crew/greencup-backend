const path = require('path');
const express = require('express');
const session = require('express-session');
const pool = require('./src/db/connection'); // MySQL Connection Pool
const morgan = require('morgan');
require('dotenv').config({ quiet: true }); // 환경 변수 이용

// Router
const authRoute = require('./src/auth/route');
const reuseOperatorRoute = require('./src/reuse-operator/route');
const partnerRoute = require('./src/partner/route');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
// app.use(express.static('public')); // frontend가 있어서 필요 없을 듯
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false // `false` is useful for implementing login sessions, reducing server storage usage, or 생략
}));
app.use(morgan('dev'));

// Middleware - Routing
app.use('/', authRoute);
app.use('/', reuseOperatorRoute);
app.use('/', partnerRoute);


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
