// 공통 에러 처리 핸들러(미들웨어)
function errorHandler(err, req, res, next) {
  console.log(err);

  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}

module.exports = errorHandler;
