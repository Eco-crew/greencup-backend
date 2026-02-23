const cron = require('node-cron');
const service = require('./service');

// SS(0~59. optional) MM(0~59) HH(0~23) Day(1~31) Mon(1~12) Day(0~7. Sunday~Saturday)
// 숫자는 interval이 아니라 일시(시각). 예) 0 0 0 * * * : 매일 자정(00:00.00)마다 실행

// 서버 timezone은 세계 표준에 맞게 UTC로 설정되어 있으므로, 한국 시간대(KST)로 변환해야 한다.
// 매일 자정은 0 0 15 * * * (GMT +9(H)를 적용해서 15 + 9 = 24 = 자정)
// 또는 0 0 0 * * * 으로 하되, timezone 값이 KST인 객체를 인수로 넘겨줘서 변환할 수도 있다.
const schedule = process.env.CRON_SCHEDULE ?? '0 0 0 * * *';

if (!cron.validate(schedule)) {
  console.error(`Invalid CRON_SCHEDULE: ${schedule}`);
  process.exit(1);
};

console.log('Node-cron has started to run rental-requests-scheduler daily. schedule:', schedule);

cron.schedule(schedule,
  service.generatePartnerDailyRequests,
  {
    timezone: 'Asia/Seoul' // KST
  }
);
