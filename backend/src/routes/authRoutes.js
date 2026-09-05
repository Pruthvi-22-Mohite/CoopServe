import express from 'express';
import { login, demoLogin, register, getMe, getDemoAccounts, refresh, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/demo-accounts', getDemoAccounts);
router.post('/demo/:role', demoLogin);
router.get('/me', authenticate, getMe);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
