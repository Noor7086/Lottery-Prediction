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

    // Check if trial has expired and mark hasUsedTrial if needed
    const isInTrial = user.isInTrial();
    if (!isInTrial && !user.hasUsedTrial) {
      user.hasUsedTrial = true;
      await user.save();
    }

    // Check if user is in trial period and has selected this lottery
    if (isInTrial && user.selectedLottery === lotteryType) {
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

      // Get lottery display name for transaction description
      const lotteryNames = {
        'gopher5': 'Gopher 5',
        'pick3': 'Pick 3',
        'lottoamerica': 'Lotto America',
        'megamillion': 'Mega Million',
        'powerball': 'Powerball'
      };
      const lotteryDisplayName = lotteryNames[prediction.lotteryType] || prediction.lotteryType;

      // Create purchase record first to get purchase ID
      const purchase = await Purchase.create({
        user: userId,
        prediction: id,
        amount: prediction.price,
        paymentMethod: 'wallet',
        paymentStatus: 'completed',
        transactionId: `WALLET_${Date.now()}_${userId}`
      });

      // Update balance
      user.walletBalance -= prediction.price;
      
      // Add transaction to user's wallet transactions
      const transactionData = {
        type: 'payment',
        amount: prediction.price,
        description: `Prediction purchase for ${lotteryDisplayName}`,
        reference: `PRED_${id}`,
        status: 'completed',
        metadata: {
          predictionId: id,
          lotteryType: prediction.lotteryType,
          purchaseId: purchase._id.toString()
        },
        createdAt: new Date()
      };
      
      user.transactions.push(transactionData);
      user.lastTransactionDate = new Date();
      user.totalWithdrawn = (user.totalWithdrawn || 0) + prediction.price;

      // Save user with all updates at once (balance, transaction, totals)
      const savedUser = await user.save();
      
      // Verify transaction was saved by refetching
      const verifyUser = await User.findById(userId);
      console.log(`[Purchase] Transaction added. User now has ${verifyUser.transactions.length} transactions`);
      if (verifyUser.transactions.length > 0) {
        const latest = verifyUser.transactions[verifyUser.transactions.length - 1];
        console.log(`[Purchase] Latest transaction:`, {
          type: latest.type,
          amount: latest.amount,
          description: latest.description,
          createdAt: latest.createdAt,
          status: latest.status
        });
      }

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

// @desc    Get trial predictions (free for trial users) - 1 per day
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

    // Check if trial has expired and mark hasUsedTrial if needed
    const isInTrial = user.isInTrial();
    if (!isInTrial && !user.hasUsedTrial) {
      user.hasUsedTrial = true;
      await user.save();
    }

    // Check if user is in trial and has selected this lottery
    if (!isInTrial || user.selectedLottery !== lotteryType) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This is only available during your trial period for your selected lottery.'
      });
    }

    // Check if user has already viewed a prediction today
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastViewDate = user.lastTrialPredictionDate ? new Date(user.lastTrialPredictionDate) : null;
    const lastViewStart = lastViewDate ? new Date(lastViewDate.getFullYear(), lastViewDate.getMonth(), lastViewDate.getDate()) : null;

    // If user already viewed a prediction today, return empty or message
    if (lastViewStart && lastViewStart.getTime() === todayStart.getTime()) {
      return res.json({
        success: true,
        data: {
          predictions: [],
          message: 'You have already viewed your free prediction for today. Come back tomorrow for a new prediction!'
        }
      });
    }

    // Get the next available prediction (1 prediction)
    const prediction = await Prediction.findOne({
      lotteryType,
      isActive: true,
      drawDate: { $gte: new Date() }
    })
    .populate('uploadedBy', 'firstName lastName')
    .sort({ drawDate: 1 });

    if (!prediction) {
      return res.json({
        success: true,
        data: {
          predictions: [],
          message: 'No predictions available at the moment. Please check back later.'
        }
      });
    }

    // Update user's last trial prediction view date
    user.lastTrialPredictionDate = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        predictions: [{
          id: prediction._id,
          lotteryType: prediction.lotteryType,
          lotteryDisplayName: prediction.lotteryDisplayName,
          drawDate: prediction.drawDate,
          drawTime: prediction.drawTime,
          nonViableNumbers: prediction.getNonViableNumbers(),
          notes: prediction.notes
        }]
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

