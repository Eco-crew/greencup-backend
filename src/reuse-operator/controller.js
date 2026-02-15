const service = require('./service');

/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// 수거지점장 - 요청 현황 목록: 전체 / 완료 / 미완료
async function getRequests(req, res, next) {
  try {
    const mapPathToStatus = {
      'total': null,
      'completed': 'complete',
      'notcompleted': 'incomplete'
    };

    // req.query.status = mapPathToStatus[req.path.split('/').slice(-1)[0]];
    // 동결 객체가 아니고 writable 속성도 false가 아닌데, req.query 원본 객체의 속성 값이 바뀌지 않아서
    const queryParams = { ...req.query }; // spread를 이용하여 객체를 얕은 복사하여 새로운 객체 생성 (기존 req.query 객체 참조 아님)
    queryParams.status = mapPathToStatus[req.path.split('/').pop()];
    console.log(queryParams);

    const result = await service.getRequests(queryParams);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 수거지점장 - 개별 요청 현황 (요청 한 건의 상세 페이지)
async function getRequestDetail(req, res, next) {
  const id = req.params.requestId;

  try {
    const result = await service.getRequestDetail(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 수거지점장 - 개별 요청 처리: 완료/미완료 처리
async function updateRequestStatus(req, res, next) {
  const id = req.params.requestId;

  const mapPathToStatus = {
    'complete': 'complete',
    'uncomplete': 'incomplete',
  };

  const status = mapPathToStatus[req.path.split('/').pop()];

  try {
    const result = await service.updateRequestStatus({ id, status });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 수거지점장 - 개별 요청 처리: 파손 및 분실 처리
async function updateRequestCupQuantity(req, res, next) {
  const id = req.params.requestId;
  const { brokenLostCount } = req.body || {}; // req.body가 undefined일 경우 발생하는 구조분해할당 오류 예방

  try {
    const result = await service.updateRequestCupQuantity({ id, brokenLostCount });
    res.json(result);
  } catch (err) {
    next(err);
  }
}


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
  updateRequestStatus,
  updateRequestCupQuantity,
  reuseOperatorPartnerList,
  reuseOperatorPartnerDetail
};
