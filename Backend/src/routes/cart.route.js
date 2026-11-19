import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart,validateIncrementCartItemQuantity } from '../validator/card.validator.js';
import { addToCart, getCart,IncrementCartItemQuantity } from '../controllers/cart.controller.js';

const cartRouter = Router();

cartRouter.post('/add/:productId/:variantId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/add/:productId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/:productId/:variantId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/:productId', authenticateUser, validateAddToCart, addToCart);
cartRouter.get('/', authenticateUser, getCart);
cartRouter.patch('/quantity/increment/:productId/:variantId',authenticateUser,validateIncrementCartItemQuantity,IncrementCartItemQuantity);

export default cartRouter;
