// reuseOperator Route - API Endpoints for reuseOperator management system
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth'); // 로그인 인증 미들웨어


/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// const createHTTPHandler = (status = null) => {
//   return (req, res) => {
//     return controller.getRequests(status, req, res);
//   }
// }

// 요청 현황 관련 API endpoints를 3개로 분리하고 프런트엔드에서도 그렇게 개발한 상태
// 백엔드에서는 라우터에 HTTP 핸들러를 등록할 때 요청 현황을 조회할 조건(요청 상태값)을 넘겨주고,
// service 계층에서는 controller 계층을 통해서 건내받은 요청 상태값에 따라서 분기해서 처리하려고 하다가,
// router.get('/requests/total', authMiddleware.checkLogin, createHTTPHandler());
// router.get('/requests/completed', authMiddleware.checkLogin, createHTTPHandler('complete'));
// router.get('/requests/notcompleted', authMiddleware.checkLogin, createHTTPHandler('incomplete'));

// 학생 팀프로젝트라는 점을 고려했을 때 추상화보다는 가독성을 우선으로 하는 게 더 낫다고 판단해서
// controller 계층에서 req.path, req.originalUrl을 이용해서 분기 처리하는 방향으로 선회
// (추후 API endpoint를 /requests 1개로 통합하고, 프론트엔드에서 /request?status=complete 식으로 요청하면
//  백엔드에서 쿼리 파라미터를 이용하여 처리 로직을 분기하는 방식으로 리팩토링 예정)

// 수거지점장 - 요청 현황 목록: 전체 / 완료 / 미완료
router.get('/requests/total', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/completed', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/notcompleted', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/cancelled', authMiddleware.checkLogin, controller.getRequests);


// 수거지점장 - 개별 요청 처리: 완료 / 미완료 / 파손 및 분실 처리
// (추후 아래 세 엔드포인트를 1개로 합치고 쿼리 파라미터를 이용하여 처리 로직을 분기하는 방식으로 리팩토링 예정 )
router.put('/requests/:requestId/complete', authMiddleware.checkLogin, controller.updateRequestStatus);
router.put('/requests/:requestId/uncomplete', authMiddleware.checkLogin, controller.updateRequestStatus);
router.put('/requests/:requestId/broken-lost', authMiddleware.checkLogin, controller.updateRequestCupQuantity);

// 수거지점장 - 개별 요청 현황 (요청 한 건의 상세 페이지)
router.get('/requests/:requestId', authMiddleware.checkLogin, controller.getRequestDetail);


/****************************************************************************************************
 *  수거지점장 - 업체관리                                                                             *
 ****************************************************************************************************/
// 수거지점장 - 업체관리 - 리스트
router.get('/partners', authMiddleware.checkLogin, controller.reuseOperatorPartnerList);
// 수거지점장 - 업체관리- 업체상세
router.get('/partners/:partnerId', authMiddleware.checkLogin, controller.reuseOperatorPartnerDetail);
router.get('/stats', authMiddleware.checkLogin, controller.reuseOperatorPartnerStats);


module.exports = router;
