import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateWalletTopUp } from '../middleware/validation.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/payments/wallet/top-up
// @desc    Top up user wallet
// @access  Private
router.post('/wallet/top-up', protect, validateWalletTopUp, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.userId;

    // For now, just simulate successful payment
    // In production, integrate with Stripe/PayPal
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add amount to wallet
    user.walletBalance += amount;
    await user.save();

    res.json({
      success: true,
      message: 'Wallet topped up successfully',
      data: {
        newBalance: user.walletBalance,
        amountAdded: amount
      }
    });
  } catch (error) {
    console.error('Wallet top-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during wallet top-up'
    });
  }
});

// @route   GET /api/payments/wallet/balance
// @desc    Get user wallet balance
// @access  Private
router.get('/wallet/balance', protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('walletBalance');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        balance: user.walletBalance
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

