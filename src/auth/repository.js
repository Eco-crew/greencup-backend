// DB job
// Business Logic
const db = require('mysql'); // 패키지명부터 찾아봐야 한다.

// OAuth 기반 로그인
function oauthLogin({ provider }) {

  try {
    const user = repository.oauthLogin({ provider });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

function callback({ provider }) {

  try {
    const user = repository.callback({ provider });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

// 로컬 로그인
function login({ username, password }) {

  try {
    const user = repository.login({ username, password });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

function logout(req, _) {
  try {
    const user = repository.logout();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

// My page
function profile({ username, password }) {

  try {
    const user = repository.profile();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

module.exports = { oauthLogin, callback, login, logout, profile };
