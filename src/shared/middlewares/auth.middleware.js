// Authentication(회원 인증), Authorization(권한 인가)
function checkLogin(req, res, next) {
  if (req.session.user) return next();

  res.status(403).json('message: 접근 권한이 없습니다');
}

module.exports = { checkLogin };
