import { Request, Response } from 'express';
import { Category } from '../models/Category.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    let category = await Category.findOne({ slug, isActive: true });
    
    // Fallback: If not found by slug and slug looks like a valid Mongo ObjectId, try searching by _id
    if (!category && slug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findOne({ _id: slug, isActive: true });
    }

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: { category } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch category details' });
  }
};
