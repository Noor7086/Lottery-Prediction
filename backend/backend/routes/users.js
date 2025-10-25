import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const trialUsers = await User.countDocuments({
      trialEndDate: { $gte: new Date() }
    });
    const totalPurchases = await Purchase.countDocuments({ paymentStatus: 'completed' });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        trialUsers,
        totalPurchases
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

