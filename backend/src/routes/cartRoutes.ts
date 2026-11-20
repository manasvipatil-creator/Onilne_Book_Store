import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.patch('/items/:bookId', updateCartItem);
router.delete('/items/:bookId', removeCartItem);
router.delete('/', clearCart);

export default router;
