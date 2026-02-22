const db = require('../db/connection');
const DBError = require('../errors/DBError');

/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// 수거지점장 - 요청 현황 목록: 전체 / 완료 / 미완료
async function getRequests({ startDate, endDate, partnerName, status, currentBranchId, limit, offset }) {
  let connection;

  const query = `
    SELECT
      dr.id AS requestId,
      dr.rented_cup_quantity AS needCount,
      dr.returned_cup_quantity AS returnCount,
      dr.lost_cup_quantity AS brokenLostCount,
      p.site_name AS partnerName,
      DATE_FORMAT(dr.deliver_by_time, '%H:%i') AS wantedVisitTime,
      dr.rental_date AS requestedDate,
      dr.status
    FROM daily_rentals dr
    JOIN partners p ON dr.partner_id = p.id
    WHERE dr.rental_date BETWEEN ? AND ?
    ${status ? `AND dr.status = ?` : ''}
    ${partnerName ? `AND p.site_name LIKE ?` : ''}
    AND dr.greencup_branch_id = ?
    ORDER BY dr.status, dr.rental_date ASC, dr.deliver_by_time DESC, dr.rented_cup_quantity DESC
    LIMIT ?
    OFFSET ?
    `;
  // 정렬 기준: 미완료 우선, 최근 일자 우선, 대여(배송) 시간이 이른 건 우선, 대여 시간이 같으면 대여 수량이 많은 업체 우선
  // binding parameter 형식: startDate or endDate = '2026-02-01'
  const args = [startDate, endDate, currentBranchId, limit.toString(), offset.toString()];
  // endpoint별 처리: /total 은 status 조건문과 인수 모두 제외하고, /complete 과 /incomplete 은 둘 다 추가
  if (status) args.splice(2, 0, status); // status 값이 있으면 위 args 배열 3번쨰 요소로 추가
  // partnerName 값이 있으면 위 args 배열에서 currentBranchId 요소 앞에 추가
  if (partnerName) args.splice(args.length - 3, 0, `%${partnerName}%`);
  // args.push(limit.toString());  // int 유형 변수를 그대로 넣었더니 connection.execute 문 실행시 MySQL 오류 발생. 문자열로 변환하니 해결됨
  // args.push(offset.toString()); // int 형도 문제 없어야 하는데, MySQL 드라이버 오류인 듯

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [results] = await connection.execute(query, args);
    return results;
    // cf. 조회 조건에 따라 결과가 없을 수도 있는 조회이므로, 결과가 없어서 빈 배열이 반환되어도 오류 아님 (cf. 빈 배열은 truthy)
  } catch (err) { // SQL 쿼리 실행이 실패한 예외 상황
    throw new DBError(err.message, query, args);
  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}

// 수거지점장 - 개별 요청 현황 (요청 한 건의 상세 페이지)
async function getRequestDetail({ requestId, currentBranchId }) {
  let connection;

  const query = `
    SELECT
      dr.id,
      dr.rented_cup_quantity AS needCount,
      dr.returned_cup_quantity AS returnCount,
      dr.lost_cup_quantity AS brokenLostCount,
      DATE_FORMAT(dr.deliver_by_time, '%H:%i') AS wantedVisitTime,
      dr.rental_date AS requestedDate,
      dr.status,
      dr.note AS memo,
      dr.partner_id AS partnerId,
      p.manager_email AS managerEmail,
      p.manager_name AS partnerManagerName,
      p.manager_nickname AS partnerManagerNickname,
      p.manager_phone_number,
      p.site_name AS partnerName,
      p.site_address AS partnerAddress,
      DATE_FORMAT(p.open_time, '%H:%i') AS partnerOperatingStart,
      DATE_FORMAT(p.close_time, '%H:%i') AS partnerOperatingEnd,
      p.closed_days,
      p.business_type AS businessType
      FROM daily_rentals dr
      JOIN partners p ON dr.partner_id = p.id
      WHERE dr.id = ?
      AND dr.greencup_branch_id = ?
    `;

  try {
    connection = await db.getConnection();
    const [result] = await connection.execute(query, [requestId, currentBranchId]);
    // 대여 요청 목록에서 특정 건을 선택해서 상세 정보를 조회하는 것이므로, 결과가 없으면 오류 상황
    if (result.length === 0) {
      throw new DBError('개별 요청 현황이 없습니다.', query, [id], 404);
    }

    return result[0] || null;
  } catch (err) {
    throw new DBError(err.message, query, [requestId, currentBranchId]);
  } finally {
    if (connection) connection.release();
  }
}

// 수거지점장 - 개별 요청 처리: 완료/미완료 처리
async function updateRequestStatus({ requestId, currentBranchId, status }) {
  let connection;

  const query = `
    UPDATE daily_rentals
    SET status = ?
    WHERE id = ?
    AND greencup_branch_id = ?
    `;

  try {
    connection = await db.getConnection();

    const [result] = await connection.execute(query, [status, requestId, currentBranchId]);
    return (result.affectedRows == 1);
  } catch (err) {
    throw new DBError(err.message, query, [status, requestId, currentBranchId]);
  } finally {
    if (connection) connection.release();
  }
}

// 수거지점장 - 개별 요청 처리: 파손 및 분실 처리
async function updateRequestCupQuantity({ requestId, currentBranchId, brokenLostCount }) {
  let connection;

  const query = `
    UPDATE daily_rentals
    SET lost_cup_quantity = ?,
        returned_cup_quantity = rented_cup_quantity - lost_cup_quantity
    WHERE id = ?
    AND greencup_branch_id = ?
    `;

  try {
    connection = await db.getConnection();

    const [result] = await connection.execute(query, [brokenLostCount, requestId, currentBranchId]);
    return (result.affectedRows == 1);
  } catch (err) {
    throw new DBError(err.message, query, [brokenLostCount, requestId, currentBranchId]);
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
      JOIN greencup_branches g ON p.greencup_branch_id = g.id 
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
      JOIN greencup_branches g ON p.greencup_branch_id = g.id 
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
            DATE_FORMAT(p.open_time, '%H:%i') AS open_time,
              DATE_FORMAT(p.close_time, '%H:%i') AS close_time,
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
      DATE_FORMAT(deliver_by_time, '%H:%i') AS deliver_by_time,
        DATE_FORMAT(contract_start_date, '%Y-%m-%d') AS contract_start_date,
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
      SELECT DATE_FORMAT(closed_date, '%Y-%m-%d') AS closed_date
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
async function reuseOperatorPartnerStatsPeriodTotal(reuseOperatorId, startDate, queryEndDate) {
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
      WHERE d.rental_date >= ? AND d.rental_date < ?
      AND d.status = 'complete'
      AND d.greencup_branch_id = ?
      GROUP BY p.business_type;
    ` ;

    const [periodTotal] = await connection.query(query, [startDate, queryEndDate, reuseOperatorId]);
    return periodTotal || null;
  } finally {
    if (connection) connection.release();
  }


}


module.exports = {
  getRequests,
  getRequestDetail,
  updateRequestStatus,
  updateRequestCupQuantity,
  reuseOperatorPartnerList,
  reuseOperatorPartnerListCount,
  reuseOperatorPartnerDetailWithDaily,
  reuseOperatorPartnerDetailWithContracts,
  reuseOperatorPartnerDetailWithSpecialClosed,
  reuseOperatorPartnerStatsCurrentTotal,
  reuseOperatorPartnerStatsPeriodTotal
};
