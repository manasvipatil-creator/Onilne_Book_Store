import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { DigitalPurchase } from '../models/DigitalPurchase.js';
import { Book } from '../models/Book.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getMyEbooks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const purchases = await DigitalPurchase.find({
      userId,
      accessStatus: 'active',
    })
      .populate('bookId', 'title slug author coverImage pricing digital')
      .populate('orderId', 'orderNumber createdAt')
      .sort({ purchasedAt: -1 });

    const ebooks = purchases
      .filter((p) => p.bookId != null)
      .map((p: any) => ({
        purchaseId: p._id,
        purchasedAt: p.purchasedAt,
        orderNumber: p.orderId?.orderNumber,
        book: {
          id: p.bookId._id,
          title: p.bookId.title,
          slug: p.bookId.slug,
          author: p.bookId.author,
          coverImage: p.bookId.coverImage,
          format: p.bookId.digital?.fileFormat || 'pdf',
          size: p.bookId.digital?.fileSize || 0,
        },
      }));

    res.json({ success: true, data: { ebooks } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch purchased eBooks' });
  }
};

export const downloadEbook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;

    // Strict ownership & status check
    const purchase = await DigitalPurchase.findOne({
      userId,
      bookId,
      accessStatus: 'active',
    });

    if (!purchase) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You have not purchased this eBook or access has been revoked.',
      });
      return;
    }

    const book = await Book.findById(bookId);
    if (!book || !book.digital?.downloadEnabled) {
      res.status(404).json({ success: false, message: 'Digital file unavailable or disabled.' });
      return;
    }

    const filePath = path.resolve(process.cwd(), 'uploads', 'ebooks', book.digital.fileKey);

    // If actual file does not exist on disk, stream generated demo secure eBook buffer
    if (!fs.existsSync(filePath)) {
      const demoContent = Buffer.from(
        `%PDF-1.4\n% Online Book Store Protected Delivery\nBook Title: ${book.title}\nAuthor: ${book.author}\nLicensed to: User (${userId})\nPurchase Date: ${purchase.purchasedAt.toISOString()}\n\nEnjoy reading your eBook!`,
        'utf-8'
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${book.slug}.pdf"`);
      res.send(demoContent);
      return;
    }

    res.download(filePath, `${book.slug}.${book.digital.fileFormat || 'pdf'}`);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error initiating digital download' });
  }
};
