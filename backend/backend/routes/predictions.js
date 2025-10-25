import express from 'express';
import {
  getPredictions,
  getPredictionDetails,
  purchasePrediction,
  getMyPurchases,
  getTrialPredictions
} from '../controllers/predictionController.js';
import { protect } from '../middleware/auth.js';
import {
  validateLotteryType,
  validatePredictionId,
  validatePurchase,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/predictions/:lotteryType
// @desc    Get all predictions for a specific lottery
// @access  Public
router.get('/:lotteryType', validateLotteryType, validatePagination, getPredictions);

// @route   GET /api/predictions/trial/:lotteryType
// @desc    Get trial predictions for user's selected lottery
// @access  Private
router.get('/trial/:lotteryType', protect, validateLotteryType, getTrialPredictions);

// @route   GET /api/predictions/:lotteryType/:id
// @desc    Get specific prediction details
// @access  Private
router.get('/:lotteryType/:id', protect, validateLotteryType, validatePredictionId, getPredictionDetails);

// @route   POST /api/predictions/:lotteryType/:id/purchase
// @desc    Purchase a prediction
// @access  Private
router.post('/:lotteryType/:id/purchase', protect, validateLotteryType, validatePredictionId, validatePurchase, purchasePrediction);

// @route   GET /api/predictions/my-purchases
// @desc    Get user's purchased predictions
// @access  Private
router.get('/my-purchases', protect, validatePagination, getMyPurchases);

export default router;

