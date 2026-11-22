import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart, mergeCart } from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.post('/merge', mergeCart);
router.patch('/items/:bookId', updateCartItem);
router.delete('/items/:bookId', removeCartItem);
router.delete('/', clearCart);

export default router;
