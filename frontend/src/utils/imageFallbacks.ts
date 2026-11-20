// Reusable image constants and error fallback handlers

export const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200';

export const DEFAULT_BOOK_COVER =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

// Clean inline SVG data URL that never fails regardless of network connectivity
export const FALLBACK_BOOK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23243B53"/><rect x="15" y="15" width="270" height="370" rx="10" fill="%23334E68" stroke="%23E6A23C" stroke-width="2"/><circle cx="150" cy="165" r="45" fill="%23E6A23C" fill-opacity="0.15"/><path d="M125 145h50v40h-50z" fill="none" stroke="%23E6A23C" stroke-width="3"/><path d="M125 158h50M125 170h35" stroke="%23E6A23C" stroke-width="2"/><text x="150" y="240" fill="%23FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">ONLINE BOOK STORE</text><text x="150" y="265" fill="%23E6A23C" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle">Premium Edition</text></svg>';

export const FALLBACK_HERO_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23102A43"/><rect x="30" y="30" width="740" height="540" rx="16" fill="%23243B53" stroke="%23334E68" stroke-width="4"/><circle cx="400" cy="260" r="80" fill="%23E6A23C" fill-opacity="0.15"/><path d="M360 220h80v80h-80z" fill="none" stroke="%23E6A23C" stroke-width="4"/><path d="M360 245h80M360 270h55" stroke="%23E6A23C" stroke-width="3"/><text x="400" y="380" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">DISCOVER GREAT BOOKS</text><text x="400" y="420" fill="%23E6A23C" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">Thousands of physical books and instant digital eBooks</text></svg>';

export const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  if (e.currentTarget.src !== FALLBACK_BOOK_SVG) {
    e.currentTarget.src = FALLBACK_BOOK_SVG;
  }
};

export const handleHeroImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  if (e.currentTarget.src !== DEFAULT_HERO_IMAGE && e.currentTarget.src !== FALLBACK_HERO_SVG) {
    e.currentTarget.src = DEFAULT_HERO_IMAGE;
  } else if (e.currentTarget.src === DEFAULT_HERO_IMAGE) {
    e.currentTarget.src = FALLBACK_HERO_SVG;
  }
};
