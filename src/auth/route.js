// partner Route - API Endpoints for auth management
const router = require('express').Router();
const controller = require('./controller');

// OAuth 기반 로그인
router.get('/api/auth/:provider', controller.oauthLogin);
router.get('/api/auth/:provider/callback', controller.callback);

// 로컬 로그인
router.get('/api/auth/login', controller.login);
router.get('/api/auth/logout', controller.logout);

// My page
router.get('/api/me', controller.profile);

module.exports = router;
