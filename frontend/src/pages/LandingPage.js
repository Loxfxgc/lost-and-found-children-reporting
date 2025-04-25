import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';  // Make sure this line exists

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update the nav link from a Link to an anchor tag
  // Remove or comment out this floating code:
  /*
  <a href="#" className="nav-link" onClick={(e) => {
    e.preventDefault();
    setActiveSection('how-it-works');
  }}>How It Works</a>
  */
  
  // In the renderContent function, add the new section:
  const renderContent = () => {
      if (activeSection === 'about') {
        return (
          <section className="about-section">
            <div className="about-content">
              <h2>About Safe Connect</h2>
              <div className="about-grid">
                <div className="about-card">
                  <h3>Our Mission</h3>
                  <p>To create a safer world by providing innovative solutions for locating and reuniting missing children with their families.</p>
                </div>
                <div className="about-card">
                  <h3>Who We Are</h3>
                  <p>Safe Connect is a dedicated platform that brings together technology and community support to help find missing children quickly and efficiently.</p>
                </div>
                <div className="about-card">
                  <h3>Our Impact</h3>
                  <p>Since our inception, we've helped thousands of families reunite with their loved ones through our advanced search and reporting system.</p>
                </div>
                <div className="about-card">
                  <h3>How We Work</h3>
                  <p>We utilize cutting-edge technology and collaborate with local authorities to ensure the fastest possible response to missing children cases.</p>
                </div>
              </div>
            </div>
          </section>
        );
      } else if (activeSection === 'services') {
        return (
          <section className="services-section">
            <div className="services-content">
              <h2>Our Services</h2>
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-icon">🚨</div>
                  <h3>Quick Reporting</h3>
                  <p>File detailed missing person reports with our user-friendly system.</p>
                </div>
                <div className="service-card">
                  <div className="service-icon">🔍</div>
                  <h3>Advanced Search System</h3>
                  <p>Use our AI-powered search system to find potential matches.</p>
                </div>
                <div className="service-card">
                  <div className="service-icon">📱</div>
                  <h3>Real-time Alerts</h3>
                  <p>Receive instant notifications for potential matches or updates.</p>
                </div>
                <div className="service-card">
                  <div className="service-icon">👥</div>
                  <h3>Community Network</h3>
                  <p>Connect with volunteers and organizations dedicated to helping.</p>
                </div>
                <div className="service-card">
                  <div className="service-icon">🤝</div>
                  <h3>Authority Collaboration</h3>
                  <p>Direct coordination with law enforcement and child protection services.</p>
                </div>
                <div className="service-card">
                  <div className="service-icon">💡</div>
                  <h3>Resource Center</h3>
                  <p>Access guides and support resources for families.</p>
                </div>
              </div>
            </div>
          </section>
        );
      } else if (activeSection === 'how-it-works') {
        return (
          <section className="how-it-works-section">
            <div className="how-it-works-content">
              <h2>How Safe Connect Works</h2>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <h3>Report Missing Child</h3>
                <p>Create a detailed report with photos, descriptions, and last known location of the missing child.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Data Processing</h3>
                <p>Our AI system processes the information and begins searching for matches in our database.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Alert Network</h3>
                <p>Notifications are sent to relevant authorities and community members in the specified area.</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Match Identification</h3>
                <p>Potential matches are identified using advanced facial recognition and data analysis.</p>
              </div>
              <div className="step-card">
                <div className="step-number">5</div>
                <h3>Verification Process</h3>
                <p>Matches are verified through a thorough process involving authorities and families.</p>
              </div>
              <div className="step-card">
                <div className="step-number">6</div>
                <h3>Reunion Support</h3>
                <p>We provide support and resources throughout the reunion process.</p>
              </div>
            </div>
          </div>
        </section>
      );
    } else if (activeSection === 'contact') {
      return (
        <section className="contact-section">
          <div className="contact-content">
            <h2>Contact Us</h2>
            <div className="contact-grid">
              <div className="contact-info">
                <h3>Get in Touch</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <i className="contact-icon">📞</i>
                    <div>
                      <h4>Emergency Hotline</h4>
                      <p>1-800-123-4567 (24/7)</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="contact-icon">✉️</i>
                    <div>
                      <h4>Email</h4>
                      <p>help@safeconnect.com</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="contact-icon">📍</i>
                    <div>
                      <h4>Office Location</h4>
                      <p>CMR College of Engineering and Technology</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="contact-form">
                <h3>Send us a Message</h3>
                <form>
                  <div className="form-group">
                    <input type="text" placeholder="Your Name" required />
                  </div>
                  <div className="form-group">
                    <input type="email" placeholder="Your Email" required />
                  </div>
                  <div className="form-group">
                    <input type="tel" placeholder="Phone Number" />
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Your Message" rows="5" required></textarea>
                  </div>
                  <button type="submit" className="submit-button">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      );
    }
    return null;
  };

  return (
    <div className="landing-page">
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''} ${activeSection !== 'home' ? 'dark-nav' : ''}`}>
        <div className="logo">SAFE CONNECT</div>
        <div className="nav-links">
          <Link to="/" className="nav-link" onClick={() => setActiveSection('home')}>Home</Link>
          <a href="#" className="nav-link" onClick={(e) => {
            e.preventDefault();
            setActiveSection('about');
          }}>About</a>
          <a href="#" className="nav-link" onClick={(e) => {
            e.preventDefault();
            setActiveSection('services');
          }}>Services</a>
          <a href="#" className="nav-link" onClick={(e) => {
            e.preventDefault();
            setActiveSection('how-it-works');
          }}>How It Works</a>
          <a href="#" className="nav-button" onClick={(e) => {
            e.preventDefault();
            setActiveSection('contact');
          }}>CONTACT</a>
        </div>
      </nav>

      {activeSection === 'home' ? (
        <>
          <main className="hero-section">
            <div className="hero-content">
              <h1>Reunite with love</h1>
              <p className="hero-subtitle">
                Quickly find missing children
              </p>
              <div className="cta-buttons">
                <Link to="/login" className="cta-button primary">LOGIN</Link>
              </div>
            </div>
          </main>

          <section className="features-section">
            <h2>How We Help</h2>
            <div className="features-grid">
              <div className="feature-card">
                <i className="feature-icon">📝</i>
                <h3>Easy Reporting</h3>
                <p>Simple and secure process to report missing children</p>
              </div>
              <div className="feature-card">
                <i className="feature-icon">🔍</i>
                <h3>Advanced Search</h3>
                <p>Powerful search capabilities to find matching records</p>
              </div>
              <div className="feature-card">
                <i className="feature-icon">🔒</i>
                <h3>Secure Platform</h3>
                <p>Your data is protected with enterprise-grade security</p>
              </div>
              <div className="feature-card">
                <i className="feature-icon">🤝</i>
                <h3>Community Support</h3>
                <p>Connect with others and share information safely</p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Children Found</p>
            </div>
            <div className="stat-card">
              <h3>5000+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-card">
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </section>

          <footer className="landing-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>SafeConnect</h4>
                <p>Dedicated to reuniting families and protecting children.</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy Policy</Link>
              </div>
              <div className="footer-section">
                <h4>Emergency</h4>
                <p>Hotline: 1-800-123-4567</p>
                <p>Email: help@safeconnect.com</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 SafeConnect. All rights reserved.</p>
            </div>
          </footer>
        </>
      ) : (
        <>
          {renderContent()}
          <footer className="landing-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>SafeConnect</h4>
                <p>Dedicated to reuniting families and protecting children.</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy Policy</Link>
              </div>
              <div className="footer-section">
                <h4>Emergency</h4>
                <p>Hotline: 1-800-123-4567</p>
                <p>Email: help@safeconnect.com</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 SafeConnect. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}

      {/* Remove the second footer that was here */}
    </div>
  );
};

export default LandingPage;