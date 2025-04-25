import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'features', 'stats'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="landing-page">
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <a href="/" className="logo">
          FindChild
        </a>
        <div className="nav-links">
          <button 
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} 
            onClick={() => scrollToSection('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${activeSection === 'features' ? 'active' : ''}`} 
            onClick={() => scrollToSection('features')}
          >
            Features
          </button>
          <button 
            className={`nav-link ${activeSection === 'stats' ? 'active' : ''}`} 
            onClick={() => scrollToSection('stats')}
          >
            Stats
          </button>
          <button 
            className="nav-button" 
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </nav>

      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1>Help Find Missing Children</h1>
          <p className="hero-subtitle">
            Join our community in making a difference. Every child deserves to be found and reunited with their family.
          </p>
          <button className="cta-button primary" onClick={handleGetStarted}>
            Get Started &gt;
          </button>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Quick Reporting</h3>
            <p>Report missing children cases quickly and easily through our intuitive platform.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Wide Network</h3>
            <p>Connect with a vast network of searchers and volunteers across the country.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Real-time Updates</h3>
            <p>Receive instant notifications and updates on reported cases.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Support</h3>
            <p>Join a supportive community dedicated to helping find missing children.</p>
          </div>
        </div>
      </section>

      <section id="stats" className="stats-section">
        <div className="stat-card">
          <h3>1000+</h3>
          <p>Children Found</p>
        </div>
        <div className="stat-card">
          <h3>5000+</h3>
          <p>Active Searchers</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>Support Available</p>
        </div>
        <div className="stat-card">
          <h3>100%</h3>
          <p>Commitment</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <button className="footer-link" onClick={() => scrollToSection('home')}>Home</button>
            <button className="footer-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="footer-link" onClick={() => scrollToSection('stats')}>Stats</button>
            <button className="footer-link" onClick={handleGetStarted}>Get Started</button>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <button className="footer-link" onClick={() => navigate('/faq')}>FAQ</button>
            <button className="footer-link" onClick={() => navigate('/safety-tips')}>Safety Tips</button>
            <button className="footer-link" onClick={() => navigate('/guidelines')}>Guidelines</button>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <button className="footer-link" onClick={() => window.location.href = 'tel:+1234567890'}>Emergency: +123 456 7890</button>
            <button className="footer-link" onClick={() => window.location.href = 'mailto:support@findchild.org'}>support@findchild.org</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 FindChild. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;