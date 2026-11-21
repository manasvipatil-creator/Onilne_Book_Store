import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light focus:ring-navy shadow-sm hover:shadow',
    secondary: 'bg-navy-subtle text-navy hover:bg-slate-200 focus:ring-navy',
    outline: 'border-2 border-borderMuted text-navy hover:border-navy hover:bg-slate-50 focus:ring-navy',
    ghost: 'text-textPrimary hover:bg-slate-100 hover:text-navy focus:ring-slate-300',
    gold: 'bg-golden text-navy hover:bg-golden-light focus:ring-golden shadow-sm hover:shadow-md',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
