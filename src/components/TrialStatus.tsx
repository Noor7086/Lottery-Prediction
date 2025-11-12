import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaGift } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const TrialStatus: React.FC = () => {
  const { user, canStartTrial, isTrialExpired } = useAuth();

  if (!user) return null;

  // Don't show this component if:
  // 1. User is currently in trial
  // 2. User has used trial
  // 3. Trial has expired (trial days = 0)
  // 4. User cannot start trial
  const hasUsedTrialValue = user.hasUsedTrial ?? false;
  if (user.isInTrial || hasUsedTrialValue || isTrialExpired() || !canStartTrial()) {
    return null;
  }

  // User can start trial - show the message
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
};

export default TrialStatus;

