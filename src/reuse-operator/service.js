// Business Logic
const repository = require('./repository');
const AppError = require('../errors/AppError');


/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// 수거지점장 - 요청 현황 목록: 전체 / 완료 / 미완료
async function getRequests({
  startDate = '2020-01-01',
  endDate = '2020-01-01',
  status = null, // null or undefined가 들어왔을 때 발생할 오류 예방용 기본값
  pageRowSize = 1,
  page = 1
}) {

  // 함수 반환값이 null, undefined일 때 등 예외 상황에서 발생할 오류 예방용 기본값 적용
  const limit = parseInt(pageRowSize) || 1;
  const offset = Math.max(0, ((parseInt(page) || 1) - 1) * limit); // page 값이 음수이면 0으로 치환

  const requests = await repository.getRequests({
    startDate,
    endDate,
    status,
    limit,
    offset
  });

  // if (!requests) {
  //   throw new AppError('쿼리 결과가 없습니다.');
  // }

  return requests || []; // 조회 조건에 따라 결과가 없을 수도 있는 조회이므로, 결과가 없으면 오류 처리 대신 빈 배열 반환
}

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

// 수거지점장 - 개별 요청 현황 (요청 한 건의 상세 페이지)
async function getRequestDetail(id) {
  const request = await repository.getRequestDetail(id);

  // 대여 요청 목록에서 특정 건을 선택해서 상세 정보를 조회하는 것이므로, 결과가 없으면 오류 상황
  if (!request) {
    throw new AppError('SQL 쿼리 결과가 없습니다.');
  }

  request.closedDaysArr = convertClosedDays(request.closed_days);

  return request;
}

// 수거지점장 - 개별 요청 처리: 완료/미완료 처리
async function updateRequestStatus({ id, status }) {
  const result = await repository.updateRequestStatus({ id, status });

  if (!result) {
    throw new AppError('SQL 업데이트 결과가 없습니다.');
  }

  return result;
}

// 수거지점장 - 개별 요청 처리: 파손 및 분실 처리
async function updateRequestCupQuantity({ id, brokenLostCount }) {
  const result = await repository.updateRequestCupQuantity({ id, brokenLostCount });

  if (!result) {
    throw new AppError('SQL 업데이트 결과가 없습니다.');
  }

  return result;
}


/****************************************************************************************************
 *  수거지점장 - 업체관리                                                                             *
 ****************************************************************************************************/

//수거지점장- 업체관리 - 리스트
async function reuseOperatorPartnerList(reuseOperatorId, page, pageRowSize, partnerName) {
  //수거지점장- 업체목록 - 리스트- 페이지네이션 데이터를 받아온다
  const partnerList = await repository.reuseOperatorPartnerList(reuseOperatorId, page, pageRowSize, partnerName);

  //배열을 돌며 키이름을 프론트에서 데이터를 받는 형태로 바꿔준다.
  let changeNamePartnerList = [];
  partnerList.forEach((partner) => {
    let changeNamePartnerObject = {};
    for (const [key, value] of Object.entries(partner)) {
      switch (key) {
        case "partner_id":
          changeNamePartnerObject.partnerId = value;
          break;
        case "site_name":
          changeNamePartnerObject.partnerName = value;
          break;
        case "manager_name":
          changeNamePartnerObject.partnerManagerName = value;
          break;
        case "rented_sum":
          changeNamePartnerObject.rentedSum = value;
          break;
        case "returned_sum":
          changeNamePartnerObject.returnedSum = value;
          break;
        case "lost_sum":
          changeNamePartnerObject.lostSum = value;
          break;
        default:
          break;

      }
    }

    changeNamePartnerList.push(changeNamePartnerObject);
  });

  //여기서 현재 보유중인 컵수를 구한다
  //전체 대여수 - 전체 반납수 - 전체 파손수
  let resultPartnerList = [];
  changeNamePartnerList.forEach((partner) => {
    let changeNamePartnerObject = {};
    const currentLoanCount = partner.rentedSum - partner.returnedSum - partner.lostSum;

    //이 키값들만 제거한 객체를 대입후, 현재 보유중인 컵수 속성을 넣는다
    const { rentedSum, returnedSum, lostSum, ...rest } = partner;
    changeNamePartnerObject = rest;
    changeNamePartnerObject.currentLoanCount = currentLoanCount;

    resultPartnerList.push(changeNamePartnerObject);
  });

  //수거지점장- 업체목록 - 리스트- 전체개수 데이터를 받아온다
  let partnerCount = await repository.reuseOperatorPartnerListCount(reuseOperatorId, partnerName)
  return { partners: resultPartnerList, searchPartnerCount: partnerCount };
}

//수거지점장 - 업체관리 - 업체상세
async function reuseOperatorPartnerDetail(partnerId) {
  //수거지점장- 업체관리- 업체정보와 업체 대여 정보를 받아온다
  let partner = await repository.reuseOperatorPartnerDetailWithDaily(partnerId);

  let changeNamePartnerObject = {};
  for (const [key, value] of Object.entries(partner)) {
    switch (key) {
      case "partner_id":
        changeNamePartnerObject.partnerId = value;
        break;
      case "site_name":
        changeNamePartnerObject.partnerName = value;
        break;
      case "manager_name":
        changeNamePartnerObject.partnerManagerName = value;
        break;
      case "manager_phone_number":
        changeNamePartnerObject.partnerManagerPhone = value;
        break;
      case "open_time":
        changeNamePartnerObject.partnerOperatingStart = value;
        break;
      case "close_time":
        changeNamePartnerObject.partnerOperatingEnd = value;
        break;
      case "site_address":
        changeNamePartnerObject.partnerAddress = value;
        break;
      case "closed_days":
        changeNamePartnerObject.weeklyOffDays = value;
        break;
      case "rented_sum":
        changeNamePartnerObject.totalLoanCount = value;
        break;
      case "returned_sum":
        changeNamePartnerObject.totalReturnCount = value;
        break;
      case "lost_sum":
        changeNamePartnerObject.totalBrokenLostCount = value;
        break;
      default:
        break;

    }
  }

  //쉬는날 숫자를 7자리 이진수로 바꾼다
  //바꾼 이진수를 한글자씩 분리하여 배열을 만든다
  //1이면 요일로 바꾼다
  const binary = changeNamePartnerObject.weeklyOffDays.toString(2).padStart(7, "0");
  const binarySplit = binary.split("");
  let weeklyOffDaysList = [];
  binarySplit.forEach((value, index) => {
    switch (index) {
      case 0:
        if (value == 1) {
          weeklyOffDaysList.push("Mon");
        }
        break;
      case 1:
        if (value == 1) {
          weeklyOffDaysList.push("Tue");
        }
        break;
      case 2:
        if (value == 1) {
          weeklyOffDaysList.push("Wed");
        }
        break;
      case 3:
        if (value == 1) {
          weeklyOffDaysList.push("Thu");
        }
        break;
      case 4:
        if (value == 1) {
          weeklyOffDaysList.push("Fri");
        }
        break;
      case 5:
        if (value == 1) {
          weeklyOffDaysList.push("Sat");
        }
        break;
      case 6:
        if (value == 1) {
          weeklyOffDaysList.push("Sun");
        }
        break;
    }
  });

  const currentLoanCount = changeNamePartnerObject.totalLoanCount - changeNamePartnerObject.totalReturnCount - changeNamePartnerObject.totalBrokenLostCount;
  changeNamePartnerObject.currentLoanCount = currentLoanCount;

  //정기휴무는 따로 보낼꺼니 이 객체에서 키를 제거
  const { weeklyOffDays, ...rest } = changeNamePartnerObject;
  changeNamePartnerObject = rest;

  //수거지점장- 업체관리 - 상세페이지- contracts - 기본대여정보를 받아오기
  let partnerSetting = await repository.reuseOperatorPartnerDetailWithContracts(partnerId);
  let changeNamePartnerSettingObject = {};
  for (const [key, value] of Object.entries(partnerSetting)) {
    switch (key) {
      case "daily_cup_quantity":
        changeNamePartnerSettingObject.defaultNeedCount = value;
        changeNamePartnerSettingObject.defaultReturnCount = value;
        break;
      case "deliver_by_time":
        changeNamePartnerSettingObject.defaultVisitTime = value;
        break;
      case "contract_start_date":
        changeNamePartnerSettingObject.contractDate = value;
        break;
      case "note":
        changeNamePartnerSettingObject.memo = value;
        break;
      default:
        break;

    }
  }

  //수거지점장- 업체관리 - 상세페이지- contracts - 비정기휴무 데이터 받기
  const closedDates = await repository.reuseOperatorPartnerDetailWithSpecialClosed(partnerId);
  let changeNameClosedDates = [];
  //console.log(closedDates);
  closedDates.forEach((date) => {
    changeNameClosedDates.push(date.closed_date);
  });

  console.log(changeNamePartnerObject);
  return { partner: changeNamePartnerObject, settingInfo: changeNamePartnerSettingObject, weeklyOffDays: weeklyOffDaysList, offDates: changeNameClosedDates }
}


module.exports = {
  getRequests,
  getRequestDetail,
  updateRequestStatus,
  updateRequestCupQuantity,
  reuseOperatorPartnerList,
  reuseOperatorPartnerDetail
};
