import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Book } from '../models/Book.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.bookId',
      select: 'title slug author pricing coverImage type physical digital status',
    });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Filter out books that have been deleted or drafts
    const validItems = cart.items.filter(
      (item: any) => item.bookId && item.bookId.status === 'published'
    );

    let subtotal = 0;
    let totalItems = 0;

    const formattedItems = validItems.map((item: any) => {
      const book = item.bookId;
      const price = book.pricing?.price || 0;
      const originalPrice = book.pricing?.originalPrice || price;
      const quantity = book.type === 'ebook' ? 1 : item.quantity;
      const itemSubtotal = price * quantity;

      subtotal += itemSubtotal;
      totalItems += quantity;

      return {
        book: {
          id: book._id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          coverImage: book.coverImage,
          type: book.type,
          price,
          originalPrice,
          stock: book.physical?.stock ?? 0,
        },
        quantity,
        subtotal: itemSubtotal,
      };
    });

    res.json({
      success: true,
      data: {
        items: formattedItems,
        subtotal,
        totalItems,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart', error: error.message });
  }
};

export const addItemToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bookId, quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book || book.status !== 'published') {
      res.status(404).json({ success: false, message: 'Book not found or unavailable' });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === bookId.toString()
    );

    if (book.type === 'ebook') {
      // eBooks must strictly have quantity 1 and no duplicate entries
      if (existingItemIndex > -1) {
        res.status(400).json({ success: false, message: 'This eBook is already in your cart' });
        return;
      }
      cart.items.push({ bookId: new mongoose.Types.ObjectId(bookId), quantity: 1 });
    } else {
      // Physical book
      const requestedQty = parseInt(quantity, 10);
      const currentQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
      const newTotalQty = currentQty + requestedQty;

      if ((book.physical?.stock ?? 0) < newTotalQty) {
        res.status(400).json({
          success: false,
          message: `Only ${book.physical?.stock || 0} copies currently in stock`,
        });
        return;
      }

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = newTotalQty;
      } else {
        cart.items.push({ bookId: new mongoose.Types.ObjectId(bookId), quantity: requestedQty });
      }
    }

    await cart.save();
    res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add item to cart', error: error.message });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;
    const { quantity } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    const item = cart.items.find((i) => i.bookId.toString() === bookId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not in cart' });
      return;
    }

    if (book.type === 'ebook') {
      item.quantity = 1;
    } else {
      const newQty = Math.max(1, parseInt(quantity, 10));
      if ((book.physical?.stock ?? 0) < newQty) {
        res.status(400).json({
          success: false,
          message: `Cannot increase quantity. Only ${book.physical?.stock || 0} in stock.`,
        });
        return;
      }
      item.quantity = newQty;
    }

    await cart.save();
    res.json({ success: true, message: 'Cart item updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter((item) => item.bookId.toString() !== bookId);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
