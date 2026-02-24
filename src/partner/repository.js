const db = require('../db/connection');
const DBError = require('../errors/DBError');


/****************************************************************************************************
 *  제휴업체 - 메뉴명 또는 업무명                                                                     *
 ****************************************************************************************************/
async function functionTemplate({ }) {
  let connection;

  const query = `
  `;

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [result] = await connection.execute(query, [bindingParameters]);
    return result || null;
  } catch (err) {
    throw new DBError(err.message, query, [bindingParameters]);
  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}


/****************************************************************************************************
 *  제휴업체 - 메뉴명 또는 업무명                                                                     *
 ****************************************************************************************************/
//업체지점장-대여현황-dailyrentals와 partners 조인
async function getRequestSettingWithDailyAndPartners(partnerId) {
  let connection;

  const query = `
  SELECT d.partner_id AS partnerId,
  p.site_name AS partnerName,
  p.manager_name AS partnerManagerName,
  p.closed_days AS weeklyOffDays,
  SUM(d.rented_cup_quantity)  AS totalLoanCount,
  SUM(d.returned_cup_quantity) AS totalReturnCount,
  SUM(d.lost_cup_quantity)    AS totalBrokenLostCount 
  FROM partners p 
  JOIN daily_rentals d ON d.partner_id = p.id 
  WHERE p.id = ?
  `;

  let bindingParameters = [];
  bindingParameters.push(partnerId);

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [result] = await connection.query(query, [bindingParameters]);
    return result[0] || null;
  } catch (err) {
    throw new DBError(err.message, query, [bindingParameters]);
  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}

//업체지점장-대여현황-partners와 greencupbranches 조인
async function getRequestSettingWithPartnersAndBranches(partnerId) {
  let connection;

  const query = `
  SELECT g.branch_name AS reuseOperatorName, g.manager_name AS reuseManagerName, g.manager_phone_number AS reuseManagerPhone
  FROM partners p
  JOIN greencup_branches g ON p.greencup_branch_id = g.id
  WHERE p.id = ?
  `;

  let bindingParameters = [];
  bindingParameters.push(partnerId);

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [result] = await connection.query(query, [bindingParameters]);
    return result[0] || null;
  } catch (err) {
    throw new DBError(err.message, query, [bindingParameters]);
  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}

//업체지점장-대여현황-contracts
async function getRequestSettingWithContracts(partnerId) {
  let connection;

  const query = `
  SELECT daily_cup_quantity AS defaultNeedCount , DATE_FORMAT(deliver_by_time, '%H:%i') AS defaultVisitTime, note AS memo
  FROM contracts
  WHERE partner_id = ?
  `;

  let bindingParameters = [];
  bindingParameters.push(partnerId);

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [result] = await connection.query(query, [bindingParameters]);
    return result[0] || null;
  } catch (err) {
    throw new DBError(err.message, query, [bindingParameters]);
  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}

//업체지점장-대여현황-special_closed_dates
async function getRequestSettingWithSpecialDates(partnerId) {
  let connection;

  const query = `
  SELECT closed_date AS offDates
  FROM special_closed_dates
  WHERE partner_id = ?
  `;

  let bindingParameters = [];
  bindingParameters.push(partnerId);

  try {
    connection = await db.getConnection(); // DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)

    const [result] = await connection.query(query, [bindingParameters]);
    return result || null;
  } catch (err) {
    throw new DBError(err.message, query, [bindingParameters]);
  } finally { // 오류 발생시에도 실행 보장
    if (connection) connection.release(); // connection 리소스 사용 직후 반환
  }
}



module.exports = {
  getRequestSettingWithDailyAndPartners,
  getRequestSettingWithPartnersAndBranches,
  getRequestSettingWithContracts,
  getRequestSettingWithSpecialDates,
};
