const AppError = require('./AppError');

// DB 에러 클래스
class DBError extends AppError {
  constructor(message, query = null, params = null, status = 500) {
    super(message, status);
    this.query = query; // 에러 발생 쿼리
    this.params = params; // Binding Parameter (예: [id, status])
    this.name = this.constructor.name; // 클래스 이름 저장
    // 객체를 생성해서 err라는 변수에 바인딩했다고 가정하면, err.constructor.name 은 'AppError'가 된다 → 로그 출력할 때 에러 종류 식별 가능
  }
}

module.exports = DBError;
