export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  socials: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'BookStore',
  tagline: 'Read • Learn • Grow',
  description:
    'Your premier destination for classic literature, contemporary fiction, academic resources, and instant digital eBooks.',
  contact: {
    email: 'support@bookstore.in',
    phone: '+91 (800) 123-4567',
    address: '42 Heritage Book Lane, Knowledge Park, Bengaluru, Karnataka 560001',
    hours: 'Monday – Saturday: 9:00 AM – 8:00 PM IST',
  },
  socials: {
    twitter: 'https://twitter.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  },
};
