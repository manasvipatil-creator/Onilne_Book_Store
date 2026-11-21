import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const baseStyles = 'animate-pulse bg-slate-200/80';
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`} />;
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-2xl border border-borderMuted p-4 space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="text" className="w-4/5 h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="w-1/4 h-5" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </div>
  );
};
