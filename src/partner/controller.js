const service = require('./service');


/****************************************************************************************************
 *  제휴업체 - 메뉴명 또는 업무명                                                                     *
 ****************************************************************************************************/
async function functionTemplate(req, res, next) {
  try {
    const template = await service.functionTemplate();

    if ('condition is true') {
      res.json(template);
    }
  } catch (err) {
    next(err);
  }
}

/****************************************************************************************************
 *  제휴업체 - 메뉴명 또는 업무명                                                                     *
 ****************************************************************************************************/
//기본 대여 설정 조회
async function getRequestSetting(req, res, next) {

  const partnerId = req.session.user.id;

  try {
    const requestSetting = await service.getRequestSetting(partnerId);
    res.json(requestSetting);
  } catch (err) {
    next(err);
  }
}

//업체지점장-대여관리 수정- 필요한 갯수와 방문시간 수정 
async function updateRequestSettingWithCountAndTime(req, res, next) {

  const partnerId = req.session.user.id;
  const { defaultNeedCount, defaultVisitTime } = req.body;

  try {
    const result = await service.updateRequestSettingWithCountAndTime(defaultNeedCount, defaultVisitTime, partnerId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

//업체지점장-대여관리 수정- 비고 메시지 수정 
async function updateRequestSettingWithMemo(req, res, next) {

  const partnerId = req.session.user.id;
  const { memo } = req.body;

  try {
    const result = await service.updateRequestSettingWithMemo(memo, partnerId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

//업체지점장-대여현황-비정기 휴무일 수정 
async function updateRequestSettingSpecialDates(req, res, next) {

  const partnerId = req.session.user.id;
  const { insertedOffDates, deletedOffDates } = req.body;

  try {
    const result = await service.updateRequestSettingSpecialDates(partnerId, insertedOffDates, deletedOffDates);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRequestSetting,
  updateRequestSettingWithCountAndTime,
  updateRequestSettingWithMemo,
  updateRequestSettingSpecialDates,
};
