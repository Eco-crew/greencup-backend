// DB job
const { connection } = require('../db/connection');

// OAuth 기반 로그인
function oauthLogin({ provider }) {

  try {
    const user = connection.execute();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

function callback({ provider }) {

  try {
    const user = connection.execute();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
}

// 로컬 로그인
function login({ username, password, userType }) {

  try {
    const table = userType === 'reuseOperator' ? 'greencup_branches' : 'partners';
    const query = `
    SELECT *
      FROM ${table}
     WHERE manager_email = ?
       `;
    const user = connection.execute();
    // ({ username, password });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

// 로컬 로그아웃 기능은 DB 작업이 없어서 service layer에서 처리
// function logout() {
// }

// My page
function profile({ username, password }) {

  try {
    const user = connection.execute();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ 'Server error': err });
  }
};

module.exports = { oauthLogin, callback, login, logout, profile };
