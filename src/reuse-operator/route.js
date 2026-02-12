// reuseOperator Route - API Endpoints for reuseOperator management
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth');


/****************************************************************************************************
 *   수거지점장 - (대여) 요청 현황                                                                      *
 ****************************************************************************************************/
router.get('/requests/total', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/completed', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/notcompleted', authMiddleware.checkLogin, controller.getRequests);
router.get('/requests/:requestId', authMiddleware.checkLogin, controller.getRequestDetail);
router.put('/requests/:requestId/complete', authMiddleware.checkLogin, controller.updateRequest);
router.put('/requests/:requestId/uncomplete', authMiddleware.checkLogin, controller.updateRequest);
router.put('/requests/:requestId/broken-lost', authMiddleware.checkLogin, controller.updateRequest);


/****************************************************************************************************
 *   수거지점장 - 업체관리                                                                            *
 ****************************************************************************************************/
// 수거지점장 - 업체관리 - 리스트
router.get('/partners', authMiddleware.checkLogin, controller.reuseOperatorPartnerList);
// 수거지점장 - 업체관리- 업체상세
router.get('/partners/:partnerId', authMiddleware.checkLogin, controller.reuseOperatorPartnerDetail);



module.exports = router;
