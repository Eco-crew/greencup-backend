// Business Logic
const repository = require('./repository');

// OAuth 기반 로그인
function oauthLogin({ provider }) {

  try {
    const code = repository.oauthLogin({ provider });
    return code;
  } catch (err) {
    console.log(err);
  }
}

function callback({ provider }) {

  try {
    const user = repository.callback({ provider });
    return user;
  } catch (err) {
    console.log(err);
  }
}

// 로컬 로그인
function login({ username, password, userType }) {

  try {
    const user = repository.login({ username, password, userType });
    return user;
  } catch (err) {
    console.log(err);
  }
};

function logout(session) {
  try {
    if (!session?.user) {
      return;
    }
    delete session.user;
  } catch (err) {
    console.log(err);
    throw new Error('login error:', err);
  }
};

// My page
function profile({ username, password }) {

  try {
    const user = repository.profile();
    return user;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { oauthLogin, callback, login, logout, profile };
