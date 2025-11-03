import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  stats?: {
    totalUsers?: number;
    totalPredictions?: number;
  };
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, stats }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Listen for sidebar toggle events from navbar
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };
    
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (sidebarOpen && !target.closest('.dashboard-sidebar') && !target.closest('.sidebar-toggle-btn')) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h4>Admin Panel</h4>
            <button 
              className="sidebar-toggle d-lg-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <a href="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </a>
            <a href="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
              <i className="bi bi-people-fill"></i>
              <span>Users</span>
              <span className="badge">{stats?.totalUsers || 0}</span>
            </a>
            <a href="/admin/predictions" className={`nav-item ${isActive('/admin/predictions') ? 'active' : ''}`}>
              <i className="bi bi-graph-up"></i>
              <span>Predictions</span>
              <span className="badge">{stats?.totalPredictions || 0}</span>
            </a>
            <a href="/admin/payments" className={`nav-item ${isActive('/admin/payments') ? 'active' : ''}`}>
              <i className="bi bi-credit-card"></i>
              <span>Recent Payments</span>
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
