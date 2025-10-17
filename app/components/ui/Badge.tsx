type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
};

export default function Badge({ children, variant = 'primary', size = 'md' }: Props) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }[size];

  const variantStyles = {
    primary: 'badge-primary',
    secondary: 'badge-neutral',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-primary', // Using primary for info
    neutral: 'badge-neutral',
  }[variant];

  return (
    <span className={`badge ${variantStyles} ${sizeStyles} font-semibold uppercase tracking-wider`}>
      {children}
    </span>
  );
}

