import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get user's wallet
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return wallet data from user model
    const walletData = {
      _id: user._id,
      user: user._id,
      balance: user.walletBalance,
      currency: 'USD',
      isActive: user.isActive,
      transactions: user.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      lastTransactionDate: user.lastTransactionDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: walletData
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wallet'
    });
  }
};

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let transactions = user.transactions;

    // Filter by type if provided
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Filter by status if provided
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const paginatedTransactions = transactions.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.length / limit),
          totalTransactions: transactions.length,
          hasNext: skip + parseInt(limit) < transactions.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
};

// @desc    Add funds to wallet
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, description = 'Wallet deposit', reference } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add transaction
    await user.addTransaction({
      type: 'credit',
      amount,
      description,
      reference,
      status: 'completed'
    });

    // Update balance
    await user.updateBalance(amount, 'credit');

    // Return updated wallet data
    const walletData = {
      _id: user._id,
      user: user._id,
      balance: user.walletBalance,
      currency: 'USD',
      isActive: user.isActive,
      transactions: user.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      lastTransactionDate: user.lastTransactionDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Funds added successfully',
      data: walletData
    });
  } catch (error) {
    console.error('Deposit funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while depositing funds'
    });
  }
};

// @desc    Withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, description = 'Wallet withdrawal', reference } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Add transaction
    await user.addTransaction({
      type: 'withdrawal',
      amount,
      description,
      reference,
      status: 'pending' // Withdrawals might need approval
    });

    // Update balance
    await user.updateBalance(amount, 'withdrawal');

    // Return updated wallet data
    const walletData = {
      _id: user._id,
      user: user._id,
      balance: user.walletBalance,
      currency: 'USD',
      isActive: user.isActive,
      transactions: user.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      lastTransactionDate: user.lastTransactionDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: walletData
    });
  } catch (error) {
    console.error('Withdraw funds error:', error);
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while withdrawing funds'
    });
  }
};

// @desc    Make payment from wallet
// @route   POST /api/wallet/payment
// @access  Private
const makePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, description, reference, metadata = {} } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Add transaction
    await user.addTransaction({
      type: 'payment',
      amount,
      description,
      reference,
      status: 'completed',
      metadata
    });

    // Update balance
    await user.updateBalance(amount, 'debit');

    // Return updated wallet data
    const walletData = {
      _id: user._id,
      user: user._id,
      balance: user.walletBalance,
      currency: 'USD',
      isActive: user.isActive,
      transactions: user.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      lastTransactionDate: user.lastTransactionDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Payment completed successfully',
      data: walletData
    });
  } catch (error) {
    console.error('Make payment error:', error);
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
};

// @desc    Add bonus to wallet
// @route   POST /api/wallet/bonus
// @access  Private
const addBonus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, description, reference, metadata = {} } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add transaction
    await user.addTransaction({
      type: 'bonus',
      amount,
      description,
      reference,
      status: 'completed',
      metadata
    });

    // Update balance
    await user.updateBalance(amount, 'bonus');

    // Return updated wallet data
    const walletData = {
      _id: user._id,
      user: user._id,
      balance: user.walletBalance,
      currency: 'USD',
      isActive: user.isActive,
      transactions: user.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      lastTransactionDate: user.lastTransactionDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Bonus added successfully',
      data: walletData
    });
  } catch (error) {
    console.error('Add bonus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding bonus'
    });
  }
};

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
const getWalletStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      currentBalance: user.walletBalance,
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      transactionCount: user.transactions.length,
      lastTransactionDate: user.lastTransactionDate,
      recentTransactions: user.getRecentTransactions(5),
      monthlyStats: {
        thisMonth: user.transactions.filter(t => {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return t.createdAt >= startOfMonth;
        }).length,
        lastMonth: user.transactions.filter(t => {
          const now = new Date();
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          return t.createdAt >= startOfLastMonth && t.createdAt <= endOfLastMonth;
        }).length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wallet statistics'
    });
  }
};

export {
  getWallet,
  getTransactions,
  depositFunds,
  withdrawFunds,
  makePayment,
  addBonus,
  getWalletStats
};

