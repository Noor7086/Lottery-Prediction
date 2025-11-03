import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, selectedLottery } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user with trial
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      selectedLottery,
      hasUsedTrial: false // New user hasn't used trial yet (they're starting it now)
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          selectedLottery: user.selectedLottery,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isInTrial: user.isInTrial(),
          hasUsedTrial: user.hasUsedTrial,
          walletBalance: user.walletBalance,
          totalDeposited: user.totalDeposited,
          totalWithdrawn: user.totalWithdrawn,
          transactionCount: user.transactionCount
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Check if trial has expired and mark hasUsedTrial
    const isInTrial = user.isInTrial();
    if (!isInTrial && !user.hasUsedTrial) {
      user.hasUsedTrial = true;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          selectedLottery: user.selectedLottery,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isInTrial: isInTrial,
          hasUsedTrial: user.hasUsedTrial,
          walletBalance: user.walletBalance,
          totalDeposited: user.totalDeposited,
          totalWithdrawn: user.totalWithdrawn,
          transactionCount: user.transactionCount,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trial has expired and mark hasUsedTrial
    const isInTrial = user.isInTrial();
    if (!isInTrial && !user.hasUsedTrial) {
      user.hasUsedTrial = true;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          selectedLottery: user.selectedLottery,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isInTrial: isInTrial,
          hasUsedTrial: user.hasUsedTrial,
          walletBalance: user.walletBalance,
          totalDeposited: user.totalDeposited,
          totalWithdrawn: user.totalWithdrawn,
          transactionCount: user.transactionCount,
          role: user.role,
          notificationsEnabled: user.notificationsEnabled
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, notificationsEnabled } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          selectedLottery: user.selectedLottery,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isInTrial: user.isInTrial(),
          hasUsedTrial: user.hasUsedTrial,
          walletBalance: user.walletBalance,
          totalDeposited: user.totalDeposited,
          totalWithdrawn: user.totalWithdrawn,
          transactionCount: user.transactionCount,
          role: user.role,
          notificationsEnabled: user.notificationsEnabled
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

export {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};

