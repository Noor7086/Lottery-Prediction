import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import Lottery from '../models/Lottery.js';

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

// @route   GET /api/users/my-stats
// @desc    Get current user's personal statistics
// @access  Private
router.get('/my-stats', protect, async (req, res) => {
  console.log('✅ /my-stats endpoint called in backend/backend');
  try {
    const userId = req.user.userId;

    // Get user's purchases count
    const totalPurchases = await Purchase.countDocuments({ 
      user: userId, 
      paymentStatus: 'completed' 
    });

    // Get successful predictions (predictions with accuracy > 0 or verified results)
    const successfulPredictions = await Purchase.aggregate([
      {
        $match: {
          user: userId,
          paymentStatus: 'completed'
        }
      },
      {
        $lookup: {
          from: 'predictions',
          localField: 'prediction',
          foreignField: '_id',
          as: 'predictionData'
        }
      },
      {
        $unwind: '$predictionData'
      },
      {
        $match: {
          $or: [
            { 'predictionData.accuracy': { $exists: true, $gt: 0 } },
            { 'predictionData.isActive': false } // Consider inactive predictions as completed/verified
          ]
        }
      },
      {
        $count: 'successfulCount'
      }
    ]);

    const successfulCount = successfulPredictions[0]?.successfulCount || 0;

    // Get active lotteries count
    const activeLotteries = await Lottery.countDocuments({ isActive: true });

    // Get recent activity (recent purchases)
    const recentPurchases = await Purchase.find({ 
      user: userId, 
      paymentStatus: 'completed' 
    })
      .populate('prediction', 'lotteryType drawDate')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('createdAt prediction');

    const recentActivity = recentPurchases.map(purchase => ({
      type: 'purchase',
      description: `Purchased ${purchase.prediction?.lotteryType || 'prediction'} prediction`,
      timestamp: purchase.createdAt,
      lottery: purchase.prediction?.lotteryType || ''
    }));

    // Calculate trial days left
    const user = await User.findById(userId);
    let trialDaysLeft = 0;
    if (user && user.trialEndDate) {
      try {
        const isInTrial = user.isInTrial();
        if (isInTrial) {
          const now = new Date();
          const endDate = new Date(user.trialEndDate);
          const diffTime = endDate - now;
          trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
      } catch (error) {
        console.error('Error calculating trial days:', error);
      }
    }

    res.json({
      success: true,
      data: {
        totalPredictions: totalPurchases,
        successfulPredictions: successfulCount,
        activeLotteries,
        trialDaysLeft,
        recentActivity,
        walletBalance: user?.walletBalance || 0
      }
    });
  } catch (error) {
    console.error('Get user personal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

