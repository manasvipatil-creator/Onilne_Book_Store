import { Router } from 'express';
import {
  getBooks,
  getBookBySlug,
  getFeaturedBooks,
  getBestSellers,
  getNewArrivals,
} from '../controllers/bookController.js';
import { HomepageConfig } from '../models/HomepageConfig.js';

const router = Router();

router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);

// Public route to get homepage dynamic config
router.get('/homepage-config', async (_req, res) => {
  try {
    let config = await HomepageConfig.findOne();
    if (!config) {
      config = await HomepageConfig.create({
        hero: {
          heading: 'Your Favorite Books, Anytime!',
          description: 'Discover a world of knowledge and imagination with BOOKORA.',
          buttonText: 'Explore Books',
          buttonLink: '/books',
          imageUrl: '/bookora-hero.jpg',
        },
        promoBanner: {
          title: 'Free Shipping Across India',
          discountText: 'USE CODE: WELCOME10',
          link: '/books',
        },
      });
    }
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch homepage config' });
  }
});

router.get('/:slug', getBookBySlug);

export default router;
