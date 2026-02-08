// DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)
const db = require('../db/connection');


/**********************
 *  OAuth 기반 로그인  *
 **********************/
async function oauthLogin({ provider }) {
  // DB 쿼리 중 오류 발생시 오류는 Controller layer → Error Handler로 넘겨서 처리하므로 catch 블록 제외
  // 단, 리소스 반환 때문에 finally 구문은 사용
  let connection;

  try {
    // connection = await db.getConnection();

    // const user = await connection.execute();
    // return user;

  } finally { // 반드시 처리해야 하는 마무리 작업은, 오류 발생시에도 '반드시 실행되는' finally 블록 안에서 처리 (try finally 없으면 실행 보장 불가)
    if (connection) connection.release(); // DB 커넥션 사용 직후 커넥션풀에 커넥션을 반환함으로써 가용 리소스 확보 및 메모리 누수 방지
  }
}

async function callback({ provider }) {
  let connection;

  try {
    // connection = await db.getConnection();

    // const user = await connection.execute();
    // return user;

  } finally {
    if (connection) connection.release();
  }
}


/**********************
 *    로컬 로그인      *
 **********************/
// function findUserByLoginId({ userId, userType }) {
// 아직 프런트엔드와 조율되지 않아서, 기본값을 재사용 컵 사업자로 설정함으로써 인수가 없어도 실행되도록 했다.
async function findUserByLoginId({ username, userType = 'reuseOperator' }) {
  let connection;

  try {
    connection = await db.getConnection();

    const table = userType === 'reuseOperator' ? 'greencup_branches' : 'partners';
    const query = `
    SELECT id, manager_email, manager_name, password_hash
      FROM ${table}
     WHERE manager_email = ?
    `;

    const user = await connection.execute(query, username);
    return user;

  } finally {
    if (connection) connection.release();
  }
};

// 로컬 로그아웃 기능은 DB 작업이 없어서 service layer에서 세션만 처리


// My page
async function profile({ userId, password }) {
  // 인증 미들웨어 통과해서 왔는데도, 인수로 id, 비밀번호를 받아서 쿼리할 때 또 조건문에 넣어야 하나?
  let connection;

  try {
    connection = await db.getConnection();

    const table = userType === 'reuseOperator' ? 'greencup_branches' : 'partners';
    const query = `
    SELECT id, manager_email, manager_name, 기타 등등 (미완성)
      FROM ${table}
     WHERE manager_email = ? (미완성)
    `;

    const user = await connection.execute(query, userId);
    return user;

  } finally {
    if (connection) connection.release();
  }
};

module.exports = { oauthLogin, callback, findUserByLoginId, profile };
