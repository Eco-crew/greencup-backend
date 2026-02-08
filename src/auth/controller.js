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
function login(req, res) {
  const { userId, password, userType } = req.body;

  try {
    const user = service.login({ userId, password, userType });
    if (user) {
      user.userType = userType;
      return res.status(200).json(user);
    }
    res.status(404).json('user');

  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

function logout(req, res) {
  try {
    service.logout({ session: req.session });
    res.status(200).json({ message: 'logged out' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};


// My page
function profile(req, res) {

  try {
    const user = service.profile();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

module.exports = { oauthLogin, callback, login, logout, profile };
