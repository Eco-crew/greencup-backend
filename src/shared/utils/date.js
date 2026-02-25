function convertClosedDays(bitTypeClosedDays) {
  // const days = ['월', '화', '수', '목', '금', '토', '일'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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

function convertClosedDaysToBit(stringTypeClosedDaysArr){
  //월,화,수,목,금,토,일에 해당하는 0배열을 만들어 기본 쉬지 않는것으로 세팅
  let closedDaysBitArr = [0,0,0,0,0,0,0];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  //배열을 돌며 맞닥뜨리면 요일에 맞는 해당 인덱스값을 0->1로 변환
  stringTypeClosedDaysArr.forEach((day) => {
    const index = days.indexOf(day);
    closedDaysBitArr[index] = 1;
  });

  //2진수 문자열로 만들고 10진수 숫자로 변환
  const bitString = closedDaysBitArr.join("");
  return parseInt(bitString,2);
}

module.exports = { convertClosedDays, convertClosedDaysToBit };
