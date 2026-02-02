const bcrypt = require('bcrypt');

const count = parseInt(process.argv[2], 10);
const password = process.argv[3] || 'password123';
const saltRounds = 10;

if (!count || count <= 0) {
  console.error('사용법: node generate-bcrypt.js <개수> [비밀번호]');
  process.exit(1);
}

(async () => {
  for (let i = 0; i < count; i++) {
    const hash = await bcrypt.hash(password, saltRounds);

    // bcrypt 결과는 항상 60바이트 ASCII 문자열
    // VARBINARY(60)에 그대로 INSERT 가능
    console.log(hash);
  }
})();
