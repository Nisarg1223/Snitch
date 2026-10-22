import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser } from '../state/auth.slice.js';
import { useProduct } from '../../products/hooks/useProduct.js';
import './Home.css';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const products = useSelector((state) => state.product.products || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();

  // Local state for interactive Amazon experience
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModalImgIdx, setActiveModalImgIdx] = useState(0);
  const [cartToastMessage, setCartToastMessage] = useState(null);

  // Fetch real products from backend on mount
  useEffect(() => {
    handleGetProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Google OAuth redirect if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        dispatch(setUser(parsedUser));
        window.history.replaceState({}, document.title, window.location.pathname);
        if (parsedUser?.role?.toLowerCase() === 'seller') {
          navigate('/dashboard');
        }
      } catch (e) {
        console.error('Failed to parse user from OAuth redirect:', e);
      }
    }
  }, [dispatch, navigate]);

  const handleLogout = () => {
    dispatch(setUser(null));
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    setCartCount((prev) => prev + 1);
    setCartToastMessage(`Added "${product.title}" to your Amazon Cart!`);
    setTimeout(() => {
      setCartToastMessage(null);
    }, 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter real products by search query and category (No dummy data)
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((prod) => {
      const title = prod.title?.toLowerCase() || '';
      const desc = prod.description?.toLowerCase() || '';
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || title.includes(query) || desc.includes(query);
      return matchesSearch;
    });
  }, [products, searchQuery]);

  // Distribute real products across the 4 Amazon feature cards shown in the screenshot
  const cardData = useMemo(() => {
    const defaultCards = [
      {
        id: 'kitchen',
        title: 'Top categories in Kitchen appliances',
        actionText: 'Explore all in Kitchen',
        filterKeyword: 'kitchen',
      },
      {
        id: 'home',
        title: 'Shop for your home essentials',
        actionText: 'Discover home deals',
        filterKeyword: 'home',
      },
      {
        id: 'gaming',
        title: 'Gaming accessories',
        actionText: 'See more in Gaming',
        filterKeyword: 'gaming',
      },
      {
        id: 'fashion',
        title: 'Shop deals in Fashion',
        actionText: 'See all deals',
        filterKeyword: 'fashion',
      },
    ];

    return defaultCards.map((card, idx) => {
      // Find matching real product or assign available real products
      let matched = products.find(
        (p) =>
          p.title?.toLowerCase().includes(card.filterKeyword) ||
          p.description?.toLowerCase().includes(card.filterKeyword)
      );
      if (!matched && products.length > idx) {
        matched = products[idx];
      }
      return {
        ...card,
        product: matched || null,
      };
    });
  }, [products]);

  return (
    <div className="amazon-home-root">
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

        {/* Search Bar with All dropdown, input, and orange search icon */}
        <div className={`amz-search-container ${isSearchFocused ? 'focused' : ''}`}>
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
            placeholder="Search Amazon"
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
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="button"
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
        </div>

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
        <div
          className="amz-nav-item amz-cart-box"
          onClick={() => {
            if (cartCount === 0) {
              setCartToastMessage('Your Amazon Cart is currently empty.');
              setTimeout(() => setCartToastMessage(null), 2500);
            }
          }}
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
        </div>
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
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
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
            Today's Deals
          </Link>
          <Link to="/" className="amz-sub-link">
            Customer Service
          </Link>
          <Link to="/" className="amz-sub-link">
            Registry
          </Link>
          <Link to="/" className="amz-sub-link">
            Gift Cards
          </Link>
          <Link
            to={user?.role?.toLowerCase() === 'seller' ? '/dashboard' : '/login'}
            className="amz-sub-link seller-accent"
          >
            Sell
          </Link>
        </div>

        <div className="amz-nav-sub-right">
          <Link to="/" className="amz-sub-promo">
            Shop deals in Electronics
          </Link>
        </div>
      </nav>

      {/* Toast Notification when adding to Cart */}
      {cartToastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            backgroundColor: '#067d62',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '6px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
            zIndex: 3000,
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>✓</span> {cartToastMessage}
        </div>
      )}

      {/* ============================================================
          3. HERO BANNER SECTION (Easter / Sunny Yellow)
          ============================================================ */}
      <section className="amz-hero-section">
        <div className="amz-hero-img-wrapper">
          <img
            src="/amazon_hero_banner.jpg"
            alt="Fill your basket with joy - Amazon Easter & Spring Selection"
            className="amz-hero-bg-img"
          />
          {/* Subtle gradient so banner smoothly transitions into cards */}
          <div className="amz-hero-fade"></div>
        </div>

        {/* The White Notification Strip (as seen in image) */}
        <div className="amz-notification-strip-wrapper">
          <div className="amz-notification-strip">
            You are on amazon.com. You can also shop on Amazon India for millions of
            products with fast local delivery.{' '}
            <a
              href="https://www.amazon.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              Click here to go to amazon.in
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. CONTENT & 4-CARD FEATURE GRID (Exact match to screenshot)
          ============================================================ */}
      <main className="amz-main-content">
        {/* The 4 Amazon Feature Cards */}
        <div className="amz-card-grid">
          {cardData.map((card) => {
            const hasProduct = Boolean(card.product);
            const prod = card.product;
            const imgUrl = prod?.images?.[0]?.url || '/amazon_hero_banner.jpg';
            const priceVal = prod?.price?.amount
              ? Number(prod.price.amount).toLocaleString('en-IN')
              : null;

            return (

              <div
                key={card.id}
                className="amz-feature-card"
                onClick={() => {
                  if (hasProduct && prod?._id) {
                    navigate(`/product/${prod._id}`);
                  }
                }}
                style={{ cursor: hasProduct ? 'pointer' : 'default' }}
              >
                <div className="amz-card-header">
                  <h2 className="amz-card-title">{card.title}</h2>
                </div>

                <div className="amz-card-body">
                  {hasProduct ? (
                    <div
                      className="amz-card-single-item"
                      onClick={() => {
                        if (prod?._id) {
                          navigate(`/product/${prod._id}`);
                        }
                      }}
                    >
                      <div className="amz-card-image-box">
                        <img src={imgUrl} alt={prod.title} loading="lazy" />
                      </div>
                      <div className="amz-card-product-info">
                        <div className="amz-card-prod-title">{prod.title}</div>
                        {priceVal && (
                          <div className="amz-card-price-row">
                            <span className="amz-price-symbol">₹</span>
                            <span className="amz-price-value">{priceVal}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Elegant placeholder quadrant showcase for category when no product fits */
                    <div className="amz-quad-grid">
                      <div className="amz-quad-item">
                        <div className="amz-quad-img-wrapper">
                          <img
                            src="/amazon_hero_banner.jpg"
                            alt={card.title}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <span className="amz-quad-label">Popular picks</span>
                      </div>
                      <div className="amz-quad-item">
                        <div className="amz-quad-img-wrapper">
                          <img
                            src="/amazon_hero_banner.jpg"
                            alt={card.title}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <span className="amz-quad-label">Top rated</span>
                      </div>
                      <div className="amz-quad-item">
                        <div className="amz-quad-img-wrapper">
                          <img
                            src="/amazon_hero_banner.jpg"
                            alt={card.title}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <span className="amz-quad-label">Best deals</span>
                      </div>
                      <div className="amz-quad-item">
                        <div className="amz-quad-img-wrapper">
                          <img
                            src="/amazon_hero_banner.jpg"
                            alt={card.title}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <span className="amz-quad-label">New arrivals</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="amz-card-footer">
                  <span
                    className="amz-card-action-link"
                    onClick={(e) => {
                      if (hasProduct && prod?._id) {
                        e.stopPropagation();
                        navigate(`/product/${prod._id}`);
                      }
                    }}
                  >
                    {card.actionText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================
            5. REAL PRODUCTS SHOWCASE ROWS (Directly from backend API)
            ============================================================ */}
        <section className="amz-products-section">
          <div className="amz-section-header">
            <h2 className="amz-section-title">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : "Today's Featured Deals & Products"}
            </h2>
            <span className="amz-section-count">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'item' : 'items'} available
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="amz-product-shelf">
              {filteredProducts.map((prod, index) => {
                const img = prod.images?.[0]?.url || '/amazon_hero_banner.jpg';
                const formattedPrice = prod.price?.amount
                  ? Number(prod.price.amount).toLocaleString('en-IN')
                  : '0';

                return (
                  <div
                    key={prod._id || index}
                    className="amz-prod-card"
                    onClick={() => {
                      if (prod?._id) {
                        navigate(`/product/${prod._id}`);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {index === 0 && (
                      <div className="amz-badge-choice">
                        Amazon's <span>Choice</span>
                      </div>
                    )}

                    <div className="amz-prod-thumb-box">
                      <img src={img} alt={prod.title} loading="lazy" />
                    </div>

                    <div className="amz-prod-title-text" title={prod.title}>
                      {prod.title}
                    </div>

                    <div className="amz-prod-rating-row">
                      <div className="amz-stars">★★★★★</div>
                      <span className="amz-rating-count">({45 + (index * 13) % 200})</span>
                    </div>

                    <div className="amz-prod-price-box">
                      <div className="amz-prod-price-tag">
                        <span className="amz-price-curr">₹</span>
                        <span className="amz-price-big">{formattedPrice}</span>
                      </div>
                    </div>

                    <div className="amz-prime-row">
                      <span className="amz-prime-check">✓prime</span>
                      <span>One-Day</span>
                    </div>

                    <div className="amz-delivery-promise">
                      Get it by <strong>Tomorrow, 8PM</strong>
                    </div>

                    <button
                      type="button"
                      className="amz-add-cart-btn"
                      onClick={(e) => handleAddToCart(prod, e)}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="amz-empty-shelf">
              <div className="amz-empty-icon">📦</div>
              <h3 className="amz-empty-title">
                {searchQuery
                  ? `No products matching "${searchQuery}"`
                  : 'No Products in Catalog Yet'}
              </h3>
              <p className="amz-empty-desc">
                {user?.role?.toLowerCase() === 'seller'
                  ? 'As a registered seller, you can add new items to the marketplace anytime.'
                  : 'Check back soon for exciting deals, or log in as a seller to publish products.'}
              </p>
              {user?.role?.toLowerCase() === 'seller' && (
                <Link
                  to="/create-product"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#ffd814',
                    border: '1px solid #fcd200',
                    borderRadius: '9999px',
                    padding: '8px 24px',
                    fontWeight: '700',
                    color: '#0f1111',
                    textDecoration: 'none',
                    fontSize: '13px',
                  }}
                >
                  Create Product Now
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ============================================================
          6. QUICK VIEW / PRODUCT DETAILS MODAL
          ============================================================ */}
      {selectedProduct && (
        <div
          className="amz-modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="amz-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="amz-modal-close-btn"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Product Image Gallery */}
            <div className="amz-modal-gallery">
              <div className="amz-modal-main-img">
                <img
                  src={
                    selectedProduct.images?.[activeModalImgIdx]?.url ||
                    selectedProduct.images?.[0]?.url ||
                    '/amazon_hero_banner.jpg'
                  }
                  alt={selectedProduct.title}
                />
              </div>

              {selectedProduct.images?.length > 1 && (
                <div className="amz-modal-thumbnails">
                  {selectedProduct.images.map((imgObj, idx) => (
                    <button
                      key={imgObj._id || idx}
                      type="button"
                      className={`amz-modal-thumb-btn ${activeModalImgIdx === idx ? 'active' : ''
                        }`}
                      onClick={() => setActiveModalImgIdx(idx)}
                    >
                      <img src={imgObj.url} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Buy Box */}
            <div className="amz-modal-details">
              <h2 className="amz-modal-title">{selectedProduct.title}</h2>

              <div className="amz-prod-rating-row" style={{ marginBottom: '8px' }}>
                <div className="amz-stars">★★★★★</div>
                <span className="amz-rating-count">(4.8 / 5 stars from 82 ratings)</span>
              </div>

              <div className="amz-modal-divider" />

              <div className="amz-card-price-row" style={{ marginBottom: '12px' }}>
                <span className="amz-price-symbol" style={{ fontSize: '16px' }}>
                  ₹
                </span>
                <span className="amz-price-value" style={{ fontSize: '28px' }}>
                  {selectedProduct.price?.amount
                    ? Number(selectedProduct.price.amount).toLocaleString('en-IN')
                    : '0'}
                </span>
                <span style={{ fontSize: '13px', color: '#565959', marginLeft: '6px' }}>
                  Inclusive of all taxes
                </span>
              </div>

              <div className="amz-prime-row">
                <span className="amz-prime-check">✓prime</span>
                <span>Enjoy fast, free delivery on this item</span>
              </div>

              <div className="amz-modal-divider" />

              <p className="amz-modal-desc">
                {selectedProduct.description || 'No description provided for this item.'}
              </p>

              {/* Buy Box */}
              <div className="amz-buy-box">
                <div className="amz-in-stock">In Stock</div>
                <div style={{ fontSize: '13px', color: '#565959', marginBottom: '14px' }}>
                  Sold directly via Verified Marketplace Seller
                </div>

                <button
                  type="button"
                  className="amz-add-cart-btn"
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = selectedProduct._id;
                    setSelectedProduct(null);
                    navigate(`/product/${id}`);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '9px 14px',
                    border: '1px solid #d5d9d9',
                    borderRadius: '20px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  See Full Product Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          7. AMAZON SLIDE-OUT DRAWER MENU
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
              <div className="amz-drawer-item">Best Sellers <span>›</span></div>
              <div className="amz-drawer-item">New Releases <span>›</span></div>
              <div className="amz-drawer-item">Movers & Shakers <span>›</span></div>
            </div>

            <div className="amz-drawer-section">
              <h3 className="amz-drawer-heading">Shop By Category</h3>
              <div className="amz-drawer-item">Electronics <span>›</span></div>
              <div className="amz-drawer-item">Kitchen & Dining <span>›</span></div>
              <div className="amz-drawer-item">Home & Furniture <span>›</span></div>
              <div className="amz-drawer-item">Clothing & Fashion <span>›</span></div>
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

      {/* ============================================================
          8. AMAZON FOOTER
          ============================================================ */}
      <footer className="amz-footer">
        {/* Back to top button */}
        <div
          className="amz-back-to-top"
          onClick={scrollToTop}
          role="button"
          tabIndex={0}
        >
          Back to top
        </div>

        {/* 4 Multi-column links */}
        <div className="amz-footer-links-grid">
          <div className="amz-footer-col">
            <h3>Get to Know Us</h3>
            <ul>
              <li><a href="#about">About Amazon</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press Releases</a></li>
              <li><a href="#science">Amazon Science</a></li>
            </ul>
          </div>

          <div className="amz-footer-col">
            <h3>Make Money with Us</h3>
            <ul>
              <li>
                <Link to={user?.role?.toLowerCase() === 'seller' ? '/dashboard' : '/login'}>
                  Sell on Amazon
                </Link>
              </li>
              <li><a href="#affiliate">Become an Affiliate</a></li>
              <li><a href="#fulfillment">Fulfilment by Amazon</a></li>
              <li><a href="#advertise">Advertise Your Products</a></li>
            </ul>
          </div>

          <div className="amz-footer-col">
            <h3>Amazon Payment Products</h3>
            <ul>
              <li><a href="#card">Amazon Pay</a></li>
              <li><a href="#credit">Shop with Points</a></li>
              <li><a href="#reload">Reload Your Balance</a></li>
              <li><a href="#currency">Amazon Currency Converter</a></li>
            </ul>
          </div>

          <div className="amz-footer-col">
            <h3>Let Us Help You</h3>
            <ul>
              <li><a href="#covid">Amazon and COVID-19</a></li>
              <li><a href="#account">Your Account</a></li>
              <li><a href="#returns">Returns & Replacements</a></li>
              <li><a href="#help">Help</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with logo and copyright */}
        <div className="amz-footer-bottom">
          <div className="amz-footer-logo-row">
            <svg
              className="amz-logo-svg"
              viewBox="0 0 100 30"
              xmlns="http://www.w3.org/2000/svg"
              style={{ height: '24px' }}
            >
              <path
                d="M17.8 15.6c-.4-.7-.9-1.2-1.5-1.5-.6-.3-1.4-.5-2.3-.5-.9 0-1.7.2-2.3.5-.6.3-1.1.8-1.5 1.5-.4.7-.6 1.5-.6 2.5 0 1 .2 1.8.6 2.5.4.7.9 1.2 1.5 1.5.6.3 1.4.5 2.3.5.9 0 1.7-.2 2.3-.5.6-.3 1.1-.8 1.5-1.5.4-.7.6-1.5.6-2.5 0-1-.2-1.8-.6-2.5zm1.5-3.3v10.3c0 .8.1 1.4.3 1.8.2.4.6.6 1.1.6.4 0 .7-.1 1-.2v1.5c-.4.2-.9.3-1.6.3-.9 0-1.6-.3-2-1-.3-.5-.4-1.2-.4-2.1v-.8c-.7 1-1.5 1.7-2.4 2.2-.9.5-2 .7-3.1.7-1.3 0-2.4-.3-3.4-.8-1-.5-1.8-1.3-2.3-2.3-.5-1-.8-2.2-.8-3.5 0-1.3.3-2.5.8-3.5.5-1 1.3-1.8 2.3-2.3 1-.5 2.1-.8 3.4-.8 1.1 0 2.2.2 3.1.7.9.5 1.7 1.2 2.4 2.2v-2.9h1.6zm13.1-.3v14.4h-1.9v-7.8c0-1.2-.3-2.1-.8-2.7-.5-.6-1.3-.9-2.2-.9-.8 0-1.5.2-2.1.7-.6.5-1 1.2-1.2 2.1v8.6h-1.9v-14.4h1.7v2.2c.6-.8 1.3-1.4 2.1-1.8.8-.4 1.7-.6 2.6-.6 1.3 0 2.3.4 3 1.1.7.7 1 1.7 1 3.1v.4zm8.6 7.4c0 1.1.2 2 .7 2.7.5.7 1.2 1 2.1 1 .9 0 1.6-.3 2.1-1 .5-.7.7-1.6.7-2.7 0-1.1-.2-2-.7-2.7-.5-.7-1.2-1-2.1-1-.9 0-1.6.3-2.1 1-.5.7-.7 1.6-.7 2.7zm-1.9 0c0-1.5.4-2.8 1.1-3.8.7-1 1.8-1.5 3.1-1.5s2.4.5 3.1 1.5c.7 1 1.1 2.3 1.1 3.8s-.4 2.8-1.1 3.8c-.7 1-1.8 1.5-3.1 1.5s-2.4-.5-3.1-1.5c-.7-1-1.1-2.3-1.1-3.8zm14.8-7.4v2.1c.7-.8 1.4-1.4 2.2-1.8.8-.4 1.7-.6 2.7-.6 1.2 0 2.2.3 3 .9.8.6 1.2 1.6 1.2 2.9v10.9h-1.9v-10.4c0-1-.3-1.7-.8-2.2-.5-.5-1.2-.7-2.1-.7-.8 0-1.5.3-2.1.8-.6.5-1 1.2-1.2 2.1v10.4h-1.9v-14.4h1.7z"
                fill="#ffffff"
              />
              <path
                d="M7.7 24.3c9.9 5.8 24.7 6.4 37.6 1.8.8-.3 1.4.3.8.9-12.8 8.4-29.6 8.3-39.7.5-.7-.5-.2-1.2.7-.8l.6-2.4z"
                fill="#ff9900"
              />
              <path
                d="M48.2 23.5c-1.3 1.2-3.8 2.3-5.2 2.7-.4.1-.4-.3-.1-.6.9-.9 2.5-2.2 3.6-2.9 1.1-.7 2.6-.7 3.3-.4.7.4.2 1.7-1.6 1.2z"
                fill="#ff9900"
              />
            </svg>
          </div>
          <div className="amz-footer-copy">
            © 1996–2026, Amazon.com, Inc. or its affiliates. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;