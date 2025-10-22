import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const MyPredictions: React.FC = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockPredictions = [
    {
      id: 1,
      lottery: 'Powerball',
      lotteryIcon: '⚡',
      date: '2024-01-15',
      drawDate: '2024-01-17',
      status: 'active',
      confidence: 96,
      nonViableNumbers: [1, 3, 7, 12, 15, 18, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67],
      powerballNonViable: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25],
      result: null,
      accuracy: null
    },
    {
      id: 2,
      lottery: 'Mega Millions',
      lotteryIcon: '💰',
      date: '2024-01-14',
      drawDate: '2024-01-16',
      status: 'completed',
      confidence: 94,
      nonViableNumbers: [2, 4, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68],
      megaBallNonViable: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 25],
      result: {
        winningNumbers: [3, 11, 19, 27, 33],
        megaBall: 8,
        accuracy: 92
      },
      accuracy: 92
    },
    {
      id: 3,
      lottery: 'Gopher 5',
      lotteryIcon: '🎯',
      date: '2024-01-13',
      drawDate: '2024-01-15',
      status: 'completed',
      confidence: 93,
      nonViableNumbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46],
      result: {
        winningNumbers: [2, 9, 16, 24, 37],
        accuracy: 87
      },
      accuracy: 87
    },
    {
      id: 4,
      lottery: 'Pick 3',
      lotteryIcon: '🎲',
      date: '2024-01-12',
      drawDate: '2024-01-13',
      status: 'completed',
      confidence: 97,
      nonViableNumbers: [0, 2, 4, 6, 8],
      result: {
        winningNumbers: [4, 7, 9],
        accuracy: 100
      },
      accuracy: 100
    }
  ];

  const filteredPredictions = selectedFilter === 'all' 
    ? mockPredictions 
    : mockPredictions.filter(pred => pred.status === selectedFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-primary">Active</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'expired':
        return <span className="badge bg-secondary">Expired</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return 'text-muted';
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 80) return 'text-warning';
    return 'text-danger';
  };

  if (!user) {
    return (
      <div className="container py-5 mt-5">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <i className="bi bi-person-x fs-1 text-muted mb-3"></i>
                <h4 className="fw-bold mb-3">Login Required</h4>
                <p className="text-muted mb-4">
                  Please log in to view your prediction history and track your success rate.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <a href="/login" className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </a>
                  <a href="/register" className="btn btn-outline-primary">
                    <i className="bi bi-person-plus me-2"></i>
                    Sign Up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 className="display-5 fw-bold gradient-text">My Predictions</h1>
              <p className="lead text-muted">Track your prediction history and success rate</p>
            </div>
            <div className="text-end">
              <div className="card bg-primary text-white">
                <div className="card-body p-3 text-center">
                  <h6 className="fw-bold mb-1">Overall Accuracy</h6>
                  <h4 className="fw-bold mb-0">91.3%</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up text-primary fs-3 mb-2"></i>
                  <h5 className="fw-bold">Total Predictions</h5>
                  <h3 className="fw-bold text-primary">{mockPredictions.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-check-circle text-success fs-3 mb-2"></i>
                  <h5 className="fw-bold">Completed</h5>
                  <h3 className="fw-bold text-success">{mockPredictions.filter(p => p.status === 'completed').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-clock text-warning fs-3 mb-2"></i>
                  <h5 className="fw-bold">Active</h5>
                  <h3 className="fw-bold text-warning">{mockPredictions.filter(p => p.status === 'active').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-trophy text-info fs-3 mb-2"></i>
                  <h5 className="fw-bold">Avg. Accuracy</h5>
                  <h3 className="fw-bold text-info">91.3%</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-funnel me-2"></i>
                Filter Predictions
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { id: 'all', name: 'All Predictions', icon: '📊' },
                  { id: 'active', name: 'Active', icon: '⏰' },
                  { id: 'completed', name: 'Completed', icon: '✅' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    className={`btn ${selectedFilter === filter.id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedFilter(filter.id)}
                  >
                    <span className="me-2">{filter.icon}</span>
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Predictions List */}
          <div className="row g-4">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-2 text-center">
                        <span className="fs-1">{prediction.lotteryIcon}</span>
                        <div className="mt-2">
                          {getStatusBadge(prediction.status)}
                        </div>
                      </div>
                      <div className="col-md-10">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold mb-1">{prediction.lottery}</h5>
                            <div className="small text-muted">
                              Generated: {prediction.date} • Draw: {prediction.drawDate}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="badge bg-success fs-6">{prediction.confidence}% Confidence</div>
                            {prediction.accuracy && (
                              <div className={`small fw-bold ${getAccuracyColor(prediction.accuracy)}`}>
                                {prediction.accuracy}% Accuracy
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Non-Viable Numbers */}
                        <div className="mb-3">
                          <h6 className="fw-bold text-danger mb-2">
                            <i className="bi bi-x-circle me-2"></i>
                            Non-Viable Numbers (Avoid These)
                          </h6>
                          <div className="d-flex flex-wrap gap-1">
                            {prediction.nonViableNumbers.map((num: number) => (
                              <span key={num} className="badge bg-danger">{num}</span>
                            ))}
                          </div>
                        </div>

                        {/* Bonus Numbers */}
                        {(prediction.powerballNonViable || prediction.megaBallNonViable) && (
                          <div className="mb-3">
                            <h6 className="fw-bold text-danger mb-2">
                              <i className="bi bi-x-circle me-2"></i>
                              Non-Viable {prediction.lottery === 'Powerball' ? 'Powerball' : 'Mega Ball'} Numbers
                            </h6>
                            <div className="d-flex flex-wrap gap-1">
                              {(prediction.powerballNonViable || prediction.megaBallNonViable)?.map((num: number) => (
                                <span key={num} className="badge bg-danger">{num}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Results */}
                        {prediction.result && (
                          <div className="alert alert-info">
                            <h6 className="fw-bold mb-2">
                              <i className="bi bi-trophy me-2"></i>
                              Draw Results
                            </h6>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {prediction.result.winningNumbers.map((num: number, index: number) => (
                                <span key={index} className="badge bg-primary fs-6">{num}</span>
                              ))}
                              {prediction.result.megaBall && (
                                <span className="badge bg-warning text-dark fs-6">{prediction.result.megaBall}</span>
                              )}
                            </div>
                            <div className="small">
                              <strong>Prediction Accuracy:</strong> {prediction.result.accuracy}%
                            </div>
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-eye me-1"></i>
                            View Details
                          </button>
                          <button className="btn btn-outline-success btn-sm">
                            <i className="bi bi-share me-1"></i>
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPredictions.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
              <h5 className="fw-bold mb-3">No Predictions Found</h5>
              <p className="text-muted mb-4">
                {selectedFilter === 'all' 
                  ? "You haven't generated any predictions yet."
                  : `No ${selectedFilter} predictions found.`
                }
              </p>
              <a href="/predictions" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Generate New Prediction
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPredictions;

