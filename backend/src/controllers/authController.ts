import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import OTP from '../models/OTP';
import { AuthRequest } from '../middleware/auth';
import { generateOTP } from '../services/otp.service';
import { sendOTPEmail } from '../services/email.service';

// Generate JWT token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: (process.env.JWT_EXPIRE || '7d'),
  } as jwt.SignOptions);
};

// @desc    Send OTP to email
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    // Generate 6-digit OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Create new OTP record
    await OTP.create({ email, code, expiresAt });

    // Send OTP via email
    await sendOTPEmail(email, code);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      email,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// @desc    Verify OTP and return JWT
// @route   POST /api/auth/verify
// @access  Public
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: 'Email and code are required',
      });
      return;
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'OTP expired or not found',
      });
      return;
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.',
      });
      return;
    }

    // Verify OTP code
    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
      return;
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
      return;
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, isVerified: true });
    } else {
      user.isVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user?._id,
        email: user?.email,
        name: user?.name,
        avatar: user?.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
