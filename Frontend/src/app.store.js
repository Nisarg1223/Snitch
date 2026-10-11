
import authReducer from '../src/features/auth/state/auth.slice.js';
import productReducer from '../src/features/products/state/product.slice.js';

import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({
    reducer:{
        auth:authReducer,
        product:productReducer,
    }
})