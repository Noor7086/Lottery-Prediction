import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { Modal, Button } from 'react-bootstrap';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';

const Predictions: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { makePayment } = useWallet();
  const [selectedLottery, setSelectedLottery] = useState('powerball');
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const lotteryCategories = [
    {
      id: 'national',
      name: 'National Lotteries',
      description: 'Multi-state lottery games with large jackpots',
      icon: '🇺🇸'
    },
    {
      id: 'state',
      name: 'State Lotteries',
      description: 'State-specific lottery games',
      icon: '🏛️'
    },
    {
      id: 'daily',
      name: 'Daily Games',
      description: 'Games with daily drawings',
      icon: '📅'
    }
  ];

  const lotteryTypes = [
    {
      id: 'powerball',
      name: 'Powerball',
      state: 'USA',
      description: 'Pick 5 from 69 + 1 from 26',
      price: 2,
      icon: '⚡',
      nextDraw: 'Wednesday, 8:59 PM EST',
      category: 'national'
    },
    {
      id: 'megamillion',
      name: 'Mega Millions',
      state: 'USA',
      description: 'Pick 5 from 70 + 1 from 25',
      price: 5,
      icon: '💰',
      nextDraw: 'Tuesday, 11:00 PM EST',
      category: 'national'
    },
    {
      id: 'lottoamerica',
      name: 'Lotto America',
      state: 'USA',
      description: 'Pick 5 from 52 + 1 from 10',
      price: 1,
      icon: '🇺🇸',
      nextDraw: 'Wednesday, 10:00 PM EST',
      category: 'national'
    },
    {
      id: 'gopher5',
      name: 'Gopher 5',
      state: 'Minnesota',
      description: 'Pick 5 numbers from 1-47',
      price: 1,
      icon: '🎯',
      nextDraw: 'Monday, 6:00 PM CST',
      category: 'state'
    },
    {
      id: 'pick3',
      name: 'Pick 3',
      state: 'Minnesota',
      description: 'Pick 3 numbers from 0-9',
      price: 1,
      icon: '🎲',
      nextDraw: 'Daily, 6:00 PM CST',
      category: 'daily'
    }
  ];

  const mockPredictions = {
    powerball: {
      nonViableNumbers: [1, 3, 7, 12, 15, 18, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67],
      powerballNonViable: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25],
      confidence: 96,
      lastUpdated: '2 hours ago',
      nextDraw: 'Wednesday, 8:59 PM EST'
    },
    megamillion: {
      nonViableNumbers: [2, 4, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68],
      megaBallNonViable: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 25],
      confidence: 94,
      lastUpdated: '1 hour ago',
      nextDraw: 'Tuesday, 11:00 PM EST'
    },
    lottoamerica: {
      nonViableNumbers: [1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51],
      starBallNonViable: [1, 3, 5, 7, 9],
      confidence: 95,
      lastUpdated: '3 hours ago',
      nextDraw: 'Wednesday, 10:00 PM EST'
    },
    gopher5: {
      nonViableNumbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46],
      confidence: 93,
      lastUpdated: '4 hours ago',
      nextDraw: 'Monday, 6:00 PM CST'
    },
    pick3: {
      nonViableNumbers: [0, 2, 4, 6, 8],
      confidence: 97,
      lastUpdated: '30 minutes ago',
      nextDraw: 'Daily, 6:00 PM CST'
    }
  };

  const handlePurchaseClick = () => {
    setShowPaymentModal(true);
  };

  const generatePredictions = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPredictions(mockPredictions[selectedLottery as keyof typeof mockPredictions]);
      setLoading(false);
    }, 2000);
  };

  const handleWalletPayment = async () => {
    if (!user || !selectedLotteryData) {
      toast.error('User or lottery data not available');
      return;
    }

    const amount = selectedLotteryData.price;
    
    // Check if user has sufficient wallet balance
    if (user.walletBalance < amount) {
      toast.error('Insufficient wallet balance. Please add funds to your wallet.');
      return;
    }

    setPaymentLoading(true);
    try {
      // Prepare payment data - simplified to avoid validation issues
      const paymentData = {
        amount: amount,
        description: `Prediction purchase for ${selectedLotteryData.name}`
      };

      console.log('Payment data being sent:', paymentData);

      // Make payment using wallet service - this will actually deduct from backend
      const success = await makePayment(paymentData);

      if (success) {
        // Refresh user data to get updated wallet balance from backend
        await refreshUser();
        
        setShowPaymentModal(false);
        generatePredictions();
        toast.success(`Payment of $${amount} processed successfully!`);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Wallet payment failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };


  const handlePayPalPayment = async () => {
    setPaymentLoading(true);
    try {
      // PayPal payment will be handled by PayPal buttons
      // This function will be called after successful PayPal payment
      setShowPaymentModal(false);
      generatePredictions();
    } catch (error) {
      console.error('PayPal payment failed:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const selectedLotteryData = lotteryTypes.find(lottery => lottery.id === selectedLottery);

  return (
    <div className="container py-5 mt-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3 gradient-text">AI Lottery Predictions</h1>
            <p className="lead text-muted">
              Get AI-powered predictions to identify non-viable numbers and improve your odds
            </p>
          </div>

          {/* Lottery Selection by Category */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-trophy me-2"></i>
                Select Lottery Game by Category
              </h5>
              
              {lotteryCategories.map((category) => {
                const categoryLotteries = lotteryTypes.filter(lottery => lottery.category === category.id);
                
                return (
                  <div key={category.id} className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-3 me-3">{category.icon}</span>
                      <div>
                        <h6 className="fw-bold mb-1">{category.name}</h6>
                        <p className="small text-muted mb-0">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="row g-3">
                      {categoryLotteries.map((lottery) => (
                        <div key={lottery.id} className="col-md-6 col-lg-4">
                          <div 
                            className={`card h-100 cursor-pointer ${selectedLottery === lottery.id ? 'border-primary' : ''}`}
                            onClick={() => setSelectedLottery(lottery.id)}
                            style={{ 
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: selectedLottery === lottery.id ? '2px solid var(--primary-color)' : '1px solid #e9ecef'
                            }}
                          >
                            <div className="card-body text-center">
                              <div className="mb-3">
                                <span style={{ fontSize: '2rem' }}>{lottery.icon}</span>
                              </div>
                              <h6 className="fw-bold">{lottery.name}</h6>
                              <p className="small text-muted mb-2">{lottery.state}</p>
                              <p className="small mb-2">{lottery.description}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="badge bg-primary">${lottery.price}/prediction</span>
                                <small className="text-muted">{lottery.nextDraw}</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {category.id !== lotteryCategories[lotteryCategories.length - 1].id && (
                      <hr className="my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate Predictions */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 text-center">

              
              {!user ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Please <a href="/register" className="alert-link">sign up</a> or <a href="/login" className="alert-link">login</a> to generate predictions
                </div>
              ) : (
                <button 
                  className="btn btn-primary btn-lg px-5"
                  onClick={handlePurchaseClick}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-magic me-2"></i>
                      Purchase Prediction - ${selectedLotteryData?.price}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Predictions Results */}
          {predictions && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    AI Predictions for {selectedLotteryData?.name}
                  </h5>
                  <div className="text-end">
                    <div className="badge bg-success fs-6">{predictions.confidence}% Confidence</div>
                    <div className="small text-muted">Updated {predictions.lastUpdated}</div>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold text-danger mb-3">
                          <i className="bi bi-x-circle me-2"></i>
                          Non-Viable Numbers (Avoid These)
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {predictions.nonViableNumbers.map((num: number) => (
                            <span key={num} className="badge bg-danger fs-6">{num}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {predictions.powerballNonViable && (
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="fw-bold text-danger mb-3">
                            <i className="bi bi-x-circle me-2"></i>
                            Non-Viable Powerball Numbers
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {predictions.powerballNonViable.map((num: number) => (
                              <span key={num} className="badge bg-danger fs-6">{num}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {predictions.megaBallNonViable && (
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="fw-bold text-danger mb-3">
                            <i className="bi bi-x-circle me-2"></i>
                            Non-Viable Mega Ball Numbers
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {predictions.megaBallNonViable.map((num: number) => (
                              <span key={num} className="badge bg-danger fs-6">{num}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {predictions.starBallNonViable && (
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="fw-bold text-danger mb-3">
                            <i className="bi bi-x-circle me-2"></i>
                            Non-Viable Star Ball Numbers
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {predictions.starBallNonViable.map((num: number) => (
                              <span key={num} className="badge bg-danger fs-6">{num}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="alert alert-info">
                    <i className="bi bi-lightbulb me-2"></i>
                    <strong>Pro Tip:</strong> Use our <a href="/tools/number-generator" className="alert-link">Number Generator</a> to create optimal combinations using only viable numbers!
                  </div>
                </div>

                <div className="text-center mt-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-clock fs-3 mb-2"></i>
                          <h6 className="fw-bold">Next Draw</h6>
                          <small>{predictions.nextDraw}</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-shield-check fs-3 mb-2"></i>
                          <h6 className="fw-bold">Confidence</h6>
                          <small>{predictions.confidence}% Accurate</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-info text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-arrow-clockwise fs-3 mb-2"></i>
                          <h6 className="fw-bold">Updated</h6>
                          <small>{predictions.lastUpdated}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-credit-card me-2"></i>
            Choose Payment Method
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h5>Purchase Prediction for {selectedLotteryData?.name}</h5>
            <p className="text-muted">Amount: <strong>${selectedLotteryData?.price}</strong></p>
            {user && (
              <p className="text-muted small">
                Wallet Balance: <strong>${user.walletBalance.toFixed(2)}</strong>
                {user.walletBalance < (selectedLotteryData?.price || 0) && (
                  <span className="text-danger ms-2">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Insufficient balance - <a href="/wallet" className="alert-link">Add funds</a>
                  </span>
                )}
              </p>
            )}
          </div>
          
          <div className="d-grid gap-3">
            {/* Wallet Payment Option */}
            <Button 
              variant="outline-primary" 
              size="lg"
              onClick={handleWalletPayment}
              disabled={paymentLoading || (user ? user.walletBalance < (selectedLotteryData?.price || 0) : false)}
              className="d-flex align-items-center justify-content-center"
            >
              {paymentLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-wallet2 me-2"></i>
                  Pay with Wallet
                </>
              )}
            </Button>

            {/* PayPal Payment Option */}
            <div className="paypal-container">
              <PayPalScriptProvider 
                options={{ 
                  clientId: "test", // Replace with your actual PayPal client ID
                  currency: "USD"
                }}
              >
                <PayPalButtons
                  createOrder={(_data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            value: selectedLotteryData?.price?.toString() || "0",
                            currency_code: "USD"
                          },
                          description: `Prediction for ${selectedLotteryData?.name}`
                        }
                      ]
                    });
                  }}
                  onApprove={(_data, actions) => {
                    return actions.order!.capture().then((details) => {
                      console.log('PayPal payment completed:', details);
                      handlePayPalPayment();
                    });
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    setPaymentLoading(false);
                  }}
                  style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Predictions;

