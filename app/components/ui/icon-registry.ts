/**
 * Centralized Icon Registry
 * 
 * This file explicitly imports and exports all Lucide icons used in the application.
 * Benefits:
 * - Full type safety (no 'any' types)
 * - Tree-shaking works (only used icons bundled)
 * - Self-documenting (clear list of all icons in use)
 * - Autocomplete support in IDE
 * - Compile-time error checking
 */

import {
  // Navigation & Brand
  BarChart,
  
  // Actions & Status
  Check,
  CircleCheck,
  Plus,
  Pencil,
  Lock,
  RefreshCw,
  
  // Business & Career
  Briefcase,
  Target,
  Star,
  
  // Financial
  DollarSign,
  Banknote,
  Landmark,
  TrendingUp,
  TrendingDown,
  
  // PCS & Moving
  Truck,
  House,
  
  // Shopping & Commissary
  ShoppingCart,
  Monitor,
  
  // Military & Deployment
  Shield,
  
  // Tools & Information
  Wrench,
  Lightbulb,
  AlertTriangle,
  
  // Time
  Timer,
  
  // General
  Zap,
  BookOpen,
  ClipboardList,
  
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon Registry - Maps icon names to components
 * Add new icons here as needed
 */
export const iconRegistry = {
  // Navigation & Brand
  BarChart,
  
  // Actions & Status
  Check,
  CircleCheck,
  Plus,
  Pencil,
  Lock,
  RefreshCw,
  
  // Business & Career
  Briefcase,
  Target,
  Star,
  
  // Financial
  DollarSign,
  Banknote,
  Landmark,
  TrendingUp,
  TrendingDown,
  
  // PCS & Moving
  Truck,
  House,
  
  // Shopping & Commissary
  ShoppingCart,
  Monitor,
  
  // Military & Deployment
  Shield,
  
  // Tools & Information
  Wrench,
  Lightbulb,
  AlertTriangle,
  
  // Time
  Timer,
  
  // General
  Zap,
  BookOpen,
  ClipboardList,
} as const;

// Export the type of valid icon names
export type IconName = keyof typeof iconRegistry;

// Export Lucide icon type for component props
export type { LucideIcon };

