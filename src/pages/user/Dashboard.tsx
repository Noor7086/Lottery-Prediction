import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, 
  FaWallet, 
  FaTicketAlt, 
  FaTrophy, 
  FaUser,
  FaBell,
  FaCreditCard
} from 'react-icons/fa';
import TrialCountdown from '../../components/TrialCountdown';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    successfulPredictions: 0,
    trialDaysLeft: 0
  });

  useEffect(() => {
    // Simulate loading user stats
    const loadUserStats = async () => {
      try {
        // In a real app, this would fetch from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalPredictions: 12,
          successfulPredictions: 8,
          trialDaysLeft: 7
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, []);

  const quickActions = [
    {
      title: 'View Predictions',
      description: 'Browse available lottery predictions',
      icon: <FaChartLine className="text-primary" />,
      action: () => navigate('/predictions'),
      variant: 'primary'
    },
    {
      title: 'My Predictions',
      description: 'View your purchased predictions',
      icon: <FaTicketAlt className="text-success" />,
      action: () => navigate('/my-predictions'),
      variant: 'success'
    },
    {
      title: 'Number Generator',
      description: 'Generate random lottery numbers',
      icon: <FaTrophy className="text-warning" />,
      action: () => navigate('/number-generator'),
      variant: 'warning'
    },
    {
      title: 'View Results',
      description: 'Check latest lottery results',
      icon: <FaBell className="text-info" />,
      action: () => navigate('/results'),
      variant: 'info'
    },
    {
      title: 'My Wallet',
      description: 'Manage your funds and add money',
      icon: <FaCreditCard className="text-secondary" />,
      action: () => navigate('/wallet'),
      variant: 'secondary'
    }
  ];

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="pt-2 pb-4" style={{ marginTop: '4rem' }}>
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Welcome back, {user?.firstName || 'User'}!</h2>
              <p className="text-muted mb-0">Here's your lottery prediction overview</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/profile')}>
                <FaUser className="me-1" />
                Profile
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Trial Countdown */}
      <Row className="mb-4">
        <Col>
          <TrialCountdown />
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaChartLine className="text-primary mb-2" style={{ fontSize: '2rem' }} />
              <h5 className="mb-1">{stats.totalPredictions}</h5>
              <p className="text-muted mb-0 small">Total Predictions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaTrophy className="text-success mb-2" style={{ fontSize: '2rem' }} />
              <h5 className="mb-1">{stats.successfulPredictions}</h5>
              <p className="text-muted mb-0 small">Successful</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaWallet className="text-warning mb-2" style={{ fontSize: '2rem' }} />
              <h5 className="mb-1">
                ${user?.walletBalance?.toFixed(2) || '0.00'}
              </h5>
              <p className="text-muted mb-0 small">Wallet Balance</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaUser className="text-info mb-2" style={{ fontSize: '2rem' }} />
              <h5 className="mb-1">{stats.trialDaysLeft}</h5>
              <p className="text-muted mb-0 small">Trial Days Left</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <h4 className="mb-3">Quick Actions</h4>
        </Col>
      </Row>
      <Row>
        {quickActions.map((action, index) => (
          <Col md={6} lg={3} className="mb-3" key={index}>
            <Card 
              className="h-100 border-0 shadow-sm quick-action-card"
              style={{ cursor: 'pointer' }}
              onClick={action.action}
            >
              <Card.Body className="text-center">
                <div className="mb-3">
                  {action.icon}
                </div>
                <h6 className="mb-2">{action.title}</h6>
                <p className="text-muted small mb-0">{action.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity */}
      <Row className="mt-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <FaBell className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <p className="text-muted">No recent activity to display</p>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/my-predictions')}>
                  View All Activity
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
