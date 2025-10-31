import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    const event = new CustomEvent('toggleSidebar');
    window.dispatchEvent(event);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark shadow-lg admin-navbar"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        height: '60px'
      }}
    >
      <div className="container-fluid px-3 px-md-4">
        <div className="d-flex align-items-center w-100">
          {/* Sidebar Toggle Button - Visible on all screens below 992px */}
          <button 
            className="btn btn-link text-white d-lg-none me-2 me-md-3 sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list" style={{ fontSize: '1.25rem' }}></i>
          </button>

          {/* Brand */}
          <Link 
            className="navbar-brand d-flex align-items-center fw-bold flex-grow-1 flex-md-grow-0" 
            to="/admin"
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
          >
            <div 
              className="me-2 me-md-3 d-flex align-items-center justify-content-center brand-icon"
              style={{ 
                width: '35px', 
                height: '35px',
                minWidth: '35px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px'
              }}
            >
              <i className="bi bi-shield-check text-white"></i>
            </div>
            <span className="d-none d-sm-inline">Admin Panel</span>
            <span className="d-inline d-sm-none">Admin</span>
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggler border-0 d-lg-none"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            aria-controls="adminNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Menu */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="adminNavbar">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center px-2 px-md-3 py-2 rounded-3 admin-user-menu"
                  href="#"
                  id="adminDropdown"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  aria-expanded={isDropdownOpen}
                >
                  <div 
                    className="me-2 d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      minWidth: '32px'
                    }}
                  >
                    <i className="bi bi-person-circle text-white"></i>
                  </div>
                  <span className="d-none d-md-inline">Admin</span>
                </a>
                <ul 
                  className={`dropdown-menu dropdown-menu-end shadow-lg border-0 ${isDropdownOpen ? 'show' : ''}`}
                  aria-labelledby="adminDropdown"
                  style={{ 
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    marginTop: '8px'
                  }}
                >
                  <li>
                    <div className="dropdown-header text-muted fw-bold px-3 py-2">
                      <i className="bi bi-person-circle me-2"></i>
                      Admin Account
                    </div>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <a 
                      className="dropdown-item d-flex align-items-center py-2 px-3" 
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      style={{ 
                        borderRadius: '8px',
                        margin: '4px 8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
                        e.currentTarget.style.color = '#dc3545';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '';
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;