// Business Logic
const repository = require('./repository');
const AppError = require('../errors/AppError');
const { convertClosedDays } = require('../shared/utils/date');
const {formatPhoneNumber} = require('../shared/utils/phone')

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
  return {partnerInfo:partnerInfo, reuseInfo:reuseInfo, settingInfo:settingInfo, weeklyOffDays:weeklyOffDayList, offDates:changeNameClosedDates};
}


module.exports = {
  getRequestSetting
};
