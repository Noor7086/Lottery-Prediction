import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Prediction from '../models/Prediction.js';

// @desc    Get all payment transactions for admin
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAdminPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, method, search } = req.query;
    
    // Build query filters
    let query = {};
    
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }
    
    if (method && method !== 'all') {
      query.paymentMethod = method;
    }
    
    // Search by transaction ID or stripe payment intent ID
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { transactionId: { $regex: search, $options: 'i' } },
          { stripePaymentIntentId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const finalQuery = { ...query, ...searchQuery };

    const purchases = await Purchase.find(finalQuery)
      .populate({
        path: 'user',
        select: 'firstName lastName email phone',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'prediction',
        select: 'lotteryType lotteryDisplayName drawDate drawTime price',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 20)
      .skip((parseInt(page) - 1) * (parseInt(limit) || 20))
      .lean();

    // If search includes email, filter in memory (populate doesn't support regex on nested fields)
    let filteredPurchases = purchases;
    if (search && search.includes('@')) {
      filteredPurchases = purchases.filter(p => 
        p.user && typeof p.user === 'object' && p.user.email && 
        p.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Purchase.countDocuments(finalQuery);
    
    console.log(`📊 Found ${filteredPurchases.length} purchases out of ${total} total (Filters: status=${status || 'all'}, method=${method || 'all'})`);

    // Format the response with complete transaction details
    const formattedPurchases = filteredPurchases.map(purchase => {
      const user = purchase.user && typeof purchase.user === 'object' ? purchase.user : null;
      const prediction = purchase.prediction && typeof purchase.prediction === 'object' ? purchase.prediction : null;
      
      return {
        id: purchase._id?.toString() || '',
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User',
        userEmail: user?.email || 'N/A',
        userPhone: user?.phone || 'N/A',
        amount: purchase.amount || 0,
        lotteryType: prediction?.lotteryType || 'N/A',
        lotteryDisplayName: prediction?.lotteryDisplayName || 'N/A',
        drawDate: prediction?.drawDate || null,
        drawTime: prediction?.drawTime || null,
        paymentMethod: purchase.paymentMethod || 'N/A',
        paymentStatus: purchase.paymentStatus || 'pending',
        transactionId: purchase.transactionId || 'N/A',
        stripePaymentIntentId: purchase.stripePaymentIntentId || null,
        downloadCount: purchase.downloadCount || 0,
        lastDownloaded: purchase.lastDownloaded || null,
        isRefunded: purchase.isRefunded || false,
        refundReason: purchase.refundReason || null,
        ipAddress: purchase.ipAddress || null,
        createdAt: purchase.createdAt || new Date(),
        updatedAt: purchase.updatedAt || purchase.createdAt || new Date()
      };
    });

    // Calculate statistics
    const stats = {
      total: total,
      completed: await Purchase.countDocuments({ ...finalQuery, paymentStatus: 'completed' }),
      pending: await Purchase.countDocuments({ ...finalQuery, paymentStatus: 'pending' }),
      failed: await Purchase.countDocuments({ ...finalQuery, paymentStatus: 'failed' }),
      refunded: await Purchase.countDocuments({ ...finalQuery, paymentStatus: 'refunded' }),
      totalRevenue: await Purchase.aggregate([
        { $match: { ...finalQuery, paymentStatus: 'completed', isRefunded: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json({
      success: true,
      data: {
        purchases: formattedPurchases,
        statistics: stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / (parseInt(limit) || 20)),
          total,
          limit: parseInt(limit) || 20
        }
      }
    });
  } catch (error) {
    console.error('❌ Get admin payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get payment statistics summary
// @route   GET /api/admin/payments/stats
// @access  Private/Admin
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const [
      totalTransactions,
      completedTransactions,
      totalRevenue,
      recentTransactions
    ] = await Promise.all([
      Purchase.countDocuments(dateQuery),
      Purchase.countDocuments({ ...dateQuery, paymentStatus: 'completed' }),
      Purchase.aggregate([
        { $match: { ...dateQuery, paymentStatus: 'completed', isRefunded: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      Purchase.find(dateQuery)
        .populate('user', 'firstName lastName email')
        .populate('prediction', 'lotteryType lotteryDisplayName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        totalTransactions,
        completedTransactions,
        totalRevenue,
        recentTransactions: recentTransactions.map(t => ({
          id: t._id,
          user: t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown',
          amount: t.amount,
          lottery: t.prediction?.lotteryDisplayName || 'N/A',
          status: t.paymentStatus,
          date: t.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment statistics'
    });
  }
};

