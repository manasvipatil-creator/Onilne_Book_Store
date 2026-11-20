import mongoose, { Document, Schema } from 'mongoose';

export interface IHomepageConfig extends Document {
  hero: {
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
  };
  promoBanner: {
    active: boolean;
    title: string;
    subtitle: string;
    discountText: string;
    buttonText: string;
    buttonLink: string;
  };
  featuredCategorySlugs: string[];
  updatedAt: Date;
}

const homepageConfigSchema = new Schema<IHomepageConfig>(
  {
    hero: {
      heading: { type: String, default: 'Discover Your Next Favourite Book' },
      description: {
        type: String,
        default: 'Explore thousands of stories, ideas, and knowledge. Find the perfect book for every moment.',
      },
      buttonText: { type: String, default: 'Explore Books' },
      buttonLink: { type: String, default: '/books' },
      imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200',
      },
    },
    promoBanner: {
      active: { type: Boolean, default: true },
      title: { type: String, default: 'Special Reading Festival' },
      subtitle: { type: String, default: 'Get up to 40% discount on select best-selling paperbacks and instant eBooks' },
      discountText: { type: String, default: 'USE CODE: READMORE' },
      buttonText: { type: String, default: 'Shop Offers' },
      buttonLink: { type: String, default: '/books?offers=true' },
    },
    featuredCategorySlugs: [{ type: String }],
  },
  { timestamps: true }
);

export const HomepageConfig = mongoose.model<IHomepageConfig>('HomepageConfig', homepageConfigSchema);
