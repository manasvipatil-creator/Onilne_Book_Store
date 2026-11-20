import { Router } from 'express';
import {
  getBooks,
  getBookBySlug,
  getFeaturedBooks,
  getBestSellers,
  getNewArrivals,
} from '../controllers/bookController.js';

const router = Router();

router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/:slug', getBookBySlug);

export default router;
