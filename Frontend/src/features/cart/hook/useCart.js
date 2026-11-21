import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    addItem, 
    getCart, 
    IncrementCartItemApi, 
    DecrementCartItemApi,
    DeleteCartItemApi 
} from '../service/cart.service.js';
import { 
    addItems, 
    setCart, 
    incrementCartItem, 
    decrementCartItem,
    removeCartItem 
} from '../state/cart.slice.js';

export const useCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart?.items || []);
    const subtotal = useSelector((state) => state.cart?.subtotal || { amount: 0, currency: 'INR' });
    const totalQuantity = useSelector((state) => state.cart?.totalQuantity || 0);
    const cartCount = totalQuantity || cartItems.reduce((acc, item) => acc + (Number(item?.quantity) || 1), 0);

    const handleAddItem = useCallback(async ({ productId, variantId, quantity = 1 }) => {
        const data = await addItem({ productId, variantId, quantity });
        if (data?.cart) {
            dispatch(setCart(data));
            await handleGetCart();
        } else {
            dispatch(addItems(data));
        }
        return data;
    }, [dispatch]);

    const handleGetCart = useCallback(async () => {
        try {
            const data = await getCart();
            if (data) {
                dispatch(setCart(data));
            }
            return data;
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            return null;
        }
    }, [dispatch]);

    const handleIncrementCartItem = useCallback(async ({ productId, variantId }) => {
        const data = await IncrementCartItemApi({ productId, variantId });
        if (data) {
            await handleGetCart();
        } else {
            dispatch(incrementCartItem({ productId, variantId }));
        }
        return data;
    }, [dispatch, handleGetCart]);
   
    const handleDecrementCartItem = useCallback(async ({ productId, variantId }) => {
        const data = await DecrementCartItemApi({ productId, variantId });
        if (data) {
            await handleGetCart();
        } else {
            dispatch(decrementCartItem({ productId, variantId }));
        }
        return data;
    }, [dispatch, handleGetCart]);

    const handleDeleteCartItem = useCallback(async ({ productId, variantId }) => {
    // 1. Call delete API (returns updated cart + subtotal)
    const data = await DeleteCartItemApi({ productId, variantId });

    // 2. Directly update Redux with the data we just received
    if (data?.cart) {
        dispatch(setCart(data));
    }
    
    return data;
}, [dispatch]);

    return {
        cartItems,
        cartCount,
        subtotal,
        totalQuantity,
        handleAddItem,
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem,
        handleDeleteCartItem
    };
};