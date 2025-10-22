import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheckCircle, FaGift } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const TrialStatus: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // User has never used trial
  if (!user.hasUsedTrial) {
    return (
      <Alert variant="info" className="border-0 shadow-sm">
        <div className="d-flex align-items-center">
          <FaGift className="me-3 fs-4 text-info" />
          <div className="flex-grow-1">
            <h6 className="alert-heading mb-1">Start Your Free Trial</h6>
            <p className="mb-2">Get 7 days of free predictions for your selected lottery game.</p>
            <Button variant="info" size="sm" href="/register">
              Start Free Trial
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  // User is currently in trial
  if (user.isInTrial) {
    const trialEndDate = new Date(user.trialEndDate);
    const now = new Date();
    const isExpired = now > trialEndDate;

    if (isExpired) {
      return (
        <Alert variant="warning" className="border-0 shadow-sm">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3 fs-4 text-warning" />
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-1">Free Trial Expired</h6>
              <p className="mb-2">Your 7-day free trial has ended. Purchase predictions to continue using our service.</p>
              <Button variant="primary" size="sm" href="/pricing">
                View Pricing
              </Button>
            </div>
          </div>
        </Alert>
      );
    }

    return (
      <Alert variant="success" className="border-0 shadow-sm">
        <div className="d-flex align-items-center">
          <FaCheckCircle className="me-3 fs-4 text-success" />
          <div className="flex-grow-1">
            <h6 className="alert-heading mb-1">Free Trial Active</h6>
            <p className="mb-2">
              Your trial ends on {trialEndDate.toLocaleDateString()}. 
              Enjoy your free predictions!
            </p>
            <Button variant="outline-success" size="sm" href="/pricing">
              View Pricing
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  // User has used trial but it's expired
  return (
    <Alert variant="secondary" className="border-0 shadow-sm">
      <div className="d-flex align-items-center">
        <FaExclamationTriangle className="me-3 fs-4 text-secondary" />
        <div className="flex-grow-1">
          <h6 className="alert-heading mb-1">Trial Completed</h6>
          <p className="mb-2">You've already used your free trial. Purchase predictions to continue using our service.</p>
          <Button variant="primary" size="sm" href="/pricing">
            View Pricing
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default TrialStatus;

