import React, { useState } from 'react';

const Results: React.FC = () => {
  const [selectedLottery, setSelectedLottery] = useState('powerball');

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

  const selectedResults = mockResults[selectedLottery as keyof typeof mockResults];

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
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Latest Results - {lotteryTypes.find(l => l.id === selectedLottery)?.name}
                </h5>
                <div className="text-end">
                  <div className="badge bg-primary fs-6">Draw Date: {selectedResults.drawDate}</div>
                </div>
              </div>

              {/* Winning Numbers */}
              <div className="text-center mb-4">
                <h6 className="fw-bold mb-3">Winning Numbers</h6>
                <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                  {selectedResults.winningNumbers.map((num: number, index: number) => (
                    <div key={index} className="lottery-ball bg-primary text-white">
                      {num}
                    </div>
                  ))}
                  {'powerball' in selectedResults && selectedResults.powerball && (
                    <>
                      <div className="mx-2 d-flex align-items-center">
                        <i className="bi bi-plus-lg text-muted"></i>
                      </div>
                      <div className="lottery-ball bg-warning text-dark">
                        {selectedResults.powerball}
                      </div>
                    </>
                  )}
                  {'megaBall' in selectedResults && selectedResults.megaBall && (
                    <>
                      <div className="mx-2 d-flex align-items-center">
                        <i className="bi bi-plus-lg text-muted"></i>
                      </div>
                      <div className="lottery-ball bg-warning text-dark">
                        {selectedResults.megaBall}
                      </div>
                    </>
                  )}
                  {'starBall' in selectedResults && selectedResults.starBall && (
                    <>
                      <div className="mx-2 d-flex align-items-center">
                        <i className="bi bi-plus-lg text-muted"></i>
                      </div>
                      <div className="lottery-ball bg-warning text-dark">
                        {selectedResults.starBall}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Jackpot and Winners */}
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <i className="bi bi-trophy fs-3 mb-2"></i>
                      <h6 className="fw-bold">Current Jackpot</h6>
                      <h4 className="fw-bold">{selectedResults.jackpot}</h4>
                      <small>Next Draw: {selectedResults.nextDraw}</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <i className="bi bi-people fs-3 mb-2"></i>
                      <h6 className="fw-bold">Winners This Draw</h6>
                      <div className="row g-2">
                        {Object.entries(selectedResults.winners).map(([type, count]) => (
                          <div key={type} className="col-6">
                            <small className="d-block">{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</small>
                            <strong>{count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    {[1, 2, 3, 4, 5].map((index) => (
                      <tr key={index}>
                        <td>{new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            {selectedResults.winningNumbers.map((num: number, i: number) => (
                              <span key={i} className="badge bg-primary">{num}</span>
                            ))}
                            {'powerball' in selectedResults && selectedResults.powerball && <span className="badge bg-warning text-dark">{selectedResults.powerball}</span>}
                            {'megaBall' in selectedResults && selectedResults.megaBall && <span className="badge bg-warning text-dark">{selectedResults.megaBall}</span>}
                            {'starBall' in selectedResults && selectedResults.starBall && <span className="badge bg-warning text-dark">{selectedResults.starBall}</span>}
                          </div>
                        </td>
                        <td>${(Math.random() * 100000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        <td>{Math.floor(Math.random() * 1000)}</td>
                      </tr>
                    ))}
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
        }
      `}</style>
    </div>
  );
};

export default Results;

