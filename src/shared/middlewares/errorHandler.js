const AuthError = require('../../errors/AuthError');
const DBError = require('../../errors/DBError');

// 공통 에러 처리 핸들러(미들웨어)
// ※ errorHandler Middleware로 등록해서 사용하려면 함수 시그니쳐가 반드시 (err, req, res, next)이어야 한다.
// 그래야 Express server가 에러 처리 미들웨어로 인식한다. errorHandler 함수 안에서 next 등을 사용하지 않더라도 마찬가지다.
function errorHandler(err, req, res, next) {

  const status = err.status || 500;
  const errorObject = {
    status,
    error: err.name,
    message: err.message || 'Internal Server error',
  };

  if (err instanceof AuthError) {
    errorObject.isLoggedIn = false;
  } else if (err instanceof DBError) {
    console.log('[DBError] query:', err.query); // 보안 때문에 SQL Query 정보는 백엔드에서만 로그로 확인
    console.log('[DBError] params:', err.params); // Binding Parameter (예: [id, status])
  }

  console.log('errorObject to send to FE:', errorObject);

  res.status(status).json(errorObject);

  // if (err instanceof AuthError) {
  //   return res.status(status).json({ status, message: err.message || 'Internal Server error', isLoggedIn: false });
  // }

  // res.status(status).json({ status, message: err.message || 'Internal Server error' });
}

module.exports = errorHandler;
