'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminTabNavigation from './components/AdminTabNavigation';
import OverviewTab from './tabs/OverviewTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import UsersTab from './tabs/UsersTab';
import ContentTab from './tabs/ContentTab';
import SystemTab from './tabs/SystemTab';
import { Alert } from './components/AlertPanel';

interface ActivityItem {
  id: string;
  type: 'signup' | 'premium' | 'support' | 'tool_use';
  message: string;
  timestamp: string;
  userId?: string;
}

interface AdminDashboardClientProps {
  metrics: {
    mrr: number;
    totalUsers: number;
    premiumUsers: number;
    conversionRate: number;
    newSignups7d: number;
    newPremium7d: number;
    activationRate: number;
    supportTickets: number;
  };
  alerts: Alert[];
  recentActivity: ActivityItem[];
  badges?: {
    overview?: number;
    users?: number;
    content?: number;
    system?: number;
  };
}

export default function AdminDashboardClient({
  metrics,
  alerts,
  recentActivity,
  badges = {},
}: AdminDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Sync with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['overview', 'analytics', 'users', 'content', 'system'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/dashboard/admin?${params.toString()}`, { scroll: false });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            initialMetrics={metrics}
            initialAlerts={alerts}
            initialActivity={recentActivity}
          />
        );
      case 'analytics':
        return <AnalyticsTab />;
      case 'users':
        return <UsersTab />;
      case 'content':
        return <ContentTab />;
      case 'system':
        return <SystemTab />;
      default:
        return <OverviewTab initialMetrics={metrics} initialAlerts={alerts} initialActivity={recentActivity} />;
    }
  };

  return (
    <>
      {/* Tab Navigation */}
      <AdminTabNavigation
        activeTab={activeTab}
        onChange={handleTabChange}
        badges={badges}
      />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="tab-content">
          {renderTab()}
        </div>
      </div>
    </>
  );
}

