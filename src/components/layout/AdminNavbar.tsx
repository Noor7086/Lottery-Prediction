import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar: React.FC = () => {
  // const location = useLocation();

  /*
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  */

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark shadow-lg"
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
        zIndex: 1000,
        height: '60px'
      }}
    >
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link text-white d-lg-none me-3"
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
              border: 'none'
            }}
            onClick={() => {
              // This will be handled by the dashboard component
              const event = new CustomEvent('toggleSidebar');
              window.dispatchEvent(event);
            }}
          >
            <i className="bi bi-list" style={{ fontSize: '1.25rem' }}></i>
          </button>
          <Link 
            className="navbar-brand d-flex align-items-center fw-bold" 
            to="/admin"
            style={{ fontSize: '1.5rem' }}
          >
            <div 
              className="me-3 d-flex align-items-center justify-content-center"
              style={{ 
                width: '40px', 
                height: '40px', 
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px'
              }}
            >
              <i className="bi bi-shield-check text-white"></i>
            </div>
            Admin Panel
          </Link>
        </div>
        
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ 
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto">
            {/* Navigation links removed as requested */}
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center px-3 py-2 rounded-3"
                href="#"
                id="adminDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <div 
                  className="me-2 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                >
                  <i className="bi bi-person-circle text-white"></i>
                </div>
                Admin
              </a>
              <ul 
                className="dropdown-menu dropdown-menu-end shadow-lg border-0" 
                aria-labelledby="adminDropdown"
                style={{ 
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <li>
                  <div className="dropdown-header text-muted fw-bold">
                    <i className="bi bi-person-circle me-2"></i>
                    Admin Account
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a 
                    className="dropdown-item d-flex align-items-center py-2" 
                    href="/" 
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/';
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
    </nav>
  );
};

export default AdminNavbar;