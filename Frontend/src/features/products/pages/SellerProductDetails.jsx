import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct.js';
import './SellerProductDetails.css';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const formatPrice = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  const sym = CURRENCY_SYMBOLS[currency] || (currency ? `${currency} ` : '₹');
  return `${sym}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return null;
};

const SellerProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById } = useProduct();
  const user = useSelector((state) => state.auth?.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await handleGetProductById(productId);
        if (isMounted) {
          setProduct(data);
          setActiveImgIndex(0);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load seller product:', err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load the requested product details.';
        setErrorMessage(msg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (productId) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [productId, handleGetProductById]);

  const sellerName =
    user?.fullname || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Seller Store');

  // Loading skeleton state
  if (loading) {
    return (
      <div className="amz-spd-wrapper">
        <header className="amz-spd-header">
          <div className="amz-spd-header-top">
            <Link to="/seller/dashboard" className="amz-spd-brand">
              <span className="amz-spd-logo-text">amazon</span>
              <span className="amz-spd-seller-tag">Seller Central</span>
            </Link>
          </div>
        </header>

        <div className="amz-spd-subheader">
          <div className="amz-spd-skeleton-box" style={{ height: '24px', width: '220px' }} />
        </div>

        <main className="amz-spd-main">
          <div className="amz-spd-card">
            <div className="amz-spd-skeleton-box" style={{ height: '380px', width: '100%' }} />
          </div>
          <div className="amz-spd-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="amz-spd-skeleton-box" style={{ height: '32px', width: '85%' }} />
            <div className="amz-spd-skeleton-box" style={{ height: '20px', width: '45%' }} />
            <div className="amz-spd-skeleton-box" style={{ height: '70px', width: '100%' }} />
            <div className="amz-spd-skeleton-box" style={{ height: '120px', width: '100%' }} />
          </div>
          <div className="amz-spd-card">
            <div className="amz-spd-skeleton-box" style={{ height: '240px', width: '100%' }} />
          </div>
        </main>
      </div>
    );
  }

  // Error or Not Found state
  if (!product || errorMessage) {
    return (
      <div className="amz-spd-wrapper">
        <header className="amz-spd-header">
          <div className="amz-spd-header-top">
            <Link to="/seller/dashboard" className="amz-spd-brand">
              <span className="amz-spd-logo-text">amazon</span>
              <span className="amz-spd-seller-tag">Seller Central</span>
            </Link>
          </div>
        </header>

        <main style={{ maxWidth: '650px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
          <div className="amz-spd-card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Listing Details Not Found
            </h2>
            <p style={{ color: '#565959', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {errorMessage || `We couldn't retrieve the listing information for ID: ${productId}.`}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/seller/dashboard" className="amz-spd-btn-primary">
                Return to Manage Inventory
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const rawImages = Array.isArray(product.images) ? product.images : [];
  const asin = product._id ? `B0${product._id.slice(-8).toUpperCase()}` : 'N/A';
  const sku = product._id ? `SNITCH-${product._id.slice(-6).toUpperCase()}` : 'N/A';
  const currentImgUrl = resolveImageUrl(rawImages[activeImgIndex]) || resolveImageUrl(rawImages[0]);

  return (
    <div className="amz-spd-wrapper">
      {/* 1. Header */}
      <header className="amz-spd-header">
        <div className="amz-spd-header-top">
          <Link to="/seller/dashboard" className="amz-spd-brand" title="Amazon Seller Central">
            <span className="amz-spd-logo-text">amazon</span>
            <span className="amz-spd-seller-tag">Seller Central</span>
          </Link>

          <div style={{ fontSize: '0.82rem', color: '#d5d9d9' }}>
            Seller: <strong style={{ color: '#ffffff' }}>{sellerName}</strong>
          </div>
        </div>

        <nav className="amz-spd-nav">
          <Link to="/seller/dashboard" className="amz-spd-nav-item active">
            Inventory ▾
          </Link>
          <Link to="/create-product" className="amz-spd-nav-item">
            Catalog ▾
          </Link>
          <span className="amz-spd-nav-item">Pricing ▾</span>
          <span className="amz-spd-nav-item">Orders ▾</span>
          <span className="amz-spd-nav-item">Reports ▾</span>
        </nav>
      </header>

      {/* 2. Subheader & Navigation */}
      <section className="amz-spd-subheader">
        <div className="amz-spd-breadcrumb">
          <Link to="/seller/dashboard">Inventory</Link>
          <span>›</span>
          <Link to="/seller/dashboard">Manage Inventory</Link>
          <span>›</span>
          <span>{asin}</span>
        </div>

        <div className="amz-spd-title-row">
          <div className="amz-spd-title-left">
            <button
              type="button"
              className="amz-spd-back-btn"
              onClick={() => navigate('/seller/dashboard')}
            >
              ← Back to Inventory
            </button>
            <span className="amz-spd-status-pill">● Active Listing</span>
          </div>

          <div className="amz-spd-actions-right">
            <Link to="/create-product" className="amz-spd-btn-primary">
              + Add Similar Product
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Main Detail Content */}
      <main className="amz-spd-main">
        {/* Left Column: Image Gallery */}
        <div className="amz-spd-card amz-spd-gallery-card">
          <div className="amz-spd-main-img-box">
            <span className="amz-spd-img-badge">
              {rawImages.length > 0 ? `Photo ${activeImgIndex + 1} of ${rawImages.length}` : 'No Image'}
            </span>
            {currentImgUrl ? (
              <img
                src={currentImgUrl}
                alt={product.title}
                className="amz-spd-main-img"
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#888c8c' }}>
                <div style={{ fontSize: '3rem' }}>📦</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No image available</div>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {rawImages.length > 1 && (
            <div className="amz-spd-thumbs-row">
              {rawImages.map((img, idx) => {
                const url = resolveImageUrl(img);
                return (
                  <img
                    key={idx}
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`amz-spd-thumb ${activeImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImgIndex(idx)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Center Column: Listing Information */}
        <div className="amz-spd-card amz-spd-details-card">
          <div>
            <h1 className="amz-spd-title">{product.title || 'Untitled Product'}</h1>
            <div className="amz-spd-meta-row" style={{ marginTop: '0.5rem' }}>
              <span>ASIN: <strong style={{ color: '#0f1111' }}>{asin}</strong></span>
              <span>•</span>
              <span>SKU: <strong style={{ color: '#0f1111' }}>{sku}</strong></span>
              <span>•</span>
              <span>Condition: <strong>New</strong></span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="amz-spd-price-box">
            <div className="amz-spd-price-label">Your Listing Price</div>
            <div className="amz-spd-price-val">
              {formatPrice(product.price?.amount, product.price?.currency)}
            </div>
            <div className="amz-spd-price-sub">
              ✓ Buy Box Eligible • {product.price?.currency || 'INR'}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="amz-spd-section-title">Product Description</h3>
            <p className="amz-spd-desc-text">
              {product.description || 'No detailed description provided for this catalog listing.'}
            </p>
          </div>

          {/* Catalog Attributes */}
          <div>
            <h3 className="amz-spd-section-title">Listing Specifications</h3>
            <table className="amz-spd-specs-table">
              <tbody>
                <tr>
                  <td>Database ID</td>
                  <td><code>{product._id}</code></td>
                </tr>
                <tr>
                  <td>Currency</td>
                  <td>{product.price?.currency || 'INR'}</td>
                </tr>
                <tr>
                  <td>Media Count</td>
                  <td>{rawImages.length} asset(s) attached</td>
                </tr>
                <tr>
                  <td>Date Created</td>
                  <td>{formatDate(product.createdAt)}</td>
                </tr>
                <tr>
                  <td>Last Updated</td>
                  <td>{formatDate(product.updatedAt)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Listing Health & Actions */}
        <div className="amz-spd-sidebar">
          <div className="amz-spd-card">
            <h3 className="amz-spd-section-title">Listing Health & Status</h3>
            <div className="amz-spd-kpi-item">
              <span className="amz-spd-kpi-label">Listing Status</span>
              <span className="amz-spd-kpi-val" style={{ color: '#137333' }}>● Active</span>
            </div>
            <div className="amz-spd-kpi-item">
              <span className="amz-spd-kpi-label">Buy Box Eligible</span>
              <span className="amz-spd-kpi-val" style={{ color: '#137333' }}>Yes</span>
            </div>
            <div className="amz-spd-kpi-item">
              <span className="amz-spd-kpi-label">Fulfillment</span>
              <span className="amz-spd-kpi-val">Merchant Fulfilled</span>
            </div>
            <div className="amz-spd-kpi-item">
              <span className="amz-spd-kpi-label">Policy Compliance</span>
              <span className="amz-spd-kpi-val" style={{ color: '#137333' }}>100% Healthy</span>
            </div>
          </div>

          <div className="amz-spd-card">
            <h3 className="amz-spd-section-title">Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="button"
                className="amz-spd-btn-primary"
                onClick={() => navigate('/seller/dashboard')}
                style={{ textAlign: 'center' }}
              >
                Manage All Inventory
              </button>
              <Link
                to="/create-product"
                className="amz-spd-back-btn"
                style={{ justifyContent: 'center' }}
              >
                + Add Another Product
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerProductDetails;