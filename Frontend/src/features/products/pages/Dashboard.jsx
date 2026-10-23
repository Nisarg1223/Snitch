import { useEffect, useState, useMemo } from 'react';
import { useProduct } from '../hooks/useProduct.js';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { handleGetSellerProduct } = useProduct();
  const rawSellerProducts = useSelector((state) => state.product.sellerProducts);
  const user = useSelector((state) => state.auth?.user);

  const handleNavigateToProduct = (productId) => {
    if (productId) {
      navigate(`/seller/product/${productId}`);
    }
  };

  // Safely ensure sellerProducts is always an array
  const sellerProducts = useMemo(() => {
    return Array.isArray(rawSellerProducts) ? rawSellerProducts : [];
  }, [rawSellerProducts]);

  // Loading and error states - avoid flashing skeletons if data is already in Redux
  const [loading, setLoading] = useState(
    () => !Array.isArray(rawSellerProducts) || rawSellerProducts.length === 0
  );
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filters and views
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal State for Quick View
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedModalImgIndex, setSelectedModalImgIndex] = useState(0);

  // Initial load effect and Back-Forward Cache (bfcache) restore handler
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        await handleGetSellerProduct();
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching seller products:', err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load your seller catalog. Please verify your connection.';
        setErrorMessage(msg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Listen for pageshow event when page is restored from Back-Forward Cache (bfcache)
    const handlePageShow = (event) => {
      if (event.persisted && isMounted) {
        // Page was restored from bfcache; re-fetch data so inventory is not stale
        loadData();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      isMounted = false;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [handleGetSellerProduct]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorMessage(null);
    try {
      await handleGetSellerProduct();
    } catch (err) {
      console.error('Error fetching seller products:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load your seller catalog. Please verify your connection.';
      setErrorMessage(msg);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...sellerProducts];

    // Filter by search query (title, description, or id)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const idMatch = (p._id || '').toLowerCase().includes(q);
        return titleMatch || descMatch || idMatch;
      });
    }

    // Filter by currency
    if (currencyFilter !== 'ALL') {
      list = list.filter(
        (p) => (p.price?.currency || 'INR').toUpperCase() === currencyFilter
      );
    }

    // Sort products
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'price-low') {
        return (Number(a.price?.amount) || 0) - (Number(b.price?.amount) || 0);
      }
      if (sortBy === 'price-high') {
        return (Number(b.price?.amount) || 0) - (Number(a.price?.amount) || 0);
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return list;
  }, [sellerProducts, searchQuery, currencyFilter, sortBy]);

  // Derived Business Metrics
  const totalListings = sellerProducts.length;

  const totalCatalogValue = useMemo(() => {
    return sellerProducts.reduce((sum, item) => {
      return sum + (Number(item.price?.amount) || 0);
    }, 0);
  }, [sellerProducts]);

  const avgPrice = totalListings > 0 ? totalCatalogValue / totalListings : 0;

  const multiImageCount = useMemo(() => {
    return sellerProducts.filter(
      (p) => Array.isArray(p.images) && p.images.length > 1
    ).length;
  }, [sellerProducts]);

  // Modal open handler
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedModalImgIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedModalImgIndex(0);
  };

  const sellerName =
    user?.fullname || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Seller Store');

  return (
    <div className="amz-dash-wrapper">
      {/* ==========================================================================
          1. TOP AMAZON SELLER CENTRAL HEADER
          ========================================================================== */}
      <header className="amz-dash-header">
        <div className="amz-dash-header-top">
          {/* Logo & Seller Central Badge */}
          <Link to="/" className="amz-dash-brand" title="Amazon Seller Central">
            <div className="amz-dash-logo-combo">
              <span className="amz-dash-logo-text">amazon</span>
              <span className="amz-dash-logo-smile">⌣</span>
            </div>
            <span className="amz-dash-seller-tag">Seller Central</span>
          </Link>

          {/* Marketplace Indicator */}
          <div className="amz-dash-market-picker">
            <span>🇮🇳</span>
            <span className="amz-dash-market-name-full">Amazon.in (India)</span>
            <span style={{ fontSize: '0.65rem' }}>▼</span>
          </div>

          {/* Live Catalog Search */}
          <div className="amz-dash-header-search">
            <input
              type="text"
              placeholder="Search catalog, ASIN, SKU, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="amz-dash-header-search-icon">🔍</span>
          </div>

          {/* Seller Profile & Utilities */}
          <div className="amz-dash-header-actions">
            <div className="amz-dash-merchant-badge">
              <span className="amz-dash-status-dot"></span>
              <span>{sellerName}</span>
            </div>
            <button className="amz-dash-icon-btn" title="Messages">
              <span>✉</span>
            </button>
            <button className="amz-dash-icon-btn" title="Help & Support">
              <span>❓</span>
            </button>
            <button className="amz-dash-icon-btn" title="Settings">
              <span>⚙</span>
            </button>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="amz-dash-nav">
          <Link to="/seller/dashboard" className="amz-dash-nav-item active">
            Inventory ▾
          </Link>
          <Link to="/create-product" className="amz-dash-nav-item">
            Catalog ▾
          </Link>
          <span className="amz-dash-nav-item">Pricing ▾</span>
          <span className="amz-dash-nav-item">Orders ▾</span>
          <span className="amz-dash-nav-item">Advertising ▾</span>
          <span className="amz-dash-nav-item">Reports ▾</span>
          <span className="amz-dash-nav-item">Performance ▾</span>
        </nav>
      </header>

      {/* ==========================================================================
          2. DASHBOARD SUBHEADER / BANNER
          ========================================================================== */}
      <section className="amz-dash-subheader">
        <div className="amz-dash-breadcrumb">
          <Link to="/">Catalog</Link>
          <span>›</span>
          <Link to="/seller/dashboard">Manage Inventory</Link>
          <span>›</span>
          <span>Seller Dashboard</span>
        </div>

        <div className="amz-dash-title-row">
          <div className="amz-dash-title-group">
            <h1>Manage Inventory & Catalog</h1>
            <p>
              View, filter, and monitor all active product listings, pricing, and media assets in your seller account.
            </p>
          </div>

          <div className="amz-dash-actions-row">
            <button
              type="button"
              className={`amz-dash-btn-refresh ${refreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing || loading}
              title="Refresh inventory from database"
            >
              <span className="spin-icon">🔄</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh Catalog'}</span>
            </button>

            <Link to="/create-product" className="amz-dash-btn-add">
              <span>+ Add a Product</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          3. MAIN CONTAINER
          ========================================================================== */}
      <main className="amz-dash-main">
        {/* Error Alert */}
        {errorMessage && (
          <div className="amz-dash-alert-error">
            <div>
              <strong>Alert:</strong> {errorMessage}
            </div>
            <button
              onClick={handleRefresh}
              style={{
                background: 'transparent',
                border: '1px solid var(--amz-red)',
                color: 'var(--amz-red)',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ======================================================================
            KPI SUMMARY TILES (Amazon Seller Business Reports)
            ====================================================================== */}
        <section className="amz-metrics-grid">
          {/* Tile 1: Active Listings */}
          <div className="amz-metric-card">
            <div className="amz-metric-header">
              <span className="amz-metric-title">Active Listings</span>
              <span className="amz-metric-badge green">● Active</span>
            </div>
            <div className="amz-metric-value">{totalListings}</div>
            <div className="amz-metric-subtext">
              <span>In Stock & Buy Box eligible</span>
            </div>
          </div>

          {/* Tile 2: Total Inventory Valuation */}
          <div className="amz-metric-card">
            <div className="amz-metric-header">
              <span className="amz-metric-title">Catalog Valuation</span>
              <span className="amz-metric-badge blue">Catalog Asset</span>
            </div>
            <div className="amz-metric-value">{formatPrice(totalCatalogValue)}</div>
            <div className="amz-metric-subtext">
              <span>Total value across all listings</span>
            </div>
          </div>

          {/* Tile 3: Average Product Price */}
          <div className="amz-metric-card">
            <div className="amz-metric-header">
              <span className="amz-metric-title">Avg Listing Price</span>
              <span className="amz-metric-badge amber">Index</span>
            </div>
            <div className="amz-metric-value">{formatPrice(avgPrice)}</div>
            <div className="amz-metric-subtext">
              <span>Competitive pricing benchmark</span>
            </div>
          </div>

          {/* Tile 4: Multi-Image Coverage */}
          <div className="amz-metric-card">
            <div className="amz-metric-header">
              <span className="amz-metric-title">Media Quality</span>
              <span className="amz-metric-badge green">✓ Amazon Standard</span>
            </div>
            <div className="amz-metric-value">
              {multiImageCount}
              <span style={{ fontSize: '0.9rem', color: '#565959', fontWeight: 600 }}>
                / {totalListings}
              </span>
            </div>
            <div className="amz-metric-subtext">
              <span>Multi-angle high resolution listings</span>
            </div>
          </div>

          {/* Tile 5: Account Health */}
          <div className="amz-metric-card">
            <div className="amz-metric-header">
              <span className="amz-metric-title">Account Health</span>
              <span className="amz-metric-badge green">100% Healthy</span>
            </div>
            <div className="amz-metric-value" style={{ color: '#067d62' }}>
              Good
            </div>
            <div className="amz-metric-subtext">
              <span>Zero policy violations detected</span>
            </div>
          </div>
        </section>

        {/* ======================================================================
            INVENTORY TABLE / GRID CONTAINER
            ====================================================================== */}
        <section className="amz-inventory-section">
          {/* Toolbar */}
          <div className="amz-inventory-toolbar">
            <div className="amz-toolbar-filters">
              {/* Search Box */}
              <div className="amz-search-box">
                <input
                  type="text"
                  placeholder="Filter by title, ASIN, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="amz-search-box-icon">🔍</span>
              </div>

              {/* Currency Filter */}
              <select
                className="amz-filter-select"
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
              >
                <option value="ALL">All Currencies</option>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>

              {/* Sort By Dropdown */}
              <select
                className="amz-filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: Newest Listed</option>
                <option value="oldest">Sort: Oldest Listed</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
                <option value="title-asc">Sort: Title (A to Z)</option>
              </select>

              {/* Clear filters shortcut */}
              {(searchQuery || currencyFilter !== 'ALL' || sortBy !== 'newest') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrencyFilter('ALL');
                    setSortBy('newest');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--amz-link)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0 4px',
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* View Mode Toggle and Counter */}
            <div className="amz-toolbar-views">
              <span className="amz-item-counter">
                Showing <strong>{filteredProducts.length}</strong> of{' '}
                <strong>{totalListings}</strong> items
              </span>

              <div className="amz-view-switch">
                <button
                  type="button"
                  className={`amz-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Manage Inventory Table View"
                >
                  <span>☰ Table</span>
                </button>
                <button
                  type="button"
                  className={`amz-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Catalog Grid Cards View"
                >
                  <span>⊞ Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================================
              LOADING SKELETON STATE
              ================================================================== */}
          {loading && sellerProducts.length === 0 ? (
            <div style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="amz-skeleton-card">
                    <div
                      className="amz-skeleton-pulse"
                      style={{ height: '180px', width: '100%' }}
                    ></div>
                    <div
                      className="amz-skeleton-pulse"
                      style={{ height: '20px', width: '80%' }}
                    ></div>
                    <div
                      className="amz-skeleton-pulse"
                      style={{ height: '24px', width: '40%' }}
                    ></div>
                    <div
                      className="amz-skeleton-pulse"
                      style={{ height: '36px', width: '100%', marginTop: 'auto' }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* ==================================================================
                EMPTY STATES
                ================================================================== */
            <div className="amz-empty-state">
              <div className="amz-empty-icon">📦</div>
              {totalListings === 0 ? (
                <>
                  <h3 className="amz-empty-title">Your Inventory is Empty</h3>
                  <p className="amz-empty-desc">
                    You haven’t added any product listings yet. Start selling on Amazon by
                    creating your first catalog item.
                  </p>
                  <Link to="/create-product" className="amz-dash-btn-add">
                    <span>+ Add Your First Product</span>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="amz-empty-title">No Matching Products Found</h3>
                  <p className="amz-empty-desc">
                    No active listings match your filter or search query "{searchQuery}".
                  </p>
                  <button
                    type="button"
                    className="amz-btn-action-view"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrencyFilter('ALL');
                    }}
                  >
                    Clear Filter Criteria
                  </button>
                </>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* ==================================================================
                VIEW MODE 1: AMAZON MANAGE INVENTORY TABLE
                ================================================================== */
            <div className="amz-table-container">
              <table className="amz-inventory-table">
                <thead>
                  <tr>
                    <th className="amz-col-status">Status</th>
                    <th className="amz-col-thumb">Image</th>
                    <th className="amz-col-product">Product Details & ASIN</th>
                    <th className="amz-col-price">Your Price</th>
                    <th className="amz-col-desc">Description</th>
                    <th className="amz-col-date">Date Created</th>
                    <th className="amz-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => {
                    const mainImgUrl = resolveImageUrl(product.images?.[0]);
                    const imgCount = Array.isArray(product.images)
                      ? product.images.length
                      : 0;
                    const asin = product._id
                      ? `B0${product._id.slice(-8).toUpperCase()}`
                      : 'N/A';
                    const sku = product._id
                      ? `SNITCH-${product._id.slice(-6).toUpperCase()}`
                      : 'N/A';
                    const itemKey = product._id || `prod-row-${index}`;

                    return (
                      <tr key={itemKey}>
                        {/* Status */}
                        <td className="amz-col-status">
                          <span className="amz-status-pill">
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#067d62',
                              }}
                            ></span>
                            Active
                          </span>
                        </td>

                        {/* Thumbnail */}
                        <td className="amz-col-thumb">
                          <div
                            className="amz-table-thumb-wrap"
                            onClick={() => handleNavigateToProduct(product._id)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view product details"
                          >
                            {mainImgUrl ? (
                              <>
                                <img
                                  src={mainImgUrl}
                                  alt={product.title}
                                  className="amz-table-thumb"
                                />
                                {imgCount > 1 && (
                                  <span className="amz-thumb-count">
                                    {imgCount}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="amz-table-no-thumb">📦</span>
                            )}
                          </div>
                        </td>

                        {/* Title & Metadata */}
                        <td className="amz-col-product">
                          <div
                            className="amz-table-product-title"
                            onClick={() => handleNavigateToProduct(product._id)}
                            style={{ cursor: 'pointer' }}
                            title={product.title}
                          >
                            {product.title || 'Untitled Product'}
                          </div>
                          <div className="amz-table-product-meta">
                            <span>
                              ASIN: <span className="amz-meta-asin">{asin}</span>
                            </span>
                            <span>•</span>
                            <span>
                              SKU: <span className="amz-meta-asin">{sku}</span>
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="amz-col-price">
                          <div className="amz-table-price-main">
                            {formatPrice(
                              product.price?.amount,
                              product.price?.currency
                            )}
                          </div>
                          <div className="amz-table-price-fee">
                            {product.price?.currency || 'INR'} • In Stock
                          </div>
                        </td>

                        {/* Description */}
                        <td className="amz-col-desc">
                          <div
                            className="amz-table-desc-text"
                            title={product.description}
                          >
                            {product.description || 'No description provided'}
                          </div>
                        </td>

                        {/* Date Listed */}
                        <td className="amz-col-date">
                          {formatDate(product.createdAt)}
                        </td>

                        {/* Action Buttons */}
                        <td className="amz-col-actions">
                          <div className="amz-table-actions">
                            <button
                              type="button"
                              className="amz-btn-action-view"
                              onClick={() => handleNavigateToProduct(product._id)}
                            >
                              View Details
                            </button>
                            <Link
                              to="/create-product"
                              className="amz-btn-action-view"
                              style={{ textDecoration: 'none' }}
                              title="Add another item to your inventory"
                            >
                              + Add Similar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ==================================================================
                VIEW MODE 2: AMAZON CATALOG GRID CARDS
                ================================================================== */
            <div className="amz-grid-container">
              {filteredProducts.map((product, index) => {
                const mainImgUrl = resolveImageUrl(product.images?.[0]);
                const imgCount = Array.isArray(product.images)
                  ? product.images.length
                  : 0;
                const asin = product._id
                  ? `B0${product._id.slice(-8).toUpperCase()}`
                  : 'N/A';
                const sku = product._id
                  ? `SNITCH-${product._id.slice(-6).toUpperCase()}`
                  : 'N/A';
                const cardKey = product._id || `prod-card-${index}`;

                return (
                  <div
                    key={cardKey}
                    className="amz-catalog-card"
                    onClick={() => handleNavigateToProduct(product._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Top image section */}
                    <div className="amz-card-image-wrap">
                      <div className="amz-card-top-badges">
                        <span className="amz-badge-active">ACTIVE</span>
                        {imgCount > 0 && (
                          <span className="amz-badge-images-count">
                            📷 {imgCount} {imgCount === 1 ? 'photo' : 'photos'}
                          </span>
                        )}
                      </div>

                      {mainImgUrl ? (
                        <img
                          src={mainImgUrl}
                          alt={product.title}
                          className="amz-card-image"
                        />
                      ) : (
                        <div className="amz-card-no-image">
                          <span style={{ fontSize: '2.5rem' }}>📦</span>
                          <span style={{ fontSize: '0.75rem' }}>No image</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="amz-card-body">
                      <div className="amz-card-meta">
                        <span>
                          ASIN: <strong style={{ color: '#0f1111' }}>{asin}</strong>
                        </span>
                        <span>•</span>
                        <span>SKU: {sku}</span>
                      </div>

                      <h3
                        className="amz-card-title"
                        title={product.title}
                      >
                        {product.title || 'Untitled Product'}
                      </h3>

                      <div className="amz-card-price-row">
                        <div className="amz-card-price">
                          {formatPrice(
                            product.price?.amount,
                            product.price?.currency
                          )}
                        </div>
                        <span className="amz-card-currency-tag">
                          {product.price?.currency || 'INR'}
                        </span>
                      </div>

                      <p className="amz-card-desc">
                        {product.description || 'No description provided.'}
                      </p>

                      <div className="amz-card-footer">
                        <span className="amz-card-date">
                          Listed {formatDate(product.createdAt)}
                        </span>
                        <button
                          type="button"
                          className="amz-card-btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToProduct(product._id);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ==========================================================================
          4. PRODUCT DETAILS QUICK-VIEW MODAL
          ========================================================================== */}
      {selectedProduct && (
        <div className="amz-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="amz-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="amz-modal-header">
              <div>
                <h2>Listing Information</h2>
                <div style={{ fontSize: '0.75rem', color: '#565959', marginTop: '2px' }}>
                  ASIN: B0{selectedProduct._id?.slice(-8).toUpperCase()} • SKU: SNITCH-
                  {selectedProduct._id?.slice(-6).toUpperCase()}
                </div>
              </div>
              <button
                type="button"
                className="amz-modal-close-btn"
                onClick={handleCloseModal}
                title="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="amz-modal-body">
              {/* Left Column: Image Gallery */}
              <div className="amz-modal-gallery">
                <div className="amz-modal-main-img-wrap">
                  {(() => {
                    const activeModalImg =
                      resolveImageUrl(selectedProduct.images?.[selectedModalImgIndex]) ||
                      resolveImageUrl(selectedProduct.images?.[0]);
                    return activeModalImg ? (
                      <img
                        src={activeModalImg}
                        alt={selectedProduct.title}
                        className="amz-modal-main-img"
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#888c8c' }}>
                        <div style={{ fontSize: '3rem' }}>📦</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          No images uploaded for this listing
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Thumbnails row if multiple images exist */}
                {Array.isArray(selectedProduct.images) &&
                  selectedProduct.images.length > 1 && (
                    <div className="amz-modal-thumbs-row">
                      {selectedProduct.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={resolveImageUrl(img)}
                          alt={`Slot ${idx + 1}`}
                          className={`amz-modal-thumb ${
                            selectedModalImgIndex === idx ? 'active' : ''
                          }`}
                          onClick={() => setSelectedModalImgIndex(idx)}
                        />
                      ))}
                    </div>
                  )}
              </div>

              {/* Right Column: Listing Details */}
              <div className="amz-modal-info">
                <div className="amz-status-pill" style={{ width: 'fit-content' }}>
                  ● Active Catalog Listing
                </div>

                <h3 className="amz-modal-title">{selectedProduct.title}</h3>

                {/* Price Box */}
                <div className="amz-modal-price-box">
                  <div style={{ fontSize: '0.75rem', color: '#565959' }}>
                    Listing Price:
                  </div>
                  <div className="amz-modal-price-val">
                    {formatPrice(
                      selectedProduct.price?.amount,
                      selectedProduct.price?.currency
                    )}
                  </div>
                  <div className="amz-modal-prime-row">
                    <span className="amz-prime-text">prime</span>
                    <span>Free Delivery & Buy Box eligible</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="amz-modal-desc-heading">Product Description</h4>
                  <p className="amz-modal-desc-text">
                    {selectedProduct.description || 'No description provided.'}
                  </p>
                </div>

                {/* Listing Metadata */}
                <div
                  style={{
                    backgroundColor: '#fafbfb',
                    border: '1px solid #e7e7e7',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#565959',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong>Currency:</strong>{' '}
                    {selectedProduct.price?.currency || 'INR'}
                  </div>
                  <div>
                    <strong>Total Media:</strong>{' '}
                    {Array.isArray(selectedProduct.images)
                      ? selectedProduct.images.length
                      : 0}{' '}
                    file(s)
                  </div>
                  <div>
                    <strong>Created:</strong>{' '}
                    {formatDate(selectedProduct.createdAt)}
                  </div>
                  <div>
                    <strong>Last Updated:</strong>{' '}
                    {formatDate(selectedProduct.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="amz-modal-footer">
              <button
                type="button"
                className="amz-btn-action-view"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <Link
                to="/create-product"
                className="amz-dash-btn-add"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              >
                + Add Another Product
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          5. FOOTER
          ========================================================================== */}
      <footer className="amz-dash-footer">
        <div className="amz-footer-links">
          <a href="#conditions">Conditions of Use</a>
          <a href="#privacy">Privacy Notice</a>
          <a href="#agreement">Amazon Services Business Solutions Agreement</a>
          <a href="#help">Help & Contact Us</a>
        </div>
        <div>
          © 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates • Seller Central
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;