import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  icon?: 'DollarSign' | 'Users' | 'TrendingUp' | 'Target' | 'CheckCircle' | 'Activity' | 'Zap' | 'Crown';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  delay?: number;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-card border-border',
  success: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200',
  warning: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200',
  danger: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200',
  info: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
};

const variantTextColors = {
  default: 'text-text-headings',
  success: 'text-green-900',
  warning: 'text-amber-900',
  danger: 'text-red-900',
  info: 'text-blue-900',
};

const variantIconColors = {
  default: 'text-primary',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
};

const variantSubtitleColors = {
  default: 'text-text-muted',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  info: 'text-blue-700',
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  delay = 0,
  onClick,
}: MetricCardProps) {
  const content = (
    <AnimatedCard
      delay={delay}
      className={`
        ${variantStyles[variant]} border-2 p-6 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold uppercase tracking-wide ${variantSubtitleColors[variant]}`}>
          {title}
        </span>
        {icon && <Icon name={icon} className={`h-5 w-5 ${variantIconColors[variant]}`} />}
      </div>

      <div className={`text-3xl font-black ${variantTextColors[variant]} mb-1`}>
        {value}
      </div>

      {subtitle && (
        <div className={`text-sm ${variantSubtitleColors[variant]}`}>
          {subtitle}
        </div>
      )}

      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.direction === 'up' && (
            <Icon name="TrendingUp" className="h-4 w-4 text-success" />
          )}
          {trend.direction === 'down' && (
            <Icon name="TrendingDown" className="h-4 w-4 text-danger" />
          )}
          <span className={`text-sm font-semibold ${
            trend.direction === 'up' ? 'text-success' : 
            trend.direction === 'down' ? 'text-danger' : 
            'text-text-muted'
          }`}>
            {trend.value}
          </span>
        </div>
      )}
    </AnimatedCard>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {content}
      </div>
    );
  }

  return content;
}

