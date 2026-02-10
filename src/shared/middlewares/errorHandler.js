const AuthError = require('../errors/AuthError');

// 공통 에러 처리 핸들러(미들웨어)
// ※ errorHandler Middleware로 등록해서 사용하려면 함수 시그니쳐가 반드시 (err, req, res, next)이어야 한다.
// 그래야 Express server가 에러 처리 미들웨어로 인식한다. errorHandler 함수 안에서 next 등을 사용하지 않더라도 마찬가지다.
function errorHandler(err, req, res, next) {
  console.log(err);

  if (err instanceof AuthError) {
    return res.status(err.status).json({ isLoggedIn: false, message: err.message });
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal Server error' });
}

module.exports = errorHandler;
