// DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)
//const connection = require('../db/connection').getConnection();
const db = require('../db/connection');






















































/**
 *  수거지점장- 업체관리 영역
*/

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

//수거지점장-통계- 수거지점의 현재개수 조회
async function reuseOperatorPartnerStatsCurrentTotal(reuseOperatorId) {
  let connection;

  try {
    connection = await db.getConnection();

    const query = `
      SELECT total_cup_quantity, available_cup_quantity, lost_cup_quantity
      FROM greencup_branches
      WHERE id = ?
    ` ;

    const [currentTotal] = await connection.query(query, [reuseOperatorId]);
    return currentTotal[0] || null;
  } finally {
    if (connection) connection.release();
  }

}

//수거지점-통계- 업체지점들의 기간별 대여개수
async function reuseOperatorPartnerStatsPeriodTotal(reuseOperatorId, startDate, endDate) {
  let connection;

  try {
    connection = await db.getConnection();

    //MySQL에서 TIMESTAMP(또는 DATETIME) 컬럼은
    //문자열 'yyyy-mm-dd' 형태와 비교하면 자동으로 시간은 00:00:00으로 간주되어 비교
    //이때 daily_rentals에서 completed 된것만 고른다
    const query = `
      SELECT SUM(d.rented_cup_quantity) AS rented_cup_quantity , SUM(d.returned_cup_quantity) AS returned_cup_quantity , SUM(d.lost_cup_quantity) AS lost_cup_quantity, p.business_type AS business_type
      FROM daily_rentals d
      JOIN partners p ON d.partner_id =  p.id
      WHERE d.rental_date >= ? AND d.rental_date <= ?
      AND d.status = 'complete'
      AND d.greencup_branch_id = ?
      GROUP BY p.business_type;
    ` ;

    const [periodTotal] = await connection.query(query, [startDate, endDate, reuseOperatorId]);
    return periodTotal || null;
  } finally {
    if (connection) connection.release();
  }

  
}

module.exports = { reuseOperatorPartnerList, reuseOperatorPartnerListCount, reuseOperatorPartnerDetailWithDaily, reuseOperatorPartnerDetailWithContracts, reuseOperatorPartnerDetailWithSpecialClosed, reuseOperatorPartnerStatsCurrentTotal, reuseOperatorPartnerStatsPeriodTotal };