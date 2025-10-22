import Prediction from '../models/Prediction.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get all predictions for a specific lottery
// @route   GET /api/predictions/:lotteryType
// @access  Public
const getPredictions = async (req, res) => {
  try {
    const { lotteryType } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const validLotteryTypes = ['gopher5', 'pick3', 'lottoamerica', 'megamillion', 'powerball'];
    if (!validLotteryTypes.includes(lotteryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lottery type'
      });
    }

    const predictions = await Prediction.find({
      lotteryType,
      isActive: true,
      drawDate: { $gte: new Date() }
    })
    .populate('uploadedBy', 'firstName lastName')
    .sort({ drawDate: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Prediction.countDocuments({
      lotteryType,
      isActive: true,
      drawDate: { $gte: new Date() }
    });

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
    console.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get specific prediction details
// @route   GET /api/predictions/:lotteryType/:id
// @access  Private (requires purchase)
const getPredictionDetails = async (req, res) => {
  try {
    const { lotteryType, id } = req.params;
    const userId = req.user.userId;

    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    if (prediction.lotteryType !== lotteryType) {
      return res.status(400).json({
        success: false,
        message: 'Lottery type mismatch'
      });
    }

    // Check if user has purchased this prediction
    const purchase = await Purchase.findOne({
      user: userId,
      prediction: id,
      paymentStatus: 'completed'
    });

    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: 'You need to purchase this prediction to view details'
      });
    }

    // Update download count
    purchase.downloadCount += 1;
    purchase.lastDownloaded = new Date();
    await purchase.save();

    prediction.downloadCount += 1;
    await prediction.save();

    res.json({
      success: true,
      data: {
        prediction: {
          id: prediction._id,
          lotteryType: prediction.lotteryType,
          lotteryDisplayName: prediction.lotteryDisplayName,
          drawDate: prediction.drawDate,
          drawTime: prediction.drawTime,
          nonViableNumbers: prediction.getNonViableNumbers(),
          price: prediction.price,
          notes: prediction.notes,
          downloadCount: prediction.downloadCount
        }
      }
    });
  } catch (error) {
    console.error('Get prediction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Purchase prediction
// @route   POST /api/predictions/:lotteryType/:id/purchase
// @access  Private
const purchasePrediction = async (req, res) => {
  try {
    const { lotteryType, id } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.userId;

    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    if (prediction.lotteryType !== lotteryType) {
      return res.status(400).json({
        success: false,
        message: 'Lottery type mismatch'
      });
    }

    // Check if user already purchased this prediction
    const existingPurchase = await Purchase.findOne({
      user: userId,
      prediction: id,
      paymentStatus: 'completed'
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this prediction'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is in trial period and has selected this lottery
    if (user.isInTrial() && user.selectedLottery === lotteryType) {
      return res.status(400).json({
        success: false,
        message: 'This prediction is free during your trial period'
      });
    }

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      if (user.walletBalance < prediction.price) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }

      // Deduct from wallet
      user.walletBalance -= prediction.price;
      await user.save();

      // Create purchase record
      const purchase = await Purchase.create({
        user: userId,
        prediction: id,
        amount: prediction.price,
        paymentMethod: 'wallet',
        paymentStatus: 'completed',
        transactionId: `WALLET_${Date.now()}_${userId}`
      });

      // Update prediction purchase count
      prediction.purchaseCount += 1;
      await prediction.save();

      return res.json({
        success: true,
        message: 'Prediction purchased successfully',
        data: {
          purchase: {
            id: purchase._id,
            amount: purchase.amount,
            paymentMethod: purchase.paymentMethod,
            paymentStatus: purchase.paymentStatus,
            transactionId: purchase.transactionId
          }
        }
      });
    }

    // For other payment methods (Stripe, PayPal), return payment intent
    res.json({
      success: true,
      message: 'Payment intent created',
      data: {
        amount: prediction.price,
        paymentMethod,
        predictionId: id
      }
    });
  } catch (error) {
    console.error('Purchase prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during purchase'
    });
  }
};

// @desc    Get user's purchased predictions
// @route   GET /api/predictions/my-purchases
// @access  Private
const getMyPurchases = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const purchases = await Purchase.find({
      user: userId,
      paymentStatus: 'completed'
    })
    .populate({
      path: 'prediction',
      select: 'lotteryType drawDate drawTime price notes'
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Purchase.countDocuments({
      user: userId,
      paymentStatus: 'completed'
    });

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get trial predictions (free for trial users)
// @route   GET /api/predictions/trial/:lotteryType
// @access  Private
const getTrialPredictions = async (req, res) => {
  try {
    const { lotteryType } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is in trial and has selected this lottery
    if (!user.isInTrial() || user.selectedLottery !== lotteryType) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This is only available during your trial period for your selected lottery.'
      });
    }

    const predictions = await Prediction.find({
      lotteryType,
      isActive: true,
      drawDate: { $gte: new Date() }
    })
    .populate('uploadedBy', 'firstName lastName')
    .sort({ drawDate: 1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        predictions: predictions.map(prediction => ({
          id: prediction._id,
          lotteryType: prediction.lotteryType,
          lotteryDisplayName: prediction.lotteryDisplayName,
          drawDate: prediction.drawDate,
          drawTime: prediction.drawTime,
          nonViableNumbers: prediction.getNonViableNumbers(),
          notes: prediction.notes
        }))
      }
    });
  } catch (error) {
    console.error('Get trial predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getPredictions,
  getPredictionDetails,
  purchasePrediction,
  getMyPurchases,
  getTrialPredictions
};

