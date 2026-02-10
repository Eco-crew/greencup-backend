// 엔티티별 요청(HTTP Request) 처리
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true
});
const service = require('./service');


/**********************
 *  OAuth 기반 로그인  *
 **********************/
function oauthLogin(req, res, next) { // ※ errorHandler Middleware를 사용하려면 함수 시그니쳐에 next 매개변수 필수
  const { provider } = req.params;
  const { userType } = req.query;

  try {
    // OAuth provider 별 로그인 페이지로 연결
    const authURL = service.oauthLogin({ provider, userType })
    res.redirect(authURL);
  } catch (err) {
    next(err); // Error Handler가 오류를 처리하도록 위임
  }
}

async function callback(req, res, next) {
  const { code, state, userType } = req.query;
  console.log(`(네이버) 로그인 페이지에서 사용자가 로그인 후 받아온 정보. code: ${code} / state: ${state}`);

  try {
    const user = await service.callback({ code, state });

    if (user) {
      user.userType = userType;
      req.session.user = user;

      const entityURI = userType === 'reuseOperator' ? 'reuse-operator' : 'partner';
      res.status(302).redirect(`${process.env.REACT_SERVER_URL}/${entityURI}/requests`);

      // return res.status(200).json(user);
    }
  } catch (err) {
    next(err);
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
    next(err);
  }
};

function logout(req, res, next) {
  try {
    service.logout({ session: req.session });
    res.status(200).json({ message: 'logged out' });
  } catch (err) {
    next(err);
  }
};


// 로그인 상태 확인
function checkLogin(req, res, next) {
  try {
    const isLoggedIn = service.checkLogin({ session: req.session });
    res.status(200).json({ isLoggedIn, 'message': '로그인된 회원입니다' }); // 로그인되어 있지 않으면 service 계층에서 던진 AuthError가 에러 처리 핸들러(미들웨어)로 넘어간다.
  } catch (err) {
    next(err);
  }
}

// My page
async function profile(req, res, next) {

  try {
    const user = await service.profile();
    res.status(200).json(user);
  } catch (err) {
    next(err);
    // console.log(err);
    // res.status(500).json({ 'Server error': err });
  }
};

module.exports = { oauthLogin, callback, login, logout, checkLogin, profile };
