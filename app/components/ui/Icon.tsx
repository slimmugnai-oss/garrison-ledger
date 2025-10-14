import { icons, LucideProps } from 'lucide-react';
import { FC } from 'react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons;
  className?: string;
}

/**
 * Dynamic icon wrapper for lucide-react icons
 * 
 * Usage:
 * <Icon name="truck" className="h-5 w-5 text-muted" />
 * <Icon name="briefcase" className="h-6 w-6 text-blue-600" />
 */
const Icon: FC<IconProps> = ({ name, className = "h-5 w-5", ...props }) => {
  const LucideIcon = icons[name];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }
  
  return <LucideIcon className={className} {...props} />;
};

export default Icon;

