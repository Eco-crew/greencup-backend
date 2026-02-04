const path = require('path');
const express = require('express');
const morgan = require('morgan');
require('dotenv').config(); // 환경 변수 이용

// Router
const authRoute = require('./src/auth/route');
const reuseOperatorRoute = require('./src/reuse-operator/route');
const partnerRoute = require('./src/partner/route');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
// app.use(express.static('public')); // frontend가 있어서 필요 없을 듯
app.use(morgan('dev'));

// Middleware - Routing
app.use('/', authRoute);
app.use('/', reuseOperatorRoute);
app.use('/', partnerRoute);


app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.URL}:${PORT}`);
});
