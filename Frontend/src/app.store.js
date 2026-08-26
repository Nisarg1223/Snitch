import redux from 'redux';
import authReducer from '../src/features/auth/state/auth.slice.js';
export const store = configureStore({
    reducer:{
        auth:authReducer
    }
})