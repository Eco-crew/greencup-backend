// reuseOperator Route - API Endpoints for reuseOperator management
const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('./src/shared/middleware/auth.middleware');

// 대여 요청 현황
router.get('/api/reuse-operator/requests', authMiddleware.checkLogin, controller.getRequests);
