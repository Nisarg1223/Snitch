import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, getCart,IncrementCartItemApi,DecrementCartItemApi } from '../service/cart.service.js';
import { addItems, setCart,incrementCartItem ,decrementCartItem} from '../state/cart.slice.js';

export const useCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart?.items || []);
    const cartCount = cartItems.reduce((acc, item) => acc + (Number(item?.quantity) || 1), 0);

    const handleAddItem = useCallback(async ({ productId, variantId, quantity = 1 }) => {
        const data = await addItem({ productId, variantId, quantity });
        if (data?.cart) {
            dispatch(setCart(data.cart));
        } else {
            dispatch(addItems(data));
        }
        return data;
    }, [dispatch]);

    const handleGetCart = useCallback(async () => {
        try {
            const data = await getCart();
            if (data?.cart) {
                dispatch(setCart(data.cart));
            }
            return data;
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            return null;
        }
    }, [dispatch]);

    const handleIncrementCartItem = useCallback(async ({ productId, variantId }) => {
        const data = await IncrementCartItemApi({ productId, variantId });
        if (data?.cart) {
            dispatch(setCart(data.cart));
        } else {
            dispatch(incrementCartItem({ productId, variantId }));
        }
        return data;
    }, [dispatch]);
   
     const handleDecrementCartItem = useCallback(async ({ productId, variantId }) => {
    const data = await DecrementCartItemApi({ productId, variantId });
    if (data?.cart) {
        dispatch(setCart(data.cart));
    } else {
        dispatch(decrementCartItem({ productId, variantId }));
    }
    return data;
}, [dispatch]);

    return {
        cartItems,
        cartCount,
        handleAddItem,
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem
    };
};
