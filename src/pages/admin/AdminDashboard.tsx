import React, { useState, useEffect } from 'react';
import { AdminStats } from '../../types';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import SimpleChart from '../../components/charts/SimpleChart';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/stats');
      if ((response as any).success) {
        setStats((response as any).data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={fetchStats}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout stats={{ totalUsers: stats?.totalUsers, totalPredictions: stats?.totalPredictions }}>
          {/* Header */}
          <div className="dashboard-header">
            <div className="header-left">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Welcome back! Here's what's happening with your platform.</p>
              </div>
            </div>
            <div className="header-actions">
              <div className="notification-badge me-3">
                <button className="btn btn-outline-light position-relative">
                  <i className="bi bi-bell"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    3
                  </span>
                </button>
              </div>
              <button className="btn btn-outline-primary me-2">
                <i className="bi bi-download me-2"></i>
                Export Data
              </button>
              <button className="btn btn-primary" onClick={fetchStats}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalUsers || 0}</h3>
                <p>Total Users</p>
                <div className="stat-trend">
                  <i className="bi bi-arrow-up text-success"></i>
                  <span className="text-success">+12%</span>
                  <span className="text-muted">from last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <i className="bi bi-person-check-fill"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.activeUsers || 0}</h3>
                <p>Active Users</p>
                <div className="stat-trend">
                  <i className="bi bi-arrow-up text-success"></i>
                  <span className="text-success">+8%</span>
                  <span className="text-muted">from last week</span>
                </div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <i className="bi bi-clock-fill"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.trialUsers || 0}</h3>
                <p>Trial Users</p>
                <div className="stat-trend">
                  <i className="bi bi-arrow-down text-warning"></i>
                  <span className="text-warning">-3%</span>
                  <span className="text-muted">from last week</span>
                </div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <i className="bi bi-graph-up"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalPredictions || 0}</h3>
                <p>Total Predictions</p>
                <div className="stat-trend">
                  <i className="bi bi-arrow-up text-success"></i>
                  <span className="text-success">+25%</span>
                  <span className="text-muted">from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue and Performance Cards */}
          <div className="revenue-section">
            <div className="revenue-card">
              <div className="card-header">
                <h4>Revenue Overview</h4>
                <div className="card-actions">
                  <button className="btn btn-sm btn-outline-primary">View Details</button>
                </div>
              </div>
              <div className="card-body">
                <div className="revenue-stats">
                  <div className="revenue-item">
                    <h2>${stats?.totalRevenue?.toFixed(2) || '0.00'}</h2>
                    <p>Total Revenue</p>
                    <div className="trend positive">
                      <i className="bi bi-arrow-up"></i>
                      <span>+15.3%</span>
                    </div>
                  </div>
                  <div className="revenue-item">
                    <h2>{stats?.totalPurchases || 0}</h2>
                    <p>Total Purchases</p>
                    <div className="trend positive">
                      <i className="bi bi-arrow-up"></i>
                      <span>+8.7%</span>
                    </div>
                  </div>
                </div>
                <div className="revenue-chart">
                  <SimpleChart
                    type="line"
                    data={[1200, 1900, 3000, 5000, 2000, 3000, 4500, 3200, 2800, 4000, 3500, 4200]}
                    labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                    title="Monthly Revenue"
                    color="#6366f1"
                  />
                </div>
              </div>
            </div>

            <div className="quick-actions-card">
              <div className="card-header">
                <h4>Quick Actions</h4>
              </div>
              <div className="card-body">
                <div className="quick-actions">
                  <button className="action-btn">
                    <i className="bi bi-person-plus"></i>
                    <span>Add User</span>
                  </button>
                  <button className="action-btn">
                    <i className="bi bi-graph-up"></i>
                    <span>View Analytics</span>
                  </button>
                  <button className="action-btn">
                    <i className="bi bi-gear"></i>
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="analytics-section">
            <div className="analytics-card">
              <div className="card-header">
                <h4>User Activity Analytics</h4>
                <div className="card-actions">
                  <button className="btn btn-sm btn-outline-primary">Export Data</button>
                </div>
              </div>
              <div className="card-body">
                <SimpleChart
                  type="bar"
                  data={[65, 59, 80, 81, 56, 55, 40]}
                  labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  title="Weekly User Activity"
                  color="#10b981"
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="activity-card">
              <div className="card-header">
                <h4>Recent Activity</h4>
                <div className="card-actions">
                  <button className="btn btn-sm btn-outline-primary">View All</button>
                </div>
              </div>
              <div className="card-body">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="activity-list">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <i className={`bi bi-${getActivityIcon(activity.type)}`}></i>
                        </div>
                        <div className="activity-content">
                          <h6>{activity.description}</h6>
                          <p className="text-muted">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="activity-badge">
                          <span className={`badge ${getActivityBadgeClass(activity.type)}`}>
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <h5>No recent activity</h5>
                    <p>Activity will appear here as users interact with your platform.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

    </AdminLayout>
  );
};

// Helper functions
const getActivityIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    'user': 'person-plus',
    'prediction': 'graph-up',
    'purchase': 'cart-check',
    'lottery': 'trophy',
    'default': 'activity'
  };
  return iconMap[type.toLowerCase()] || iconMap.default;
};

const getActivityBadgeClass = (type: string): string => {
  const classMap: { [key: string]: string } = {
    'user': 'bg-primary',
    'prediction': 'bg-info',
    'purchase': 'bg-success',
    'lottery': 'bg-warning',
    'default': 'bg-secondary'
  };
  return classMap[type.toLowerCase()] || classMap.default;
};

export default AdminDashboard;