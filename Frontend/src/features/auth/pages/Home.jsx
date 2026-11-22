import { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { setUser } from '../state/auth.slice.js';
import { useProduct } from '../../products/hooks/useProduct.js';
import { useCart } from '../../cart/hook/useCart.js';
import notFoundVideo from '../../../assets/not_found_video.mp4';
import '../../shared/pages/NotFound.css';
import './Home.css';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const products = useSelector((state) => state.product.products || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGetProducts } = useProduct();
  const { handleAddItem } = useCart();

  // Search query derived from URL search params (controlled by shared Nav)
  const searchQuery = searchParams.get('search') || '';
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModalImgIdx, setActiveModalImgIdx] = useState(0);
  const [cartToastMessage, setCartToastMessage] = useState(null);

  // Carousel horizontal scroll controls
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  };

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 560;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Fetch real products from backend on mount
  useEffect(() => {
    handleGetProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update carousel button state on mount and resize
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
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

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await handleAddItem({
        productId: product._id,
        quantity: 1,
      });
      setCartToastMessage(`Added "${product.title}" to your Snitch Cart!`);
      setTimeout(() => {
        setCartToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    }
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

  return (
    <div className="amazon-home-root">
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
          3. AMAZON INDIA HERO DEALS CAROUSEL (Under ₹499, Sneakers, etc.)
          ============================================================ */}
      <section className="amz-deals-carousel-wrapper">
        {canScrollLeft && (
          <button
            type="button"
            className="amz-carousel-arrow amz-carousel-arrow-left"
            onClick={() => scrollCarousel('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div
          className="amz-deals-carousel"
          ref={carouselRef}
          onScroll={checkScrollButtons}
        >
          {/* Card 1: Everything under ₹499 (Orange) */}
          <div
            className="amz-hero-deal-card card-orange"
            onClick={() => navigate('/?search=under 499')}
          >
            <div className="amz-deal-header">
              <span className="amz-deal-price-title">Everything</span>
              <h3 className="amz-deal-price-big">under ₹499</h3>
              <p className="amz-deal-subtitle">Fashion, home & more</p>
              <div className="amz-deal-pills-row">
                <span className="amz-deal-pill">
                  <span className="amz-pill-icon">🚚</span> Free Delivery
                </span>
                <span className="amz-deal-pill">
                  <span className="amz-pill-icon">⏱</span> Quick Refunds
                </span>
              </div>
            </div>

            <div className="amz-deal-mosaic-body">
              <img
                src="/amz_deal_everything.jpg"
                alt="Everything under ₹499"
                className="amz-deal-mosaic-img"
              />
            </div>

            <div className="amz-deal-card-bottom-bar">
              <button
                type="button"
                className="amz-deal-reload-btn"
                title="Refresh deals"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGetProducts();
                }}
              >
                ↻
              </button>
            </div>
          </div>

          {/* Card 2: Under ₹499 Trendy sneakers (Red) */}
          <div
            className="amz-hero-deal-card card-red"
            onClick={() => navigate('/?search=sneakers')}
          >
            <div className="amz-deal-header">
              <h3 className="amz-deal-price-big">Under ₹499</h3>
              <p className="amz-deal-subtitle">Trendy sneakers</p>
              <div className="amz-deal-pills-row">
                <span className="amz-deal-badge-pill">Top brands</span>
                <span className="amz-deal-badge-pill">Latest trends</span>
              </div>
            </div>

            <div className="amz-deal-img-container">
              <img
                src="/amz_deal_sneakers.jpg"
                alt="Trendy sneakers under ₹499"
                className="amz-deal-hero-img"
              />
            </div>

            <div className="amz-icici-cashback-bar">
              <div className="amz-icici-badge-pill">
                <span className="amz-icici-badge-top">amazon pay</span>
                <span className="amz-icici-badge-sub">ICICI Bank</span>
              </div>
              <span className="amz-icici-text">
                Unlimited <strong>5% cashback*</strong> with Amazon Pay ICICI Bank credit card
              </span>
            </div>
            <div className="amz-deal-tc">*T&C apply</div>
          </div>

          {/* Card 3: Under ₹999 Electric toothbrushes & more (Mint Green) */}
          <div
            className="amz-hero-deal-card card-mint"
            onClick={() => navigate('/?search=toothbrush')}
          >
            <div className="amz-deal-header dark-theme">
              <h3 className="amz-deal-price-big dark-text">Under ₹999</h3>
              <p className="amz-deal-subtitle dark-sub">Electric toothbrushes & more</p>
              <div className="amz-deal-pills-row">
                <span className="amz-brand-logo-pill">Oral-B</span>
              </div>
            </div>

            <div className="amz-deal-img-container">
              <img
                src="/amz_deal_toothbrush.jpg"
                alt="Electric toothbrushes & more under ₹999"
                className="amz-deal-hero-img"
              />
            </div>

            <div className="amz-icici-cashback-bar">
              <div className="amz-icici-badge-pill">
                <span className="amz-icici-badge-top">amazon pay</span>
                <span className="amz-icici-badge-sub">ICICI Bank</span>
              </div>
              <span className="amz-icici-text">
                Unlimited <strong>3% cashback*</strong> with Amazon Pay ICICI Bank credit card
              </span>
            </div>
            <div className="amz-deal-tc dark-tc">*T&C apply</div>
          </div>

          {/* Card 4: Win up to ₹300 back - FunZone (Winter Sky Blue) */}
          <div
            className="amz-hero-deal-card card-sky"
            onClick={() => navigate('/?search=deals')}
          >
            <div className="amz-deal-header dark-theme">
              <span className="amz-deal-price-title dark-sub">Win up to</span>
              <h3 className="amz-deal-price-big dark-text">₹300 back</h3>
              <div className="amz-deal-pills-row">
                <span className="amz-funzone-badge">FUN<span className="amz-fun-accent">ZONE</span></span>
              </div>
            </div>

            <div className="amz-deal-img-container">
              <img
                src="/amz_deal_funzone.jpg"
                alt="Win up to ₹300 back FunZone"
                className="amz-deal-hero-img"
              />
            </div>

            <div className="amz-funzone-bottom-bar">
              <span className="amz-funzone-tc">*Terms & conditions apply</span>
              <button
                type="button"
                className="amz-deal-reload-btn dark-reload"
                title="Spin again"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGetProducts();
                }}
              >
                ↻
              </button>
            </div>
          </div>

          {/* Card 5: Under ₹399 Bestselling kurtas (Charcoal Slate) */}
          <div
            className="amz-hero-deal-card card-charcoal"
            onClick={() => navigate('/?search=kurta')}
          >
            <div className="amz-deal-header">
              <h3 className="amz-deal-price-big">Under ₹399</h3>
              <p className="amz-deal-subtitle">Bestselling kurtas</p>
              <div className="amz-deal-pills-row">
                <span className="amz-deal-badge-pill">Top brands</span>
                <span className="amz-deal-badge-pill">Latest trends</span>
              </div>
            </div>

            <div className="amz-deal-img-container">
              <img
                src="/amz_deal_kurtas.jpg"
                alt="Bestselling kurtas under ₹399"
                className="amz-deal-hero-img"
              />
            </div>

            <div className="amz-icici-cashback-bar">
              <div className="amz-icici-badge-pill">
                <span className="amz-icici-badge-top">amazon pay</span>
                <span className="amz-icici-badge-sub">ICICI Bank</span>
              </div>
              <span className="amz-icici-text">
                Unlimited <strong>5% cashback*</strong> with Amazon Pay ICICI Bank credit card
              </span>
            </div>
            <div className="amz-deal-tc">*T&C apply</div>
          </div>

          {/* Card 6: Starting ₹199 Colourful decor (Festive Emerald Green) */}
          <div
            className="amz-hero-deal-card card-green"
            onClick={() => navigate('/?search=decor')}
          >
            <div className="amz-deal-header">
              <h3 className="amz-deal-price-big">Starting ₹199</h3>
              <p className="amz-deal-subtitle">Colourful decor</p>
              <div className="amz-deal-pills-row">
                <span className="amz-deal-badge-pill">Top brands</span>
                <span className="amz-deal-badge-pill">Latest trends</span>
              </div>
            </div>

            <div className="amz-deal-img-container">
              <img
                src="/amz_deal_decor.jpg"
                alt="Colourful festive decor starting ₹199"
                className="amz-deal-hero-img"
              />
            </div>

            <div className="amz-icici-cashback-bar">
              <div className="amz-icici-badge-pill">
                <span className="amz-icici-badge-top">amazon pay</span>
                <span className="amz-icici-badge-sub">ICICI Bank</span>
              </div>
              <span className="amz-icici-text">
                Unlimited <strong>5% cashback*</strong> with Amazon Pay ICICI Bank credit card
              </span>
            </div>
            <div className="amz-deal-tc">*T&C apply</div>
          </div>
        </div>

        {canScrollRight && (
          <button
            type="button"
            className="amz-carousel-arrow amz-carousel-arrow-right"
            onClick={() => scrollCarousel('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </section>

      {/* ============================================================
          4. MAIN CONTENT & REAL PRODUCTS SHOWCASE ROWS
          ============================================================ */}
      <main className="amz-main-content">

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
                        Snitch's <span>Choice</span>
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
          ) : searchQuery ? (
            <div style={{ textAlign: 'center', padding: 'clamp(20px, 4vw, 36px) 16px', width: '100%', boxSizing: 'border-box' }}>
              <div className="amz-notfound-video-wrap">
                <video
                  src={notFoundVideo || '/not_found_video.mp4'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="amz-notfound-video"
                />
                {/* Mask to eliminate any black line artifact on video edges */}
                <div className="amz-video-edge-mask right"></div>
                <div className="amz-video-edge-mask left"></div>
                <div className="amz-video-edge-mask top"></div>
                <div className="amz-video-edge-mask bottom"></div>
              </div>
              <h3 style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: '700', marginTop: '14px', color: '#0f1111', padding: '0 8px' }}>
                Oops! No items found matching "{searchQuery}"
              </h3>
              <p style={{ color: '#565959', fontSize: 'clamp(13px, 3.2vw, 14px)', marginTop: '6px', padding: '0 12px', maxWidth: '420px', margin: '6px auto 0', lineHeight: 1.5 }}>
                Try checking your spelling or search with different keywords.
              </p>
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
              <li><a href="#fulfillment">Fulfilment by Snitch</a></li>
              <li><a href="#advertise">Advertise Your Products</a></li>
            </ul>
          </div>

          <div className="amz-footer-col">
            <h3>Snitch Payment Products</h3>
            <ul>
              <li><a href="#card">Snitch Pay</a></li>
              <li><a href="#credit">Shop with Points</a></li>
              <li><a href="#reload">Reload Your Balance</a></li>
              <li><a href="#currency">Snitch Currency Converter</a></li>
            </ul>
          </div>

          <div className="amz-footer-col">
            <h3>Let Us Help You</h3>
            <ul>
              <li><a href="#covid">Snitch and COVID-19</a></li>
              <li><a href="#account">Your Account</a></li>
              <li><a href="#returns">Returns & Replacements</a></li>
              <li><a href="#help">Help</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with logo and copyright */}
        <div className="amz-footer-bottom">
          <div className="amz-footer-logo-row">
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
            <span className="amz-logo-in-badge">.in</span>
          </div>
          <div className="amz-footer-copy">
            © 2026, Snitch.in, Inc. or its affiliates. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;