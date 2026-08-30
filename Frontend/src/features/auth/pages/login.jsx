import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { handleRegister, handleLogin, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    role: 'buyer',
    isSeller: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      isSeller: role === 'seller',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.fullname.trim()) {
        newErrors.fullname = 'Full name is required';
      }
      if (!formData.contact.trim()) {
        newErrors.contact = 'Contact number is required';
      } else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.contact)) {
        newErrors.contact = 'Please enter a valid phone number';
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (isSignUp) {
        await handleRegister({
          email: formData.email,
          password: formData.password,
          contact: formData.contact,
          fullname: formData.fullname,
          isSeller: formData.isSeller,
        });
      } else {
        await handleLogin({
          email: formData.email,
          password: formData.password,
        });
      }

      navigate('/');
    } catch (err) {
      console.error(isSignUp ? 'Registration failed:' : 'Login failed:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        (isSignUp ? 'Registration failed' : 'Login failed');
      setErrors((prev) => ({ ...prev, form: errorMsg }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side: Form Section */}
        <div className="auth-form-column">
          <div className="auth-form-wrapper">
            {/* Header Brand Logo */}
            <div className="brand-header">
              <div className="brand-logo">
                <svg
                  className="brand-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="brand-name">SNITCH</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="auth-heading-group">
              <h1 className="auth-title">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="auth-subtitle">
                {isSignUp
                  ? "Let's get started with your 30 days free trial"
                  : 'Enter your credentials to access your SNITCH dashboard'}
              </p>
            </div>

            {/* Global Error Banner */}
            {(errors.form || authError) && (
              <div className="auth-error-banner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="alert-icon"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.form || authError}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                window.location.href = 'http://localhost:3000/api/auth/google';
              }}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSignUp ? 'Sign up with Google' : 'Login with Google'}</span>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Type of User (Seller or Buyer) - Shown in Sign Up */}
              {isSignUp && (
                <div className="form-group role-group">
                  <label className="input-label">Account Type</label>
                  <div className="role-selector">
                    <button
                      type="button"
                      className={`role-option ${formData.role === 'buyer' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('buyer')}
                    >
                      <svg
                        className="role-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>Buyer</span>
                    </button>

                    <button
                      type="button"
                      className={`role-option ${formData.role === 'seller' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('seller')}
                    >
                      <svg
                        className="role-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>Seller</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (for Sign Up) */}
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="fullname" className="input-label">
                    Full Name<span className="required-star">*</span>
                  </label>
                  <div className="input-field-wrapper">
                    <input
                      id="fullname"
                      type="text"
                      name="fullname"
                      className={`form-input ${errors.fullname ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                      value={formData.fullname}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.fullname && <span className="error-text">{errors.fullname}</span>}
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="input-label">
                  Email<span className="required-star">*</span>
                </label>
                <div className="input-field-wrapper">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Contact Number (for Sign Up) */}
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="contact" className="input-label">
                    Contact Number<span className="required-star">*</span>
                  </label>
                  <div className="input-field-wrapper">
                    <input
                      id="contact"
                      type="tel"
                      name="contact"
                      className={`form-input ${errors.contact ? 'input-error' : ''}`}
                      placeholder="Enter your contact number"
                      value={formData.contact}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.contact && <span className="error-text">{errors.contact}</span>}
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="input-label">
                  Password<span className="required-star">*</span>
                </label>
                <div className="input-field-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input password-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="toggle-icon"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="toggle-icon"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Terms Checkbox (Sign Up) */}
              {isSignUp && (
                <div className="terms-group">
                  <label className="custom-checkbox-container">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-checkmark"></span>
                    <span className="checkbox-text">
                      I agree to all <a href="#terms" className="inline-link">Terms</a>,{' '}
                      <a href="#privacy" className="inline-link">Privacy Policy</a> and Fees
                    </span>
                  </label>
                  {errors.agreeTerms && <span className="error-text block-error">{errors.agreeTerms}</span>}
                </div>
              )}

              {/* Forgot password in Login mode */}
              {!isSignUp && (
                <div className="forgot-password-row">
                  <a href="#forgot" className="inline-link forgot-link">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit CTA Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading-content">
                    <span className="btn-spinner"></span>
                    <span>{isSignUp ? 'Signing Up...' : 'Logging In...'}</span>
                  </span>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Log In */}
            <div className="auth-footer-toggle">
              <span>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                className="toggle-mode-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Showcase Banner */}
        <div className="auth-visual-column">
          <div className="showcase-card">
            <div className="showcase-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop"
                alt="Discovering the Best Collections"
                className="showcase-img"
              />
              <div className="showcase-gradient-overlay" />
            </div>

            {/* Showcase Overlay Content */}
            <div className="showcase-content">
              <h2 className="showcase-headline">
                Discovering the Best Furniture & Lifestyle for Your Home
              </h2>
              <p className="showcase-description">
                Our platform connects buyers with exceptional sellers, creating seamless shopping experiences.
              </p>

              {/* Feature Badges */}
              <div className="showcase-badges">
                <div className="badge-pill">
                  <svg
                    className="badge-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>100% Guarantee</span>
                </div>

                <div className="badge-pill">
                  <svg
                    className="badge-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Free delivery London area</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


