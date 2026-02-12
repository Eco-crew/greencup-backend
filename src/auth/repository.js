// DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)
const db = require('../db/connection');


/**********************
 *    로컬 로그인      *
 **********************/
// DB 쿼리 중 오류 발생시 오류는 Controller layer → Error Handler로 넘겨서 처리하므로 catch 블록 제외
// 단, 리소스 반환 때문에 finally 구문은 사용
// function findUserByLoginId({ userId, userType }) {
async function findUserByLoginId({ username, userType = 'reuseOperator' }) { // userType 기본값: 재사용 컵 사업자
  let connection;

  try {
    connection = await db.getConnection();

    const table = userType === 'reuseOperator' ? 'greencup_branches' : 'partners';
    const query = `
    SELECT id, manager_email, manager_name, password_hash
      FROM ${table}
     WHERE manager_email = ?
    `;

    const [user] = await connection.execute(query, [username]); // execute 함수 2번째 인수, 반환값 모두 배열 형태로 받아야 함
    return user[0] || null; // 위에서 쿼리 결과가 없으면 빈 배열이 할당되는데, 빈배열[0]은 undefined 이므로 가독성을 위해서 null로 변환

  } finally { // 반드시 처리해야 하는 마무리 작업은, 오류 발생시에도 '반드시 실행되는' finally 블록 안에서 처리 (try finally 없으면 실행 보장 불가)
    if (connection) connection.release(); // DB 커넥션 사용 직후 커넥션풀에 커넥션을 반환함으로써 가용 리소스 확보 및 메모리 누수 방지
  }
};


// My page
async function profile({ username, password }) {
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

    const [user] = await connection.execute(query, [username]);
    return user[0] || null;

  } finally {
    if (connection) connection.release();
  }
};

//수거지점장- 업체목록 - 리스트- 페이지네이션
async function reuseOperatorPartnerList(reuseOperatorId, page, pageRowSize, partnerName) {
  const limitCount = pageRowSize;
  const offsetCount = (page - 1) * limitCount;

  let connection;

  try {
    connection = await db.getConnection();

    let partnerNamequery = ``;
    const changedPartnerName = (partnerName ?? "").trim();
    //업체이름을 검색 조건에 넣었으면 
    if (changedPartnerName) {
      partnerNamequery = `AND p.site_name LIKE ? `;
    }

    //execute() → 서버 prepared statement → LIMIT 파라미터가 DB 버전에 따라 문제 가능
    //query() → 클라이언트 치환 후 전송 → LIMIT 항상 안정
    const query = `
      SELECT d.partner_id AS partner_id,
      p.site_name AS site_name,
      p.manager_name AS manager_name,
      SUM(d.rented_cup_quantity)  AS rented_sum,
      SUM(d.returned_cup_quantity) AS returned_sum,
      SUM(d.lost_cup_quantity)    AS lost_sum 
      FROM partners p 
      JOIN greencup_branches g ON p.greencup_branch_id=g.id 
      JOIN daily_rentals d ON d.partner_id = p.id 
      WHERE g.id = ? 
    ` + partnerNamequery
      + `GROUP BY d.partner_id LIMIT ? OFFSET ? `;


    let result;
    //업체이름을 검색 조건에 넣었으면 
    if (changedPartnerName) {
      console.log("LIST PARAMS", [reuseOperatorId, `%${changedPartnerName}%`, limitCount, offsetCount]);
      console.log(query);
      console.log(typeof limitCount, limitCount);
      console.log(typeof offsetCount, offsetCount);
      const [partnerList] = await connection.query(query, [reuseOperatorId, `%${changedPartnerName}%`, limitCount, offsetCount]);
      result = partnerList;
    } else {
      console.log("LIST PARAMS", [reuseOperatorId, limitCount, offsetCount]);
      console.log(query);
      console.log(typeof limitCount, limitCount);
      console.log(typeof offsetCount, offsetCount);
      const [partnerList] = await connection.query(query, [reuseOperatorId, limitCount, offsetCount]);
      result = partnerList;
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
}

//수거지점장- 업체목록 - 리스트- 전체개수
async function reuseOperatorPartnerListCount(reuseOperatorId, partnerName) {
  let connection;

  try {
    connection = await db.getConnection();

    let partnerNamequery = ``;
    const changedPartnerName = (partnerName ?? "").trim();
    //업체이름을 검색 조건에 넣었으면 
    if (changedPartnerName) {
      partnerNamequery = `AND p.site_name LIKE ? `;
    }

    const query = `
      SELECT COUNT(DISTINCT d.partner_id) AS result_count
      FROM partners p 
      JOIN greencup_branches g ON p.greencup_branch_id=g.id 
      JOIN daily_rentals d ON d.partner_id = p.id 
      WHERE g.id = ? 
    ` + partnerNamequery;

    let result;
    //업체이름을 검색 조건에 넣었으면 
    if (changedPartnerName) {
      const [count] = await connection.query(query, [reuseOperatorId, `%${changedPartnerName}%`]);
      result = count[0]["result_count"] || null;
    } else {
      const [count] = await connection.query(query, [reuseOperatorId]);
      result = count[0]["result_count"] || null;
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { findUserByLoginId, profile, reuseOperatorPartnerList, reuseOperatorPartnerListCount };
