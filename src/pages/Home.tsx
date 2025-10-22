import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoBackground from '../components/layout/VideoBackground';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home: React.FC = () => {
  const { user, canStartTrial } = useAuth();

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
      {/* Enhanced Hero Section with Video Background */}
      <VideoBackground className="text-white">
        <section id="home" className="hero-section">
          <div className="container">
            <div className="row align-items-center min-vh-100">
              <div className="col-lg-6 hero-content">
                <h1 className="hero-title fade-in">
                  Advanced Lottery Prediction Technology
                </h1>
                <p className="hero-subtitle fade-in animate-delay-1">
                  Leverage AI-powered analytics and machine learning algorithms to identify non-viable numbers with 95%+ accuracy. 
                  Join over 50,000 professionals who trust Obyyo for data-driven lottery strategies.
                </p>
                <div className="d-flex flex-wrap gap-3 mb-5 fade-in animate-delay-2">
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
                      <Link to="/how-it-works" className="btn btn-outline-light btn-lg px-4 hover-lift">
                        <i className="bi bi-question-circle me-2"></i>
                        How It Works
                      </Link>
                    </>
                  )}
                </div>
                <div className="hero-stats fade-in animate-delay-3">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="hero-stat">
                        <span className="hero-stat-number">50K+</span>
                        <span className="hero-stat-label">Active Users</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="hero-stat">
                        <span className="hero-stat-number">95%</span>
                        <span className="hero-stat-label">Success Rate</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="hero-stat">
                        <span className="hero-stat-number">$2M+</span>
                        <span className="hero-stat-label">Winnings Generated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 text-center">
                <div className="hero-visual fade-in animate-delay-4">
                  <div className="lottery-showcase-container">
                    {/* Animated Background Elements */}
                    <div className="showcase-background">
                      <div className="magic-circle circle-1"></div>
                      <div className="magic-circle circle-2"></div>
                      <div className="magic-circle circle-3"></div>
                      <div className="magic-circle circle-4"></div>
                      <div className="energy-waves">
                        <div className="wave wave-1"></div>
                        <div className="wave wave-2"></div>
                        <div className="wave wave-3"></div>
                        <div className="wave wave-4"></div>
                        <div className="wave wave-5"></div>
                      </div>
                      <div className="holographic-overlay">
                        <div className="hologram-line line-1"></div>
                        <div className="hologram-line line-2"></div>
                        <div className="hologram-line line-3"></div>
                        <div className="hologram-line line-4"></div>
                      </div>
                      <div className="lightning-effects">
                        <div className="lightning lightning-1"></div>
                        <div className="lightning lightning-2"></div>
                        <div className="lightning lightning-3"></div>
                      </div>
                    </div>

                    {/* Main Lottery Balls Container */}
                    <div className="lottery-balls-container">
                      <div className="lottery-balls">
                        {/* Lottery Ball 1 */}
                        <div className="lottery-ball ball-1">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">17</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">

                          </div>
                        </div>
                        
                        {/* Lottery Ball 2 */}
                        <div className="lottery-ball ball-2">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">23</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 3 */}
                        <div className="lottery-ball ball-3">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">41</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">

                          </div>
                        </div>
                        
                        {/* Lottery Ball 4 */}
                        <div className="lottery-ball ball-4">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">15</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">

                          </div>
                        </div>
                        
                        {/* Lottery Ball 5 */}
                        <div className="lottery-ball ball-5">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">38</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">

                          </div>
                        </div>
                        
                        {/* Lottery Ball 6 */}
                        <div className="lottery-ball ball-6">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">19</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 7 */}
                        <div className="lottery-ball ball-7">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">52</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 8 */}
                        <div className="lottery-ball ball-8">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">18</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 9 */}
                        <div className="lottery-ball ball-9">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">34</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 10 */}
                        <div className="lottery-ball ball-10">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">67</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 11 */}
                        <div className="lottery-ball ball-11">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">29</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                        
                        {/* Lottery Ball 12 */}
                        <div className="lottery-ball ball-12">
                          <div className="ball-glow"></div>
                          <div className="ball-aura"></div>
                          <span className="ball-number">44</span>
                          <div className="ball-shine"></div>
                          <div className="ball-sparkles">
                          </div>
                        </div>
                      </div>
                      
                      {/* Advanced Visual Elements */}
                      <div className="neural-network">
                        <div className="neural-node node-1"></div>
                        <div className="neural-node node-2"></div>
                        <div className="neural-node node-3"></div>
                        <div className="neural-node node-4"></div>
                        <div className="neural-node node-5"></div>
                        <div className="neural-node node-6"></div>
                        <div className="neural-connection conn-1"></div>
                        <div className="neural-connection conn-2"></div>
                        <div className="neural-connection conn-3"></div>
                        <div className="neural-connection conn-4"></div>
                        <div className="neural-connection conn-5"></div>
                        <div className="neural-connection conn-6"></div>
                      </div>

                      {/* Energy Connections */}
                      <div className="energy-connections">
                        <div className="connection connection-1"></div>
                        <div className="connection connection-2"></div>
                        <div className="connection connection-3"></div>
                        <div className="connection connection-4"></div>
                        <div className="connection connection-5"></div>
                        <div className="connection connection-6"></div>
                      </div>
                    </div>

                    {/* Floating Text Elements */}
                    <div className="floating-text">
                      <div className="text-element text-1">LUCKY</div>
                      <div className="text-element text-2">WIN</div>
                      <div className="text-element text-3">JACKPOT</div>
                      <div className="text-element text-4">MAGIC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </VideoBackground>

      {/* Enhanced Lottery Types Section with Swiper */}
      <section className="py-5" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 gradient-text">Supported Lotteries</h2>
            <p className="lead text-muted">
              Choose from our comprehensive list of lottery predictions
            </p>
          </div>
          
          <div className="lottery-swiper-container">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
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
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
              }}
              loop={true}
              className="lottery-swiper"
            >
              {lotteryTypes.map((lottery, index) => (
                <SwiperSlide key={lottery.type}>
                  <div className="lottery-card h-100 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="lottery-icon">
                      <span style={{ fontSize: '2.5rem' }}>{lottery.icon}</span>
                    </div>
                    <h4 className="lottery-name">{lottery.name}</h4>
                    <p className="lottery-state">{lottery.state}</p>
                    <p className="lottery-description">{lottery.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="lottery-price">${lottery.price}/prediction</span>
                      <Link 
                        to={`/predictions?lottery=${lottery.type}`}
                        className="btn btn-outline-primary hover-lift"
                      >
                        <i className="bi bi-arrow-right me-1"></i>
                        View Predictions
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <div className="swiper-button-prev-custom">
              <i className="bi bi-chevron-left"></i>
            </div>
            <div className="swiper-button-next-custom">
              <i className="bi bi-chevron-right"></i>
            </div>
            
            {/* Custom Pagination */}
            <div className="swiper-pagination-custom"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 gradient-text">Why Choose Obyyo?</h2>
            <p className="lead text-muted">
              Advanced prediction technology designed to maximize your winning potential
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-custom hover-lift fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-body p-4">
                    <div className="feature-icon mb-4">
                      <div className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${feature.color} bg-opacity-10`}
                           style={{ 
                             width: '70px', 
                             height: '70px',
                             boxShadow: 'var(--shadow-md)'
                           }}>
                        <i className={`${feature.icon} text-${feature.color} fs-3`}></i>
                      </div>
                    </div>
                    <h5 className="fw-bold mb-3 text-dark">{feature.title}</h5>
                    <p className="text-muted lh-lg">{feature.description}</p>
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
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 gradient-text">Transparent Pricing</h2>
            <p className="lead text-muted">
              Choose the plan that fits your needs. No hidden fees, no long-term commitments.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {/* Starter Plan - Centered */}
            <div className="col-lg-6 col-md-8 col-sm-10 mb-4">
              <div className="card border-0 h-100 fade-in" style={{ 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="plan-header mb-4">
                    <div className="plan-icon mb-3">
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}>
                        <i className="bi bi-lightning text-white fs-2"></i>
                      </div>
                    </div>
                    <h4 className="fw-bold mb-2">Starter Plan</h4>
                    <p className="text-muted mb-0">Pay as you go - Simple and transparent</p>
                  </div>
                  
                  <div className="pricing mb-4">
                    <div className="d-flex align-items-baseline justify-content-center">
                      <span className="display-3 fw-bold text-primary">$1</span>
                      <span className="text-muted ms-1 fs-5">/prediction</span>
                    </div>
                  </div>

                  <div className="features mb-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="feature-item text-center">
                          <i className="bi bi-check2-circle text-success fs-4 mb-2 d-block"></i>
                          <span className="small fw-semibold">95%+ accuracy</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="feature-item text-center">
                          <i className="bi bi-check2-circle text-success fs-4 mb-2 d-block"></i>
                          <span className="small fw-semibold">All lottery types</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="feature-item text-center">
                          <i className="bi bi-check2-circle text-success fs-4 mb-2 d-block"></i>
                          <span className="small fw-semibold">SMS notifications</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="feature-item text-center">
                          <i className="bi bi-check2-circle text-success fs-4 mb-2 d-block"></i>
                          <span className="small fw-semibold">Number generator</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link to="/register" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Get Started Now
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

