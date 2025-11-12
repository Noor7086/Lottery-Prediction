import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from env file in backend directory
dotenv.config({ path: join(__dirname, 'env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - more lenient for development
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 1000, // 10k requests in dev, 1k in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import predictionRoutes from './routes/predictions.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import lotteryRoutes from './routes/lotteries.js';
import walletRoutes from './routes/wallet.js';
import contactRoutes from './routes/contact.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
console.log('✅ Users routes registered at /api/users');
app.use('/api/predictions', predictionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
// Debug: Log when admin routes are registered
console.log('✅ Admin routes registered at /api/admin');
app.use('/api/notifications', notificationRoutes);
app.use('/api/lotteries', lotteryRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/contact', contactRoutes);
console.log('✅ Contact routes registered at /api/contact');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

