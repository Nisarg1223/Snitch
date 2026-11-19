import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';

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
      let user;
      if (isSignUp) {
        user = await handleRegister({
          email: formData.email,
          password: formData.password,
          contact: formData.contact,
          fullname: formData.fullname,
          isSeller: formData.isSeller,
        });
      } else {
        user = await handleLogin({
          email: formData.email,
          password: formData.password,
        });
      }

      if (user?.role?.toLowerCase() === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
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
      <div className="auth-card-container">
        {/* ============================================================
            LEFT COLUMN: BENTO 3x3 GRID ART SHOWCASE
            ============================================================ */}
        <div className="bento-showcase-column">
          <div className="bento-box">
            {/* Row 1, Col 1: Bokeh tile */}
            <div className="bento-tile bento-bokeh-tile">
              <div className="bokeh-circle bokeh-1" />
              <div className="bokeh-circle bokeh-2" />
            </div>

            {/* Row 1, Col 2: Purple Card with plus matrix */}
            <div className="bento-tile bento-card-purple">
              <div className="bento-plus-matrix">
                <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
                <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
                <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
              </div>
              <div className="bento-card-text">
                <span className="bento-text-line">Total Care.</span>
                <span className="bento-text-line">Total Different.</span>
              </div>
            </div>

            {/* Row 1, Col 3: Bokeh tile */}
            <div className="bento-tile bento-bokeh-tile">
              <div className="bokeh-circle bokeh-3" />
              <div className="bokeh-circle bokeh-4" />
            </div>

            {/* Row 2, Col 1: Purple Card with Snitch 'S' logo */}
            <div className="bento-tile bento-card-purple bento-logo-center">
              <div className="bento-snitch-s-icon">
                <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 9 H26 C30.4 9 34 12.6 34 17 C34 21 31 24.2 27 25.2 L17 18.2 H26 C27.1 18.2 28 17.3 28 16.2 C28 15.1 27.1 14.2 26 14.2 H14 L12 9 Z"
                    fill="#111827"
                  />
                  <path
                    d="M32 35 H18 C13.6 35 10 31.4 10 27 C10 23 13 19.8 17 18.8 L27 25.8 H18 C16.9 25.8 16 26.7 16 27.8 C16 28.9 16.9 29.8 18 29.8 H30 L32 35 Z"
                    fill="#111827"
                  />
                </svg>
              </div>
            </div>

            {/* Row 2, Col 2: Pastel Yellow Card with Trust text */}
            <div className="bento-tile bento-card-yellow">
              <span className="bento-corner-plus">+</span>
              <div className="bento-card-text">
                <span className="bento-text-line">Building trust</span>
                <span className="bento-text-line">in blockchain</span>
                <span className="bento-text-line">technology</span>
              </div>
            </div>

            {/* Row 2, Col 3: Bokeh tile */}
            <div className="bento-tile bento-bokeh-tile">
              <div className="bokeh-circle bokeh-2" />
              <div className="bokeh-circle bokeh-5" />
            </div>

            {/* Row 3, Col 1: Pastel Yellow Card with Power text */}
            <div className="bento-tile bento-card-yellow">
              <span className="bento-corner-plus">+</span>
              <div className="bento-card-text">
                <span className="bento-text-line">Own</span>
                <span className="bento-text-line">your power</span>
              </div>
            </div>

            {/* Row 3, Col 2: Bokeh tile */}
            <div className="bento-tile bento-bokeh-tile">
              <div className="bokeh-circle bokeh-1" />
              <div className="bokeh-circle bokeh-4" />
            </div>

            {/* Row 3, Col 3: Bokeh tile */}
            <div className="bento-tile bento-bokeh-tile">
              <div className="bokeh-circle bokeh-3" />
              <div className="bokeh-circle bokeh-5" />
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN: LIGHT MODE AUTH FORM
            ============================================================ */}
        <div className="auth-form-column">
          <div className="auth-form-content">
            {/* Header: Title & Subtitle */}
            <div className="auth-header-block">
              <h1 className="auth-heading-title">
                {isSignUp ? 'Sign Up' : 'Log In'}
              </h1>
              <p className="auth-heading-subtitle">
                {isSignUp
                  ? 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem'
                  : 'Welcome back! Please enter your details to sign in.'}
              </p>
            </div>

            {/* Global Error Banner */}
            {(errors.form || authError) && (
              <div className="auth-error-alert">
                <span className="error-icon">⚠️</span>
                <span>{errors.form || authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="auth-fields-form">
              {/* Account Type Selector (for Sign Up) */}
              {isSignUp && (
                <div className="auth-role-wrapper">
                  <span className="auth-role-title">Account Type</span>
                  <div className="auth-role-pills">
                    <button
                      type="button"
                      className={`auth-role-pill ${formData.role === 'buyer' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('buyer')}
                    >
                      🛍️ Buyer
                    </button>
                    <button
                      type="button"
                      className={`auth-role-pill ${formData.role === 'seller' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('seller')}
                    >
                      🏪 Seller
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name Field (Sign Up) */}
              {isSignUp && (
                <div className="auth-field-group">
                  <div className={`auth-notched-field ${errors.fullname ? 'field-error' : ''}`}>
                    <label htmlFor="fullname" className="auth-notched-label">
                      Full Name
                    </label>
                    <input
                      id="fullname"
                      type="text"
                      name="fullname"
                      className="auth-notched-input"
                      placeholder="Alice Caroline"
                      value={formData.fullname}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.fullname && (
                    <span className="auth-input-err-msg">{errors.fullname}</span>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="auth-field-group">
                <div className={`auth-notched-field ${errors.email ? 'field-error' : ''}`}>
                  <label htmlFor="email" className="auth-notched-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="auth-notched-input"
                    placeholder="alice_login@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <span className="auth-input-err-msg">{errors.email}</span>
                )}
              </div>

              {/* Contact Number Field (Sign Up) */}
              {isSignUp && (
                <div className="auth-field-group">
                  <div className={`auth-notched-field ${errors.contact ? 'field-error' : ''}`}>
                    <label htmlFor="contact" className="auth-notched-label">
                      Contact Number
                    </label>
                    <input
                      id="contact"
                      type="tel"
                      name="contact"
                      className="auth-notched-input"
                      placeholder="+91 98765 43210"
                      value={formData.contact}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.contact && (
                    <span className="auth-input-err-msg">{errors.contact}</span>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div className="auth-field-group">
                <div className={`auth-notched-field ${errors.password ? 'field-error' : ''}`}>
                  <label htmlFor="password" className="auth-notched-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="auth-notched-input"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-input-err-msg">{errors.password}</span>
                )}
              </div>

              {/* Terms Checkbox (Sign Up) */}
              {isSignUp && (
                <div className="auth-checkbox-row">
                  <label className="auth-custom-checkbox">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                    />
                    <span className="auth-checkbox-box" />
                    <span className="auth-checkbox-label-text">
                      I agree to all <a href="#terms">Terms</a>,{' '}
                      <a href="#privacy">Privacy Policy</a> and Fees
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <span className="auth-input-err-msg">{errors.agreeTerms}</span>
                  )}
                </div>
              )}

              {/* Forgot Password Link (Login) */}
              {!isSignUp && (
                <div className="auth-forgot-link-row">
                  <a href="#forgot" className="auth-forgot-link">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Main Submit Button (Full Width Pill) */}
              <button type="submit" className="auth-pill-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner-wrap">
                    <span className="auth-btn-spinner" />
                    <span>{isSignUp ? 'Signing Up...' : 'Logging In...'}</span>
                  </span>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
                )}
              </button>
            </form>

            {/* Horizontal "Or" Divider */}
            <div className="auth-or-divider">
              <span className="auth-or-text">Or</span>
            </div>

            {/* Social Buttons (Google & Facebook) */}
            <div className="auth-social-buttons-row">
              <button
                type="button"
                className="auth-social-pill-btn"
                onClick={() => {
                  window.location.href = 'http://localhost:3000/api/auth/google';
                }}
              >
                <svg className="social-icon" viewBox="0 0 24 24">
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
                <span>Google</span>
              </button>

              <button
                type="button"
                className="auth-social-pill-btn"
                onClick={() => {
                  setErrors((prev) => ({
                    ...prev,
                    form: 'Facebook login is coming soon! Please use Google or Email.',
                  }));
                }}
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Bottom Toggle Log In / Sign Up */}
            <div className="auth-toggle-mode-row">
              <span>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                className="auth-toggle-btn"
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
      </div>
    </div>
  );
};

export default Login;



