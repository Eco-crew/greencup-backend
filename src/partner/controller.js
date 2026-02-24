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
async function getRequestSetting(req, res, next){

  const partnerId = req.session.user.id;

  try{
    const requestSetting = await service.getRequestSetting(partnerId);
    res.json(requestSetting);
  } catch (err){
    next(err);
  }
}


module.exports = {
  getRequestSetting
};
