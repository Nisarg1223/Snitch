import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart,validateIncrementCartItemQuantity, validateDecrementCartItemQuantity,validateDeleteCartItem } from '../validator/card.validator.js';
import { addToCart, getCart,IncrementCartItemQuantity,DecrementCartItemQuantity,deleteCartItem } from '../controllers/cart.controller.js';

const cartRouter = Router();

cartRouter.post('/add/:productId/:variantId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/add/:productId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/:productId/:variantId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/:productId', authenticateUser, validateAddToCart, addToCart);
cartRouter.get('/', authenticateUser, getCart);
cartRouter.patch('/quantity/increment/:productId/:variantId', authenticateUser, validateIncrementCartItemQuantity, IncrementCartItemQuantity);
cartRouter.patch('/quantity/increment/:productId', authenticateUser, validateIncrementCartItemQuantity, IncrementCartItemQuantity);
cartRouter.patch('/quantity/decrement/:productId/:variantId', authenticateUser, validateDecrementCartItemQuantity, DecrementCartItemQuantity);
cartRouter.patch('/quantity/decrement/:productId', authenticateUser, validateDecrementCartItemQuantity, DecrementCartItemQuantity);
// 🗑️ Delete item from cart (with & without variantId)
cartRouter.delete('/remove/:productId/:variantId', authenticateUser, validateDeleteCartItem, deleteCartItem);
cartRouter.delete('/remove/:productId', authenticateUser, validateDeleteCartItem, deleteCartItem);
//payment.
cartRouter.post("/payment/create/order",authenticateUser);
export default cartRouter;
