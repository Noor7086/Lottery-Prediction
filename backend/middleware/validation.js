import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('selectedLottery')
    .isIn(['gopher5', 'pick3', 'lottoamerica', 'megamillion', 'powerball'])
    .withMessage('Please select a valid lottery type'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('notificationsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Notifications enabled must be a boolean value'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Lottery type validation
const validateLotteryType = [
  param('lotteryType')
    .isIn(['gopher5', 'pick3', 'lottoamerica', 'megamillion', 'powerball'])
    .withMessage('Invalid lottery type'),
  
  handleValidationErrors
];

// Prediction ID validation
const validatePredictionId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid prediction ID'),
  
  handleValidationErrors
];

// Purchase validation
const validatePurchase = [
  body('paymentMethod')
    .isIn(['wallet', 'stripe', 'paypal'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Wallet top-up validation
const validateWalletTopUp = [
  body('amount')
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Amount must be between $1 and $1000'),
  
  body('paymentMethod')
    .isIn(['stripe', 'paypal'])
    .withMessage('Invalid payment method for wallet top-up'),
  
  handleValidationErrors
];

// Admin prediction upload validation
const validatePredictionUpload = [
  body('lotteryType')
    .isIn(['gopher5', 'pick3', 'lottoamerica', 'megamillion', 'powerball'])
    .withMessage('Invalid lottery type'),
  
  body('drawDate')
    .isISO8601()
    .withMessage('Invalid draw date format'),
  
  body('drawTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid draw time format'),
  
  body('price')
    .isFloat({ min: 0.01, max: 100 })
    .withMessage('Price must be between $0.01 and $100'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

export {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateLotteryType,
  validatePredictionId,
  validatePurchase,
  validatePagination,
  validateWalletTopUp,
  validatePredictionUpload,
  handleValidationErrors
};

