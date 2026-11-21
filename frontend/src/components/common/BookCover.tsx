import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // defaults to aspect-[3/4]
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export const BookCover: React.FC<BookCoverProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[3/4]',
  loading = 'lazy',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source or failed to load, show fallback placeholder
  if (!src || hasError) {
    return (
      <div
        className={`w-full ${aspectRatio} rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex flex-col items-center justify-center p-3 text-center select-none overflow-hidden ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center mb-2">
          <BookOpen className="w-5 h-5 text-golden" />
        </div>
        <p className="text-[11px] font-serif font-bold text-navy line-clamp-3 leading-snug px-1">
          {alt || 'Book Cover'}
        </p>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
          No Preview
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden bg-slate-100 ${className}`}>
      {/* Shimmer / Skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
