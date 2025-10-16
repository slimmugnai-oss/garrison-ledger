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
  X,
  Trash2,
  Edit,
  Share2,
  Folder,
  Image,
  File,
  ChevronLeft,
  CheckCircle,
  Upload,
  Download,
  Send,
  
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
  PiggyBank,
  Calculator,
  
  // PCS & Moving
  Truck,
  House,
  Home,
  
  // Shopping & Commissary
  ShoppingCart,
  Monitor,
  
  // Military & Deployment
  Shield,
  
  // Tools & Information
  Wrench,
  Lightbulb,
  AlertTriangle,
  Settings,
  
  // Time
  Timer,
  Calendar,
  
  // Navigation
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Menu,
  
  // User & Interface
  User,
  Users,
  HelpCircle,
  Crown,
  Sparkles,
  
  // Layout & Structure
  LayoutDashboard,
  ClipboardCheck,
  FolderOpen,
  Library,
  MapPin,
  
  // General
  Zap,
  BookOpen,
  ClipboardList,
  Gift,
  
  // Admin & Monitoring (NEW)
  Activity,
  Brain,
  CheckCircle2,
  Circle,
  CreditCard,
  Database,
  ExternalLink,
  Globe,
  Key,
  Mail,
  MessageSquare,
  Rss,
  XCircle,
  
  // Theme Toggle
  Moon,
  Sun,
  
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
  X,
  Trash2,
  Edit,
  Share2,
  Folder,
  Image,
  File,
  CheckCircle,
  Upload,
  Download,
  Send,
  
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
  PiggyBank,
  Calculator,
  
  // PCS & Moving
  Truck,
  House,
  Home,
  
  // Shopping & Commissary
  ShoppingCart,
  Monitor,
  
  // Military & Deployment
  Shield,
  
  // Tools & Information
  Wrench,
  Lightbulb,
  AlertTriangle,
  Settings,
  
  // Time
  Timer,
  Calendar,
  
  // Navigation
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Menu,
  
  // User & Interface
  User,
  Users,
  HelpCircle,
  Crown,
  Sparkles,
  
  // Layout & Structure
  LayoutDashboard,
  ClipboardCheck,
  FolderOpen,
  Library,
  MapPin,
  
  // General
  Zap,
  BookOpen,
  ClipboardList,
  Gift,
  
  // Admin & Monitoring
  Activity,
  Brain,
  CheckCircle2,
  Circle,
  CreditCard,
  Database,
  ExternalLink,
  Globe,
  Key,
  Mail,
  MessageSquare,
  Rss,
  XCircle,
  
  // Theme Toggle
  Moon,
  Sun,
  // Listening Post
  Radio,
  Globe,
  Newspaper,
} as const;

// Export the type of valid icon names
export type IconName = keyof typeof iconRegistry;

// Export Lucide icon type for component props
export type { LucideIcon };

