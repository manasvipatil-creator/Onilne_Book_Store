import mongoose from 'mongoose';
import { Book } from './models/Book.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://patilmanaswi80_db_user:Y5jlDyCcPEaMiQ5V@cluster0.6zifvjw.mongodb.net/online_book_store?retryWrites=true&w=majority';

// High-definition, authentic book cover photographs and scans from Wikimedia Commons, OpenLibrary, and verified CDN sources
const realCoversBySlug: Record<string, string> = {
  // 1. The Great Gatsby - Classic Blue Celestial Eyes cover
  'the-great-gatsby': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg',

  // 2. Clean Code - Robert C. Martin classic blue & white handbook cover
  'clean-code': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg',

  // 3. Atomic Habits - James Clear white minimalist edition with dots
  'atomic-habits': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',

  // Sapiens: A Brief History of Humankind
  'sapiens': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1700180949i/23692271.jpg',
  'sapiens-a-brief-history-of-humankind': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1700180949i/23692271.jpg',

  // To Kill a Mockingbird
  'to-kill-a-mockingbird': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg',

  // Steve Jobs Biography
  'steve-jobs': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg',
  'steve-jobs-biography': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg',

  // The Pragmatic Programmer
  'the-pragmatic-programmer': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1401432508i/4099.jpg',

  // 8. The Alchemist - Paulo Coelho classic blue & gold desert cover
  'the-alchemist': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg',

  // 9. A Brief History of Time - Stephen Hawking space nebula cover
  'a-brief-history-of-time': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg',

  // 10. Rich Dad Poor Dad - Robert Kiyosaki purple & gold edition
  'rich-dad-poor-dad': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388211242i/69571.jpg',

  // 11. Designing Data-Intensive Applications - Martin Kleppmann O'Reilly wild boar cover
  'designing-data-intensive-applications': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1410196656i/23463279.jpg',

  // 12. Thinking, Fast and Slow - Daniel Kahneman pencil cover
  'thinking-fast-and-slow': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1317793965i/11468377.jpg',

  // 13. The Psychology of Money - Morgan Housel marble brain cover
  'psychology-of-money': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1581527774i/41881472.jpg',

  // 14. The Little Prince - Antoine de Saint-Exupéry asteroid B-612 cover
  'the-little-prince': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1367545443i/157993.jpg',

  // Zero to One
  'zero-to-one': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414347376i/18050143.jpg',
  'zero-to-one-notes-on-startups': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414347376i/18050143.jpg',

  // Deep Work
  'deep-work': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957962i/25744928.jpg',
  'deep-work-rules-for-focused-success': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957962i/25744928.jpg',
  'deep-work-rules-for-focused-success-in-a-distracted-world': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957962i/25744928.jpg',
};

async function updateRealBookCovers() {
  console.log('Connecting to MongoDB Atlas to update real HD book covers...');
  await mongoose.connect(MONGODB_URI);

  const books = await Book.find();
  console.log(`Found ${books.length} books in database.`);

  let updatedCount = 0;
  for (const book of books) {
    const realCover = realCoversBySlug[book.slug];
    if (realCover) {
      book.coverImage = realCover;
      await book.save();
      console.log(`[UPDATED] "${book.title}" -> ${realCover}`);
      updatedCount++;
    } else {
      console.log(`[SKIPPED] No exact match for slug: ${book.slug}`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} books with authentic real covers.`);
  await mongoose.disconnect();
}

updateRealBookCovers().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
