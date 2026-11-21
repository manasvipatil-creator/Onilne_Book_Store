import { Request, Response } from 'express';
import { Book } from '../models/Book.js';
import { Category } from '../models/Category.js';

export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      type,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      featured,
      bestseller,
    } = req.query;

    const query: any = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        query.categoryId = catDoc._id;
      }
    }

    if (type && (type === 'physical' || type === 'ebook')) {
      query.type = type;
    }

    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.price'].$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (bestseller === 'true') {
      query.isBestSeller = true;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { 'pricing.price': 1 };
    else if (sort === 'price_desc') sortOption = { 'pricing.price': -1 };
    else if (sort === 'popularity' || sort === 'bestseller') sortOption = { isBestSeller: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('categoryId', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
};

export const getBookBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    let book = await Book.findOne({ slug, status: 'published' }).populate('categoryId', 'name slug');
    
    // Fallback: If not found by slug and slug looks like a valid Mongo ObjectId, try searching by _id
    if (!book && slug.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findOne({ _id: slug, status: 'published' }).populate('categoryId', 'name slug');
    }

    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    // Fetch related books from the same category
    const relatedBooks = await Book.find({
      categoryId: book.categoryId,
      _id: { $ne: book._id },
      status: 'published',
    })
      .limit(4)
      .select('title slug author pricing coverImage type');

    res.json({
      success: true,
      data: {
        book,
        relatedBooks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch book details' });
  }
};

export const getFeaturedBooks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find({ isFeatured: true, status: 'published' })
      .populate('categoryId', 'name slug')
      .limit(8);
    res.json({ success: true, data: { books } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured books' });
  }
};

export const getBestSellers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find({ isBestSeller: true, status: 'published' })
      .populate('categoryId', 'name slug')
      .limit(8);
    res.json({ success: true, data: { books } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bestsellers' });
  }
};

export const getNewArrivals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find({ status: 'published' })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ success: true, data: { books } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch new arrivals' });
  }
};
