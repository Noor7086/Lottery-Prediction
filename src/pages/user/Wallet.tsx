import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaWallet, FaPlus, FaHistory, FaCreditCard } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowAddFundsModal(false);
    setAmount('');
    setError('');
    setSuccess('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    if (numAmount < 1) {
      setError('Minimum amount is $1.00');
      return false;
    }
    if (numAmount > 1000) {
      setError('Maximum amount is $1,000.00');
      return false;
    }
    return true;
  };

  const createOrder = (_data: any, actions: any) => {
    if (!validateAmount()) {
      return Promise.reject('Invalid amount');
    }

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
            currency_code: 'USD'
          },
          description: `Add $${amount} to wallet balance`
        }
      ]
    });
  };

  const onApprove = async (_data: any, actions: any) => {
    try {
      setLoading(true);
      setError('');
      
      // Capture the payment
      const details = await actions.order.capture();
      
      // Here you would typically send the payment details to your backend
      // to update the user's wallet balance
      console.log('Payment completed:', details);
      
      setSuccess(`Successfully added $${amount} to your wallet!`);
      
      // Close modal after a short delay
      setTimeout(() => {
        handleCloseModal();
        // You might want to refresh user data here
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal error:', err);
    setError('Payment failed. Please try again.');
  };

  return (
    <Container className="py-4" style={{ marginTop: '4rem' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-1">
                <FaWallet className="me-2 text-primary" />
                My Wallet
              </h2>
              <p className="text-muted mb-0">Manage your funds and view transaction history</p>
            </div>
            <Button 
              variant="success" 
              size="lg"
              onClick={handleAddFunds}
            >
              <FaPlus className="me-2" />
              Add Funds
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Wallet Balance Card */}
        <Col lg={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center py-4">
                <FaWallet className="text-primary mb-3" style={{ fontSize: '4rem' }} />
                <h3 className="mb-2">Current Balance</h3>
                <h1 className="display-4 fw-bold text-primary mb-3">
                  ${user?.walletBalance?.toFixed(2) || '0.00'}
                </h1>
                <p className="text-muted">
                  Available funds for lottery predictions
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col lg={4}>
          <Row className="g-3">
            <Col xs={12}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <FaPlus className="text-success fs-2 mb-2" />
                  <h6 className="card-title">Total Deposited</h6>
                  <h4 className="text-success fw-bold">
                    ${user?.walletBalance?.toFixed(2) || '0.00'}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={12}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <FaHistory className="text-info fs-2 mb-2" />
                  <h6 className="card-title">Transactions</h6>
                  <h4 className="text-info fw-bold">0</h4>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={12}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <FaCreditCard className="text-warning fs-2 mb-2" />
                  <h6 className="card-title">Last Payment</h6>
                  <p className="text-muted small mb-0">Never</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Transaction History Placeholder */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <FaHistory className="me-2" />
                Transaction History
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <FaHistory className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h5 className="text-muted">No transactions yet</h5>
                <p className="text-muted">Your transaction history will appear here after you add funds.</p>
                <Button variant="outline-primary" onClick={handleAddFunds}>
                  <FaPlus className="me-2" />
                  Add Your First Funds
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Funds Modal */}
      <Modal show={showAddFundsModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2 text-success" />
            Add Funds to Wallet
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          )}

          <div className="mb-4">
            <h6>Current Balance: ${user?.walletBalance?.toFixed(2) || '0.00'}</h6>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>Enter amount you want to add to your account</Form.Label>
            <Form.Control
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="form-control-lg"
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Minimum: $1.00 | Maximum: $1,000.00
            </Form.Text>
          </Form.Group>

           {amount && parseFloat(amount) > 0 && (
             <div className="text-center">
               <h6 className="mb-3">Payment Amount: ${parseFloat(amount).toFixed(2)}</h6>
               
               <PayPalScriptProvider 
                 key={`paypal-${amount}`}
                 options={{ 
                   clientId: "test",
                   currency: "USD"
                 }}
               >
                 <PayPalButtons
                   key={`buttons-${amount}`}
                   createOrder={createOrder}
                   onApprove={onApprove}
                   onError={onError}
                   style={{
                     layout: 'vertical',
                     color: 'blue',
                     shape: 'rect',
                     label: 'paypal'
                   }}
                 />
               </PayPalScriptProvider>
             </div>
           )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Cancel
          </Button>
          {loading && (
            <div className="d-flex align-items-center">
              <Spinner size="sm" className="me-2" />
              Processing payment...
            </div>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Wallet;
