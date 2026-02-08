// Authentication(회원 인증), Authorization(권한 인가)
function checkLogin(req, res, next) {
  // Guard clause (조건에 안 맞으면 조기 반환. "Fail fast, return early")
  if (!req.session.user) return res.status(401).json('message: 접근 권한이 없습니다');

  next();
}

module.exports = { checkLogin };
