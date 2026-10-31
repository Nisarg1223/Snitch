import { useEffect, useState, useRef } from 'react';
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

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (Indian Rupee)' },
  { code: 'USD', symbol: '$', label: 'USD (US Dollar)' },
  { code: 'EUR', symbol: '€', label: 'EUR (Euro)' },
  { code: 'GBP', symbol: '£', label: 'GBP (British Pound)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (Japanese Yen)' },
];

const COMMON_ATTRIBUTES = ['Color', 'Size', 'Style', 'Material', 'Storage', 'RAM'];

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

const extractVariantAttributes = (attrs) => {
  if (!attrs) return [];
  if (attrs instanceof Map) return Array.from(attrs.entries());
  if (typeof attrs === 'object') return Object.entries(attrs);
  return [];
};

const SellerProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleAddProductVariant } = useProduct();
  const user = useSelector((state) => state.auth?.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedVariantPreviewUrl, setSelectedVariantPreviewUrl] = useState(null);

  // Variant Modal & Notifications
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal Form State
  const [variantPrice, setVariantPrice] = useState('');
  const [variantCurrency, setVariantCurrency] = useState('INR');
  const [variantStock, setVariantStock] = useState('10');
  const [variantAttributes, setVariantAttributes] = useState([{ key: 'Color', value: '' }]);
  const [variantImages, setVariantImages] = useState([]); // array of { url: string }
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [modalError, setModalError] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
          setSelectedVariantPreviewUrl(null);
          if (data?.price) {
            setVariantPrice(data.price.amount || '');
            setVariantCurrency(data.price.currency || 'INR');
          }
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

  // Open modal with prefilled price/currency
  const handleOpenAddVariantModal = () => {
    setVariantPrice(product?.price?.amount || '');
    setVariantCurrency(product?.price?.currency || 'INR');
    setVariantStock('10');
    setVariantAttributes([{ key: 'Color', value: '' }]);
    setVariantImages([]);
    setImageUrlInput('');
    setModalError('');
    setIsAddVariantModalOpen(true);
  };

  // Dynamic attribute row handlers
  const handleAddAttributeRow = (key = '', value = '') => {
    setVariantAttributes((prev) => [...prev, { key, value }]);
  };

  const handleRemoveAttributeRow = (index) => {
    setVariantAttributes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAttributeChange = (index, field, value) => {
    setVariantAttributes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Image handlers
  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (variantImages.length >= 7) {
      setModalError('Maximum 7 images allowed per variant.');
      return;
    }
    setVariantImages((prev) => [...prev, { url: trimmed }]);
    setImageUrlInput('');
    setModalError('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 7 - variantImages.length;
    if (remaining <= 0) {
      setModalError('Maximum 7 images allowed per variant.');
      return;
    }

    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setVariantImages((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveVariantImage = (index) => {
    setVariantImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCopyParentImages = () => {
    if (!product?.images || product.images.length === 0) return;
    const parentImages = product.images.map((img) => ({
      url: resolveImageUrl(img),
    })).filter((img) => img.url);

    setVariantImages((prev) => {
      const existingUrls = new Set(prev.map((i) => i.url));
      const filtered = parentImages.filter((p) => !existingUrls.has(p.url));
      return [...prev, ...filtered].slice(0, 7);
    });
  };

  // Save new variant
  const handleSaveVariant = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!variantPrice || Number(variantPrice) <= 0) {
      setModalError('Price amount must be greater than 0.');
      return;
    }

    // Convert attributes array to object map
    const attributesMap = {};
    let validAttrs = 0;
    variantAttributes.forEach(({ key, value }) => {
      const k = key.trim();
      const v = value.trim();
      if (k && v) {
        attributesMap[k] = v;
        validAttrs++;
      }
    });

    if (validAttrs === 0) {
      setModalError('Please define at least one attribute (e.g., Color: Red or Size: L).');
      return;
    }

    try {
      setIsSubmittingVariant(true);

      const formData = new FormData();
      formData.append('priceAmount', variantPrice);
      formData.append('priceCurrency', variantCurrency);
      formData.append('stock', variantStock || 0);
      formData.append('attributes', JSON.stringify(attributesMap));

      // Separate file uploads from existing URLs
      const existingUrls = [];
      variantImages.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        } else if (img.url && !img.url.startsWith('blob:')) {
          existingUrls.push(img.url);
        }
      });

      // Images fallback to parent if none provided
      if (existingUrls.length === 0 && (!variantImages || variantImages.length === 0) && product?.images && product.images.length > 0) {
        product.images.forEach((img) => {
          const u = resolveImageUrl(img);
          if (u) existingUrls.push(u);
        });
      }

      if (existingUrls.length > 0) {
        formData.append('existingImages', JSON.stringify(existingUrls));
      }

      const res = await handleAddProductVariant(productId, formData);

      if (res?.product) {
        setProduct(res.product);
      } else if (res?.variant) {
        setProduct((prev) => ({
          ...prev,
          varients: [...(prev?.varients || prev?.variants || []), res.variant],
        }));
      }

      setIsAddVariantModalOpen(false);
      showToast('✓ Variant added successfully to listing!');
    } catch (err) {
      console.error('Failed to add variant:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add variant to listing.';
      setModalError(msg);
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  // Delete variant from local listing
  const handleDeleteVariant = (variantId) => {
    if (!window.confirm('Are you sure you want to remove this variant?')) return;

    setProduct((prev) => {
      const currentList = prev?.varients || prev?.variants || [];
      return {
        ...prev,
        varients: currentList.filter((v) => v._id !== variantId),
      };
    });
    showToast('✓ Variant removed.');
  };

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
  const currentImgUrl =
    selectedVariantPreviewUrl ||
    resolveImageUrl(rawImages[activeImgIndex]) ||
    resolveImageUrl(rawImages[0]);

  // Support both 'varients' (schema name) and 'variants'
  const variantsList = Array.isArray(product.varients)
    ? product.varients
    : Array.isArray(product.variants)
      ? product.variants
      : [];

  const activeCurrencyObj = CURRENCIES.find((c) => c.code === variantCurrency) || CURRENCIES[0];
  const firstPreviewImg =
    variantImages[0]?.url ||
    resolveImageUrl(product?.images?.[0]) ||
    null;

  return (
    <div className="amz-spd-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="amz-spd-toast">
          <span>{toastMessage}</span>
        </div>
      )}

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
            <button
              type="button"
              className="amz-spd-btn-accent"
              onClick={handleOpenAddVariantModal}
            >
              + Add Variant
            </button>
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
              {selectedVariantPreviewUrl
                ? 'Variant Photo'
                : rawImages.length > 0
                  ? `Photo ${activeImgIndex + 1} of ${rawImages.length}`
                  : 'No Image'}
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

          {/* Reset button if viewing variant photo */}
          {selectedVariantPreviewUrl && (
            <button
              type="button"
              className="amz-spd-back-btn"
              onClick={() => setSelectedVariantPreviewUrl(null)}
              style={{ justifyContent: 'center', fontSize: '0.78rem' }}
            >
              ↺ Reset to Main Product Photos
            </button>
          )}

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
                    className={`amz-spd-thumb ${
                      !selectedVariantPreviewUrl && activeImgIndex === idx ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedVariantPreviewUrl(null);
                      setActiveImgIndex(idx);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Center Column: Listing Information & Variations */}
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

          {/* ==============================================================
              PRODUCT VARIATIONS & VARIANTS SECTION
              ============================================================== */}
          <div className="amz-spd-variants-card">
            <div className="amz-spd-variants-header">
              <div className="amz-spd-variants-header-left">
                <h3 className="amz-spd-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                  Product Variations & Options
                </h3>
                <span className="amz-spd-variants-count-badge">
                  {variantsList.length} {variantsList.length === 1 ? 'Variant' : 'Variants'}
                </span>
              </div>

              <button
                type="button"
                className="amz-spd-btn-accent"
                onClick={handleOpenAddVariantModal}
              >
                + Add Variant
              </button>
            </div>

            {/* Empty State */}
            {variantsList.length === 0 ? (
              <div className="amz-spd-variants-empty">
                <div className="amz-spd-variants-empty-icon">🎨</div>
                <h4 className="amz-spd-variants-empty-title">No Variants Configured Yet</h4>
                <p className="amz-spd-variants-empty-desc">
                  Provide customer choice by adding variations such as different sizes, colors, styles, materials, or specifications under this single listing.
                </p>
                <button
                  type="button"
                  className="amz-spd-btn-accent"
                  onClick={handleOpenAddVariantModal}
                  style={{ marginTop: '0.4rem' }}
                >
                  + Add First Variant
                </button>
              </div>
            ) : (
              /* Variants List */
              <div className="amz-spd-variants-list">
                {variantsList.map((variant, vIdx) => {
                  const variantAttrs = extractVariantAttributes(variant.attributes);
                  const variantPriceVal = variant.price?.amount ?? product.price?.amount;
                  const variantCurr = variant.price?.currency || product.price?.currency || 'INR';
                  const variantStockVal = Number(variant.stock) || 0;
                  const variantImg = resolveImageUrl(variant.images?.[0]) || currentImgUrl;

                  return (
                    <div key={variant._id || vIdx} className="amz-spd-variant-card">
                      <div className="amz-spd-variant-left">
                        {/* Thumbnail */}
                        <div
                          className="amz-spd-variant-thumb-box"
                          title="Click to preview this variant in main gallery"
                          onClick={() => {
                            if (variantImg) setSelectedVariantPreviewUrl(variantImg);
                          }}
                        >
                          <img src={variantImg} alt={`Variant ${vIdx + 1}`} />
                        </div>

                        {/* Attribute pills & metadata */}
                        <div className="amz-spd-variant-info">
                          <div className="amz-spd-variant-attrs-wrap">
                            {variantAttrs.length > 0 ? (
                              variantAttrs.map(([key, val], aIdx) => (
                                <span key={aIdx} className="amz-spd-variant-attr-badge">
                                  <strong>{key}:</strong> {val}
                                </span>
                              ))
                            ) : (
                              <span className="amz-spd-variant-attr-badge">Default Variation</span>
                            )}
                          </div>
                          <div className="amz-spd-variant-meta">
                            Variant #{vIdx + 1} • {variant.images?.length || 0} photo(s)
                            {variant._id && <span> • ID: <code>{String(variant._id).slice(-6)}</code></span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing, Stock & Actions */}
                      <div className="amz-spd-variant-right">
                        <div className="amz-spd-variant-price-box">
                          <div className="amz-spd-variant-price-val">
                            {formatPrice(variantPriceVal, variantCurr)}
                          </div>
                          <div
                            className={`amz-spd-variant-stock-pill ${
                              variantStockVal > 0 ? 'in-stock' : 'out-stock'
                            }`}
                          >
                            {variantStockVal > 0 ? `✓ ${variantStockVal} In Stock` : 'Out of Stock'}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="amz-spd-variant-delete-btn"
                          title="Delete this variant"
                          onClick={() => handleDeleteVariant(variant._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
              <span className="amz-spd-kpi-label">Variations</span>
              <span className="amz-spd-kpi-val" style={{ color: variantsList.length > 0 ? '#137333' : '#565959' }}>
                {variantsList.length} Active
              </span>
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
                className="amz-spd-btn-accent"
                onClick={handleOpenAddVariantModal}
                style={{ justifyContent: 'center' }}
              >
                + Add Product Variant
              </button>
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

      {/* ==============================================================
          ADD VARIANT MODAL UI (MATCHING MONGOOSE MODEL)
          ============================================================== */}
      {isAddVariantModalOpen && (
        <div className="amz-spd-modal-overlay" onClick={() => setIsAddVariantModalOpen(false)}>
          <div className="amz-spd-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="amz-spd-modal-header">
              <div>
                <span className="amz-spd-modal-badge">Seller Central Variation Tool</span>
                <h2 className="amz-spd-modal-title">Add Product Variant</h2>
                <div style={{ fontSize: '0.8rem', color: '#d5d9d9', marginTop: '0.2rem' }}>
                  Parent: <strong>{product.title}</strong>
                </div>
              </div>
              <button
                type="button"
                className="amz-spd-modal-close"
                onClick={() => setIsAddVariantModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div style={{ backgroundColor: '#fff0f0', borderLeft: '4px solid #b12704', padding: '0.75rem 1.5rem', color: '#b12704', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {modalError}
              </div>
            )}

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveVariant} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="amz-spd-modal-body">
                {/* 1. Attributes Section */}
                <div className="amz-spd-modal-section">
                  <h4 className="amz-spd-modal-section-title">1. Variation Attributes (Key / Value)</h4>
                  <p className="amz-spd-modal-section-sub">
                    Define the unique options distinguishing this variation (e.g., Color = Navy Blue, Size = XL).
                  </p>

                  {/* Suggestion Chips */}
                  <div className="amz-spd-chips-row">
                    <span className="amz-spd-chips-label">Quick Suggestions:</span>
                    {COMMON_ATTRIBUTES.map((attr) => (
                      <button
                        key={attr}
                        type="button"
                        className="amz-spd-chip"
                        onClick={() => {
                          const emptyIdx = variantAttributes.findIndex((a) => !a.key.trim() && !a.value.trim());
                          if (emptyIdx >= 0) {
                            handleAttributeChange(emptyIdx, 'key', attr);
                          } else {
                            handleAddAttributeRow(attr, '');
                          }
                        }}
                      >
                        + {attr}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Attribute Rows */}
                  {variantAttributes.map((attr, idx) => (
                    <div key={idx} className="amz-spd-attr-row">
                      <div className="amz-spd-field">
                        <label className="amz-spd-field-label">Attribute Name</label>
                        <input
                          type="text"
                          className="amz-spd-input"
                          placeholder="e.g. Color, Size, Material"
                          value={attr.key}
                          onChange={(e) => handleAttributeChange(idx, 'key', e.target.value)}
                          required
                        />
                      </div>
                      <div className="amz-spd-field" style={{ flex: 1.5 }}>
                        <label className="amz-spd-field-label">Attribute Value</label>
                        <input
                          type="text"
                          className="amz-spd-input"
                          placeholder="e.g. Matte Black, XL, Cotton"
                          value={attr.value}
                          onChange={(e) => handleAttributeChange(idx, 'value', e.target.value)}
                          required
                        />
                      </div>
                      {variantAttributes.length > 1 && (
                        <button
                          type="button"
                          className="amz-spd-row-trash"
                          onClick={() => handleRemoveAttributeRow(idx)}
                          title="Remove attribute row"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="amz-spd-btn-ghost"
                    onClick={() => handleAddAttributeRow('', '')}
                  >
                    + Add Another Attribute
                  </button>
                </div>

                {/* 2. Pricing & Stock Section */}
                <div className="amz-spd-modal-section">
                  <h4 className="amz-spd-modal-section-title">2. Price & Inventory</h4>
                  <p className="amz-spd-modal-section-sub">
                    Configure the exact price and fulfillment stock quantity for this variant.
                  </p>

                  <div className="amz-spd-grid-2">
                    <div className="amz-spd-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="amz-spd-field-label">
                          Variant Price <span className="req">*</span>
                        </label>
                        {product?.price?.amount && (
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: '#007185', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => {
                              setVariantPrice(product.price.amount);
                              setVariantCurrency(product.price.currency || 'INR');
                            }}
                          >
                            Copy base price ({product.price.currency} {product.price.amount})
                          </button>
                        )}
                      </div>
                      <div className="amz-spd-price-wrap">
                        <span className="amz-spd-price-sym">{activeCurrencyObj.symbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          className="amz-spd-input amz-spd-price-input"
                          placeholder="0.00"
                          value={variantPrice}
                          onChange={(e) => setVariantPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="amz-spd-field">
                      <label className="amz-spd-field-label">Currency</label>
                      <select
                        className="amz-spd-select"
                        value={variantCurrency}
                        onChange={(e) => setVariantCurrency(e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="amz-spd-grid-2" style={{ marginTop: '0.85rem' }}>
                    <div className="amz-spd-field">
                      <label className="amz-spd-field-label">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        className="amz-spd-input"
                        placeholder="e.g. 10"
                        value={variantStock}
                        onChange={(e) => setVariantStock(e.target.value)}
                      />
                    </div>
                    <div className="amz-spd-field">
                      <label className="amz-spd-field-label">Inventory Status</label>
                      <input
                        type="text"
                        className="amz-spd-input"
                        value={Number(variantStock) > 0 ? `In Stock (${variantStock} units)` : 'Out of Stock'}
                        disabled
                        style={{ backgroundColor: '#f0f2f2', color: Number(variantStock) > 0 ? '#137333' : '#b12704', fontWeight: 600 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Images Section */}
                <div className="amz-spd-modal-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 className="amz-spd-modal-section-title">3. Variant Images (Up to 7)</h4>
                      <p className="amz-spd-modal-section-sub" style={{ margin: 0 }}>
                        Provide photos representing this variation.
                      </p>
                    </div>
                    {product?.images && product.images.length > 0 && (
                      <button
                        type="button"
                        className="amz-spd-chip"
                        onClick={handleCopyParentImages}
                        title="Copy images from base product"
                      >
                        Copy Base Photos
                      </button>
                    )}
                  </div>

                  <div className="amz-spd-img-input-row">
                    <input
                      type="url"
                      className="amz-spd-input"
                      placeholder="Paste image URL (e.g. https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="amz-spd-back-btn"
                      onClick={handleAddImageUrl}
                    >
                      Add URL
                    </button>
                    <button
                      type="button"
                      className="amz-spd-back-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse File
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Previews Grid */}
                  {variantImages.length > 0 && (
                    <div className="amz-spd-previews-grid">
                      {variantImages.map((img, idx) => (
                        <div key={idx} className="amz-spd-preview-item">
                          <img src={img.url} alt={`Variant preview ${idx + 1}`} />
                          <button
                            type="button"
                            className="amz-spd-preview-remove"
                            onClick={() => handleRemoveVariantImage(idx)}
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Live Preview */}
                <div className="amz-spd-live-preview">
                  <div className="amz-spd-live-thumb">
                    {firstPreviewImg ? (
                      <img src={firstPreviewImg} alt="Preview" />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>📦</span>
                    )}
                  </div>
                  <div className="amz-spd-live-info">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#007185', textTransform: 'uppercase' }}>
                      Live Variation Preview
                    </div>
                    <div className="amz-spd-live-attrs">
                      {variantAttributes.filter((a) => a.key.trim() && a.value.trim()).length > 0 ? (
                        variantAttributes
                          .filter((a) => a.key.trim() && a.value.trim())
                          .map((a, i) => (
                            <span key={i} className="amz-spd-variant-attr-badge">
                              <strong>{a.key}:</strong> {a.value}
                            </span>
                          ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#888c8c', fontStyle: 'italic' }}>
                          Add attribute key/value pairs above
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b12704' }}>
                        {activeCurrencyObj.symbol}
                        {Number(variantPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: Number(variantStock) > 0 ? '#137333' : '#b12704', fontWeight: 700 }}>
                        {Number(variantStock) > 0 ? `✓ ${variantStock} In Stock` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="amz-spd-modal-footer">
                <button
                  type="button"
                  className="amz-spd-btn-cancel"
                  onClick={() => setIsAddVariantModalOpen(false)}
                  disabled={isSubmittingVariant}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="amz-spd-btn-accent"
                  style={{ padding: '0.55rem 1.5rem', opacity: isSubmittingVariant ? 0.7 : 1 }}
                  disabled={isSubmittingVariant}
                >
                  {isSubmittingVariant ? 'Adding Variant...' : '+ Add Variant to Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductDetails;