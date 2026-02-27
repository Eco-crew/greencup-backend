const db = require('../db/connection');
const DBError = require('../errors/DBError');

/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// 수거지점장 - 요청 현황 목록: 전체 / 완료 / 미완료
async function getRequests({ startDate, endDate, partnerName, status, currentBranchId, limit, offset }) {
  let connection;

  // FE 페이지네이션, 진행율(Progress bar) 표시 등을 위한 상태별 레코드 개수 집계 쿼리
  const countQuery = `
    SELECT dr.status, COUNT(*) AS count
    FROM daily_rentals dr
    JOIN partners p ON dr.partner_id = p.id
    WHERE dr.rental_date BETWEEN ? AND ?
    ${partnerName ? `AND p.site_name LIKE ?` : ''}
    AND dr.greencup_branch_id = ?
    GROUP BY dr.status;
    `;
  // ${status ? `AND dr.status = ?` : ''}
  // 레코드 쿼리와 대여일자 및 제휴업체명 조회 조건 동일. status별로 그룹화해서 상태별 레코드 개수 집계
  // LIMIT/OFFSET을 적용하지 않음으로써 (페이지네이션) 페이지 이동 중에도 동일한 진행율 표시 (적용하면 페이지별로 진행률이 달라진다.)

  // 실제 레코드 쿼리
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

  // const args = [startDate, endDate, currentBranchId, limit.toString(), offset.toString()];
  const args = [startDate, endDate];
  // endpoint별 처리: /total 은 status 조건문과 인수 모두 제외하고, /complete 과 /incomplete 은 둘 다 추가
  if (partnerName) args.push(`%${partnerName}%`); // partnerName 값이 있으면 args 배열 끝에 추가
  args.push(currentBranchId);

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [countRows] = await connection.execute(countQuery, args); // status 별 요청 건수 배열
    // console.log('repository.js → countRows:', countRows);

    if (status) args.splice(2, 0, status); // status 값이 있으면 args 배열 3번째 요소로 추가
    args.push(limit.toString());
    args.push(offset.toString());
    // console.log('repository.js → args:', args);

    // 조회 조건에 맞는 요청 건수가 존재할 때만 요청 목록 쿼리
    // 즉, countQuery 개수가 0이면 데이터 쿼리를 실행하지 않음으로써 지연 감소 및 리소스 절약 (DB server disk I/O)
    // const [rows] = (totalCount > 0) ? await connection.execute(query, args) : [[]];
    const [rows] = (countRows.length > 0) ? await connection.execute(query, args) : [[]];
    // console.log('repository.js → rows:', rows);

    return { rows: rows ?? [], countRows };
    // return { rows: rows ?? [], totalCount: totalCount };

    // cf. 조회 조건에 따라 결과가 없을 수도 있는 조회이므로, 결과가 없어서 rows에 빈 배열이 반환되어도 오류 아님
  } catch (err) { // SQL 쿼리 실행이 실패한 예외 상황
    throw new DBError(err.message, err.sql, args);
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
    return result.affectedRows == 1;
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
    return result.affectedRows == 1;
  } catch (err) {
    throw new DBError(err.message, query, [brokenLostCount, requestId, currentBranchId]);
  } finally {
    if (connection) connection.release();
  }
}

// (수거지점장) 당일 대여 요청 자동 생성
async function generatePartnerDailyRequests() {
  let connection;

  // 1. 오늘이 정기 휴일인 제휴업체는 당일 대여 요청을 생성하지 않는다.
  // (주당 평균 빈도수 1~2회로 가장 많이 발생하는 휴일이므로, 이 조건으로 우선 필터링해서 휴일 제휴업체 제외)

  // 2. 오늘이 비정기 휴일인 제휴업체도 당일 대여 요청을 생성하지 않는다.
  // 비정기 휴일 테이블은 history 테이블의 성격을 띄어서 운영 기간이 길어질수록 레코드가 많아질테니,
  // (partner_id로 조인하면 제휴업체별로 그동안의 비정기 휴일 전부와 연결되므로)
  // contract 테이블과 조인하지 말고 별개의 단일 쿼리 또는 아래 3에서 FROM 다음에 contract 대신 서브 쿼리로 사용하는 게 낫겠다.
  // 특별한 일이 없는 대부분의 제휴업체는 1년에 몇 회 발생하지 않을 거라, 발생 빈도수가 낮아서 이 조건은 후순위 필터링

  // 3. 위 1, 2로 필터링해서 남은 제휴업체 중 계약기간이 만료되지 않은 업체에 한해서 당일 대여 요청을 생성

  // 일단은 위 방식처럼 여러 번 쿼리를 나눠서 필터링하지 않고, 서브쿼리를 이용한 긴 쿼리문 한 개를 생성해서 처리
  // 위 방식대로 1번 필터 적용 → 2번 필터 적용 후 결과로 받은 제휴업체 목록을 가지고, 계약 정보를 읽어와서 처리하는 방식과
  // 비교했을 때 어떤 방식이 나을지는 추후 고민해봐야겠다.
  const query = `
    INSERT INTO daily_rentals(
      id,
      rented_cup_quantity,
      rental_date,
      deliver_by_time,
      greencup_branch_id,
      partner_id,
      STATUS,
      note
      )
    SELECT
      UUID(),
      daily_cup_quantity,
      CURDATE(),
      deliver_by_time,
      greencup_branch_id,
      partner_id,
      'incomplete',
      note
    FROM contracts
    WHERE CURDATE() <= contract_end_date
    AND partner_id IN (SELECT id
                      FROM partners
                      WHERE IF (CASE DAYOFWEEK(CURDATE())
                                  WHEN 1 THEN 1
                                  WHEN 2 THEN 64
                                  WHEN 3 THEN 32
                                  WHEN 4 THEN 16
                                  WHEN 5 THEN 8
                                  WHEN 6 THEN 4
                                  WHEN 7 THEN 2
                                  END & closed_days = 0, 'open', 'closed') = 'open'
                      AND id NOT IN (SELECT partner_id
                                    FROM special_closed_dates
                                    WHERE CURDATE() = closed_date));
    `; // 오늘 영업하는(정기 휴일, 비정기 휴일 둘 다 아닌) 제휴업체의 계약 정보를 바탕으로 당일 대여 요청 자동 생성

  try {
    connection = await db.getConnection();

    const [result] = await connection.execute(query);
    // console.log('result.affectedRows:', result.affectedRows);
    return result.affectedRows >= 1;
  } catch (err) {
    throw new DBError(err.message, query);
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
  generatePartnerDailyRequests,
  reuseOperatorPartnerList,
  reuseOperatorPartnerListCount,
  reuseOperatorPartnerDetailWithDaily,
  reuseOperatorPartnerDetailWithContracts,
  reuseOperatorPartnerDetailWithSpecialClosed,
  reuseOperatorPartnerStatsCurrentTotal,
  reuseOperatorPartnerStatsPeriodTotal
};
