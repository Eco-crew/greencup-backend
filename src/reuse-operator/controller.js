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
      'notcompleted': 'incomplete',
      'cancelled': 'cancelled'
    };

    // req.query.status = mapPathToStatus[req.path.split('/').slice(-1)[0]];
    // 동결 객체가 아니고 writable 속성도 false가 아닌데, req.query 원본 객체의 속성 값이 바뀌지 않아서
    const bindingParams = { ...req.query }; // spread를 이용하여 객체를 얕은 복사하여 새로운 객체 생성 (기존 req.query 객체 참조 아님)
    // API endpoints 마지막 부분을 요청 레코드의 status 컬럼 값으로 매핑. null 병합 연산자를 이용하여, 잘못된 endpoint는 null로 매핑
    bindingParams.status = mapPathToStatus[req.path.split('/').pop()] ?? null;
    bindingParams.currentBranchId = req.session.user.id; // 로그인한 관리자 소속 그린컵 '지점'의 ID (소속 지점의 자료만 조회 가능하도록 제한)
    console.log(bindingParams);

    const result = await service.getRequests(bindingParams);
    // console.log(result);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 수거지점장 - 개별 요청 현황 (요청 한 건의 상세 페이지)
async function getRequestDetail(req, res, next) {
  const requestId = req.params.requestId;
  const currentBranchId = req.session.user.id;
  console.log(currentBranchId);

  const bindingParams = {
    requestId: req.params.requestId,
    currentBranchId: req.session.user.id
  };

  try {
    const result = await service.getRequestDetail(bindingParams);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 수거지점장 - 개별 요청 처리: 완료/미완료 처리
async function updateRequestStatus(req, res, next) {
  const requestId = req.params.requestId;
  const currentBranchId = req.session.user.id;
  console.log(currentBranchId);

  const mapPathToStatus = {
    'complete': 'complete',
    'uncomplete': 'incomplete',
  };
  const status = mapPathToStatus[req.path.split('/').pop()];

  const bindingParams = {
    requestId,
    currentBranchId,
    status
  };

  try {
    const result = await service.updateRequestStatus(bindingParams);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 수거지점장 - 개별 요청 처리: 파손 및 분실 처리
async function updateRequestCupQuantity(req, res, next) {
  const requestId = req.params.requestId;
  // req.body가 undefined일 경우 발생하는 구조분해할당 오류 예방 // brokenLostCount 사용자 입력값이 음수이면 0으로 치환
  const brokenLostCount = Math.max(0, req.body?.brokenLostCount || 0);
  const currentBranchId = req.session.user.id;
  console.log(currentBranchId);

  const bindingParams = {
    requestId,
    currentBranchId,
    brokenLostCount
  };

  try {
    const result = await service.updateRequestCupQuantity(bindingParams);
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

//수거지점장- 통계
async function reuseOperatorPartnerStats(req, res, next) {
  const { startDate, endDate } = req.query;
  console.log(startDate);
  console.log(endDate);

  //로그인한 당사자인 수거지점장의 uuid를 가져옴
  const reuseOperatorId = req.session.user.id;

  try {
    const reusePartnerStats = await service.reuseOperatorPartnerStats(reuseOperatorId, startDate, endDate);
    res.json(reusePartnerStats);
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
  reuseOperatorPartnerDetail,
  reuseOperatorPartnerStats
};
