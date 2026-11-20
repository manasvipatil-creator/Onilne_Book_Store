import { Router } from 'express';
import { getMyEbooks, downloadEbook } from '../controllers/ebookController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMyEbooks);
router.get('/:bookId/download', downloadEbook);

export default router;
