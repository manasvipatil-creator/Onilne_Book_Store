import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // defaults to standard 2:3 book cover ratio: aspect-[2/3]
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export const BookCover: React.FC<BookCoverProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[2/3]',
  loading = 'lazy',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source or failed to load, show premium book cover placeholder
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
    <div
      className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1 sm:p-1.5 ${className}`}
    >
      {/* Shimmer / Skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-xl" />
      )}

      {/* Real HD Book Cover Image with object-contain to prevent cropping and subtle realistic book drop-shadow */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-contain rounded-lg drop-shadow-md transition-all duration-300 group-hover:drop-shadow-xl group-hover:scale-[1.03] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
