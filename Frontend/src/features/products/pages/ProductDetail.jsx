import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById } = useProduct();
  const { user } = useSelector((state) => state.auth);

  // Core product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // User interactions
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [cartSuccessBanner, setCartSuccessBanner] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch product detail on mount or productId change
  useEffect(() => {
    let isMounted = true;
    async function fetchProductDetail() {
      setLoading(true);
      try {
        const detail = await handleGetProductById(productId);
        if (isMounted) {
          setProduct(detail);
          setActiveImgIdx(0);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (productId) {
      fetchProductDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + Number(quantity));
    setCartSuccessBanner(true);
    showToast(`Added ${quantity} item(s) to Cart`);
  };

  const handleBuyNow = () => {
    setIsBuyModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="amz-pdp-root">
        <header className="amz-pdp-nav-main">
          <Link to="/" className="amz-pdp-nav-logo">
            <span className="amz-pdp-logo-text">
              amazon<span>.in</span>
            </span>
          </Link>
          <div className="amz-pdp-nav-search">
            <input
              type="text"
              className="amz-pdp-search-input"
              placeholder="Search Amazon.in"
              disabled
            />
          </div>
        </header>

        <div className="amz-pdp-skeleton-container">
          <div className="amz-pdp-skeleton-box" style={{ height: '420px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="amz-pdp-skeleton-box" style={{ height: '32px', width: '70%' }} />
            <div className="amz-pdp-skeleton-box" style={{ height: '36px', width: '35%' }} />
            <div className="amz-pdp-skeleton-box" style={{ height: '140px', width: '100%' }} />
          </div>
          <div className="amz-pdp-skeleton-box" style={{ height: '320px' }} />
        </div>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!product) {
    return (
      <div className="amz-pdp-root">
        <header className="amz-pdp-nav-main">
          <Link to="/" className="amz-pdp-nav-logo">
            <span className="amz-pdp-logo-text">
              amazon<span>.in</span>
            </span>
          </Link>
        </header>
        <div className="amz-pdp-notfound">
          <h2>Product Not Found</h2>
          <p>We couldn't find a product with ID: {productId}</p>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Real product data extraction
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [{ url: '/amazon_hero_banner.jpg', _id: 'fallback_img' }];

  const currentImg = images[activeImgIdx]?.url || images[0]?.url;
  const unitPrice = Number(product.price?.amount || 0);
  const formattedPrice = unitPrice.toLocaleString('en-IN');
  const currency = product.price?.currency || 'INR';

  // Format dates
  const createdDate = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const updatedDate = product.updatedAt
    ? new Date(product.updatedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="amz-pdp-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#067d62',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ============================================================
          1. AMAZON TOP NAVIGATION
          ============================================================ */}
      <header className="amz-pdp-nav-main">
        <Link to="/" className="amz-pdp-nav-logo" title="Amazon Home">
          <span className="amz-pdp-logo-text">
            amazon<span>.in</span>
          </span>
        </Link>

        <div className="amz-pdp-nav-delivery" title="Deliver to India">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="amz-pdp-nav-delivery-text">
            <span className="amz-pdp-subtext">Deliver to</span>
            <span className="amz-pdp-maintext">India</span>
          </div>
        </div>

        <form className="amz-pdp-nav-search" onSubmit={handleSearchSubmit}>
          <select className="amz-pdp-search-dropdown" defaultValue="All">
            <option value="All">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
          </select>
          <input
            type="text"
            className="amz-pdp-search-input"
            placeholder="Search Amazon.in"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="amz-pdp-search-btn" title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <Link to={user ? '/' : '/login'} className="amz-pdp-nav-item">
          <span className="amz-pdp-subtext">
            Hello, {user?.fullname ? user.fullname.split(' ')[0] : 'sign in'}
          </span>
          <span className="amz-pdp-maintext">Account & Lists ▾</span>
        </Link>

        <Link to="/" className="amz-pdp-nav-item">
          <span className="amz-pdp-subtext">Returns</span>
          <span className="amz-pdp-maintext">& Orders</span>
        </Link>

        <div className="amz-pdp-cart-item" onClick={() => showToast(`Cart has ${cartCount} item(s)`)}>
          <span className="amz-pdp-cart-badge">{cartCount}</span>
          <svg width="34" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="amz-pdp-maintext" style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
            Cart
          </span>
        </div>
      </header>

      {/* Subnav */}
      <nav className="amz-pdp-nav-sub">
        <div className="amz-pdp-sub-links">
          <Link to="/" className="amz-pdp-sub-link">
            <span>☰</span> All
          </Link>
          <Link to="/" className="amz-pdp-sub-link">All Products</Link>
          <Link to="/" className="amz-pdp-sub-link">Customer Service</Link>
          {user?.role?.toLowerCase() === 'seller' && (
            <Link to="/dashboard" className="amz-pdp-sub-link" style={{ color: '#febd69' }}>
              Seller Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <div className="amz-pdp-top-bar">
        <div className="amz-pdp-breadcrumbs">
          <Link to="/" className="amz-pdp-back-btn">
            ‹ Back to results
          </Link>
          <span>|</span>
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/">Products</Link>
          <span>›</span>
          <span>{product.title}</span>
        </div>
      </div>

      {/* Cart Success Banner */}
      {cartSuccessBanner && (
        <div className="amz-pdp-cart-success-banner">
          <div className="amz-pdp-cart-success-left">
            <div className="amz-pdp-cart-success-icon">✓</div>
            <div>
              <div className="amz-pdp-cart-success-title">Added to Cart</div>
              <div style={{ fontSize: '13px', color: '#333' }}>
                Cart subtotal ({cartCount} item{cartCount > 1 ? 's' : ''}):{' '}
                <strong style={{ color: '#0f1111' }}>
                  ₹{(unitPrice * cartCount).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>
          <div className="amz-pdp-cart-success-right">
            <button
              type="button"
              className="amz-pdp-banner-btn amz-pdp-banner-btn-cart"
              onClick={() => showToast(`Shopping cart contains ${cartCount} items`)}
            >
              View Cart
            </button>
            <button
              type="button"
              className="amz-pdp-banner-btn amz-pdp-banner-btn-checkout"
              onClick={handleBuyNow}
            >
              Proceed to Buy ({cartCount} items)
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          2. MAIN 3-COLUMN PRODUCT DETAIL CONTENT (TRUE DATA ONLY)
          ============================================================ */}
      <main className="amz-pdp-main-content">
        {/* COLUMN 1: IMAGE GALLERY */}
        <section className="amz-pdp-col-gallery">
          {images.length > 1 && (
            <div className="amz-pdp-thumbnails-list">
              {images.map((imgObj, idx) => (
                <div
                  key={imgObj._id || idx}
                  className={`amz-pdp-thumb-item ${activeImgIdx === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveImgIdx(idx)}
                  onClick={() => setActiveImgIdx(idx)}
                  title={`View image ${idx + 1}`}
                >
                  <img src={imgObj.url} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}

          <div className="amz-pdp-main-stage">
            <div
              className="amz-pdp-main-img-wrapper"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={currentImg}
                alt={product.title}
                className={`amz-pdp-main-img ${isZoomed ? 'zoomed' : ''}`}
              />
            </div>

            <div className="amz-pdp-zoom-caption">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Roll over image to zoom in</span>
            </div>
          </div>
        </section>

        {/* COLUMN 2: TRUE PRODUCT DETAILS */}
        <section className="amz-pdp-col-details">
          {/* Title */}
          <h1 className="amz-pdp-title">{product.title}</h1>

          <hr className="amz-pdp-divider" />

          {/* Real Price Display */}
          <div className="amz-pdp-price-box">
            <div className="amz-pdp-price-row">
              <div className="amz-pdp-current-price">
                <span className="amz-pdp-currency-symbol">₹</span>
                <span>{formattedPrice}</span>
                <span className="amz-pdp-fraction">00</span>
              </div>
              <span className="amz-pdp-currency-tag">({currency})</span>
            </div>
            <div className="amz-pdp-taxes-note">Inclusive of all taxes</div>
          </div>

          <hr className="amz-pdp-divider" />

          {/* Real Product Specifications */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px 0', color: '#0f1111' }}>
              Product Details
            </h3>
            <table className="amz-pdp-specs-table">
              <tbody>
                <tr>
                  <td className="amz-pdp-spec-label">Product Name</td>
                  <td className="amz-pdp-spec-value">{product.title}</td>
                </tr>
                <tr>
                  <td className="amz-pdp-spec-label">Product ID</td>
                  <td className="amz-pdp-spec-value" style={{ fontFamily: 'monospace' }}>
                    {product._id}
                  </td>
                </tr>
                {product.seller && (
                  <tr>
                    <td className="amz-pdp-spec-label">Seller ID</td>
                    <td className="amz-pdp-spec-value" style={{ fontFamily: 'monospace' }}>
                      {typeof product.seller === 'object'
                        ? (product.seller.fullname || product.seller.email || product.seller._id)
                        : product.seller}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="amz-pdp-spec-label">Currency</td>
                  <td className="amz-pdp-spec-value">{currency}</td>
                </tr>
                {createdDate && (
                  <tr>
                    <td className="amz-pdp-spec-label">Date Added</td>
                    <td className="amz-pdp-spec-value">{createdDate}</td>
                  </tr>
                )}
                {updatedDate && (
                  <tr>
                    <td className="amz-pdp-spec-label">Last Updated</td>
                    <td className="amz-pdp-spec-value">{updatedDate}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <hr className="amz-pdp-divider" />

          {/* Real Product Description */}
          <div className="amz-pdp-about-section">
            <h3>About this item</h3>
            {product.description ? (
              <p className="amz-pdp-true-description">
                {product.description}
              </p>
            ) : (
              <p style={{ color: '#565959', fontStyle: 'italic' }}>
                No description provided for this product.
              </p>
            )}
          </div>
        </section>

        {/* COLUMN 3: BUY BOX */}
        <aside className="amz-pdp-col-buybox">
          <div className="amz-pdp-buybox-price">
            <span style={{ fontSize: '16px', position: 'relative', top: '-7px', marginRight: '2px' }}>₹</span>
            <span>{formattedPrice}</span>
            <span style={{ fontSize: '14px', position: 'relative', top: '-7px', marginLeft: '2px' }}>00</span>
          </div>

          {/* Quantity Selector */}
          <div className="amz-pdp-qty-row">
            <label htmlFor="qty-select">Quantity:</label>
            <select
              id="qty-select"
              className="amz-pdp-qty-select"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '13px', color: '#565959' }}>
            Subtotal: <strong>₹{(unitPrice * quantity).toLocaleString('en-IN')}</strong>
          </div>

          {/* ADD TO CART & BUY NOW BUTTONS */}
          <button
            type="button"
            className="amz-pdp-btn-add-cart"
            onClick={handleAddToCart}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to Cart
          </button>

          <button
            type="button"
            className="amz-pdp-btn-buy-now"
            onClick={handleBuyNow}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Buy Now
          </button>

          {/* True Seller Info */}
          {product.seller && (
            <div className="amz-pdp-buybox-meta">
              <span className="amz-pdp-buybox-meta-label">Seller</span>
              <span className="amz-pdp-buybox-meta-val" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {typeof product.seller === 'object'
                  ? (product.seller.fullname || product.seller.email || product.seller._id)
                  : product.seller}
              </span>
            </div>
          )}
        </aside>
      </main>

      {/* ============================================================
          3. BUY NOW QUICK CHECKOUT MODAL (TRUE DETAILS)
          ============================================================ */}
      {isBuyModalOpen && (
        <div className="amz-pdp-modal-overlay" onClick={() => setIsBuyModalOpen(false)}>
          <div className="amz-pdp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="amz-pdp-modal-header">
              <h3>Order Summary</h3>
              <button
                type="button"
                className="amz-pdp-modal-close"
                onClick={() => setIsBuyModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="amz-pdp-modal-body">
              <div className="amz-pdp-checkout-item">
                <img
                  src={currentImg}
                  alt={product.title}
                  className="amz-pdp-checkout-thumb"
                />
                <div className="amz-pdp-checkout-info">
                  <h4>{product.title}</h4>
                  <div style={{ fontSize: '13px', color: '#565959', marginBottom: '4px' }}>
                    Quantity: {quantity}
                  </div>
                  <div className="amz-pdp-checkout-price">
                    ₹{(unitPrice * quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="amz-pdp-checkout-summary">
                <div className="amz-pdp-summary-row">
                  <span>Unit Price:</span>
                  <span>₹{formattedPrice}</span>
                </div>
                <div className="amz-pdp-summary-row">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="amz-pdp-summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{(unitPrice * quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="amz-pdp-modal-footer">
              <button
                type="button"
                className="amz-pdp-btn-cancel"
                onClick={() => setIsBuyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="amz-pdp-btn-confirm-order"
                onClick={() => {
                  setIsBuyModalOpen(false);
                  showToast('🎉 Order placed successfully!');
                }}
              >
                Place Your Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;