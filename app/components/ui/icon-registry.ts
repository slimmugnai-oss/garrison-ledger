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
  Monitor,

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
  Quote,
  GraduationCap,
  Cloud,

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
  Building,
  Fuel,
  Bed,
  Utensils,
  Receipt,

  // Shopping & Commissary
  ShoppingCart,

  // Military & Deployment
  Shield,

  // Tools & Information
  Wrench,
  Lightbulb,
  AlertTriangle,
  Settings,
  Command,

  // Time
  Timer,
  Calendar,

  // Navigation
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Menu,
  Grid3x3,
  List,
  RotateCcw,
  CloudOff,

  // User & Interface
  User,
  Users,
  UserPlus,
  HelpCircle,
  Crown,
  Sparkles,

  // Layout & Structure
  LayoutDashboard,
  ClipboardCheck,
  FolderOpen,
  Library,
  MapPin,
  Map,

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
  MessageCircle,
  Rss,
  XCircle,
  Heart,
  Info,
  Link,
  ArrowRight,
  ArrowLeft,
  Copy,
  AlertCircle,

  // Theme Toggle
  Moon,
  Sun,

  // Listening Post
  Radio,
  Newspaper,

  // Export & Sharing
  Printer,
  Camera,
  Loader,
  Archive,
  Save,

  // Additional Icons
  Eye,
  Ban,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon Registry - Maps icon names to components
 * Add new icons here as needed
 */
export const iconRegistry = {
  // Navigation & Brand
  BarChart,
  Monitor,

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
  Quote,
  Heart,
  Info,
  Link,
  ArrowRight,
  ArrowLeft,
  Copy,
  AlertCircle,
  GraduationCap,
  Cloud,

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
  Building,
  Fuel,
  Bed,
  Utensils,
  Receipt,

  // Shopping & Commissary
  ShoppingCart,

  // Military & Deployment
  Shield,

  // Tools & Information
  Wrench,
  Lightbulb,
  AlertTriangle,
  Settings,
  Command,

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
  Grid: Grid3x3,
  List,
  RotateCcw,
  CloudOff,

  // User & Interface
  User,
  Users,
  UserPlus,
  HelpCircle,
  Crown,
  Sparkles,

  // Layout & Structure
  LayoutDashboard,
  ClipboardCheck,
  FolderOpen,
  Library,
  MapPin,
  Map,

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
  MessageCircle,
  Rss,
  XCircle,

  // Theme Toggle
  Moon,
  Sun,
  // Listening Post
  Radio,
  Newspaper,

  // Export & Sharing
  Printer,
  Camera,
  Loader,
  Archive,
  Save,
  Eye,
  Ban,
} as const;

// Export the type of valid icon names
export type IconName = keyof typeof iconRegistry;

// Export Lucide icon type for component props
export type { LucideIcon };
