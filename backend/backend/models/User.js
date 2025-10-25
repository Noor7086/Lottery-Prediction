import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  selectedLottery: {
    type: String,
    enum: ['gopher5', 'pick3', 'lottoamerica', 'megamillion', 'powerball'],
    required: [true, 'Please select a lottery for your trial']
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
  },
  transactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund', 'payment', 'bonus', 'withdrawal'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    reference: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  lastTransactionDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is in trial period
userSchema.methods.isInTrial = function() {
  return new Date() <= this.trialEndDate;
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Wallet methods
userSchema.methods.addTransaction = function(transactionData) {
  const transaction = {
    ...transactionData,
    createdAt: new Date()
  };
  
  this.transactions.push(transaction);
  this.lastTransactionDate = new Date();
  
  // Update totals
  if (transactionData.type === 'credit' || transactionData.type === 'refund' || transactionData.type === 'bonus') {
    this.totalDeposited += transactionData.amount;
  } else if (transactionData.type === 'debit' || transactionData.type === 'withdrawal') {
    this.totalWithdrawn += transactionData.amount;
  }
  
  return this.save();
};

userSchema.methods.updateBalance = function(amount, type) {
  if (type === 'credit' || type === 'refund' || type === 'bonus') {
    this.walletBalance += amount;
  } else if (type === 'debit' || type === 'withdrawal') {
    if (this.walletBalance >= amount) {
      this.walletBalance -= amount;
    } else {
      throw new Error('Insufficient balance');
    }
  }
  
  return this.save();
};

userSchema.methods.getRecentTransactions = function(limit = 10) {
  return this.transactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

userSchema.methods.getTransactionsByType = function(type) {
  return this.transactions.filter(transaction => transaction.type === type);
};

userSchema.methods.getBalanceHistory = function(days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return this.transactions
    .filter(transaction => transaction.createdAt >= startDate)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

// Virtual for transaction count
userSchema.virtual('transactionCount').get(function() {
  return this.transactions.length;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);

