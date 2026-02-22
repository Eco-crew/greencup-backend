const cron = require('node-cron');

// SS(0~59. optional) MM(0~59) HH(0~23) Day(1~31) Mon(1~12) Day(0~7. Sunday~Saturday)
// 숫자는 interval이 아니라 일시(시각). 예) 0 0 0 * * * : 매일 자정(00:00.00)마다 실행

// cron.schedule(`*/2 * * * * *`, () => {
//   console.log(`2s has passed`);
// });

// 서버 timezone은 세계 표준에 맞게 UTC로 설정되어 있으므로, 한국 시간대(KST)로 변환해야 한다.
// 매일 자정은 0 0 15 * * * (GMT +9(H)를 적용해서 15 + 9 = 24 = 자정)
// 또는 timezone 객체를 인수로 줘서 설정할 수도 있다.
cron.schedule(`0 3 21 * * *`,
  () => {
    console.log(`21:03:00초가 되었습니다.`);
  },
  {
    timezone: 'Asia/Seoul' // KST
  }
);
