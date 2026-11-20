import { Router } from 'express';
import {
  getAdminStats,
  getAdminBooks,
  createBook,
  updateBook,
  deleteBook,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  toggleCustomerActive,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getHomepageConfig,
  updateHomepageConfig,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

// Stats
router.get('/dashboard', getAdminStats);

// Books
router.get('/books', getAdminBooks);
router.post('/books', createBook);
router.patch('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Customers
router.get('/customers', getAdminCustomers);
router.patch('/customers/:id/toggle-active', toggleCustomerActive);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.patch('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Homepage configuration
router.get('/homepage', getHomepageConfig);
router.patch('/homepage', updateHomepageConfig);

// File uploads
router.post('/upload', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'ebook', maxCount: 1 }]), (req: any, res) => {
  const files: any = {};
  if (req.files?.cover?.[0]) {
    files.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
  }
  if (req.files?.ebook?.[0]) {
    files.fileKey = req.files.ebook[0].filename;
  }
  res.json({ success: true, files });
});

export default router;
