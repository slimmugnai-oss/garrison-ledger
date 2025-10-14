'use client';

import { FC } from 'react';
import { iconRegistry, IconName, type LucideIcon } from './icon-registry';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}

/**
 * Type-safe icon wrapper for lucide-react icons
 * 
 * Usage:
 * <Icon name="Truck" className="h-5 w-5 text-gray-700" />
 * <Icon name="Briefcase" className="h-6 w-6 text-blue-600" />
 * 
 * Features:
 * - Full TypeScript autocomplete
 * - Compile-time error checking for invalid icon names
 * - Tree-shaking (only used icons are bundled)
 * - Consistent default styling
 */
const Icon: FC<IconProps> = ({ 
  name, 
  className = "h-5 w-5", 
  size, 
  strokeWidth,
  absoluteStrokeWidth 
}) => {
  const IconComponent = iconRegistry[name] as LucideIcon;
  
  if (!IconComponent) {
    // This should never happen due to TypeScript, but defensive programming
    console.error(`Icon "${name}" not found in registry`);
    return null;
  }
  
  return (
    <IconComponent 
      className={className} 
      size={size} 
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
    />
  );
};

export default Icon;
