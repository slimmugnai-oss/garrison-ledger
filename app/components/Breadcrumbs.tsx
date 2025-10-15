'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './ui/Icon';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: 'Home' }
    ];

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map segments to readable labels
      let label = segment;
      let icon: string | undefined;
      
      switch (segment) {
        case 'dashboard':
          label = 'Dashboard';
          icon = 'LayoutDashboard';
          break;
        case 'assessment':
          label = 'Assessment';
          icon = 'ClipboardCheck';
          break;
        case 'binder':
          label = 'My Binder';
          icon = 'FolderOpen';
          break;
        case 'library':
          label = 'Intel Library';
          icon = 'Library';
          break;
        case 'directory':
          label = 'Directory';
          icon = 'Users';
          break;
        case 'referrals':
          label = 'Refer & Earn';
          icon = 'Gift';
          break;
        case 'upgrade':
          label = 'Upgrade';
          icon = 'Crown';
          break;
        case 'tools':
          label = 'Tools';
          icon = 'Settings';
          break;
        case 'tsp-modeler':
          label = 'TSP Modeler';
          icon = 'BarChart';
          break;
        case 'sdp-strategist':
          label = 'SDP Strategist';
          icon = 'PiggyBank';
          break;
        case 'house-hacking':
          label = 'House Hacking';
          icon = 'Home';
          break;
        case 'pcs-planner':
          label = 'PCS Financial Planner';
          icon = 'Truck';
          break;
        case 'on-base-savings':
          label = 'Annual Savings Center';
          icon = 'ShoppingCart';
          break;
        case 'salary-calculator':
          label = 'Career Opportunity Analyzer';
          icon = 'Briefcase';
          break;
        case 'profile':
          label = 'Profile';
          icon = 'User';
          break;
        case 'settings':
          label = 'Settings';
          icon = 'Settings';
          break;
        case 'support':
          label = 'Support';
          icon = 'HelpCircle';
          break;
        case 'plan':
          label = 'My Plan';
          icon = 'Target';
          break;
        default:
          // Capitalize first letter for unknown segments
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }

      // Only add href if it's not the last segment
      const href = index === segments.length - 1 ? undefined : currentPath;
      
      breadcrumbs.push({
        label,
        href,
        icon
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page or if there's only one breadcrumb
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-4 py-3" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <Icon name="ChevronRight" className="w-4 h-4 text-gray-400 mx-2" />
              )}
              {breadcrumb.href ? (
                <Link 
                  href={breadcrumb.href}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {breadcrumb.icon && <Icon name={breadcrumb.icon as any} className="w-4 h-4 mr-1.5" />}
                  {breadcrumb.label}
                </Link>
              ) : (
                <span className="flex items-center text-gray-900 font-medium">
                  {breadcrumb.icon && <Icon name={breadcrumb.icon as any} className="w-4 h-4 mr-1.5" />}
                  {breadcrumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
