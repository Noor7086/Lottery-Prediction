import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Result {
  _id: string;
  lotteryType: string;
  drawDate: string;
  winningNumbers?: {
    whiteBalls?: number[];
    redBalls?: number[];
  };
  winningNumbersSingle?: number[];
  winningNumbersPick3?: number[];
  jackpot: number;
  winners: {
    jackpot: number;
    match5: number;
    match4: number;
    match3: number;
    exact: number;
    any: number;
  };
}

const Results: React.FC = () => {
  const [selectedLottery, setSelectedLottery] = useState('powerball');
  const [latestResult, setLatestResult] = useState<Result | null>(null);
  const [recentResults, setRecentResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

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
    { id: 'powerball', name: 'Powerball', icon: '⚡', category: 'national' },
    { id: 'megamillion', name: 'Mega Millions', icon: '💰', category: 'national' },
    { id: 'lottoamerica', name: 'Lotto America', icon: '🇺🇸', category: 'national' },
    { id: 'gopher5', name: 'Gopher 5', icon: '🎯', category: 'state' },
    { id: 'pick3', name: 'Pick 3', icon: '🎲', category: 'daily' }
  ];

  const mockResults = {
    powerball: {
      winningNumbers: [7, 14, 21, 28, 35],
      powerball: 12,
      drawDate: '2024-01-15',
      jackpot: '$50,000,000',
      nextDraw: '2024-01-17',
      winners: {
        jackpot: 0,
        match5: 2,
        match4: 45,
        match3: 1234
      }
    },
    megamillion: {
      winningNumbers: [3, 11, 19, 27, 33],
      megaBall: 8,
      drawDate: '2024-01-16',
      jackpot: '$75,000,000',
      nextDraw: '2024-01-19',
      winners: {
        jackpot: 0,
        match5: 1,
        match4: 38,
        match3: 987
      }
    },
    lottoamerica: {
      winningNumbers: [5, 13, 22, 31, 42],
      starBall: 3,
      drawDate: '2024-01-15',
      jackpot: '$2,000,000',
      nextDraw: '2024-01-17',
      winners: {
        jackpot: 0,
        match5: 0,
        match4: 12,
        match3: 456
      }
    },
    gopher5: {
      winningNumbers: [2, 9, 16, 24, 37],
      drawDate: '2024-01-15',
      jackpot: '$100,000',
      nextDraw: '2024-01-22',
      winners: {
        jackpot: 1,
        match4: 8,
        match3: 123
      }
    },
    pick3: {
      winningNumbers: [4, 7, 9],
      drawDate: '2024-01-16',
      jackpot: '$500',
      nextDraw: '2024-01-17',
      winners: {
        exact: 12,
        any: 45
      }
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedLottery]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Fetch all results for the selected lottery (no limit to show all)
      const response = await apiService.get(`/admin/results/lottery/${selectedLottery}?limit=100`);
      if ((response as any).success) {
        setLatestResult((response as any).data.latest);
        // Show all recent results, not just limited ones
        setRecentResults((response as any).data.recent || []);
      }
    } catch (error: any) {
      console.error('Error fetching results:', error);
      // Fallback to mock data if API fails
      setLatestResult(null);
      setRecentResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Format winning numbers for display
  const getWinningNumbers = (result: Result | null) => {
    if (!result) return { main: [], special: [] };
    
    // Check for single selection lotteries first (Gopher 5, etc.)
    if (result.winningNumbersSingle && Array.isArray(result.winningNumbersSingle) && result.winningNumbersSingle.length > 0) {
      return {
        main: result.winningNumbersSingle,
        special: []
      };
    }
    
    // Check for Pick 3 type lotteries
    if (result.winningNumbersPick3 && Array.isArray(result.winningNumbersPick3) && result.winningNumbersPick3.length > 0) {
      return {
        main: result.winningNumbersPick3,
        special: []
      };
    }
    
    // Check for double selection lotteries (Powerball, Mega Millions, etc.)
    if (result.winningNumbers) {
      // Get all red balls as an array, not just the first one
      const redBalls = Array.isArray(result.winningNumbers.redBalls) 
        ? result.winningNumbers.redBalls 
        : (result.winningNumbers.redBalls ? [result.winningNumbers.redBalls] : []);
      const whiteBalls = Array.isArray(result.winningNumbers.whiteBalls) 
        ? result.winningNumbers.whiteBalls 
        : [];
      
      // Only return if we have actual numbers
      if (whiteBalls.length > 0 || redBalls.length > 0) {
        return {
          main: whiteBalls,
          special: redBalls
        };
      }
    }
    
    return { main: [], special: [] };
  };

  // Format jackpot for display
  const formatJackpot = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Use latest result or fallback to mock
  const displayResults = latestResult ? latestResult : (mockResults[selectedLottery as keyof typeof mockResults] as any);

  return (
    <div className="container py-5 mt-5">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3 gradient-text">Lottery Results</h1>
            <p className="lead text-muted">
              Latest winning numbers and jackpot information for all major lottery games
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
                            onClick={() => {
                              setSelectedLottery(lottery.id);
                              
                              // Scroll to Latest Results section
                              setTimeout(() => {
                                const resultsSection = document.getElementById('latest-results-section');
                                if (resultsSection) {
                                  // Calculate offset to account for any fixed headers
                                  const headerOffset = 80;
                                  const elementPosition = resultsSection.getBoundingClientRect().top;
                                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                  window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                  });
                                }
                              }, 150);
                            }}
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

          {/* Latest Results */}
          <div id="latest-results-section" className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Latest Results - {lotteryTypes.find(l => l.id === selectedLottery)?.name}
                </h5>
                <div className="text-end">
                  <div className="badge bg-primary fs-6">
                    Draw Date: {latestResult ? (() => {
                    // Parse date correctly to avoid timezone issues
                    const date = new Date(latestResult.drawDate);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${month}/${day}/${year}`;
                  })() : displayResults.drawDate}
                  </div>
                </div>
              </div>

              {/* Winning Numbers */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <h6 className="fw-bold mb-3">Winning Numbers</h6>
                  <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                    {(() => {
                      const numbers = getWinningNumbers(latestResult);
                      return (
                        <>
                          {numbers.main.map((num: number, index: number) => (
                            <div key={index} className="lottery-ball bg-primary text-white">
                              {num}
                            </div>
                          ))}
                          {numbers.special && numbers.special.length > 0 && (
                            <>
                              <div className="mx-2 d-flex align-items-center">
                                <i className="bi bi-plus-lg text-muted"></i>
                              </div>
                              {numbers.special.map((num: number, index: number) => (
                                <div key={`special-${index}`} className="lottery-ball bg-warning text-dark">
                                  {num}
                                </div>
                              ))}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Jackpot and Winners */}
              {!loading && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <i className="bi bi-trophy fs-3 mb-2"></i>
                        <h6 className="fw-bold">Jackpot</h6>
                        <h4 className="fw-bold">
                          {latestResult ? formatJackpot(latestResult.jackpot) : displayResults.jackpot}
                        </h4>
                        {!latestResult && <small>Next Draw: {displayResults.nextDraw}</small>}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-success">
                      <div className="card-body text-center text-dark">
                        <i className="bi bi-people fs-3 mb-2 text-dark"></i>
                        <h6 className="fw-bold text-dark">Winners This Draw</h6>
                        <div className="row g-2">
                          {latestResult ? (
                            <>
                              {latestResult.winners.jackpot > 0 && (
                                <div className="col-6">
                                  <small className="d-block text-dark">Jackpot</small>
                                  <strong className="text-dark">{latestResult.winners.jackpot}</strong>
                                </div>
                              )}
                              {latestResult.winners.match5 > 0 && (
                                <div className="col-6">
                                  <small className="d-block text-dark">Match 5</small>
                                  <strong className="text-dark">{latestResult.winners.match5}</strong>
                                </div>
                              )}
                              {latestResult.winners.match4 > 0 && (
                                <div className="col-6">
                                  <small className="d-block text-dark">Match 4</small>
                                  <strong className="text-dark">{latestResult.winners.match4}</strong>
                                </div>
                              )}
                              {latestResult.winners.match3 > 0 && (
                                <div className="col-6">
                                  <small className="d-block text-dark">Match 3</small>
                                  <strong className="text-dark">{latestResult.winners.match3}</strong>
                                </div>
                              )}
                              {latestResult.winners.exact > 0 && (
                                <div className="col-6">
                                  <small className="d-block text-dark">Exact</small>
                                  <strong className="text-dark">{latestResult.winners.exact}</strong>
                                </div>
                              )}
                              {latestResult.winners.any > 0 && (
                                <div className="col-6">
                                  <small className="d-block text-dark">Any</small>
                                  <strong className="text-dark">{latestResult.winners.any}</strong>
                                </div>
                              )}
                            </>
                          ) : (
                            Object.entries(displayResults.winners).map(([type, count]) => (
                              <div key={type} className="col-6">
                                <small className="d-block text-dark">{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</small>
                                <strong className="text-dark">{count as number}</strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historical Results */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-clock-history me-2"></i>
                Recent Draws
              </h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Draw Date</th>
                      <th>Winning Numbers</th>
                      <th>Jackpot</th>
                      <th>Winners</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : recentResults.length > 0 ? (
                      recentResults.map((result) => {
                        const numbers = getWinningNumbers(result);
                        const totalWinners = result.winners.jackpot + result.winners.match5 + result.winners.match4 + result.winners.match3 + result.winners.exact + result.winners.any;
                        return (
                          <tr key={result._id}>
                            <td>{(() => {
                              // Parse date correctly to avoid timezone issues
                              const date = new Date(result.drawDate);
                              // Get date components in local timezone
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              return `${month}/${day}/${year}`;
                            })()}</td>
                            <td>
                              <div className="d-flex gap-1 flex-wrap">
                                {numbers.main.map((num: number, i: number) => (
                                  <span key={i} className="badge bg-primary">{num}</span>
                                ))}
                                {numbers.special && numbers.special.length > 0 && (
                                  numbers.special.map((num: number, i: number) => (
                                    <span key={`special-${i}`} className="badge bg-warning text-dark">{num}</span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td>{formatJackpot(result.jackpot)}</td>
                            <td>{totalWinners}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          No results available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .lottery-ball {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: static !important;
          animation: none !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
};

export default Results;

