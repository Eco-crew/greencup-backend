// 엔티티별 요청 처리
const service = require('./service');

// OAuth 기반 로그인
function oauthLogin(req, res) {
  const { provider } = req.params;

  try {
    const user = service.oauthLogin({ provider });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

function callback(req, res) {
  const { provider } = req.params;

  try {
    const user = service.callback({ provider });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

// 로컬 로그인
function login(req, res) {
  const { username, password } = req.query;

  try {
    const user = service.login({ username, password });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

function logout(req, res) {
  try {
    const user = service.logout();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

// My page
function profile(req, res) {

  try {
    const user = service.profile();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

module.exports = { oauthLogin, callback, login, logout, profile };
