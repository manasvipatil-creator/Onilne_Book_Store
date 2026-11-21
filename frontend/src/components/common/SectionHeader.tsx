import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'View All',
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 ${className}`}>
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-navy">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-textSecondary mt-1 max-w-xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="group inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-navy hover:text-golden transition-colors self-start sm:self-auto"
        >
          <span>{viewAllText}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-golden" />
        </Link>
      )}
    </div>
  );
};
