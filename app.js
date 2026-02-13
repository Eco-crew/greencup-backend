const path = require('path');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
require('dotenv').config({ quiet: true }); // 환경 변수 이용
const errorHandler = require('./src/shared/middlewares/errorHandler'); // Error Handler
// Routers
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
app.use('/api/auth', authRoute);
app.use('/api/reuse-operator', reuseOperatorRoute);
// app.use('/api/partner', partnerRoute);

// Middleware - Error Handler (※ 모든 라우터 등록 후 마지막에 등록해야 함!)
app.use(errorHandler);

module.exports = { app };
