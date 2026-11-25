import { Response } from 'express';
import { Book } from '../models/Book.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { HomepageConfig } from '../models/HomepageConfig.js';
import { DigitalPurchase } from '../models/DigitalPurchase.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// --- Dashboard Overview ---
export const getAdminStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalBooks = await Book.countDocuments();
    const physicalBooks = await Book.countDocuments({ type: 'physical' });
    const digitalBooks = await Book.countDocuments({ type: 'ebook' });
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalCoupons = await Coupon.countDocuments();

    const paidOrders = await Order.find({ 'payment.status': 'Paid' });
    const totalSales = paidOrders.reduce((sum, ord) => sum + ord.pricing.finalTotal, 0);

    const pendingOrders = await Order.countDocuments({
      $or: [{ 'payment.status': 'Pending' }, { physicalStatus: 'Processing' }],
    });

    const lowStockBooks = await Book.find({
      type: 'physical',
      'physical.stock': { $lte: 5 },
      status: 'published',
    }).select('title physical.stock pricing');

    const recentOrders = await Order.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(8);

    const recentCustomers = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(8);

    // Dynamic daily sales breakdown for recent 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesHistory = await Order.aggregate([
      {
        $match: {
          'payment.status': 'Paid',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailyRevenue: { $sum: '$pricing.finalTotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks,
          physicalBooks,
          digitalBooks,
          totalOrders,
          totalCustomers,
          totalSales,
          pendingOrders,
          totalCoupons,
          lowStockCount: lowStockBooks.length,
        },
        salesHistory,
        lowStockBooks,
        recentOrders,
        recentCustomers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// --- Book Management ---
export const getAdminBooks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, type } = req.query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.categoryId = category;
    if (type) filter.type = type;

    const books = await Book.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { books } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
};

export const createBook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      description,
      categoryId,
      publisher,
      isbn,
      language,
      pages,
      type,
      price,
      originalPrice,
      stock,
      sku,
      coverImage,
      isFeatured,
      isBestSeller,
      status,
      fileKey,
      fileFormat,
      downloadEnabled,
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const book = await Book.create({
      title,
      slug,
      author,
      description,
      categoryId,
      publisher: publisher || 'Independent',
      isbn: isbn || '',
      language: language || 'English',
      pages: Number(pages) || 0,
      type,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      pricing: {
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        currency: 'INR',
      },
      physical: type === 'physical' ? { stock: Number(stock) || 0, sku: sku || `SKU-${Date.now().toString().slice(-6)}` } : undefined,
      digital: type === 'ebook' ? {
        fileKey: fileKey || 'sample-ebook.pdf',
        fileFormat: fileFormat || 'pdf',
        fileSize: 1024 * 1024 * 2,
        downloadEnabled: downloadEnabled !== false,
      } : undefined,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isBestSeller: isBestSeller === true || isBestSeller === 'true',
      status: status || 'published',
    });

    res.status(201).json({ success: true, message: 'Book created successfully', data: { book } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create book', error: error.message });
  }
};

export const updateBook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    if (data.title) book.title = data.title;
    if (data.author) book.author = data.author;
    if (data.description !== undefined) book.description = data.description;
    if (data.categoryId) book.categoryId = data.categoryId;
    if (data.publisher) book.publisher = data.publisher;
    if (data.isbn !== undefined) book.isbn = data.isbn;
    if (data.language) book.language = data.language;
    if (data.pages !== undefined) book.pages = Number(data.pages);
    if (data.coverImage) book.coverImage = data.coverImage;
    if (data.status) book.status = data.status;

    if (data.price !== undefined || data.originalPrice !== undefined) {
      book.pricing.price = Number(data.price ?? book.pricing.price);
      book.pricing.originalPrice = Number(data.originalPrice ?? book.pricing.originalPrice);
    }

    if (book.type === 'physical') {
      if (!book.physical) book.physical = { stock: 0, sku: '' };
      if (data.stock !== undefined) book.physical.stock = Number(data.stock);
      if (data.sku) book.physical.sku = data.sku;
    }

    if (book.type === 'ebook') {
      if (!book.digital) book.digital = { fileKey: '', fileFormat: 'pdf', fileSize: 0, downloadEnabled: true };
      if (data.fileKey) book.digital.fileKey = data.fileKey;
      if (data.downloadEnabled !== undefined) book.digital.downloadEnabled = data.downloadEnabled;
    }

    if (data.isFeatured !== undefined) book.isFeatured = Boolean(data.isFeatured);
    if (data.isBestSeller !== undefined) book.isBestSeller = Boolean(data.isBestSeller);

    await book.save();
    res.json({ success: true, message: 'Book updated successfully', data: { book } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update book', error: error.message });
  }
};

export const deleteBook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
};

// --- Category Management ---
export const getAdminCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, message: 'Category created', data: { category } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, displayOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ success: true, message: 'Category updated', data: { category } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booksCount = await Book.countDocuments({ categoryId: id });
    if (booksCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category with ${booksCount} assigned book(s). Reassign them first.`,
      });
      return;
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// --- Order Management ---
export const getAdminOrders = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { orders } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin orders' });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { physicalStatus, courierName, trackingNumber, paymentStatus, digitalStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (physicalStatus) {
      order.physicalStatus = physicalStatus;
      if (physicalStatus === 'Cancelled') {
        // Return physical stock if cancelled
        for (const item of order.items) {
          if (item.type === 'physical') {
            await Book.findByIdAndUpdate(item.bookId, {
              $inc: { 'physical.stock': item.quantity },
            });
          }
        }
      }
    }

    if (courierName || trackingNumber) {
      order.trackingInfo = {
        courierName: courierName || order.trackingInfo?.courierName || '',
        trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber || '',
        updatedAt: new Date(),
      };
    }

    if (paymentStatus) {
      order.payment.status = paymentStatus;
    }

    if (digitalStatus) {
      order.digitalStatus = digitalStatus;
      if (digitalStatus === 'Access Revoked' || digitalStatus === 'Refunded') {
        await DigitalPurchase.updateMany({ orderId: order._id }, { accessStatus: 'revoked' });
      } else if (digitalStatus === 'Available') {
        await DigitalPurchase.updateMany({ orderId: order._id }, { accessStatus: 'active' });
      }
    }

    await order.save();
    res.json({ success: true, message: 'Order status updated successfully', data: { order } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// --- Customer Management ---
export const getAdminCustomers = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { customers } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

export const toggleCustomerActive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.json({
      success: true,
      message: `Customer account ${customer.isActive ? 'activated' : 'deactivated'}`,
      data: { customer },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle customer status' });
  }
};

// --- Coupon Management ---
export const getAdminCoupons = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { coupons } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

export const createCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minimumOrder, expiryDate, usageLimit, isActive } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 0,
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit) || 100,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: { coupon } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create coupon', error: error.message });
  }
};

export const updateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    if (data.code) coupon.code = data.code.toUpperCase().trim();
    if (data.discountType) coupon.discountType = data.discountType;
    if (data.discountValue !== undefined) coupon.discountValue = Number(data.discountValue);
    if (data.minimumOrder !== undefined) coupon.minimumOrder = Number(data.minimumOrder);
    if (data.expiryDate) coupon.expiryDate = new Date(data.expiryDate);
    if (data.usageLimit !== undefined) coupon.usageLimit = Number(data.usageLimit);
    if (data.isActive !== undefined) coupon.isActive = Boolean(data.isActive);

    await coupon.save();
    res.json({ success: true, message: 'Coupon updated successfully', data: { coupon } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

// --- Homepage Management ---
export const getHomepageConfig = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let configDoc = await HomepageConfig.findOne();
    if (!configDoc) {
      configDoc = await HomepageConfig.create({
        hero: {
          heading: 'Discover Your Next Favourite Book',
          description: 'Explore thousands of stories, ideas, and knowledge. Find the perfect book for every moment.',
          buttonText: 'Explore Books',
          buttonLink: '/books',
          imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200',
        },
      });
    }
    res.json({ success: true, data: { config: configDoc } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch homepage configuration' });
  }
};

export const updateHomepageConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    let configDoc = await HomepageConfig.findOne();
    if (!configDoc) {
      configDoc = new HomepageConfig();
    }

    if (data.hero) configDoc.hero = { ...configDoc.hero, ...data.hero };
    if (data.promoBanner) configDoc.promoBanner = { ...configDoc.promoBanner, ...data.promoBanner };
    if (data.featuredCategorySlugs) configDoc.featuredCategorySlugs = data.featuredCategorySlugs;

    await configDoc.save();
    res.json({ success: true, message: 'Homepage configuration updated', data: { config: configDoc } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update homepage config' });
  }
};
