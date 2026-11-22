import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Footer.css';

const Footer = () => {
  const { user } = useSelector((state) => state.auth);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="amz-footer">
      {/* Back to top bar */}
      <div
        className="amz-back-to-top"
        onClick={scrollToTop}
        role="button"
        tabIndex={0}
      >
        Back to Top ^
      </div>

      {/* 4 Multi-column links */}
      <div className="amz-footer-links-grid">
        <div className="amz-footer-col">
          <h3>Get to Know Us</h3>
          <ul>
            <li><a href="#about">About Snitch</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#press">Press Releases</a></li>
            <li><a href="#science">Snitch Science</a></li>
          </ul>
        </div>

        <div className="amz-footer-col">
          <h3>Make Money with Us</h3>
          <ul>
            <li>
              <Link to={user?.role?.toLowerCase() === 'seller' ? '/dashboard' : '/login'}>
                Sell on Snitch
              </Link>
            </li>
            <li><a href="#affiliate">Become an Affiliate</a></li>
            <li><a href="#advertise">Advertise Your Products</a></li>
            <li><a href="#fulfillment">Fulfilment by Snitch</a></li>
          </ul>
        </div>

        <div className="amz-footer-col">
          <h3>Snitch Payment Products</h3>
          <ul>
            <li><a href="#card">Snitch Pay</a></li>
            <li><a href="#giftcards">Gift Cards</a></li>
            <li><a href="#reload">Reload Your Balance</a></li>
            <li><a href="#currency">Snitch Currency Converter</a></li>
          </ul>
        </div>

        <div className="amz-footer-col">
          <h3>Let Us Help You</h3>
          <ul>
            <li><a href="#help">Help</a></li>
            <li><a href="#track">Track Orders</a></li>
            <li><a href="#returns">Returns & Refunds</a></li>
            <li><a href="#shipping">Shipping</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar with logo, divider, social icons, and copyright */}
      <div className="amz-footer-bottom">
        <div className="amz-footer-brand-row">
          <div className="snitch-logo-wrap">
            <span className="snitch-brand-text">snitch</span>
            <svg
              className="snitch-smile-curve"
              viewBox="0 0 100 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4c24 11 60 11 86 1"
                fill="none"
                stroke="#ff9900"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M87 0l8 5-6 6z"
                fill="#ff9900"
              />
            </svg>
          </div>

          <span className="amz-footer-divider">|</span>

          {/* Social Media Icons */}
          <div className="amz-footer-socials">
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="amz-social-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* X / Twitter */}
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="amz-social-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="amz-social-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="amz-social-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="amz-footer-copy">
          © 2024 Snitch. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
