import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Predictions',
      value: '24',
      icon: 'bi-graph-up',
      color: 'primary',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Accuracy Rate',
      value: '95%',
      icon: 'bi-target',
      color: 'success',
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Active Lotteries',
      value: '3',
      icon: 'bi-dice-6',
      color: 'info',
      change: '2 new',
      changeType: 'neutral'
    },
    {
      title: 'Winnings',
      value: '$1,250',
      icon: 'bi-currency-dollar',
      color: 'warning',
      change: '+$450',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'View Predictions',
      description: 'Check latest lottery predictions',
      icon: 'bi-eye',
      link: '/predictions',
      color: 'primary'
    },
    {
      title: 'Number Generator',
      description: 'Generate winning combinations',
      icon: 'bi-shuffle',
      link: '/number-generator',
      color: 'secondary'
    },
    {
      title: 'My Predictions',
      description: 'View your prediction history',
      icon: 'bi-clock-history',
      link: '/my-predictions',
      color: 'info'
    },
    {
      title: 'Results',
      description: 'Check lottery results',
      icon: 'bi-trophy',
      link: '/results',
      color: 'success'
    }
  ];

  const recentActivity = [
    {
      action: 'New prediction available',
      lottery: 'Powerball',
      time: '2 hours ago',
      icon: 'bi-bell'
    },
    {
      action: 'Prediction accuracy updated',
      lottery: 'Mega Million',
      time: '1 day ago',
      icon: 'bi-graph-up'
    },
    {
      action: 'Number generated',
      lottery: 'Gopher 5',
      time: '2 days ago',
      icon: 'bi-shuffle'
    }
  ];

  return (
    <div className="container py-5 mt-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="display-5 fw-bold mb-2 gradient-text">Dashboard</h1>
              <p className="lead text-muted">Welcome back, {user?.firstName}! 👋</p>
            </div>
            <div className="d-flex align-items-center">
              <div className="avatar bg-gradient-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" 
                   style={{ width: '60px', height: '60px' }}>
                <span className="fw-bold fs-4">{user?.firstName?.charAt(0)}</span>
              </div>
            </div>
          </div>
          
          {user?.isInTrial && (
            <div className="alert alert-info border-0 shadow-custom fade-in">
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle me-3 fs-4"></i>
                <div>
                  <h6 className="alert-heading mb-1">Free Trial Active</h6>
                  <p className="mb-0">Your trial ends on {new Date(user.trialEndDate).toLocaleDateString()}. 
                  <Link to="/profile" className="alert-link ms-1">Upgrade now</Link></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-custom hover-lift fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className={`icon-wrapper bg-${stat.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                       style={{ width: '50px', height: '50px' }}>
                    <i className={`${stat.icon} text-${stat.color} fs-4`}></i>
                  </div>
                  <span className={`badge bg-${stat.changeType === 'positive' ? 'success' : stat.changeType === 'negative' ? 'danger' : 'secondary'} bg-opacity-10 text-${stat.changeType === 'positive' ? 'success' : stat.changeType === 'negative' ? 'danger' : 'secondary'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="fw-bold mb-1">{stat.value}</h3>
                <p className="text-muted mb-0">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-custom fade-in">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {quickActions.map((action, index) => (
                  <div key={index} className="col-md-6">
                    <Link to={action.link} className="text-decoration-none">
                      <div className="card border-0 bg-light hover-lift h-100">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center">
                            <div className={`icon-wrapper bg-${action.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                                 style={{ width: '40px', height: '40px' }}>
                              <i className={`${action.icon} text-${action.color} fs-5`}></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1 text-dark">{action.title}</h6>
                              <p className="text-muted small mb-0">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-custom fade-in">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="d-flex align-items-start mb-3">
                    <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: '35px', height: '35px' }}>
                      <i className={`${activity.icon} text-primary fs-6`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 fw-medium">{activity.action}</p>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary me-2 small">{activity.lottery}</span>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/my-predictions" className="btn btn-outline-primary btn-sm w-100 mt-3">
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

