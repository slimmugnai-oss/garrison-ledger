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

// Card sub-components
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
