function convertClosedDays(bitTypeClosedDays) {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const closedDaysArr = [];

  for (let i = 0, mask = 0b10000000; i < 7; i++) {
    mask = mask >> 1; // mask를 월요일 → 일요일 순으로 한 bit씩 이동시키면서
    // console.log(mask);
    if (bitTypeClosedDays & mask) { // 상응하는 업체의 정기 휴일을 전부 closedDaysArr 배열에 넣는다.
      closedDaysArr.push(days[i]);
    }
  }

  return closedDaysArr;
}

module.exports = { convertClosedDays };
