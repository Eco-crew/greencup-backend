// DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)
const connection = require('../db/connection').getConnection();
























































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

//수거지점장- 업체관리 - 상세페이지- dailyrentals와 partners 조인
async function reuseOperatorPartnerDetailWithDaily(partnerId) {
  let connection;

  try {
    connection = await db.getConnection();

    const query = `
      SELECT d.partner_id AS partner_id,
      p.site_name AS site_name,
      p.manager_name AS manager_name,
      p.manager_phone_number AS manager_phone_number,
      p.open_time AS open_time,
      p.close_time AS close_time,
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

//수거지점장- 업체관리 - 상세페이지- contracts


module.exports = { reuseOperatorPartnerList, reuseOperatorPartnerListCount };