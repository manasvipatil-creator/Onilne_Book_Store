import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  actionTo?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  actionLink,
  actionTo,
  className = '',
}) => {
  const label = actionLabel || actionText;
  const targetLink = actionTo || actionLink;

  const renderIcon = () => {
    if (!icon) return <BookOpen className="w-8 h-8 text-golden" />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="w-8 h-8 text-golden" />;
    }
    return null;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-surface border border-dashed border-borderMuted ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-navy-subtle flex items-center justify-center text-navy mb-4 shadow-inner">
        {renderIcon()}
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy">{title}</h3>
      <p className="text-sm text-textSecondary max-w-md mt-1.5 mb-6">{description}</p>
      {label && (
        targetLink ? (
          <Link to={targetLink}>
            <Button variant="primary">{label}</Button>
          </Link>
        ) : onAction ? (
          <Button variant="primary" onClick={onAction}>
            {label}
          </Button>
        ) : null
      )}
    </div>
  );
};
