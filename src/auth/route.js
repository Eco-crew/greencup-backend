// partner Route - API Endpoints for auth management
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../shared/middlewares/auth');

// OAuth 기반 로그인
router.get('/api/auth/:provider', controller.oauthLogin);
router.get('/api/auth/:provider/callback', controller.callback);

// 로컬 로그인
router.post('/api/auth/login', controller.login);
router.post('/api/auth/logout', controller.logout);

// 로그인 상태 확인
router.get('/api/auth/check-login', controller.checkLogin);

// My page
router.get('/api/me', authMiddleware.checkLogin, controller.profile);

module.exports = router;
