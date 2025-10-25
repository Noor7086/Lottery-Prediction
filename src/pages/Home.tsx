import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home: React.FC = () => {
  const { user, canStartTrial } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 4); // 4 slides total
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update active slide based on currentSlide state
  useEffect(() => {
    const slides = document.querySelectorAll('.hero-slide');
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
  }, [currentSlide]);

  const lotteryTypes = [
    {
      type: 'gopher5',
      name: 'Gopher 5',
      state: 'Minnesota',
      description: 'Pick 5 numbers from 1-47',
      price: 1,
      icon: '🎯'
    },
    {
      type: 'pick3',
      name: 'Pick 3',
      state: 'Minnesota',
      description: 'Pick 3 numbers from 0-9',
      price: 1,
      icon: '🎲'
    },
    {
      type: 'lottoamerica',
      name: 'Lotto America',
      state: 'USA',
      description: 'Pick 5 from 52 + 1 from 10',
      price: 1,
      icon: '🇺🇸'
    },
    {
      type: 'megamillion',
      name: 'Mega Million',
      state: 'USA',
      description: 'Pick 5 from 70 + 1 from 25',
      price: 5,
      icon: '💰'
    },
    {
      type: 'powerball',
      name: 'Powerball',
      state: 'USA',
      description: 'Pick 5 from 69 + 1 from 26',
      price: 2,
      icon: '⚡'
    }
  ];

  const features = [
    {
      icon: 'bi-target',
      title: '95%+ Accuracy Rate',
      description: 'Our advanced AI-powered prediction system analyzes historical data and patterns to identify non-viable numbers with exceptional precision.',
      color: 'primary'
    },
    {
      icon: 'bi-credit-card',
      title: 'Flexible Pricing',
      description: 'Pay-per-prediction model with no hidden fees or subscriptions. Only pay for what you use, when you need it.',
      color: 'success'
    },
    {
      icon: 'bi-phone',
      title: 'Instant Notifications',
      description: 'Receive real-time SMS alerts when new predictions are available for your selected lottery games.',
      color: 'info'
    },
    {
      icon: 'bi-shield-check',
      title: 'Bank-Level Security',
      description: 'Your personal data and payment information are protected with enterprise-grade encryption and security protocols.',
      color: 'warning'
    },
    {
      icon: 'bi-cpu',
      title: 'Smart Number Generator',
      description: 'Our advanced algorithm generates optimal number combinations from viable numbers using machine learning.',
      color: 'secondary'
    },
    {
      icon: 'bi-graph-up',
      title: 'Performance Analytics',
      description: 'Track prediction accuracy, success rates, and lottery results with detailed analytics and insights.',
      color: 'danger'
    }
  ];

  /*
  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      title: 'Financial Analyst',
      location: 'Minneapolis, MN',
      text: 'Obyyo\'s prediction accuracy has been remarkable. I\'ve seen a 40% improvement in my lottery success rate since using their service. The data-driven approach is exactly what I needed.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      title: 'Software Engineer',
      location: 'San Francisco, CA',
      text: 'The real-time notifications and analytics dashboard are game-changers. I can track my performance and make informed decisions. The ROI has been exceptional.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Business Owner',
      location: 'Austin, TX',
      text: 'As a business owner, I appreciate the transparency and reliability. Obyyo has helped me optimize my lottery strategy with their advanced number generation algorithms.',
      rating: 5,
      avatar: 'ER'
    },
    {
      name: 'David Thompson',
      title: 'Investment Advisor',
      location: 'New York, NY',
      text: 'The security and professionalism of the platform is outstanding. My clients trust the service, and the results speak for themselves.',
      rating: 5,
      avatar: 'DT'
    }
  ];
  */

  return (
    <div className="home-page">
      {/* New Single Column Hero Section */}
      <section id="home" className="hero-section-new">
        <div className="hero-background">
          <div className="hero-slide hero-slide-1 active"></div>
          <div className="hero-slide hero-slide-2"></div>
          <div className="hero-slide hero-slide-3"></div>
          <div className="hero-slide hero-slide-4"></div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6 text-center">
              <div className="hero-content-new">
                <h1 className="hero-title-new fade-in">
                  Advanced Lottery Prediction Technology
                </h1>
                <p className="hero-subtitle-new fade-in animate-delay-1">
                  Leverage AI-powered analytics and machine learning algorithms to identify non-viable numbers with 95%+ accuracy. 
                  Join over 50,000 professionals who trust Obyyo for data-driven lottery strategies.
                </p>
                <div className="d-flex flex-wrap gap-3 justify-content-center mb-5 fade-in animate-delay-2">
                  {user ? (
                    <Link to="/dashboard" className="btn btn-primary btn-lg px-5 hover-lift">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      {canStartTrial() ? (
                        <Link to="/register" className="btn btn-primary btn-lg px-5 hover-lift">
                          <i className="bi bi-rocket-takeoff me-2"></i>
                          Start Free Trial
                        </Link>
                      ) : (
                        <Link to="/pricing" className="btn btn-primary btn-lg px-5 hover-lift">
                          <i className="bi bi-credit-card me-2"></i>
                          View Pricing
                        </Link>
                      )}
                      <Link to="/how-it-works" className="btn btn-secondary btn-lg px-4 hover-lift">
                        <i className="bi bi-question-circle me-2"></i>
                        How It Works
                      </Link>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Lottery Types Section with Swiper */}
      <section className="py-5 enhanced-lottery-section" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 gradient-text">Supported Lotteries</h2>
            <p className="lead text-muted mb-4">
              Choose from our comprehensive list of lottery predictions with advanced AI analysis
            </p>
            
            {/* Enhanced Stats Bar */}
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8">
                <div className="lottery-stats-bar">
                  <div className="row g-3">
                    <div className="col-md-3 col-6">
                      <div className="stat-item">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-number">5+</div>
                        <div className="stat-label">Lottery Types</div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="stat-item">
                        <div className="stat-icon">📊</div>
                        <div className="stat-number">95%</div>
                        <div className="stat-label">Accuracy Rate</div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="stat-item">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-number">24/7</div>
                        <div className="stat-label">Monitoring</div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="stat-item">
                        <div className="stat-icon">👥</div>
                        <div className="stat-number">50K+</div>
                        <div className="stat-label">Users</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lottery-swiper-container">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination-custom',
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 1.1,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 1.3,
                  spaceBetween: 25,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
              }}
              loop={true}
              className="lottery-swiper"
            >
              {lotteryTypes.map((lottery, index) => (
                <SwiperSlide key={lottery.type}>
                  <div className="enhanced-lottery-card h-100 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Card Header with Gradient */}
                    <div className="card-header-gradient">
                      <div className="lottery-icon-enhanced">
                        <span className="lottery-emoji">{lottery.icon}</span>
                        <div className="icon-glow"></div>
                      </div>
                      <div className="popular-badge">
                        <i className="bi bi-star-fill"></i>
                        Popular
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="card-content">
                      <h4 className="lottery-name-enhanced">{lottery.name}</h4>
                      <p className="lottery-state-enhanced">
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {lottery.state}
                      </p>
                      <p className="lottery-description-enhanced">{lottery.description}</p>
                      
                      {/* Enhanced Features */}
                      <div className="lottery-features">
                        <div className="feature-item">
                          <i className="bi bi-check-circle-fill text-success"></i>
                          <span>AI Predictions</span>
                        </div>
                        <div className="feature-item">
                          <i className="bi bi-check-circle-fill text-success"></i>
                          <span>Real-time Updates</span>
                        </div>
                        <div className="feature-item">
                          <i className="bi bi-check-circle-fill text-success"></i>
                          <span>SMS Alerts</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="card-footer-enhanced">
                      <div className="price-section">
                        <span className="price-label">Starting from</span>
                        <span className="lottery-price-enhanced">${lottery.price}</span>
                        <span className="price-unit">/prediction</span>
                      </div>
                      <Link 
                        to={`/predictions?lottery=${lottery.type}`}
                        className="btn btn-primary-enhanced hover-lift"
                      >
                        <i className="bi bi-arrow-right me-2"></i>
                        Get Predictions
                        <i className="bi bi-lightning-fill ms-2"></i>
                      </Link>
                    </div>
                    
                    {/* Hover Effects */}
                    <div className="card-hover-overlay"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Enhanced Navigation Buttons */}
            <div className="swiper-button-prev-custom enhanced-nav-btn">
              <i className="bi bi-chevron-left"></i>
            </div>
            <div className="swiper-button-next-custom enhanced-nav-btn">
              <i className="bi bi-chevron-right"></i>
            </div>
            
            {/* Enhanced Pagination */}
            <div className="swiper-pagination-custom enhanced-pagination"></div>
          </div>
          
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="display-5 fw-bold mb-2 gradient-text">Why Choose Obyyo?</h2>
            <p className="lead text-muted">
              Advanced prediction technology designed to maximize your winning potential
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 features-card-enhanced fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-body p-3">
                    <div className="feature-icon mb-3">
                      <div className="feature-icon-enhanced d-inline-flex align-items-center justify-content-center rounded-3"
                           style={{ 
                             width: '80px', 
                             height: '80px',
                             background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
                             border: '2px solid rgba(99, 102, 241, 0.2)',
                             boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
                             position: 'relative',
                             overflow: 'hidden'
                           }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                          pointerEvents: 'none'
                        }}></div>
                        <i className={`${feature.icon} text-primary fs-2`} style={{ 
                          zIndex: 2,
                          position: 'relative',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}></i>
                      </div>
                    </div>
                    <h5 className="fw-bold mb-2 text-dark">{feature.title}</h5>
                    <p className="text-muted lh-lg small">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="py-5" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 gradient-text">How It Works</h2>
            <p className="lead text-muted">
              Simple steps to start improving your lottery odds
            </p>
          </div>
          <div className="row g-4">
            {[
              { step: 1, title: "Sign Up", description: "Create your free account and select your preferred lottery for a 7-day trial.", icon: "bi-person-plus" },
              { step: 2, title: "Get Predictions", description: "Receive daily predictions showing non-viable numbers to avoid.", icon: "bi-graph-up" },
              { step: 3, title: "Generate Numbers", description: "Use our number generator to create winning combinations from viable numbers.", icon: "bi-shuffle" },
              { step: 4, title: "Win More", description: "Play smarter with higher probability numbers and improve your winning odds.", icon: "bi-trophy" }
            ].map((step, index) => (
              <div key={index} className="col-lg-3 col-md-6 text-center">
                <div className="step-card fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="step-number mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle shadow-custom-lg" 
                       style={{ 
                         width: '80px', 
                         height: '80px', 
                         background: 'var(--gradient-primary)',
                         color: 'white'
                       }}>
                    <i className={`${step.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold mb-3">{step.title}</h5>
                  <p className="text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Professional Pricing Section */}
      <section id="pricing" className="py-5" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="display-5 fw-bold mb-2 gradient-text">Transparent Pricing</h2>
            <p className="lead text-muted">
              Choose the plan that fits your needs. No hidden fees, no long-term commitments.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {/* Starter Plan - Centered */}
            <div className="col-lg-4 col-md-6 col-sm-8 mb-4">
              <div className="card border-0 h-100 fade-in pricing-card-enhanced" style={{ 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 8px 25px rgba(99, 102, 241, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="plan-header mb-3">
                    <div className="plan-icon mb-2">
                      <div className="pricing-icon-enhanced" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
                          pointerEvents: 'none'
                        }}></div>
                        <i className="bi bi-lightning text-white fs-2" style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                          zIndex: 2,
                          position: 'relative'
                        }}></i>
                      </div>
                    </div>
                    <h5 className="fw-bold mb-1">Starter Plan</h5>
                    <p className="text-muted mb-0 small">Pay as you go - Simple and transparent</p>
                  </div>
                  
                  <div className="pricing mb-3">
                    <div className="pricing-badge mb-2">
                      <span className="badge bg-gradient-primary text-white px-3 py-2 rounded-pill fw-semibold">
                        Most Popular
                      </span>
                    </div>
                    <div className="d-flex align-items-baseline justify-content-center">
                      <span className="display-4 fw-bold pricing-price" style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}>$1</span>
                      <span className="text-muted ms-1 small fw-semibold">/prediction</span>
                    </div>
                  </div>

                  <div className="features mb-3">
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="feature-item-enhanced text-center p-2 rounded-3" style={{
                          background: 'rgba(99, 102, 241, 0.05)',
                          border: '1px solid rgba(99, 102, 241, 0.1)',
                          transition: 'all 0.3s ease'
                        }}>
                          <i className="bi bi-check2-circle text-success fs-5 mb-1 d-block"></i>
                          <span className="small fw-semibold">95%+ accuracy</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="feature-item-enhanced text-center p-2 rounded-3" style={{
                          background: 'rgba(99, 102, 241, 0.05)',
                          border: '1px solid rgba(99, 102, 241, 0.1)',
                          transition: 'all 0.3s ease'
                        }}>
                          <i className="bi bi-check2-circle text-success fs-5 mb-1 d-block"></i>
                          <span className="small fw-semibold">All lottery types</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="feature-item-enhanced text-center p-2 rounded-3" style={{
                          background: 'rgba(99, 102, 241, 0.05)',
                          border: '1px solid rgba(99, 102, 241, 0.1)',
                          transition: 'all 0.3s ease'
                        }}>
                          <i className="bi bi-check2-circle text-success fs-5 mb-1 d-block"></i>
                          <span className="small fw-semibold">SMS notifications</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="feature-item-enhanced text-center p-2 rounded-3" style={{
                          background: 'rgba(99, 102, 241, 0.05)',
                          border: '1px solid rgba(99, 102, 241, 0.1)',
                          transition: 'all 0.3s ease'
                        }}>
                          <i className="bi bi-check2-circle text-success fs-5 mb-1 d-block"></i>
                          <span className="small fw-semibold">Number generator</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link to="/register" className="btn btn-primary w-100 rounded-pill fw-bold pricing-btn-enhanced" style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      <i className="bi bi-rocket-takeoff me-2"></i>
                      Get Started Now
                    </span>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transition: 'left 0.5s ease'
                    }}></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-5 bg-gradient-hero text-white position-relative overflow-hidden">
        <div className="container text-center position-relative" style={{ zIndex: 2 }}>
          <h2 className="display-5 fw-bold mb-3 text-white">Ready to Transform Your Lottery Strategy?</h2>
          <p className="lead mb-4 text-white">
            Join 50,000+ professionals who trust Obyyo for data-driven lottery predictions
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {user ? (
              <Link to="/dashboard" className="btn btn-light btn-lg px-5 hover-lift">
                <i className="bi bi-speedometer2 me-2"></i>
                Go to Dashboard
              </Link>
            ) : (
              <>
                {canStartTrial() ? (
                  <Link to="/register" className="btn btn-light btn-lg px-5 hover-lift">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Start Free Trial
                  </Link>
                ) : (
                  <Link to="/pricing" className="btn btn-light btn-lg px-5 hover-lift">
                    <i className="bi bi-credit-card me-2"></i>
                    View Pricing
                  </Link>
                )}
                <Link to="/contact" className="btn btn-outline-light btn-lg px-4 hover-lift">
                  <i className="bi bi-telephone me-2"></i>
                  Schedule Demo
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
          <div className="position-absolute" style={{ 
            top: '20%', 
            left: '10%', 
            width: '100px', 
            height: '100px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div className="position-absolute" style={{ 
            top: '60%', 
            right: '15%', 
            width: '60px', 
            height: '60px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite reverse'
          }}></div>
        </div>
      </section>
    </div>
  );
};

export default Home;

