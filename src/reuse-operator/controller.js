const service = require('./service');


/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
async function getRequests(req, res) {
  try {
    const searchCondition = req.query;
    const requests = await service.getRequests(searchCondition);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}
// ?startDate=2026-01-18&endDate=2026-01-23&page=1&pageRowSize=10

async function getRequestDetail(req, res) {
  try {
    const request = await service.getRequestDetail();

  } catch (err) {
    next(err);
  }
}

async function updateRequest(req, res) {
  try {
    const request = await service.updateRequest();

  } catch (err) {
    next(err);
  }
}

// router.get('/requests/:requestId', authMiddleware.checkLogin, controller.getRequestDetail);
// router.put('/requests/:requestId/complete', authMiddleware.checkLogin, controller.updateRequest);


/****************************************************************************************************
 *  수거지점장 - 업체관리                                                                             *
 ****************************************************************************************************/

//수거지점장 - 업체관리 - 리스트
async function reuseOperatorPartnerList(req, res, next) {
  const { partnerName, page, pageRowSize } = req.query;

  //로그인한 당사자인 수거지점장의 uuid를 가져옴
  const reuseOperatorId = req.session.user.id;

  try {
    const reusePartnerList = await service.reuseOperatorPartnerList(reuseOperatorId, Number(page), Number(pageRowSize), partnerName);
    res.json(reusePartnerList);
  } catch (err) {
    next(err);
  }

}

//수거지점장 - 업체관리 - 업체 상세
async function reuseOperatorPartnerDetail(req, res, next) {
  const { partnerId } = req.params;

  try {
    const reusePartnerObject = await service.reuseOperatorPartnerDetail(partnerId);
    res.json(reusePartnerObject);
  } catch (err) {
    next(err);
  }

}


module.exports = {
  getRequests,
  getRequestDetail,
  updateRequest,
  reuseOperatorPartnerList,
  reuseOperatorPartnerDetail
};
