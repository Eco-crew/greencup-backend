// reuseOperator Route - API Endpoints for reuseOperator management system
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth'); // 로그인 인증 미들웨어


/****************************************************************************************************
 *  수거지점장 - (대여) 요청 현황                                                                     *
 ****************************************************************************************************/
// 수거지점장 - 요청 현황 목록: 전체 / 완료 / 미완료
// (추후 아래 세 엔드포인트를 1개로 합치고 쿼리 파라미터로 처리 로직을 분기하는 방식으로 리팩토링 예정 )
router.get('/requests/total', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/completed', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/notcompleted', authMiddleware.checkLogin, controller.getRequests);

// 수거지점장 - 개별 요청 현황 (요청 한 건의 상세 페이지)
router.get('/requests/:requestId', authMiddleware.checkLogin, controller.getRequest);
// 수거지점장 - 개별 요청 처리: 완료 / 미완료 / 파손 및 분실 처리
// (추후 아래 세 엔드포인트를 1개로 합치고 쿼리 파라미터로 처리 로직을 분기하는 방식으로 리팩토링 예정 )
router.put('/requests/:requestId/complete', authMiddleware.checkLogin, controller.updateRequest);
router.put('/requests/:requestId/uncomplete', authMiddleware.checkLogin, controller.updateRequest);
router.put('/requests/:requestId/broken-lost', authMiddleware.checkLogin, controller.updateRequest);


/****************************************************************************************************
 *  수거지점장 - 업체관리                                                                             *
 ****************************************************************************************************/
// 수거지점장 - 업체관리 - 리스트
router.get('/partners', authMiddleware.checkLogin, controller.reuseOperatorPartnerList);
// 수거지점장 - 업체관리- 업체상세
router.get('/partners/:partnerId', authMiddleware.checkLogin, controller.reuseOperatorPartnerDetail);
router.get('/stats', authMiddleware.checkLogin, controller.reuseOperatorPartnerStats);



module.exports = router;
