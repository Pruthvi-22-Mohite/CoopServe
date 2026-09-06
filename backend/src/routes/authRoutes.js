import express from 'express';
import {
  login,
  demoLogin,
  register,
  getMe,
  getDemoAccounts,
  refresh,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/demo-accounts', getDemoAccounts);
router.post('/demo/:role', demoLogin);
router.get('/me', authenticate, getMe);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
