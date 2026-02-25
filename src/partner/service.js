// Business Logic
const repository = require('./repository');
const AppError = require('../errors/AppError');
const { convertClosedDays, convertClosedDaysToBit } = require('../shared/utils/date');
const { formatPhoneNumber } = require('../shared/utils/phone')

/****************************************************************************************************
 *  제휴업체 - 메뉴명 또는 업무명                                                                     *
 ****************************************************************************************************/
async function functionTemplate({ }) {
  const template = await repository.functionTemplate({});

  return template;
}



/****************************************************************************************************
 *  제휴업체 - 메뉴명 또는 업무명                                                                     *
 ****************************************************************************************************/
//업체지점장-대여관리-데이터 읽기
async function getRequestSetting(partnerId) {
  let partnerInfo = await repository.getRequestSettingWithDailyAndPartners(partnerId);
  const weeklyOffDayList = convertClosedDays(partnerInfo.weeklyOffDays);

  //정기휴무는 따로 보낼꺼니 이 객체에서 키를 제거
  const { weeklyOffDays, ...rest } = partnerInfo;
  partnerInfo = rest;

  let reuseInfo = await repository.getRequestSettingWithPartnersAndBranches(partnerId);
  reuseInfo.reuseManagerPhone = formatPhoneNumber(reuseInfo.reuseManagerPhone);
  let settingInfo = await repository.getRequestSettingWithContracts(partnerId);
  settingInfo.defaultReturnCount = settingInfo.defaultNeedCount;

  const offDates = await repository.getRequestSettingWithSpecialDates(partnerId);
  let changeNameClosedDates = [];
  offDates.forEach((date) => {
    changeNameClosedDates.push(date.offDates);
  });
  return { partnerInfo: partnerInfo, reuseInfo: reuseInfo, settingInfo: settingInfo, weeklyOffDays: weeklyOffDayList, offDates: changeNameClosedDates };
}

//업체지점장-대여관리 수정- 필요한 갯수와 방문시간 수정 
async function updateRequestSettingWithCountAndTime(defaultNeedCount, defaultVisitTime, partnerId) {
  const result = await repository.updateRequestSettingWithCountAndTime(defaultNeedCount, defaultVisitTime, partnerId);

  return {
    // status: 200,
    success: '필요개수 및 방문시간 설정 수정 성공',

  };
}

//업체지점장-대여관리 수정- 비고 메시지 수정 
async function updateRequestSettingWithMemo(memo, partnerId) {
  const result = await repository.updateRequestSettingWithMemo(memo, partnerId);

  return {
    // status: 200,
    success: '비고 메시지 설정 수정 성공',

  };
}

//업체지점장-대여현황-비정기 휴무일 수정 
async function updateRequestSettingSpecialDates(partnerId, addDates, deleteDates) {
  //추가할 날들마다 순회하며 insert
  await addDates.forEach(async (date) => {
    const result = await repository.updateRequestSettingAddSpecialDate(partnerId, date);
  });

  //삭제할 날들마다 순회하며 delete
  await deleteDates.forEach(async (date) => {
    const result = await repository.updateRequestSettingDeleteSpecialDate(partnerId, date);
  });

  return {
    // status: 200,
    success: '비정기 휴무일 설정 수정 성공',

  };
}

//업체지점장-대여현황-정기 휴무 요일 수정 
async function updateRequestSettingClosedDays(closedDays, partnerId) {
  //문자배열을 10진수 숫자로 바꾼다
  const numberClosedDays = convertClosedDaysToBit(closedDays);

  const result = await repository.updateRequestSettingClosedDays(numberClosedDays, partnerId);

  return {
    // status: 200,
    success: '정기 휴무 요일 설정 수정 성공',

  };

}

module.exports = {
  getRequestSetting,
  updateRequestSettingWithCountAndTime,
  updateRequestSettingWithMemo,
  updateRequestSettingSpecialDates,
  updateRequestSettingClosedDays,
};
