type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
};

export default function Badge({ children, variant = 'primary' }: Props) {
  const styles = {
    primary: 'bg-primary-accent/10 text-primary-accent border-primary-accent/20',
    secondary: 'bg-gray-100 text-text-muted border-border',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-300',
  }[variant];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles}`}>
      {children}
    </span>
  );
}

