import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart } from '../validator/card.validator.js';
import { addToCart, getCart } from '../controllers/cart.controller.js';

const cartRouter = Router();

cartRouter.post('/add/:productId/:variantId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/add/:productId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/:productId/:variantId', authenticateUser, validateAddToCart, addToCart);
cartRouter.post('/:productId', authenticateUser, validateAddToCart, addToCart);
cartRouter.get('/', authenticateUser, getCart);

export default cartRouter;
