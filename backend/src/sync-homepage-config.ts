import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { HomepageConfig } from './models/HomepageConfig.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://patilmanaswi80_db_user:Y5jlDyCcPEaMiQ5V@cluster0.6zifvjw.mongodb.net/online_book_store?retryWrites=true&w=majority';

async function syncHomepageConfig() {
  console.log('Connecting to MongoDB Atlas to sync HomepageConfig with live storefront...');
  await mongoose.connect(MONGODB_URI);

  let config = await HomepageConfig.findOne();
  if (!config) {
    config = new HomepageConfig();
  }

  // Set exact BOOKORA values that match the home page
  config.hero = {
    heading: 'Your Favorite Books, Anytime!',
    description: 'Discover a world of knowledge and imagination with BOOKORA.',
    buttonText: 'Explore Books',
    buttonLink: '/books',
    imageUrl: '/bookora-hero.jpg',
  };

  config.promoBanner = {
    active: true,
    title: 'Free Shipping Across India',
    subtitle: '100% Genuine Publisher Prints Delivered in 2-4 Days',
    discountText: 'USE CODE: WELCOME10',
    buttonText: 'Explore Collection',
    buttonLink: '/books',
  };

  await config.save();
  console.log('HomepageConfig successfully updated in MongoDB:');
  console.log(JSON.stringify(config, null, 2));

  await mongoose.disconnect();
}

syncHomepageConfig().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
