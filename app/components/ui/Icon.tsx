'use client';

import * as Icons from 'lucide-react';
import { FC } from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Dynamic icon wrapper for lucide-react icons
 * 
 * Usage:
 * <Icon name="Truck" className="h-5 w-5 text-gray-700" />
 * <Icon name="Briefcase" className="h-6 w-6 text-blue-600" />
 */
const Icon: FC<IconProps> = ({ name, className = "h-5 w-5", size, strokeWidth }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`Icon "${name}" not found in lucide-react. Available icons include: Truck, Briefcase, etc.`);
    return null;
  }
  
  return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
};

export default Icon;
