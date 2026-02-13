// DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)
//const connection = require('../db/connection').getConnection();
const db = require('../db/connection');


/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// 대여 요청 정보
// id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin, -- UUID. 의미 있는 문자열이 아니라서 utf8mb4_bin으로 오버라이드 (byte 단위 비교)
// rented_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 대여 컵 개수
// returned_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 반납 컵 개수 (다음 날에 그린컵 관리자가 '완료' 처리할 때 업데이트 됨)
// lost_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 분실 컵 개수 (")
// rental_date DATE NOT NULL,
// deliver_by_time TIME NOT NULL,
// greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
// partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
// status ENUM('incomplete', 'complete', 'cancelled') NOT NULL Default 'incomplete', -- 미완료 상태인 요청이 더 위에 정렬되도록 변경 (우선순위 ↑)
// note VARCHAR(128), -- 비고

async function getRequests({ startDate, endDate, status, pageRowSize, page }) {
  let connection;

  try {
    connection = await db.getConnection();
    const query = `
      SELECT
        dr.rented_cup_quantity,
        dr.returned_cup_quantity,
        dr.lost_cup_quantity,
        p.site_name,
        dr.deliver_by_time,
        dr.rental_date,
        dr.status
      FROM daily_rentals dr
      JOIN partners p ON dr.partner_id = p.id
      WHERE dr.rental_date BETWEEN ? AND ?
      ${status ? `AND dr.status = ${status}` : ''}
      ORDER BY dr.status, dr.rental_date ASC, dr.deliver_by_time DESC, dr.rented_cup_quantity DESC
      LIMIT ?
      OFFSET ?
    `;
    // 정렬 기준: 미완료 우선, 최근 일자 우선, 대여(배송) 시간이 이른 건 우선, 대여 시간이 같으면 대여 수량이 많은 업체 우선
    // 형식 예시: startDate or endDate = '2026-02-01' / status = 'complete' or 'incomplete' / pageRowSize = 10 / page=1
    const result = await connection.execute(query, [startDate, endDate, status, pageRowSize, page]);
    return result || null;

  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}

async function getRequestDetail(req, res) {
  let connection;

  try {
    connection = await db.getConnection();

    // 제휴업체 정보
    // manager_email VARCHAR(32) NOT NULL UNIQUE, -- email (Login ID). 중복 가입 불허
    // manager_name VARCHAR(4),
    // manager_nickname VARCHAR(16), -- 관리자 별명 (이름과 별명중 하나는 꼭 있어야 한다)
    // manager_phone_number VARCHAR(12) NOT NULL,
    // site_name VARCHAR(32) NOT NULL, -- 사업장명(지점일 경우 지점명. 업종이 다양해서 '사업장'이라고 칭함)
    // site_address VARCHAR(64) NOT NULL,
    // open_time TIME NOT NULL, -- 영업 시작 시간
    // close_time TIME NOT NULL, -- 영업 종료 시간
    // closed_days TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 정기 휴일. 1bit 정수형에 & 연산자로 bit 연산. 예) 01000000 (10진수 64) = 월, 00000011 (10진수 3) = 토일
    // business_type ENUM('office', 'public', 'cafe', 'event') NOT NULL Default 'office',

    // 대여 요청 정보
    // id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin, -- UUID. 의미 있는 문자열이 아니라서 utf8mb4_bin으로 오버라이드 (byte 단위 비교)
    // rented_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 대여 컵 개수
    // returned_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 반납 컵 개수 (다음 날에 그린컵 관리자가 '완료' 처리할 때 업데이트 됨)
    // lost_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 분실 컵 개수 (")
    // rental_date DATE NOT NULL,
    // deliver_by_time TIME NOT NULL,
    // greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
    // partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
    // status ENUM('incomplete', 'complete', 'cancelled') NOT NULL Default 'incomplete', -- 미완료 상태인 요청이 더 위에 정렬되도록 변경 (우선순위 ↑)
    // note VARCHAR(128), -- 비고

    const query = `
      SELECT *
      FROM daily_rentals dr
      JOIN partners p ON dr.partner_id = p.id
      WHERE dr.rental_date = ?
    `;

    const result = await connection.execute(query, []);
    return result || null;

  } finally {
    if (connection) connection.release();
  }
}

async function updateRequest(req, res) {
  let connection;

  try {
    connection = await db.getConnection();
    const query = `
      UPDATE daily_rentals
         SET status = ?
       WHERE id? = ?
    `;

    const result = await connection.execute(query, []);
    return result || null;

  } finally {
    if (connection) connection.release();
  }
}


/****************************************************************************************************
 *  수거지점장 - 업체관리                                                                             *
 ****************************************************************************************************/

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

//수거지점장- 업체관리 - 상세페이지- dailyrentals와 partners 조인 - 업체정보와 업체 대여 정보
async function reuseOperatorPartnerDetailWithDaily(partnerId) {
  let connection;

  try {
    connection = await db.getConnection();

    const query = `
      SELECT d.partner_id AS partner_id,
      p.site_name AS site_name,
      p.manager_name AS manager_name,
      p.manager_phone_number AS manager_phone_number,
      DATE_FORMAT(p.open_time,'%H:%i') AS open_time,
      DATE_FORMAT(p.close_time,'%H:%i') AS close_time,
      p.site_address AS site_address,
      p.closed_days AS closed_days,
      SUM(d.rented_cup_quantity)  AS rented_sum,
      SUM(d.returned_cup_quantity) AS returned_sum,
      SUM(d.lost_cup_quantity)    AS lost_sum 
      FROM partners p 
      JOIN daily_rentals d ON d.partner_id = p.id 
      WHERE p.id = ?
    ` ;

    const [partner] = await connection.query(query, [partnerId]);
    return partner[0] || null;
  } finally {
    if (connection) connection.release();
  }
}

//수거지점장- 업체관리 - 상세페이지- contracts - 기본대여정보
async function reuseOperatorPartnerDetailWithContracts(partnerId) {
  let connection;

  try {
    connection = await db.getConnection();

    const query = `
      SELECT daily_cup_quantity,
      DATE_FORMAT(deliver_by_time,'%H:%i') AS deliver_by_time,
      DATE_FORMAT(contract_start_date,'%Y-%m-%d') AS contract_start_date,
      note
      FROM contracts
      WHERE partner_id = ?
    ` ;

    const [partner] = await connection.query(query, [partnerId]);
    return partner[0] || null;
  } finally {
    if (connection) connection.release();
  }
}

//수거지점장- 업체관리 - 상세페이지- special_closed_dates - 비정기휴무 데이터 받기 
async function reuseOperatorPartnerDetailWithSpecialClosed(partnerId) {
  let connection;

  try {
    connection = await db.getConnection();

    const query = `
      SELECT DATE_FORMAT(closed_date,'%Y-%m-%d') AS closed_date
      FROM special_closed_dates
      WHERE partner_id = ?
    ` ;

    const [closedDates] = await connection.query(query, [partnerId]);
    return closedDates || null;
  } finally {
    if (connection) connection.release();
  }
}


module.exports = {
  getRequests,
  getRequestDetail,
  updateRequest,
  reuseOperatorPartnerList,
  reuseOperatorPartnerListCount,
  reuseOperatorPartnerDetailWithDaily,
  reuseOperatorPartnerDetailWithContracts,
  reuseOperatorPartnerDetailWithSpecialClosed
};
