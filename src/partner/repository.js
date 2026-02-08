// DB Connection Pool에서 가용 커넥션을 받아온다 (없으면 큐에서 요청 대기)
const connection = require('../db/connection').getConnection();
