// Business Logic
const bcrypt = require('bcrypt');
const repository = require('./repository');
const AuthError = require('../errors/AuthError');


/**********************
 *  OAuth 기반 로그인  *
 **********************/
function oauthLogin({ provider }) {
  // DB 쿼리 중 오류 발생시 오류는 Controller layer → Error Handler로 넘겨서 처리하므로
  // 중복 코드를 제외하고 간결하게 만들기 위해서 try ~ catch 블록 제외
  const code = repository.oauthLogin({ provider });
  return code;
}

function callback({ provider }) {
  const user = repository.callback({ provider });
  return user;
}


/**********************
 *    로컬 로그인      *
 **********************/
async function login({ username, password, userType }) {

  const user = await repository.findUserByLoginId({ username, userType }) || {}; // 결과값이 없을 때 구조분해할당 오류 방지용 빈 객체
  const { id, manager_email, manager_name, password_hash } = user;

  // Timing attack 예방용 더미 해시 이용 (bcrypt hash, salt rounds (cost factor): 11)
  // 사용자 ID가 존재할 때만 bcrypt.compare 함수를 실행하면, 존재하지 않을 때와 처리 속도가 달라져서 해커가 ID 존재 여부 추측 가능
  // 그러므로 존재하지 않을 때에도 더미 해시를 가지고 compare 함수를 실행해서 로그인 처리 속도를 비슷하게 맞춤으로써, 해커 공격 예방
  const DUMMY_HASH = '$2b$11$00000000000000000000000000000000000000000000000000000';
  const hash = password_hash.toString() || DUMMY_HASH;
  const isValid = await bcrypt.compare(password, hash);

  if (!isValid) {
    throw new AuthError('아이디나 비밀번호가 맞지 않습니다.'); // 보안을 위해서 어느 것이 틀린지 정확한 정보를 제공하지 않음
  }
  return { id, manager_email, manager_name };
};

function logout(session) {
  if (!session?.user) {
    throw new AuthError('로그인되어 있지 않습니다.');
  }

  delete session.user;
};


// My page
async function profile({ username, password }) {
  const user = await repository.profile();
  return user;
};

module.exports = { oauthLogin, callback, login, logout, profile };
