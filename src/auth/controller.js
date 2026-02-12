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
  // console.log(`(네이버) 로그인 페이지에서 사용자가 로그인 후 받아온 정보. code: ${code} / state: ${state}`);

  try {
    const user = await service.callback({ code, state, userType });

    if (user) {
      user.userType = userType;
      req.session.user = user;

      const entityURI = userType === 'reuseOperator' ? 'reuse-operator' : 'partner';
      res.redirect(`${process.env.REACT_SERVER_URL}/${entityURI}/requests`);
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

      res.json(user);
    }
  } catch (err) {
    next(err);
  }
};

function logout(req, res, next) {
  try {
    service.logout({ session: req.session });
    res.json({ success: '로그아웃 성공' });
  } catch (err) {
    next(err);
  }
};


// 로그인 상태 확인
function checkLogin(req, res, next) {
  try {
    const user = service.checkLogin({ session: req.session });
    res.json({ 'user': user, 'isLoggedIn': true, 'message': '로그인된 회원입니다' });
    // 로그인되어 있지 않으면 service 계층에서 던진 AuthError가 에러 처리 핸들러(미들웨어)로 넘어간다.
  } catch (err) {
    next(err);
  }
}

// My page
async function profile(req, res, next) {
  try {
    const user = await service.profile();
    res.json(user);
  } catch (err) {
    next(err);
    // console.log(err);
    // res.status(500).json({ 'Server error': err });
  }
};

//수거지점장- 업체목록 - 리스트
async function reuseOperatorPartnerList (req, res, next){
  const {partnerName, page, pageRowSize} = req.query;

  //로그인한 당사자인 수거지점장의 uuid를 가져옴
  const reuseOperatorId = req.session.user.id;

  try{
    const reusePartnerList = await service.reuseOperatorPartnerList(reuseOperatorId, Number(page), Number(pageRowSize) , partnerName);
    res.json(reusePartnerList);
  } catch(err){
    next(err);
  }

}

module.exports = { oauthLogin, callback, login, logout, checkLogin, profile, reuseOperatorPartnerList };
