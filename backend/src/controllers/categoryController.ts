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
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: { category } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch category details' });
  }
};
