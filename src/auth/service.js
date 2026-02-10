// Business Logic
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true
});
const repository = require('./repository');
const AuthError = require('../errors/AuthError');
const AppError = require('../errors/AppError');

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_AUTH_REDIRECT_URI = process.env.NAVER_AUTH_REDIRECT_URI;

const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';
const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
const NAVER_USERINFO_URL = 'https://openapi.naver.com/v1/nid/me';

/**********************
 *  OAuth 기반 로그인  *
 **********************/
function oauthLogin({ provider, userType }) {
  // DB 쿼리 중 오류 발생시 오류는 Controller layer → Error Handler로 넘겨서 처리하므로
  // 중복 코드를 제외하고 간결하게 만들기 위해서 try ~ catch 블록 제외

  if (provider === 'naver') {
    return `${NAVER_AUTH_URL}?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_AUTH_REDIRECT_URI}&state=login&userType=${userType}`;
  }
}

async function callback({ code, state, userType }) {
  // const user = repository.callback({ provider });
  // return user;

  // 1. 네이버 로그인 페이지에서 사용자가 로그인 후 받아온 코드를 검증
  const tokenUrl = new URL(NAVER_TOKEN_URL);
  tokenUrl.search = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: NAVER_CLIENT_ID,
    client_secret: NAVER_CLIENT_SECRET,
    code: code,
    state: state
  });

  // 2. Callback URL 쿼리 파라미터를 통해서 받은 요청 정보를 조합해서 네이버에 Access Token 요청
  const token = await fetch(tokenUrl.toString());
  const tokenData = await token.json();
  console.log('Naver에 사용자 코드를 가지고 Access Token를 요청해서 받은 정보', tokenData);


  // 3. 네이버에서 코드 검증 후 발급해준 Access Token을 이용해서 사용자 정보 받아오기
  console.log('Naver에서 발급한 Access Token:', tokenData.access_token);
  const response = await fetch(NAVER_USERINFO_URL, {
    headers: {
      Authorization: `Bear                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      r ${tokenData.access_token}`
    }
  });

  if (!response.ok) {
    throw new AppError('OAuth 사용자 정보 요청 실패', response.status);
  }
  const oauthUserInfo = await response.json();
  if (!oauthUserInfo) {
    throw new AppError('OAuth 사용자 정보 오류', 500);
  }
  console.log('Access Token을 가지고 요청한 사용자 정보:', oauthUserInfo.response);

  // 4. 네이버에서 받아온 사용자 정보로 우리 홈페이지 회원인지 조회 (로컬 로그인 > findUserByLoginId 함수를 이용하여 처리 (공용 함수))
  const user = await repository.findUserByLoginId({ username: oauthUserInfo.response.email, userType }) || {};
  const { id, manager_email, manager_name } = user;

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
  const hash = password_hash?.toString() || DUMMY_HASH;
  const isValid = await bcrypt.compare(password, hash);

  if (!isValid) {
    throw new AuthError('아이디나 비밀번호가 맞지 않습니다.'); // 보안을 위해서 어느 것이 틀린지 정확한 정보를 제공하지 않음
  }
  return { id, manager_email, manager_name };
};

function logout({ session }) {
  if (!session?.user) {
    throw new AuthError('로그인되어 있지 않습니다.');
  }

  delete session.user;
};


// 로그인 상태 확인
function checkLogin({ session }) {
  if (!session?.user) {
    throw new AuthError('로그인되어 있지 않습니다.');
  }
  return true;
}


// My page
async function profile({ username, password }) {
  const user = await repository.profile();
  return user;
};

module.exports = { oauthLogin, callback, login, logout, checkLogin, profile };
