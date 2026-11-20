import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    subtotal: { amount: 0, currency: "INR" },
    totalQuantity: 0,
  },
  reducers: {
    setCart: (state, action) => {
      const payload = action.payload;
      if (!payload) return;

      if (Array.isArray(payload)) {
        state.items = payload;
      } else if (payload?.cart?.items && Array.isArray(payload.cart.items)) {
        state.items = payload.cart.items;
      } else if (payload?.items && Array.isArray(payload.items)) {
        state.items = payload.items;
      }

      if (payload?.subtotal) {
        state.subtotal = payload.subtotal;
      } else if (payload?.cart?.subtotal) {
        state.subtotal = payload.cart.subtotal;
      }

      if (payload?.totalQuantity != null) {
        state.totalQuantity = payload.totalQuantity;
      } else if (payload?.cart?.totalQuantity != null) {
        state.totalQuantity = payload.cart.totalQuantity;
      }
    },
    setItems: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      } else if (action.payload?.items && Array.isArray(action.payload.items)) {
        state.items = action.payload.items;
      }
    },
    addItems: (state, action) => {
      const payload = action.payload;
      if (payload?.cart?.items) {
        state.items = payload.cart.items;
      } else if (payload?.items && Array.isArray(payload.items)) {
        state.items = payload.items;
      } else if (Array.isArray(payload)) {
        state.items = payload;
      } else if (payload && typeof payload === "object") {
        state.items.push(payload);
      }
    },
    incrementCartItem: (state, action) => {
      const { productId, variantId } = action.payload;

      state.items = state.items.map((item) => {
        const itemProdId =
          item.product?._id?.toString() ||
          item.product?.toString() ||
          item.productId;
        const itemVarId =
          item.variant?._id?.toString() ||
          item.variant?.toString() ||
          item.variantId ||
          null;
        const targetVarId = variantId ? variantId.toString() : null;

        const isProductMatch = itemProdId === productId;
        const isVariantMatch = targetVarId
          ? itemVarId === targetVarId
          : !itemVarId;

        if (isProductMatch && isVariantMatch) {
          return { ...item, quantity: (Number(item.quantity) || 0) + 1 };
        }
        return item;
      });
    },
    // Add inside reducers:
    decrementCartItem: (state, action) => {
      const { productId, variantId } = action.payload;

      state.items = state.items.map((item) => {
        const itemProdId =
          item.product?._id?.toString() ||
          item.product?.toString() ||
          item.productId;
        const itemVarId =
          item.variant?._id?.toString() ||
          item.variant?.toString() ||
          item.variantId ||
          null;
        const targetVarId = variantId ? variantId.toString() : null;

        const isProductMatch = itemProdId === productId;
        const isVariantMatch = targetVarId
          ? itemVarId === targetVarId
          : !itemVarId;

        if (isProductMatch && isVariantMatch) {
          const currentQty = Number(item.quantity) || 1;
          // Enforce minimum 1 (cannot decrement below 1)
          return { ...item, quantity: Math.max(1, currentQty - 1) };
        }
        return item;
      });
    },
  },
});

export const { setCart, setItems, addItems, incrementCartItem,decrementCartItem } =
  cartSlice.actions;
export default cartSlice.reducer;
