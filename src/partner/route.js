// partner Route - API Endpoints for partner management
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth'); // 로그인 인증 미들웨어

// 기본 대여 설정 조회
// router.get('/api/partner/request-settings', authMiddleware.checkLogin, controller.getRequestSetting);

