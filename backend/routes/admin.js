import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validatePredictionUpload, validatePagination } from '../middleware/validation.js';
import User from '../models/User.js';
import Prediction from '../models/Prediction.js';
import Purchase from '../models/Purchase.js';
import Lottery from '../models/Lottery.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {

    const [
      totalUsers,
      activeUsers,
      trialUsers,
      totalPredictions,
      totalPurchases,
      totalRevenue,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ trialEndDate: { $gte: new Date() } }),
      Prediction.countDocuments(),
      Purchase.countDocuments({ paymentStatus: 'completed' }),
      Purchase.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      User.find({}).select('firstName lastName createdAt').sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        trialUsers,
        totalPredictions,
        totalPurchases,
        totalRevenue,
        recentActivity: recentActivity.map(user => ({
          type: 'user_registration',
          description: `${user.firstName} ${user.lastName} registered`,
          timestamp: user.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/predictions
// @desc    Upload new prediction
// @access  Private/Admin
router.post('/predictions', protect, authorize('admin'), validatePredictionUpload, async (req, res) => {
  try {
    const predictionData = {
      ...req.body,
      uploadedBy: req.user.userId
    };

    const prediction = await Prediction.create(predictionData);

    res.status(201).json({
      success: true,
      message: 'Prediction uploaded successfully',
      data: { prediction }
    });
  } catch (error) {
    console.error('Upload prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during prediction upload'
    });
  }
});

// @route   GET /api/admin/predictions
// @desc    Get all predictions for admin
// @access  Private/Admin
router.get('/predictions', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const predictions = await Prediction.find({})
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prediction.countDocuments();

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

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
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/admin/users/:id/:action
// @desc    Update user status or delete user
// @access  Private/Admin
router.patch('/users/:id/:action', protect, authorize('admin'), async (req, res) => {
  try {
    const { id, action } = req.params;

    if (action === 'toggle-status') {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } else if (action === 'delete') {
      await User.findByIdAndDelete(id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/admin/predictions/:id/:action
// @desc    Update prediction status or delete prediction
// @access  Private/Admin
router.patch('/predictions/:id/:action', protect, authorize('admin'), async (req, res) => {
  try {
    const { id, action } = req.params;

    if (action === 'toggle-status') {
      const prediction = await Prediction.findById(id);
      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found'
        });
      }

      prediction.isActive = !prediction.isActive;
      await prediction.save();

      res.json({
        success: true,
        message: `Prediction ${prediction.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } else if (action === 'delete') {
      await Prediction.findByIdAndDelete(id);
      res.json({
        success: true,
        message: 'Prediction deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } catch (error) {
    console.error('Update prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/lotteries
// @desc    Get all lotteries for admin
// @access  Private/Admin
router.get('/lotteries', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const lotteries = await Lottery.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lottery.countDocuments(query);

    res.json({
      success: true,
      data: {
        lotteries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin lotteries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/lotteries
// @desc    Create new lottery
// @access  Private/Admin
router.post('/lotteries', protect, authorize('admin'), async (req, res) => {
  try {
    const lottery = await Lottery.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Lottery created successfully',
      data: { lottery }
    });
  } catch (error) {
    console.error('Create lottery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lottery creation'
    });
  }
});

// @route   PATCH /api/admin/lotteries/:id/:action
// @desc    Update lottery status or delete lottery
// @access  Private/Admin
router.patch('/lotteries/:id/:action', protect, authorize('admin'), async (req, res) => {
  try {
    const { id, action } = req.params;

    if (action === 'toggle-status') {
      const lottery = await Lottery.findById(id);
      if (!lottery) {
        return res.status(404).json({
          success: false,
          message: 'Lottery not found'
        });
      }

      lottery.isActive = !lottery.isActive;
      await lottery.save();

      res.json({
        success: true,
        message: `Lottery ${lottery.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } else if (action === 'delete') {
      await Lottery.findByIdAndDelete(id);
      res.json({
        success: true,
        message: 'Lottery deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } catch (error) {
    console.error('Update lottery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data for admin
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get user growth data
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get revenue data
    const revenueData = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get prediction stats by lottery type
    const predictionStats = await Prediction.aggregate([
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'prediction',
          as: 'purchases'
        }
      },
      {
        $group: {
          _id: '$lotteryType',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $sum: '$purchases.amount'
            }
          }
        }
      }
    ]);

    // Get top predictions
    const topPredictions = await Prediction.aggregate([
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'prediction',
          as: 'purchases'
        }
      },
      {
        $addFields: {
          purchaseCount: { $size: '$purchases' },
          revenue: { $sum: '$purchases.amount' }
        }
      },
      {
        $sort: { purchaseCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get user activity
    const userActivity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth: userGrowth.map(item => ({
          date: item._id,
          count: item.count
        })),
        revenueData: revenueData.map(item => ({
          date: item._id,
          amount: item.amount
        })),
        predictionStats: predictionStats.map(item => ({
          lotteryType: item._id,
          count: item.count,
          revenue: item.revenue
        })),
        topPredictions: topPredictions.map(item => ({
          id: item._id,
          lotteryDisplayName: item.lotteryDisplayName,
          purchaseCount: item.purchaseCount,
          revenue: item.revenue
        })),
        userActivity: userActivity.map(item => ({
          date: item._id,
          activeUsers: item.activeUsers,
          newUsers: item.newUsers
        }))
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create admin user (one-time setup)
// @access  Public (for initial setup only)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      email: email || 'admin@lottery.com',
      password: password || 'admin123',
      phone: '+1234567890',
      selectedLottery: 'powerball',
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isInTrial: false,
      walletBalance: 1000,
      role: 'admin',
      notificationsEnabled: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin creation'
    });
  }
});

export default router;

