import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LotteryType } from '../../types';

const Navbar: React.FC = () => {
  const { user, logout, canStartTrial } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPredictionsOpen, setIsPredictionsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        setIsPredictionsOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking on nav links
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsPredictionsOpen(false);
    setIsUserMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMobileMenu();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSmoothScroll = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMobileMenu();
  };

  const lotteryTypes: { type: LotteryType; name: string }[] = [
    { type: 'gopher5', name: 'Gopher 5' },
    { type: 'pick3', name: 'Pick 3' },
    { type: 'lottoamerica', name: 'Lotto America' },
    { type: 'megamillion', name: 'Mega Million' },
    { type: 'powerball', name: 'Powerball' }
  ];

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-eye-fill me-2 text-primary"></i>
          Obyyo
        </Link>

        {/* Mobile menu button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation menu */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => {
                  handleSmoothScroll('home');
                  closeMobileMenu();
                }}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/features"
                onClick={closeMobileMenu}
              >
                Features
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className={`nav-link dropdown-toggle ${isActive('/predictions') ? 'active' : ''}`} 
                href="#" 
                role="button" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsPredictionsOpen(!isPredictionsOpen);
                }}
                aria-expanded={isPredictionsOpen}
              >
                <i className="bi bi-graph-up me-1"></i>
                Predictions
              </a>
              <ul className={`dropdown-menu shadow-custom-lg ${isPredictionsOpen ? 'show' : ''}`}>
                {lotteryTypes.map((lottery) => (
                  <li key={lottery.type}>
                    <Link 
                      className="dropdown-item" 
                      to={`/predictions?lottery=${lottery.type}`}
                      onClick={closeMobileMenu}
                    >
                      <i className="bi bi-dice-6 me-2"></i>
                      {lottery.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nav-item">
            <Link 
                className="nav-link" 
                to="/how-it-works"
                onClick={closeMobileMenu}
              >
                How It Works
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/pricing"
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/contact"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* User menu */}
          <ul className="navbar-nav">
            {user && (
              <li className="nav-item">
                <Link 
                  className="nav-link d-flex align-items-center" 
                  to="/wallet"
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-wallet2 me-1"></i>
                  <span className="d-none d-md-inline">Wallet:</span>
                  <span className="badge bg-success ms-1">
                    ${user?.walletBalance?.toFixed(2) || '0.00'}
                  </span>
                </Link>
              </li>
            )}
            {user ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle d-flex align-items-center" 
                  href="#" 
                  role="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" 
                       style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                    <span className="fw-bold">{user.firstName.charAt(0)}</span>
                  </div>
                  <span>{user.firstName}</span>
                  {user.isInTrial && (
                    <span className="badge bg-success ms-2 small">Trial</span>
                  )}
                </a>
                <ul className={`dropdown-menu dropdown-menu-end ${isUserMenuOpen ? 'show' : ''}`}>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/dashboard"
                      onClick={closeMobileMenu}
                    >
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/my-predictions"
                      onClick={closeMobileMenu}
                    >
                      <i className="bi bi-download me-2"></i>
                      My Predictions
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/profile"
                      onClick={closeMobileMenu}
                    >
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/wallet"
                      onClick={closeMobileMenu}
                    >
                      <i className="bi bi-wallet2 me-2"></i>
                      My Wallet
                      <span className="badge bg-success ms-2">
                        ${user?.walletBalance?.toFixed(2) || '0.00'}
                      </span>
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li><hr className="dropdown-divider" /></li>
                  )}
                  {user.role === 'admin' && (
                    <li>
                      <Link 
                        className="dropdown-item" 
                        to="/admin"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <i className="bi bi-gear me-2"></i>
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/login"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="btn btn-primary ms-2" 
                    to={canStartTrial() ? "/register" : "/pricing"}
                    onClick={closeMobileMenu}
                  >
                    {canStartTrial() ? "Get Started" : "View Pricing"}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

