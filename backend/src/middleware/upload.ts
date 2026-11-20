import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let dest = path.resolve(process.cwd(), 'uploads');
    if (file.fieldname === 'cover') {
      dest = path.resolve(dest, 'covers');
    } else if (file.fieldname === 'ebook') {
      dest = path.resolve(dest, 'ebooks');
    }
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
