import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverLift = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface rounded-2xl border border-borderMuted shadow-sm transition-all duration-300 ${
        hoverLift ? 'hover:-translate-y-1 hover:shadow-soft hover:border-golden/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
