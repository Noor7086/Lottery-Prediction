import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  lotteryType: {
    type: String,
    required: [true, 'Lottery type is required'],
    enum: ['gopher5', 'pick3', 'lottoamerica', 'megamillion', 'powerball']
  },
  drawDate: {
    type: Date,
    required: [true, 'Draw date is required']
  },
  drawTime: {
    type: String,
    required: [true, 'Draw time is required']
  },
  nonViableNumbers: {
    whiteBalls: [{
      type: Number,
      min: 1,
      max: 70
    }],
    redBalls: [{
      type: Number,
      min: 1,
      max: 26
    }]
  },
  // For single selection lotteries like Gopher 5
  nonViableNumbersSingle: [{
    type: Number,
    min: 1,
    max: 47
  }],
  // For Pick 3 type lotteries
  nonViableNumbersPick3: [{
    type: Number,
    min: 0,
    max: 9
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
predictionSchema.index({ lotteryType: 1, drawDate: 1 });
predictionSchema.index({ isActive: 1, drawDate: 1 });

// Virtual for lottery display name
predictionSchema.virtual('lotteryDisplayName').get(function() {
  const lotteryNames = {
    'gopher5': 'Gopher 5 (Minnesota)',
    'pick3': 'Pick 3 (Minnesota)',
    'lottoamerica': 'Lotto America (USA)',
    'megamillion': 'Mega Million (USA)',
    'powerball': 'Powerball (USA)'
  };
  return lotteryNames[this.lotteryType] || this.lotteryType;
});

// Method to get non-viable numbers based on lottery type
predictionSchema.methods.getNonViableNumbers = function() {
  switch (this.lotteryType) {
    case 'powerball':
    case 'megamillion':
    case 'lottoamerica':
      return {
        whiteBalls: this.nonViableNumbers.whiteBalls,
        redBalls: this.nonViableNumbers.redBalls
      };
    case 'gopher5':
      return this.nonViableNumbersSingle;
    case 'pick3':
      return this.nonViableNumbersPick3;
    default:
      return [];
  }
};

export default mongoose.model('Prediction', predictionSchema);

