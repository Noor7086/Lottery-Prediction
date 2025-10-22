// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedLottery: LotteryType;
  trialStartDate: string;
  trialEndDate: string;
  isInTrial: boolean;
  hasUsedTrial: boolean;
  walletBalance: number;
  role: 'user' | 'admin';
  notificationsEnabled: boolean;
}

export interface AuthUser extends User {
  token: string;
}

// Lottery Types
export type LotteryType = 'gopher5' | 'pick3' | 'lottoamerica' | 'megamillion' | 'powerball';

export interface Lottery {
  id: string;
  name: string;
  code: string;
  type: 'single' | 'double';
  description: string;
  price: number;
  currency: string;
  drawSchedule: Array<{
    day: string;
    time: string;
  }>;
  isActive: boolean;
  state: string;
  country: string;
  officialWebsite?: string;
  lastDrawDate?: string;
  nextDrawDate?: string;
}

// Prediction Types
export interface Prediction {
  id: string;
  lotteryType: LotteryType;
  lotteryDisplayName: string;
  drawDate: string;
  drawTime: string;
  nonViableNumbers: {
    whiteBalls?: number[];
    redBalls?: number[];
  } | number[];
  price: number;
  notes?: string;
  downloadCount: number;
  purchaseCount: number;
  accuracy?: number;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Purchase Types
export interface Purchase {
  id: string;
  user: string;
  prediction: Prediction;
  amount: number;
  paymentMethod: 'wallet' | 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  downloadCount: number;
  lastDownloaded?: string;
  isRefunded: boolean;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  selectedLottery: LotteryType;
  agreeToTerms: boolean;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone: string;
  notificationsEnabled: boolean;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface WalletTopUpForm {
  amount: number;
  paymentMethod: 'stripe' | 'paypal';
}

// Number Generator Types
export interface NumberGeneratorConfig {
  lotteryType: LotteryType;
  viableNumbers: number[];
  pickCount: number;
  generateCount: number;
}

export interface GeneratedCombination {
  id: string;
  numbers: number[];
  timestamp: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
}

// Contact Types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  totalPredictions: number;
  totalPurchases: number;
  totalRevenue: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'prediction' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginForm) => Promise<{ user: User; token: string }>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateForm) => Promise<void>;
  changePassword: (data: PasswordChangeForm) => Promise<void>;
  refreshUser: () => Promise<void>;
  isTrialActive: () => boolean;
  isTrialExpired: () => boolean;
  canStartTrial: () => boolean;
}

export interface PredictionContextType {
  predictions: Prediction[];
  loading: boolean;
  fetchPredictions: (lotteryType: LotteryType) => Promise<void>;
  fetchPredictionDetails: (lotteryType: LotteryType, id: string) => Promise<Prediction>;
  purchasePrediction: (lotteryType: LotteryType, id: string, paymentMethod: string) => Promise<void>;
  fetchMyPurchases: () => Promise<Purchase[]>;
  fetchTrialPredictions: (lotteryType: LotteryType) => Promise<Prediction[]>;
}

