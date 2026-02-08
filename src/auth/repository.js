// DB job
const { connection } = require('../db/connection');


/**********************
 *  OAuth 기반 로그인  *
 **********************/
function oauthLogin({ provider }) {

  // DB 쿼리 중 오류 발생시 오류는 Controller layer로 넘겨서 처리하므로 catch 블록 제외. 단, 리소스 반환 때문에 finally 구문은 사용
  try {
    const user = connection.execute();
    res.json(user);
  } finally { // 반드시 처리해야 하는 마무리 작업은, 오류 발생시에도 '반드시 실행되는' finally 블록 안에서 처리 (try finally 없으면 실행 보장 불가)
    connection.release(); // DB 커넥션 사용 직후 커넥션풀에 커넥션을 반환함으로써 가용 리소스 확보 및 메모리 누수 방지
  }
}

function callback({ provider }) {

  try {
    const user = connection.execute();
    res.json(user);
  } finally {
    connection.release();
  }
}


/**********************
 *    로컬 로그인      *
 **********************/
function findUserByLoginId({ userId, userType }) {

  try {
    const table = userType === 'reuseOperator' ? 'greencup_branches' : 'partners';
    const query = `
    SELECT id, manager_email, manager_name, password_hash
      FROM ${table}
     WHERE manager_email = ?
    `;

    const user = connection.execute(query, userId);
    return user;

  } finally {
    connection.release();
  }
};

// 로컬 로그아웃 기능은 DB 작업이 없어서 service layer에서 처리


// My page
function profile({ username, password }) {

  try {
    const user = connection.execute();
    return user;

  } finally {
    connection.release();
  }
};

module.exports = { oauthLogin, callback, findUserByLoginId, profile };
