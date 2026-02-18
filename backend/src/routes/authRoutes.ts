import express from 'express';
import { login, verifyOTP, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/verify', verifyOTP);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
