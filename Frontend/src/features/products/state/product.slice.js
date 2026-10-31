import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        currentProduct: null
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload;
        },
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload;
        },
        updateSellerProduct: (state, action) => {
            const updatedProduct = action.payload;
            if (!updatedProduct) return;
            state.sellerProducts = state.sellerProducts.map((p) =>
                p._id === updatedProduct._id ? updatedProduct : p
            );
            if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
                state.currentProduct = updatedProduct;
            }
        },
        addVariantToProduct: (state, action) => {
            const { productId, variant, product } = action.payload || {};
            if (product) {
                state.sellerProducts = state.sellerProducts.map((p) =>
                    p._id === product._id ? product : p
                );
                if (state.currentProduct && state.currentProduct._id === product._id) {
                    state.currentProduct = product;
                }
            } else if (productId && variant) {
                const target = state.sellerProducts.find((p) => p._id === productId);
                if (target) {
                    if (!Array.isArray(target.varients)) {
                        target.varients = [];
                    }
                    target.varients.push(variant);
                }
                if (state.currentProduct && state.currentProduct._id === productId) {
                    if (!Array.isArray(state.currentProduct.varients)) {
                        state.currentProduct.varients = [];
                    }
                    state.currentProduct.varients.push(variant);
                }
            }
        }
    }
});

export const {
    setSellerProducts,
    setProducts,
    setCurrentProduct,
    updateSellerProduct,
    addVariantToProduct
} = productSlice.actions;

export default productSlice.reducer;
