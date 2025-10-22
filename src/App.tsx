import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { PredictionProvider } from './contexts/PredictionContext'
import { WalletProvider } from './contexts/WalletContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Predictions from './pages/Predictions'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/user/Dashboard'
import Profile from './pages/user/Profile'
import MyPredictions from './pages/user/MyPredictions'
import Wallet from './pages/user/Wallet'
import NumberGenerator from './pages/tools/NumberGenerator'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPredictions from './pages/admin/AdminPredictions'
import AdminUsers from './pages/admin/AdminUsers'
import AdminLotteries from './pages/admin/AdminLotteries'
import Results from './pages/Results'
import HowItWorks from './pages/HowItWorks'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsConditions from './pages/legal/TermsConditions'
import ResponsiblePlay from './pages/legal/ResponsiblePlay'
import AvoidScams from './pages/legal/AvoidScams'
import Disclaimer from './pages/legal/Disclaimer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AdminRedirect from './components/auth/AdminRedirect'

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Component to conditionally render navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return null; // Admin pages render their own navbar
  }
  
  return <Navbar />;
};

// Component to conditionally render footer
const ConditionalFooter = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return null; // Admin pages don't need footer
  }
  
  return <Footer />;
};

function App() {
  return (
      <AuthProvider>
        <WalletProvider>
          <PredictionProvider>
            <div className="App" style={{ margin: 0, padding: 0 }}>
          <ScrollToTop />
          <ConditionalNavbar />
          <main style={{ margin: 0, padding: 0 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/results" element={<Results />} />
              <Route path="/number-generator" element={<NumberGenerator />} />
              
              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/responsible-play" element={<ResponsiblePlay />} />
              <Route path="/avoid-scams" element={<AvoidScams />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AdminRedirect>
                    <Dashboard />
                  </AdminRedirect>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AdminRedirect>
                    <Profile />
                  </AdminRedirect>
                </ProtectedRoute>
              } />
              <Route path="/my-predictions" element={
                <ProtectedRoute>
                  <AdminRedirect>
                    <MyPredictions />
                  </AdminRedirect>
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <AdminRedirect>
                    <Wallet />
                  </AdminRedirect>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/predictions" element={
                <AdminRoute>
                  <AdminPredictions />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="/admin/lotteries" element={
                <AdminRoute>
                  <AdminLotteries />
                </AdminRoute>
              } />
            </Routes>
          </main>
            <ConditionalFooter />
            </div>
          </PredictionProvider>
        </WalletProvider>
      </AuthProvider>
  )
}

export default App

