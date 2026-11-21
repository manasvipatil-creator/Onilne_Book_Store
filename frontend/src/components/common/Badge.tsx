import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'paperback' | 'ebook' | 'bestseller' | 'discount' | 'success' | 'warning' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  icon,
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-lg tracking-wide shadow-xs';

  const variants = {
    paperback: 'bg-navy text-white',
    ebook: 'bg-sky-600 text-white',
    bestseller: 'bg-golden text-navy',
    discount: 'bg-rose-500 text-white',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    gold: 'bg-golden-subtle text-golden-dark border border-golden/30',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
