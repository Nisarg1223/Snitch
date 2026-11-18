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
    }
});

export const { setCart, setItems, addItems } = cartSlice.actions;
export default cartSlice.reducer;
