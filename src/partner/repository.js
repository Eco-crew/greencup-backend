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



module.exports = {
};
