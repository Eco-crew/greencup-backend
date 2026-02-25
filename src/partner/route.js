// partner Route - API Endpoints for partner management
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth'); // 로그인 인증 미들웨어

// 기본 대여 설정 조회
router.get('/request-settings', authMiddleware.checkLogin, controller.getRequestSetting);
//업체지점장-대여관리 수정- 필요한 갯수와 방문시간 수정 
router.put('/request-settings/setting-info', authMiddleware.checkLogin, controller.updateRequestSettingWithCountAndTime);


module.exports = router;