// reuseOperator Route - API Endpoints for reuseOperator management
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth');

// 대여 요청 현황
// router.get('/api/reuse-operator/requests', authMiddleware.checkLogin, controller.getRequests);

























/**
 *  수거지점장- 업체관리 영역
 */

//수거지점장- 업체관리 - 리스트
router.get('/api/reuse-operator/partners', controller.reuseOperatorPartnerList);
//수거지점장- 업체관리- 업체상세
router.get('/api/reuse-operator/partners/:partnerId', controller.reuseOperatorPartnerDetail);