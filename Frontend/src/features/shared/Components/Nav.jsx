import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../auth/state/auth.slice.js';
import { useCart } from '../../cart/hook/useCart.js';
import './Nav.css';

const Nav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const user = useSelector((state) => state.auth?.user);
  const { cartCount, handleGetCart } = useCart();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Keep cart synced if user is authenticated
  useEffect(() => {
    if (user) {
      handleGetCart();
    }
  }, [user, handleGetCart]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  const handleLogout = () => {
    dispatch(setUser(null));
    navigate('/login');
  };

  return (
    <>
      {/* ============================================================
          1. MAIN NAVIGATION BAR (#131921)
          ============================================================ */}
      <header className="amz-nav-main">
        {/* Amazon Logo with smile arrow */}
        <Link to="/" className="amz-nav-item amz-logo-link" aria-label="Amazon Home">
          <svg
            className="amz-logo-svg"
            viewBox="0 0 100 30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.8 15.6c-.4-.7-.9-1.2-1.5-1.5-.6-.3-1.4-.5-2.3-.5-.9 0-1.7.2-2.3.5-.6.3-1.1.8-1.5 1.5-.4.7-.6 1.5-.6 2.5 0 1 .2 1.8.6 2.5.4.7.9 1.2 1.5 1.5.6.3 1.4.5 2.3.5.9 0 1.7-.2 2.3-.5.6-.3 1.1-.8 1.5-1.5.4-.7.6-1.5.6-2.5 0-1-.2-1.8-.6-2.5zm1.5-3.3v10.3c0 .8.1 1.4.3 1.8.2.4.6.6 1.1.6.4 0 .7-.1 1-.2v1.5c-.4.2-.9.3-1.6.3-.9 0-1.6-.3-2-1-.3-.5-.4-1.2-.4-2.1v-.8c-.7 1-1.5 1.7-2.4 2.2-.9.5-2 .7-3.1.7-1.3 0-2.4-.3-3.4-.8-1-.5-1.8-1.3-2.3-2.3-.5-1-.8-2.2-.8-3.5 0-1.3.3-2.5.8-3.5.5-1 1.3-1.8 2.3-2.3 1-.5 2.1-.8 3.4-.8 1.1 0 2.2.2 3.1.7.9.5 1.7 1.2 2.4 2.2v-2.9h1.6zm13.1-.3v14.4h-1.9v-7.8c0-1.2-.3-2.1-.8-2.7-.5-.6-1.3-.9-2.2-.9-.8 0-1.5.2-2.1.7-.6.5-1 1.2-1.2 2.1v8.6h-1.9v-14.4h1.7v2.2c.6-.8 1.3-1.4 2.1-1.8.8-.4 1.7-.6 2.6-.6 1.3 0 2.3.4 3 1.1.7.7 1 1.7 1 3.1v.4zm8.6 7.4c0 1.1.2 2 .7 2.7.5.7 1.2 1 2.1 1 .9 0 1.6-.3 2.1-1 .5-.7.7-1.6.7-2.7 0-1.1-.2-2-.7-2.7-.5-.7-1.2-1-2.1-1-.9 0-1.6.3-2.1 1-.5.7-.7 1.6-.7 2.7zm-1.9 0c0-1.5.4-2.8 1.1-3.8.7-1 1.8-1.5 3.1-1.5s2.4.5 3.1 1.5c.7 1 1.1 2.3 1.1 3.8s-.4 2.8-1.1 3.8c-.7 1-1.8 1.5-3.1 1.5s-2.4-.5-3.1-1.5c-.7-1-1.1-2.3-1.1-3.8zm14.8-7.4v2.1c.7-.8 1.4-1.4 2.2-1.8.8-.4 1.7-.6 2.7-.6 1.2 0 2.2.3 3 .9.8.6 1.2 1.6 1.2 2.9v10.9h-1.9v-10.4c0-1-.3-1.7-.8-2.2-.5-.5-1.2-.7-2.1-.7-.8 0-1.5.3-2.1.8-.6.5-1 1.2-1.2 2.1v10.4h-1.9v-14.4h1.7z"
              fill="#ffffff"
            />
            {/* Amazon Smile Curve */}
            <path
              d="M7.7 24.3c9.9 5.8 24.7 6.4 37.6 1.8.8-.3 1.4.3.8.9-12.8 8.4-29.6 8.3-39.7.5-.7-.5-.2-1.2.7-.8l.6-2.4z"
              fill="#ff9900"
            />
            {/* Arrowhead */}
            <path
              d="M48.2 23.5c-1.3 1.2-3.8 2.3-5.2 2.7-.4.1-.4-.3-.1-.6.9-.9 2.5-2.2 3.6-2.9 1.1-.7 2.6-.7 3.3-.4.7.4.2 1.7-1.6 1.2z"
              fill="#ff9900"
            />
          </svg>
          <span className="amz-logo-in-badge">.in</span>
        </Link>

        {/* Deliver to India */}
        <div className="amz-nav-item amz-delivery-box" title="Deliver to India">
          <svg
            className="amz-location-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="amz-delivery-text">
            <span className="amz-sub-text">Deliver to</span>
            <span className="amz-main-text">India</span>
          </div>
        </div>

        {/* Search Bar */}
        <form
          className={`amz-search-container ${isSearchFocused ? 'focused' : ''}`}
          onSubmit={handleSearchSubmit}
        >
          <select
            className="amz-search-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select search category"
          >
            <option value="All">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
            <option value="Kitchen">Kitchen</option>
          </select>

          <input
            type="text"
            className="amz-search-input"
            placeholder="Search Amazon.in"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            aria-label="Search Amazon"
          />

          {searchQuery && (
            <button
              type="button"
              className="amz-search-clear"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="submit"
            className="amz-search-btn"
            title="Search"
            aria-label="Submit Search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Language Selector: EN */}
        <div className="amz-nav-item amz-lang-box" title="Change Language">
          <svg className="amz-flag-icon" viewBox="0 0 640 480" width="18" height="12">
            <g fillRule="evenodd">
              <path fill="#fff" d="M0 0h640v480H0z" />
              <path fill="#00247d" d="M0 0h640v480H0z" />
              <path fill="#fff" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0h75z" />
              <path fill="#cf142b" d="m424 288 216 156v36L384 316l40-28zm184-288L360 216l40 28 240-180V0h-32zM0 36l200 150-40 30L0 72V36zm0 408 240-180 40 30L40 480H0v-36z" />
              <path fill="#fff" d="M240 0h160v480H240zM0 160h640v160H0z" />
              <path fill="#cf142b" d="M280 0h80v480h-80zM0 200h640v80H0z" />
            </g>
          </svg>
          <span className="amz-main-text" style={{ fontSize: '13px' }}>
            EN ▾
          </span>
        </div>

        {/* Account & Lists */}
        <div className="amz-nav-item amz-account-box">
          <span className="amz-sub-text">
            Hello, {user ? (user.fullname?.split(' ')[0] || 'User') : 'sign in'}
          </span>
          <span className="amz-main-text">Account & Lists ▾</span>

          {/* Account Dropdown Menu */}
          <div className="amz-account-dropdown">
            {user ? (
              <div>
                <div className="amz-dropdown-user-header">
                  <div className="amz-dropdown-name">{user.fullname}</div>
                  <div className="amz-dropdown-email">{user.email}</div>
                  <span className={`amz-dropdown-badge ${user.role?.toLowerCase()}`}>
                    {user.role?.toUpperCase()} ACCOUNT
                  </span>
                </div>

                <div className="amz-dropdown-links">
                  {user.role?.toLowerCase() === 'seller' && (
                    <>
                      <Link to="/dashboard" className="amz-dropdown-link">
                        <span>📊</span> Seller Dashboard
                      </Link>
                      <Link to="/create-product" className="amz-dropdown-link">
                        <span>📦</span> Add New Product
                      </Link>
                    </>
                  )}
                  <Link to="/" className="amz-dropdown-link">
                    <span>🛒</span> Your Orders
                  </Link>
                  <Link to="/" className="amz-dropdown-link">
                    <span>❤️</span> Your Wishlist
                  </Link>
                </div>

                <button
                  type="button"
                  className="amz-logout-btn"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    backgroundColor: '#f0c14b',
                    border: '1px solid #a88734',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontWeight: '700',
                    color: '#111',
                    textDecoration: 'none',
                    fontSize: '13px',
                    marginBottom: '8px',
                    boxSizing: 'border-box',
                  }}
                >
                  Sign In
                </Link>
                <div style={{ fontSize: '12px', color: '#565959' }}>
                  New customer?{' '}
                  <Link
                    to="/login"
                    style={{ color: '#007185', textDecoration: 'none' }}
                  >
                    Start here.
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Returns & Orders */}
        <Link to="/" className="amz-nav-item amz-orders-box">
          <span className="amz-sub-text">Returns</span>
          <span className="amz-main-text">& Orders</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          className="amz-nav-item amz-cart-box"
          title="Shopping Cart"
        >
          <div className="amz-cart-icon-wrapper">
            <span className="amz-cart-count">{cartCount}</span>
            <svg
              width="38"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <span className="amz-cart-title">Cart</span>
        </Link>
      </header>

      {/* ============================================================
          2. SUB NAVBAR (#232f3e)
          ============================================================ */}
      <nav className="amz-nav-sub">
        <div className="amz-nav-sub-left">
          {/* Hamburger All */}
          <button
            type="button"
            className="amz-sub-link all-menu"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Amazon Navigation Drawer"
          >
            <svg
              className="amz-hamburger-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>All</span>
          </button>

          <Link to="/" className="amz-sub-link">
            All Products
          </Link>
          <Link to="/" className="amz-sub-link">
            Amazon Pay
          </Link>
          <Link to="/" className="amz-sub-link">
            Mobiles
          </Link>
          <Link to="/" className="amz-sub-link">
            Prime ▾
          </Link>
          <Link to="/" className="amz-sub-link">
            Electronics
          </Link>
          <Link to="/" className="amz-sub-link">
            Fashion
          </Link>
          <Link to="/" className="amz-sub-link">
            Customer Service
          </Link>
          <Link
            to={user?.role?.toLowerCase() === 'seller' ? '/dashboard' : '/login'}
            className="amz-sub-link seller-accent"
          >
            {user?.role?.toLowerCase() === 'seller' ? 'Seller Dashboard' : 'Sell'}
          </Link>
        </div>

        <div className="amz-nav-sub-right">
          <Link to="/" className="amz-sub-promo">
            Shop deals in Electronics
          </Link>
        </div>
      </nav>

      {/* ============================================================
          3. SLIDE-OUT DRAWER MENU
          ============================================================ */}
      {isDrawerOpen && (
        <div
          className="amz-drawer-backdrop"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="amz-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="amz-drawer-header">
              <div className="amz-drawer-avatar">
                {user ? user.fullname?.[0]?.toUpperCase() : '👤'}
              </div>
              <span className="amz-drawer-username">
                Hello, {user ? user.fullname : 'Sign In'}
              </span>
            </div>

            <div className="amz-drawer-section">
              <h3 className="amz-drawer-heading">Trending</h3>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                Best Sellers <span>›</span>
              </div>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                New Releases <span>›</span>
              </div>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                Movers & Shakers <span>›</span>
              </div>
            </div>

            <div className="amz-drawer-section">
              <h3 className="amz-drawer-heading">Shop By Category</h3>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                Electronics <span>›</span>
              </div>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                Kitchen & Dining <span>›</span>
              </div>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                Home & Furniture <span>›</span>
              </div>
              <div className="amz-drawer-item" onClick={() => { setIsDrawerOpen(false); navigate('/'); }}>
                Clothing & Fashion <span>›</span>
              </div>
            </div>

            <div className="amz-drawer-section">
              <h3 className="amz-drawer-heading">Seller & Account</h3>
              {user?.role?.toLowerCase() === 'seller' ? (
                <>
                  <Link
                    to="/dashboard"
                    className="amz-drawer-item"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Seller Dashboard <span>›</span>
                  </Link>
                  <Link
                    to="/create-product"
                    className="amz-drawer-item"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Create Product <span>›</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="amz-drawer-item"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Sell on Amazon <span>›</span>
                </Link>
              )}

              {user ? (
                <div
                  className="amz-drawer-item"
                  onClick={() => {
                    handleLogout();
                    setIsDrawerOpen(false);
                  }}
                  style={{ color: '#c40000', fontWeight: '600' }}
                >
                  Sign Out
                </div>
              ) : (
                <Link
                  to="/login"
                  className="amz-drawer-item"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Sign In <span>›</span>
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            className="amz-drawer-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default Nav;
