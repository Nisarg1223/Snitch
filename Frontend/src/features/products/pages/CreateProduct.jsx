import { useState, useRef } from 'react';
import { useProduct } from '../hooks/useProduct.js';
import { Link, useNavigate } from 'react-router-dom';
import './CreateProduct.css';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
];

const DEFAULT_SLOTS = [
  { id: 1, label: 'MAIN Image (Search view)', tag: 'MAIN', isMain: true, file: null, previewUrl: null },
  { id: 2, label: 'Image 2 (Angle / Detail)', tag: 'IMG 2', isMain: false, file: null, previewUrl: null },
  { id: 3, label: 'Image 3 (Angle / Detail)', tag: 'IMG 3', isMain: false, file: null, previewUrl: null },
  { id: 4, label: 'Image 4 (Angle / Detail)', tag: 'IMG 4', isMain: false, file: null, previewUrl: null },
  { id: 5, label: 'Image 5 (Angle / Detail)', tag: 'IMG 5', isMain: false, file: null, previewUrl: null },
  { id: 6, label: 'Image 6 (Angle / Detail)', tag: 'IMG 6', isMain: false, file: null, previewUrl: null },
  { id: 7, label: 'Image 7 (Angle / Detail)', tag: 'IMG 7', isMain: false, file: null, previewUrl: null },
];

const CreateProduct = () => {
  // Connect hook
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [activeSlotId, setActiveSlotId] = useState(null);

  // Active step tab & preview visibility
  const [activeTab, setActiveTab] = useState('vital');
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Submission & Response state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [createdProductData, setCreatedProductData] = useState(null);

  // 2-way binding states for the exact 4 fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');

  // Images state (up to 7 images)
  const [imageSlots, setImageSlots] = useState(DEFAULT_SLOTS);
  const [selectedPreviewImageIndex, setSelectedPreviewImageIndex] = useState(0);

  // Image Upload Handlers
  const handleSlotClick = (slotId) => {
    setActiveSlotId(slotId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeSlotId) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);

    setImageSlots((prev) =>
      prev.map((slot) =>
        slot.id === activeSlotId ? { ...slot, file, previewUrl } : slot
      )
    );
  };

  const handleRemoveImage = (e, slotId) => {
    e.stopPropagation();
    setImageSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, file: null, previewUrl: null } : slot
      )
    );
  };

  // Calculate Progress Score
  const calculateQuality = () => {
    let score = 0;
    if (title && title.trim().length > 0) score += 25;
    if (priceAmount && Number(priceAmount) > 0) score += 25;
    if (description && description.trim().length > 0) score += 25;
    const uploadedImagesCount = imageSlots.filter((s) => s.file !== null).length;
    if (uploadedImagesCount >= 1) score += 25;
    return score;
  };

  const qualityScore = calculateQuality();
  const currentSymbol = CURRENCIES.find((c) => c.code === priceCurrency)?.symbol || '₹';

  // Get uploaded images for preview
  const uploadedPreviews = imageSlots
    .filter((s) => s.previewUrl !== null)
    .map((s) => s.previewUrl);

  const displayMainPreviewImg =
    uploadedPreviews.length > 0
      ? uploadedPreviews[selectedPreviewImageIndex] || uploadedPreviews[0]
      : null;

  // Validation
  const isFormValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    priceAmount &&
    Number(priceAmount) > 0 &&
    priceCurrency.trim().length > 0;

  // Form submission: calls handleCreateProduct from useProduct
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      setApiError('Title is required.');
      setActiveTab('vital');
      return;
    }
    if (!priceAmount || Number(priceAmount) <= 0) {
      setApiError('Valid price amount is required.');
      setActiveTab('offer');
      return;
    }
    if (!description.trim()) {
      setApiError('Description is required.');
      setActiveTab('description');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('priceAmount', String(priceAmount).trim());
      formData.append('priceCurrency', priceCurrency);

      // Append up to 7 images
      const filesToUpload = imageSlots.filter((slot) => slot.file instanceof File);
      filesToUpload.forEach((slot) => {
        formData.append('images', slot.file);
      });

      // Execute hook function
      const product = await handleCreateProduct(formData);

      setCreatedProductData({
        title: title.trim(),
        price: `${currentSymbol}${priceAmount}`,
        currency: priceCurrency,
        imagesCount: filesToUpload.length,
        product,
      });
    } catch (err) {
      console.error('Failed to create product:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to create product listing. Please check your credentials and try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setPriceAmount('');
    setPriceCurrency('INR');
    setImageSlots(DEFAULT_SLOTS);
    setCreatedProductData(null);
    setApiError('');
    setActiveTab('vital');
  };

  return (
    <div className="amz-seller-wrapper">
      {/* Hidden File Input for Image Slots */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {/* ==========================================================================
          1. TOP AMAZON SELLER CENTRAL HEADER
          ========================================================================== */}
      <header className="amz-header">
        <div className="amz-header-top">
          {/* Logo & Seller Central Brand */}
          <Link to="/" className="amz-header-brand">
            <div className="amz-logo-combo">
              <span className="amz-logo-text">amazon</span>
              <span className="amz-logo-smile">⌣</span>
            </div>
            <span className="amz-seller-tag">Seller Central</span>
          </Link>

          {/* Marketplace Indicator */}
          <div className="amz-market-picker">
            <span>🇮🇳</span>
            <span className="amz-market-name-full">Amazon.in (India)</span>
            <span className="amz-market-name-short">IN</span>
            <span style={{ fontSize: '0.65rem' }}>▼</span>
          </div>

          {/* Search Header */}
          <div className="amz-header-search">
            <input
              type="text"
              placeholder="Search catalog, ASIN, SKU..."
            />
            <span className="amz-header-search-icon">🔍</span>
          </div>

          {/* Merchant Profile & Utilities */}
          <div className="amz-header-actions">
            <div className="amz-merchant-badge">
              <span className="amz-status-dot"></span>
              <span className="amz-merchant-name-full">Seller Store</span>
              <span className="amz-merchant-name-short">Seller</span>
            </div>
            <button className="amz-header-icon-btn amz-hide-mobile" title="Messages">
              <span>✉</span>
            </button>
            <button className="amz-header-icon-btn" title="Help">
              <span>❓</span>
            </button>
            <button className="amz-header-icon-btn amz-hide-mobile" title="Settings">
              <span>⚙</span>
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation */}
        <nav className="amz-header-nav">
          <span className="amz-nav-item active">Catalog ▾</span>
          <Link to="/seller/dashboard" className="amz-nav-item" style={{ textDecoration: 'none', color: '#ffffff' }}>Inventory ▾</Link>
          <span className="amz-nav-item">Pricing ▾</span>
          <span className="amz-nav-item">Orders ▾</span>
          <span className="amz-nav-item">Advertising ▾</span>
          <span className="amz-nav-item">Reports ▾</span>
          <span className="amz-nav-item">Performance ▾</span>
        </nav>
      </header>

      {/* ==========================================================================
          2. BREADCRUMBS & LISTING SUBHEADER
          ========================================================================== */}
      <section className="amz-subheader">
        <div className="amz-breadcrumb">
          <Link to="/">Catalog</Link>
          <span>›</span>
          <Link to="/products/create">Add Products</Link>
          <span>›</span>
          <span>Create Product</span>
        </div>

        <div className="amz-page-title-row">
          <div className="amz-title-group">
            <h1>Add a Product: Listing Details</h1>
            <p className="amz-title-subtitle">
              Provide product details, pricing, images (up to 7), and description to publish your listing.
            </p>
          </div>

          <div className="amz-listing-meta">
            {/* Listing Strength Progress */}
            <div className="amz-quality-pill">
              <span style={{ fontWeight: 600 }}>Listing Strength:</span>
              <div className="amz-progress-bar-wrap">
                <div
                  className="amz-progress-fill"
                  style={{ width: `${qualityScore}%` }}
                ></div>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  color: qualityScore === 100 ? '#067d62' : '#e47911',
                }}
              >
                {qualityScore}%
              </span>
            </div>

            {/* Customer Live Preview Toggle */}
            <div className="amz-view-toggle">
              <button
                type="button"
                className={`amz-view-toggle-btn ${showLivePreview ? 'active' : ''}`}
                onClick={() => setShowLivePreview(!showLivePreview)}
              >
                <span>{showLivePreview ? '👁 Hide Live Amazon Preview' : '👁 Show Live Amazon Preview'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          3. TABS NAVIGATION (SELLER STEPS)
          ========================================================================== */}
      <nav className="amz-tabs-nav-bar">
        <button
          type="button"
          className={`amz-tab-btn ${activeTab === 'vital' ? 'active' : ''}`}
          onClick={() => setActiveTab('vital')}
        >
          <span>Title & Vital Info</span>
          <span className={`amz-tab-badge ${title.trim() ? 'completed' : ''}`}>
            {title.trim() ? '✓' : '1'}
          </span>
        </button>

        <button
          type="button"
          className={`amz-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
          onClick={() => setActiveTab('offer')}
        >
          <span>Price & Currency</span>
          <span className={`amz-tab-badge ${priceAmount ? 'completed' : ''}`}>
            {priceAmount ? '✓' : '2'}
          </span>
        </button>

        <button
          type="button"
          className={`amz-tab-btn ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          <span>Images (Up to 7)</span>
          <span
            className={`amz-tab-badge ${
              imageSlots.some((s) => s.file) ? 'completed' : ''
            }`}
          >
            {imageSlots.filter((s) => s.file).length}/7
          </span>
        </button>

        <button
          type="button"
          className={`amz-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          <span>Description</span>
          <span className={`amz-tab-badge ${description.trim() ? 'completed' : ''}`}>
            {description.trim() ? '✓' : '4'}
          </span>
        </button>
      </nav>

      {/* ==========================================================================
          4. MAIN CONTENT CONTAINER (FORM + LIVE PREVIEW)
          ========================================================================== */}
      <main className={`amz-main-container ${showLivePreview ? 'with-preview' : ''}`}>
        <form id="create-product-form" onSubmit={handleSubmit} className="amz-form-column">
          {/* Submission / Alert Banner */}
          {apiError && (
            <div className="amz-alert error">
              <span className="amz-alert-icon">⚠️</span>
              <div className="amz-alert-content">
                <strong>Submission Error:</strong>
                {apiError}
              </div>
            </div>
          )}

          <div className="amz-alert warning">
            <span className="amz-alert-icon">⚠️</span>
            <div className="amz-alert-content">
              <strong>Amazon Catalog Policy:</strong>
              Please enter clear and accurate title, pricing, images, and description to ensure customer trust and Buy Box eligibility.
            </div>
          </div>

          {/* ==================================================================
              TAB 1: TITLE & VITAL INFO (2-WAY BOUND)
              ================================================================== */}
          {activeTab === 'vital' && (
            <div className="amz-card">
              <div className="amz-card-header">
                <div>
                  <h2>Product Title</h2>
                  <div className="amz-card-header-desc">
                    Enter the official product name as it should appear in Amazon customer search results.
                  </div>
                </div>
              </div>

              <div className="amz-form-grid single-col">
                <div className="amz-form-group">
                  <div className="amz-label-row">
                    <label className="amz-label" htmlFor="product-title-input">
                      Product Title (title) <span className="amz-required">*</span>
                    </label>
                    <span
                      className={`amz-char-counter ${
                        title.length > 150 ? 'warning' : ''
                      }`}
                    >
                      {title.length} / 200 characters
                    </span>
                  </div>
                  <input
                    id="product-title-input"
                    name="title"
                    type="text"
                    className={`amz-input ${!title.trim() && isSubmitting ? 'error' : ''}`}
                    placeholder="Enter product title (e.g., Men's Casual Slim Fit Cotton Shirt)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <span className="amz-hint">
                    Include key product attributes such as brand, style, material, and color.
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="amz-btn-primary"
                  onClick={() => setActiveTab('offer')}
                >
                  Continue to Price & Currency ›
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 2: PRICE & CURRENCY (2-WAY BOUND)
              ================================================================== */}
          {activeTab === 'offer' && (
            <div className="amz-card">
              <div className="amz-card-header">
                <div>
                  <h2>Price & Currency</h2>
                  <div className="amz-card-header-desc">
                    Specify the selling price and standard currency for your product.
                  </div>
                </div>
              </div>

              <div className="amz-form-grid single-col">
                <div className="amz-form-group">
                  <div className="amz-label-row">
                    <label className="amz-label" htmlFor="product-price-input">
                      Price Amount & Currency <span className="amz-required">*</span>
                    </label>
                  </div>
                  <div className="amz-price-combo">
                    <select
                      id="product-currency-select"
                      name="priceCurrency"
                      className="amz-select amz-currency-select"
                      value={priceCurrency}
                      onChange={(e) => setPriceCurrency(e.target.value)}
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol})
                        </option>
                      ))}
                    </select>

                    <div className="amz-price-input-wrap">
                      <span className="amz-currency-symbol">{currentSymbol}</span>
                      <input
                        id="product-price-input"
                        name="priceAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        className={`amz-input ${(!priceAmount || Number(priceAmount) <= 0) && isSubmitting ? 'error' : ''}`}
                        placeholder="0.00"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <span className="amz-hint">
                    Checkout price customer will pay (priceAmount and priceCurrency).
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="amz-btn-secondary"
                  onClick={() => setActiveTab('vital')}
                >
                  ‹ Back to Title
                </button>
                <button
                  type="button"
                  className="amz-btn-primary"
                  onClick={() => setActiveTab('images')}
                >
                  Continue to Images ›
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 3: IMAGES (UP TO 7)
              ================================================================== */}
          {activeTab === 'images' && (
            <div className="amz-card">
              <div className="amz-card-header">
                <div>
                  <h2>Product Images (Up to 7 Images)</h2>
                  <div className="amz-card-header-desc">
                    Upload 1 primary MAIN image and up to 6 additional angles/views.
                  </div>
                </div>
              </div>

              <div className="amz-image-matrix-container">
                {/* 7 Slots Grid */}
                <div className="amz-image-matrix-grid">
                  {imageSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`amz-image-slot ${slot.isMain ? 'is-main' : ''} ${
                        slot.previewUrl ? 'has-image' : ''
                      }`}
                      onClick={() => handleSlotClick(slot.id)}
                    >
                      <div className="amz-slot-tag">{slot.tag}</div>

                      {slot.previewUrl ? (
                        <>
                          <img
                            src={slot.previewUrl}
                            alt={slot.label}
                            className="amz-slot-preview-img"
                          />
                          <button
                            type="button"
                            className="amz-slot-corner-remove"
                            onClick={(e) => handleRemoveImage(e, slot.id)}
                            title="Remove image"
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                          <div className="amz-slot-actions">
                            <span>{slot.isMain ? 'MAIN View' : 'Uploaded'}</span>
                            <button
                              type="button"
                              className="amz-remove-slot-btn"
                              onClick={(e) => handleRemoveImage(e, slot.id)}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="amz-slot-placeholder">
                          <span className="amz-upload-icon">📷</span>
                          <p>{slot.label}</p>
                          <span>Click to upload</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Amazon Image Standards Box */}
                <div className="amz-image-guidelines-box">
                  <h4>Amazon Product Image Standards</h4>
                  <ul className="amz-image-guidelines-list">
                    <li>
                      <span className="amz-guide-check">✓</span>
                      <span>Up to 7 high-resolution images</span>
                    </li>
                    <li>
                      <span className="amz-guide-check">✓</span>
                      <span>JPEG, PNG, or WEBP under 5MB each</span>
                    </li>
                    <li>
                      <span className="amz-guide-check">✓</span>
                      <span>Pure white background recommended for MAIN image</span>
                    </li>
                    <li>
                      <span className="amz-guide-check">✓</span>
                      <span>No watermarks, promotional text, or borders</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="amz-btn-secondary"
                  onClick={() => setActiveTab('offer')}
                >
                  ‹ Back to Price
                </button>
                <button
                  type="button"
                  className="amz-btn-primary"
                  onClick={() => setActiveTab('description')}
                >
                  Continue to Description ›
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 4: DESCRIPTION (2-WAY BOUND)
              ================================================================== */}
          {activeTab === 'description' && (
            <div className="amz-card">
              <div className="amz-card-header">
                <div>
                  <h2>Product Description</h2>
                  <div className="amz-card-header-desc">
                    Enter the detailed product description describing features, specifications, and details.
                  </div>
                </div>
              </div>

              <div className="amz-form-grid single-col">
                <div className="amz-form-group">
                  <div className="amz-label-row">
                    <label className="amz-label" htmlFor="product-description-input">
                      Product Description (description) <span className="amz-required">*</span>
                    </label>
                    <span className="amz-char-counter">
                      {description.length} / 2000 characters
                    </span>
                  </div>
                  <textarea
                    id="product-description-input"
                    name="description"
                    rows="7"
                    className={`amz-textarea ${!description.trim() && isSubmitting ? 'error' : ''}`}
                    placeholder="Enter comprehensive product description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                  <span className="amz-hint">
                    Provide accurate product details, fabric/materials, usage instructions, or package contents.
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="amz-btn-secondary"
                  onClick={() => setActiveTab('images')}
                >
                  ‹ Back to Images
                </button>
                <button
                  type="submit"
                  className="amz-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="amz-spinner"></span> Saving Listing...
                    </>
                  ) : (
                    'Save and Finish Listing 🚀'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* ==========================================================================
            5. LIVE AMAZON CUSTOMER PRODUCT PREVIEW (REFLECTS 2-WAY BOUND STATE)
            ========================================================================== */}
        {showLivePreview && (
          <aside className="amz-preview-panel">
            <div className="amz-preview-header">
              <span>Customer View (Amazon Live Preview)</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: '#37475a',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                LIVE PREVIEW
              </span>
            </div>

            <div className="amz-preview-body">
              {/* Product Gallery */}
              <div className="amz-preview-gallery">
                <div className="amz-preview-main-img-wrap">
                  {displayMainPreviewImg ? (
                    <img
                      src={displayMainPreviewImg}
                      alt={title || 'Product Preview'}
                      className="amz-preview-main-img"
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#888c8c', padding: '1.5rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>📦</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>No Image Uploaded Yet</div>
                      <div style={{ fontSize: '0.72rem' }}>Upload images in the Images tab</div>
                    </div>
                  )}
                </div>

                {uploadedPreviews.length > 1 && (
                  <div className="amz-preview-thumbnails">
                    {uploadedPreviews.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`amz-preview-thumb ${
                          selectedPreviewImageIndex === idx ? 'active' : ''
                        }`}
                        onClick={() => setSelectedPreviewImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="amz-preview-info">
                <h3 className="amz-preview-title">
                  {title.trim() ? title : 'Product Title Will Appear Here'}
                </h3>

                <div className="amz-preview-ratings">
                  <span className="amz-stars">★★★★☆</span>
                  <span style={{ fontWeight: 600 }}>4.8</span>
                  <span className="amz-ratings-count">Ratings & Reviews</span>
                </div>

                {/* Price Block */}
                <div className="amz-preview-price-block">
                  <div className="amz-preview-price">
                    {currentSymbol}
                    {priceAmount ? Number(priceAmount).toLocaleString() : '0.00'}
                  </div>

                  <div className="amz-preview-prime-row">
                    <span className="amz-prime-badge">prime</span>
                    <span>FREE delivery <strong>Tomorrow</strong></span>
                  </div>
                </div>

                {/* Buy Box */}
                <div className="amz-preview-buybox">
                  <div className="amz-stock-badge">In Stock</div>
                  <button type="button" className="amz-buybox-btn-cart">
                    Add to Cart
                  </button>
                  <button type="button" className="amz-buybox-btn-buy">
                    Buy Now
                  </button>
                </div>

                {/* Description Preview */}
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', margin: '0 0 6px 0', color: '#0f1111' }}>
                    Product Description:
                  </h4>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: description.trim() ? '#333333' : '#888888',
                      margin: 0,
                      lineHeight: 1.45,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {description.trim()
                      ? description
                      : 'Product description entered in the form will preview here...'}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* ==========================================================================
          6. STICKY FOOTER ACTIONS BAR (SUBMITS THE FORM VIA HOOK)
          ========================================================================== */}
      <footer className="amz-sticky-bottom-bar">
        <div className="amz-footer-status-bar">
          <span className={`amz-footer-status ${isFormValid ? 'valid' : 'invalid'}`}>
            {isFormValid
              ? '✓ All required fields provided'
              : '⚠️ Complete required fields (Title, Price, Description)'}
          </span>
        </div>

        <div className="amz-footer-controls">
          <div className="amz-footer-left">
            <button
              type="button"
              className="amz-btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="amz-btn-secondary"
              onClick={() => alert('Draft saved locally.')}
            >
              Save Draft
            </button>
          </div>

          <div className="amz-footer-right">
            <button
              type="submit"
              form="create-product-form"
              className="amz-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="amz-spinner"></span> Saving Listing...
                </>
              ) : (
                'Save and Finish'
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* ==========================================================================
          7. SUCCESS MODAL
          ========================================================================== */}
      {createdProductData && (
        <div className="amz-modal-backdrop">
          <div className="amz-success-modal">
            <div className="amz-modal-header">
              <div className="amz-modal-success-icon">✓</div>
              <div>
                <h3>Listing Created Successfully!</h3>
                <span style={{ fontSize: '0.8rem', color: '#565959' }}>
                  Your product has been saved to the database.
                </span>
              </div>
            </div>

            <div className="amz-modal-body">
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#0f1111' }}>
                Your product has been created with all attributes and uploaded images.
              </p>

              <div className="amz-modal-summary">
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Product Title:</strong>
                  <div style={{ color: '#0f1111', fontWeight: 600 }}>
                    {createdProductData.title}
                  </div>
                </div>
                <div>
                  <strong>Listing Price:</strong>
                  <div style={{ color: '#067d62', fontWeight: 700 }}>
                    {createdProductData.price} ({createdProductData.currency})
                  </div>
                </div>
                <div>
                  <strong>Images Uploaded:</strong>
                  <div style={{ color: '#007185', fontWeight: 700 }}>
                    {createdProductData.imagesCount} / 7 images
                  </div>
                </div>
              </div>
            </div>

            <div className="amz-modal-actions">
              <button
                type="button"
                className="amz-btn-secondary"
                onClick={handleResetForm}
              >
                Create Another Product
              </button>
              <button
                type="button"
                className="amz-btn-primary"
                onClick={() => navigate('/seller/dashboard')}
              >
                Go to Seller Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProduct;