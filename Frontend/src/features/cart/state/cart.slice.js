import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
    },
    reducers: {
        setCart: (state, action) => {
            const payload = action.payload;
            if (Array.isArray(payload)) {
                state.items = payload;
            } else if (payload?.items && Array.isArray(payload.items)) {
                state.items = payload.items;
            } else if (payload?.cart?.items && Array.isArray(payload.cart.items)) {
                state.items = payload.cart.items;
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
            } else if (payload && typeof payload === 'object') {
                state.items.push(payload);
            }
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;

            state.items = state.items.map((item) => {
                const itemProdId = item.product?._id?.toString() || item.product?.toString() || item.productId;
                const itemVarId = item.variant?._id?.toString() || item.variant?.toString() || item.variantId || null;
                const targetVarId = variantId ? variantId.toString() : null;

                const isProductMatch = itemProdId === productId;
                const isVariantMatch = targetVarId ? itemVarId === targetVarId : !itemVarId;

                if (isProductMatch && isVariantMatch) {
                    return { ...item, quantity: (Number(item.quantity) || 0) + 1 };
                }
                return item;
            });
        }
    }
});

export const { setCart, setItems, addItems,incrementCartItem } = cartSlice.actions;
export default cartSlice.reducer;
