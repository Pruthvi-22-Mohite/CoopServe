import express from 'express';
import { login, demoLogin, register, getMe, getDemoAccounts } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/demo-accounts', getDemoAccounts);
router.post('/demo/:role', demoLogin);
router.get('/me', authenticate, getMe);

export default router;
