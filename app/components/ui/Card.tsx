import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
};

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const variantStyles = {
    default: 'card',
    elevated: 'card shadow-elevated',
    outlined: 'bg-surface border-2 border-strong',
  }[variant];

  const hoverStyles = hover ? 'card-hover' : '';

  return (
    <div className={`${variantStyles} ${paddingStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
