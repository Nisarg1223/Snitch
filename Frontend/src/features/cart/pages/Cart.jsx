import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from '../hook/useCart.js';
import './Cart.css';

const extractVariantAttributes = (attrs) => {
  if (!attrs) return [];
  if (attrs instanceof Map) return Array.from(attrs.entries());
  if (typeof attrs === 'object') return Object.entries(attrs);
  return [];
};

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return null;
};

const formatPrice = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
  return `${sym}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Cart = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const { cartItems, cartCount, handleGetCart, handleAddItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [isGift, setIsGift] = useState(false);
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Attach handleGetCart hook on mount to fetch live cart data from backend
  useEffect(() => {
    let isMounted = true;
    const loadCart = async () => {
      setLoading(true);
      try {
        await handleGetCart();
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCart();
    return () => {
      isMounted = false;
    };
  }, [handleGetCart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live calculation of subtotal based solely on active cart items
  const { subtotalAmount, totalQuantity } = useMemo(() => {
    let amount = 0;
    let units = 0;
    cartItems.forEach((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price?.amount ?? item.product?.price?.amount ?? 0);
      amount += price * qty;
      units += qty;
    });
    return { subtotalAmount: amount, totalQuantity: units };
  }, [cartItems]);

  const handleIncrement = async (item) => {
    const prodId = item.product?._id || item.product;
    const varId = item.variant;
    try {
      setUpdatingItemId(item._id || prodId);
      await handleAddItem({
        productId: prodId,
        variantId: varId,
        quantity: 1,
      });
      showToast('Cart updated');
    } catch (err) {
      console.error('Error incrementing item quantity:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update quantity';
      showToast(`⚠️ ${msg}`);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleProceedToBuy = () => {
    showToast('Redirecting to checkout...');
    // Future checkout flow hook / route
  };

  return (
    <div className="amz-cart-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="amz-cart-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Content */}
      <main className="amz-cart-main-container">
        {/* Left Column: Cart Box */}
        <section className="amz-cart-box-card">
          <div className="amz-cart-header-row">
            <h1 className="amz-cart-title">Shopping Cart</h1>
            {cartItems.length > 0 && (
              <span className="amz-cart-header-price-label">Price</span>
            )}
          </div>
          <hr className="amz-cart-divider" />

          {/* Skeleton Loader */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 0' }}>
              <div className="amz-cart-skeleton-box" style={{ height: '110px', width: '100%' }} />
              <div className="amz-cart-skeleton-box" style={{ height: '110px', width: '100%' }} />
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <div className="amz-cart-empty-box">
              <div className="amz-cart-empty-icon">🛒</div>
              <h2 className="amz-cart-empty-title">Your Snitch Cart is empty</h2>
              <p className="amz-cart-empty-desc">
                Your shopping cart is waiting. Give it purpose – explore our catalog and add items you love.
              </p>
              <Link to="/" className="amz-cart-btn-continue">
                Continue shopping
              </Link>
            </div>
          ) : (
            /* Active Cart Items */
            <div className="amz-cart-items-list">
              {cartItems.map((item, index) => {
                const product = typeof item.product === 'object' && item.product ? item.product : null;
                const variantsList = product?.varients || product?.variants || [];
                const matchedVariant = variantsList.find(
                  (v) => v._id && item.variant && v._id.toString() === item.variant.toString()
                );

                const itemImg =
                  resolveImageUrl(matchedVariant?.images?.[0]) ||
                  resolveImageUrl(product?.images?.[0]) ||
                  '/amazon_hero_banner.jpg';

                const title = product?.title || 'Product Item';
                const unitPrice = Number(item.price?.amount ?? matchedVariant?.price?.amount ?? product?.price?.amount ?? 0);
                const currency = item.price?.currency || matchedVariant?.price?.currency || product?.price?.currency || 'INR';
                const qty = Number(item.quantity) || 1;
                const variantAttrs = extractVariantAttributes(matchedVariant?.attributes);
                const stock = matchedVariant?.stock != null ? Number(matchedVariant.stock) : 10;
                const isUpdating = updatingItemId === (item._id || product?._id);

                return (
                  <div key={item._id || index} className="amz-cart-item-row">
                    {/* Checkbox & Media */}
                    <div className="amz-cart-item-media">
                      <input type="checkbox" defaultChecked className="amz-cart-checkbox" />
                      <Link
                        to={product?._id ? `/product/${product._id}` : '#'}
                        className="amz-cart-item-thumb-link"
                      >
                        <img src={itemImg} alt={title} className="amz-cart-item-thumb" />
                      </Link>
                    </div>

                    {/* Center: Details */}
                    <div className="amz-cart-item-details">
                      <Link
                        to={product?._id ? `/product/${product._id}` : '#'}
                        className="amz-cart-item-title"
                      >
                        {title}
                      </Link>

                      {/* Stock status */}
                      {stock <= 5 && stock > 0 ? (
                        <div className="amz-cart-stock-alert">Only {stock} left in stock.</div>
                      ) : stock > 5 ? (
                        <div className="amz-cart-stock-ok">In stock</div>
                      ) : (
                        <div className="amz-cart-stock-out">Currently out of stock</div>
                      )}

                      {/* Delivery badge */}
                      <div className="amz-cart-delivery-tag">
                        <span>FREE delivery available</span>
                        <span className="amz-cart-fulfilled-badge">Fulfilled</span>
                      </div>

                      {/* Variant Specifications */}
                      {variantAttrs.length > 0 && (
                        <div className="amz-cart-attrs-list">
                          {variantAttrs.map(([k, v], aIdx) => (
                            <div key={aIdx} className="amz-cart-attr-row">
                              <span>{k}:</span>
                              <strong>{v}</strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions: Qty Counter, Delete, Save, Share */}
                      <div className="amz-cart-actions-row">
                        <div className="amz-cart-qty-pill">
                          <button
                            type="button"
                            className="amz-cart-qty-btn"
                            title="Quantity"
                            disabled
                          >
                            Qty:
                          </button>
                          <span className="amz-cart-qty-val">{qty}</span>
                          <button
                            type="button"
                            className="amz-cart-qty-btn"
                            onClick={() => handleIncrement(item)}
                            disabled={isUpdating}
                            title="Add one more"
                          >
                            +
                          </button>
                        </div>
                        <span className="amz-cart-action-pipe">|</span>
                        <button
                          type="button"
                          className="amz-cart-action-link"
                          onClick={() => showToast('Feature available in next release')}
                        >
                          Delete
                        </button>
                        <span className="amz-cart-action-pipe">|</span>
                        <button
                          type="button"
                          className="amz-cart-action-link"
                          onClick={() => showToast('Saved for later')}
                        >
                          Save for later
                        </button>
                        <span className="amz-cart-action-pipe">|</span>
                        <button
                          type="button"
                          className="amz-cart-action-link"
                          onClick={() => {
                            if (navigator.clipboard && product?._id) {
                              navigator.clipboard.writeText(`${window.location.origin}/product/${product._id}`);
                              showToast('Link copied to clipboard');
                            }
                          }}
                        >
                          Share
                        </button>
                      </div>
                    </div>

                    {/* Right: Item Price */}
                    <div className="amz-cart-item-price-col">
                      <div className="amz-cart-item-price">
                        {formatPrice(unitPrice * qty, currency)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Subtotal inside Cart Box */}
              <div className="amz-cart-bottom-subtotal">
                Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}):{' '}
                <strong>{formatPrice(subtotalAmount)}</strong>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Checkout Summary Sidebar */}
        {cartItems.length > 0 && (
          <aside className="amz-cart-sidebar">
            <div className="amz-cart-summary-card">
              <div className="amz-cart-summary-subtotal">
                Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}):{' '}
                <strong>{formatPrice(subtotalAmount)}</strong>
              </div>

              <label className="amz-cart-gift-row">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                />
                <span>This order contains a gift</span>
              </label>

              <button
                type="button"
                className="amz-cart-btn-proceed"
                onClick={handleProceedToBuy}
              >
                Proceed to Buy
              </button>

              {/* EMI Available Accordion */}
              <div className="amz-cart-emi-card">
                <div
                  className="amz-cart-emi-header"
                  onClick={() => setIsEmiOpen(!isEmiOpen)}
                >
                  <span>EMI Available</span>
                  <span>{isEmiOpen ? '▲' : '▼'}</span>
                </div>
                {isEmiOpen && (
                  <div className="amz-cart-emi-content">
                    No Cost EMI and standard bank EMI available on eligible credit & debit cards at checkout.
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="amz-cart-footer-disclaimer">
        The price and availability of items at Snitch are subject to change. The shopping cart is a temporary place to store a list of your items and reflects each item's most recent price.
      </footer>
    </div>
  );
};

export default Cart;
