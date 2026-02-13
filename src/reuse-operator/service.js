// Business Logic
const repository = require('./repository');
const AppError = require('../errors/AppError');


/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
async function getRequests({ startDate, endDate, status = null, pageRowSize, page }) {
  // incomplete 조건절이 위에 와야 한다. ※ complete을 위에 두면 incomplete도 그 조건절을 타게 되므로 주의!
  // if (path.includes('incomplete')) {
  // } else if (path.includes('complete')) {
  // }

  const requests = await repository.getRequests({ startDate, endDate, status, pageRowSize, page });

  if (!requests) {
    throw new AppError('쿼리 결과가 없습니다.');
  }

  return requests;
}

async function getRequestDetail({ }) {
  const request = await repository.getRequestDetail({});

  return request;
}

async function updateRequest({ }) {
  const request = await repository.updateRequest({});

  return request;
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
  updateRequest,
  reuseOperatorPartnerList,
  reuseOperatorPartnerDetail
};
