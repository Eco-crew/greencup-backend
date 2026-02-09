// 엔티티별 요청(HTTP Request) 처리
const service = require('./service');


/**********************
 *  OAuth 기반 로그인  *
 **********************/
function oauthLogin(req, res) {
  const { provider } = req.params;

  try {
    const user = service.oauthLogin({ provider });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

function callback(req, res) {
  const { provider } = req.params;

  try {
    const user = service.callback({ provider });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}


/**********************
 *    로컬 로그인      *
 **********************/
async function login(req, res, next) {
  const { username, password, userType } = req.body;

  try {
    const user = await service.login({ username, password, userType });
    if (user) {
      user.userType = userType;
      req.session.user = user;

      return res.status(200).json(user);
    }
  } catch (err) {
    next(err); // Error Handler가 오류를 처리하도록 위임
  }
};

function logout(req, res) {
  try {
    service.logout({ session: req.session });
    res.status(200).json({ message: 'logged out' });
  } catch (err) {
    // res.status(500).json({ 'Server error': err });
    next(err);
  }
};


// 로그인 상태 확인
function checkLogin(req, res) {
  try {
    const isLoggedIn = service.checkLogin({ session: req.session });
    res.status(200).json({ isLoggedIn, 'message': '로그인된 회원입니다' }); // 로그인되어 있지 않으면 service 계층에서 던진 AuthError가 에러 처리 핸들러(미들웨어)로 넘어간다.
  } catch (err) {
    next(err);
  }
}

// My page
async function profile(req, res) {

  try {
    const user = await service.profile();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

module.exports = { oauthLogin, callback, login, logout, checkLogin, profile };
