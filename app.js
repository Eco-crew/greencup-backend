const path = require('path');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
require('dotenv').config({ quiet: true }); // 환경 변수 이용
const errorHandler = require('./src/shared/middlewares/errorHandler'); // Error Handler
require('./src/reuse-operator/rental-requests-scheduler'); // 당일 대여 요청 자동 생성 스케쥴러
// Routers
const authRoute = require('./src/auth/route');
const reuseOperatorRoute = require('./src/reuse-operator/route');
const partnerRoute = require('./src/partner/route');

const app = express();
// const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false // `false` is useful for implementing login sessions, reducing server storage usage, or 생략
}));
app.use(morgan('dev'));


app.use(express.static('public')); // FE에서 npm run build (vite build)로 빌드한 정적 파일 제공

// Middleware - Routing
app.use('/api/auth', authRoute);
app.use('/api/reuse-operator', reuseOperatorRoute);
app.use('/api/partner', partnerRoute);


// Middleware - Error Handler (※ 모든 라우터 등록 후 마지막에 등록해야 함!)
app.use(errorHandler);

module.exports = { app };
