import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Book } from '../models/Book.js';
import { Coupon } from '../models/Coupon.js';
import { HomepageConfig } from '../models/HomepageConfig.js';
import { config } from '../config/env.js';

export const seedInitialData = async (): Promise<void> => {
  try {
    // 1. Ensure Admin exists
    const adminExists = await User.findOne({ email: config.admin.email.toLowerCase() });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(config.admin.password, salt);
      await User.create({
        name: config.admin.name,
        email: config.admin.email.toLowerCase(),
        mobile: '9876543210',
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      console.log(`[Seed] Default Admin account created: ${config.admin.email}`);
    }

    // 2. Ensure Categories exist (At least 10 required)
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categories = [
        { name: 'Fiction', slug: 'fiction', description: 'Imaginative literature, novels, and gripping stories', displayOrder: 1, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400' },
        { name: 'Non-Fiction', slug: 'non-fiction', description: 'Real-world knowledge, essays, and factual insights', displayOrder: 2, image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400' },
        { name: 'Education', slug: 'education', description: 'Academic textbooks, references, and learning materials', displayOrder: 3, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400' },
        { name: 'Technology', slug: 'technology', description: 'Programming, artificial intelligence, and computing', displayOrder: 4, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400' },
        { name: 'Business', slug: 'business', description: 'Entrepreneurship, leadership, economics, and finance', displayOrder: 5, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400' },
        { name: 'Self-Help', slug: 'self-help', description: 'Personal development, habits, mindset, and motivation', displayOrder: 6, image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400' },
        { name: 'Biography', slug: 'biography', description: 'Inspiring life stories of visionary leaders and thinkers', displayOrder: 7, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400' },
        { name: 'History', slug: 'history', description: 'Ancient civilizations, world wars, and milestones', displayOrder: 8, image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400' },
        { name: 'Children Books', slug: 'children-books', description: 'Delightful tales, illustrations, and early learning', displayOrder: 9, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400' },
        { name: 'Competitive Exams', slug: 'competitive-exams', description: 'Civil services, engineering, banking, and entrance tests', displayOrder: 10, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' },
      ];
      await Category.insertMany(categories);
      console.log(`[Seed] 10 Categories successfully seeded.`);
    }

    // 3. Ensure Books exist (At least 15 sample books with physical & ebooks)
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      const categoriesMap = await Category.find();
      const getCatId = (slug: string) => categoriesMap.find((c) => c.slug === slug)?._id;

      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          slug: 'the-great-gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A classic of twentieth-century literature, exploring decadence, idealism, and the American dream in the Jazz Age.',
          categoryId: getCatId('fiction'),
          publisher: 'Scribner',
          isbn: '9780743273565',
          language: 'English',
          pages: 180,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 349, originalPrice: 499, currency: 'INR' },
          physical: { stock: 25, sku: 'BOOK-FIC-001' },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          slug: 'clean-code',
          author: 'Robert C. Martin',
          description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
          categoryId: getCatId('technology'),
          publisher: 'Prentice Hall',
          isbn: '9780132350884',
          language: 'English',
          pages: 464,
          type: 'ebook',
          coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 499, originalPrice: 899, currency: 'INR' },
          digital: { fileKey: 'clean-code-sample.pdf', fileFormat: 'pdf', fileSize: 3500000, downloadEnabled: true },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Atomic Habits',
          slug: 'atomic-habits',
          author: 'James Clear',
          description: 'An easy & proven way to build good habits and break bad ones. The definitive guide on human behavior.',
          categoryId: getCatId('self-help'),
          publisher: 'Avery',
          isbn: '9780735211292',
          language: 'English',
          pages: 320,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 420, originalPrice: 650, currency: 'INR' },
          physical: { stock: 40, sku: 'BOOK-SLF-001' },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Zero to One: Notes on Startups',
          slug: 'zero-to-one',
          author: 'Peter Thiel',
          description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to build.',
          categoryId: getCatId('business'),
          publisher: 'Crown Business',
          isbn: '9780804139298',
          language: 'English',
          pages: 224,
          type: 'ebook',
          coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 299, originalPrice: 550, currency: 'INR' },
          digital: { fileKey: 'zero-to-one-sample.pdf', fileFormat: 'pdf', fileSize: 2200000, downloadEnabled: true },
          isFeatured: true,
          isBestSeller: false,
          status: 'published',
        },
        {
          title: 'Sapiens: A Brief History of Humankind',
          slug: 'sapiens',
          author: 'Yuval Noah Harari',
          description: 'From examining the role that evolving humans have played in the global ecosystem to charting the rise of empires.',
          categoryId: getCatId('history'),
          publisher: 'Harper',
          isbn: '9780062316097',
          language: 'English',
          pages: 464,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 549, originalPrice: 799, currency: 'INR' },
          physical: { stock: 15, sku: 'BOOK-HIS-001' },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Steve Jobs',
          slug: 'steve-jobs-biography',
          author: 'Walter Isaacson',
          description: 'The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs conducted over two years.',
          categoryId: getCatId('biography'),
          publisher: 'Simon & Schuster',
          isbn: '9781451648539',
          language: 'English',
          pages: 656,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 620, originalPrice: 899, currency: 'INR' },
          physical: { stock: 8, sku: 'BOOK-BIO-001' },
          isFeatured: false,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Designing Data-Intensive Applications',
          slug: 'designing-data-intensive-applications',
          author: 'Martin Kleppmann',
          description: 'The big ideas behind reliable, scalable, and maintainable systems for modern enterprise architectures.',
          categoryId: getCatId('technology'),
          publisher: "O'Reilly Media",
          isbn: '9781449373320',
          language: 'English',
          pages: 616,
          type: 'ebook',
          coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 699, originalPrice: 1299, currency: 'INR' },
          digital: { fileKey: 'ddia-sample.pdf', fileFormat: 'pdf', fileSize: 6200000, downloadEnabled: true },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Thinking, Fast and Slow',
          slug: 'thinking-fast-and-slow',
          author: 'Daniel Kahneman',
          description: 'A tour of the mind explaining the two systems that drive the way we think and make life-defining decisions.',
          categoryId: getCatId('non-fiction'),
          publisher: 'Farrar, Straus and Giroux',
          isbn: '9780374533557',
          language: 'English',
          pages: 512,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 399, originalPrice: 599, currency: 'INR' },
          physical: { stock: 3, sku: 'BOOK-NF-001' }, // Low stock sample
          isFeatured: false,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'The Psychology of Money',
          slug: 'psychology-of-money',
          author: 'Morgan Housel',
          description: 'Timeless lessons on wealth, greed, and happiness doing well with money has a little to do with how smart you are.',
          categoryId: getCatId('business'),
          publisher: 'Harriman House',
          isbn: '9780857197689',
          language: 'English',
          pages: 256,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 320, originalPrice: 450, currency: 'INR' },
          physical: { stock: 18, sku: 'BOOK-BUS-002' },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'The Little Prince',
          slug: 'the-little-prince',
          author: 'Antoine de Saint-Exupéry',
          description: 'A poetic tale with watercolor illustrations by the author, in which a pilot stranded in the desert meets a young prince.',
          categoryId: getCatId('children-books'),
          publisher: 'Reynal & Hitchcock',
          isbn: '9780156012195',
          language: 'English',
          pages: 96,
          type: 'ebook',
          coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 199, originalPrice: 299, currency: 'INR' },
          digital: { fileKey: 'little-prince-sample.pdf', fileFormat: 'pdf', fileSize: 1800000, downloadEnabled: true },
          isFeatured: false,
          isBestSeller: false,
          status: 'published',
        },
        {
          title: 'Cracking the Coding Interview',
          slug: 'cracking-the-coding-interview',
          author: 'Gayle Laakmann McDowell',
          description: '189 programming questions and solutions to pass your tech interviews at Google, Amazon, and top firms.',
          categoryId: getCatId('competitive-exams'),
          publisher: 'CareerCup',
          isbn: '9780984782857',
          language: 'English',
          pages: 687,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 799, originalPrice: 1199, currency: 'INR' },
          physical: { stock: 12, sku: 'BOOK-EXAM-001' },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'Deep Work: Rules for Focused Success in a Distracted World',
          slug: 'deep-work',
          author: 'Cal Newport',
          description: 'Master the ability to focus without distraction on a cognitively demanding task to thrive in modern economy.',
          categoryId: getCatId('self-help'),
          publisher: 'Grand Central Publishing',
          isbn: '9781455586691',
          language: 'English',
          pages: 304,
          type: 'ebook',
          coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 349, originalPrice: 599, currency: 'INR' },
          digital: { fileKey: 'deep-work-sample.pdf', fileFormat: 'pdf', fileSize: 2900000, downloadEnabled: true },
          isFeatured: false,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'A Brief History of Time',
          slug: 'a-brief-history-of-time',
          author: 'Stephen Hawking',
          description: 'From the big bang to black holes, Hawking discusses the profound questions of space, time, and cosmos.',
          categoryId: getCatId('education'),
          publisher: 'Bantam Books',
          isbn: '9780553380163',
          language: 'English',
          pages: 212,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 449, originalPrice: 599, currency: 'INR' },
          physical: { stock: 22, sku: 'BOOK-EDU-001' },
          isFeatured: false,
          isBestSeller: false,
          status: 'published',
        },
        {
          title: 'To Kill a Mockingbird',
          slug: 'to-kill-a-mockingbird',
          author: 'Harper Lee',
          description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
          categoryId: getCatId('fiction'),
          publisher: 'J. B. Lippincott & Co.',
          isbn: '9780061120084',
          language: 'English',
          pages: 281,
          type: 'physical',
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 299, originalPrice: 450, currency: 'INR' },
          physical: { stock: 14, sku: 'BOOK-FIC-002' },
          isFeatured: true,
          isBestSeller: true,
          status: 'published',
        },
        {
          title: 'The Pragmatic Programmer: Your Journey to Mastery',
          slug: 'the-pragmatic-programmer',
          author: 'David Thomas, Andrew Hunt',
          description: 'Straight from the programming trenches, cutting through the fluff to examine the core of the development process.',
          categoryId: getCatId('technology'),
          publisher: 'Addison-Wesley Professional',
          isbn: '9780135957059',
          language: 'English',
          pages: 352,
          type: 'ebook',
          coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
          pricing: { price: 599, originalPrice: 999, currency: 'INR' },
          digital: { fileKey: 'pragmatic-prog-sample.pdf', fileFormat: 'pdf', fileSize: 4100000, downloadEnabled: true },
          isFeatured: true,
          isBestSeller: false,
          status: 'published',
        },
      ];

      await Book.insertMany(sampleBooks);
      console.log(`[Seed] 15 Sample Books seeded (Both physical & eBooks).`);
    }

    // 4. Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany([
        {
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          minimumOrder: 299,
          expiryDate: new Date('2028-12-31'),
          usageLimit: 500,
          isActive: true,
        },
        {
          code: 'READMORE',
          discountType: 'fixed',
          discountValue: 100,
          minimumOrder: 699,
          expiryDate: new Date('2028-12-31'),
          usageLimit: 300,
          isActive: true,
        },
      ]);
      console.log(`[Seed] Promotional Coupons seeded.`);
    }

    // 5. Seed Homepage Config
    const homeConfig = await HomepageConfig.findOne();
    if (!homeConfig) {
      await HomepageConfig.create({
        hero: {
          heading: 'Discover Your Next Favourite Book',
          description: 'Explore thousands of stories, ideas, and knowledge. Find the perfect book for every moment.',
          buttonText: 'Explore Books',
          buttonLink: '/books',
          imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200',
        },
        promoBanner: {
          active: true,
          title: 'Special Reading Festival',
          subtitle: 'Get up to 40% discount on select best-selling paperbacks and instant eBooks',
          discountText: 'USE CODE: READMORE',
          buttonText: 'Shop Offers',
          buttonLink: '/books?offers=true',
        },
      });
      console.log(`[Seed] Homepage configuration seeded.`);
    }
  } catch (error) {
    console.error('[Seed] Error running seed script:', error);
  }
};
