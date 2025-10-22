# Admin Dashboard Guide

## Overview

The Admin Dashboard is a comprehensive, tab-based management system for Garrison Ledger. It provides real-time monitoring, deep analytics, user management, content curation, and system health monitoring all in one unified interface.

## Architecture

### Tab-Based Navigation

The dashboard features 5 primary tabs accessible via:
- **Visual navigation**: Click on tab headers
- **URL parameters**: `/dashboard/admin?tab=analytics`
- **Keyboard shortcuts**: Press `1-5` to switch tabs
  - `1` = Overview (Command Center)
  - `2` = Analytics (Intel)
  - `3` = Users (Personnel)
  - `4` = Content (Assets)
  - `5` = System (Ops Status)

### Server + Client Architecture

The dashboard uses a hybrid server/client approach:
- **`page.tsx` (Server Component)**: Fetches initial data, handles authentication
- **`AdminDashboardClient.tsx` (Client Component)**: Manages tab state and navigation
- **Tab Components**: Individual tab implementations

## Components

### AdminTabNavigation

Tab navigation bar with keyboard shortcuts and badge counts.

**Props:**
```typescript
interface AdminTabNavigationProps {
  activeTab: string;
  onChange: (tab: string) => void;
  badges?: {
    overview?: number;
    analytics?: number;
    users?: number;
    content?: number;
    system?: number;
  };
}
```

**Usage:**
```tsx
<AdminTabNavigation
  activeTab={activeTab}
  onChange={handleTabChange}
  badges={{ users: 5, content: 12 }}
/>
```

### MetricCard

Enhanced metric display with trends, icons, and color variants.

**Props:**
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  icon?: 'DollarSign' | 'Users' | 'TrendingUp' | 'Target' | 'CheckCircle' | 'Activity' | 'Zap';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  delay?: number;
  onClick?: () => void;
}
```

**Usage:**
```tsx
<MetricCard
  title="MRR"
  value="$1,234.56"
  subtitle="45 premium users"
  icon="DollarSign"
  variant="success"
  trend={{ direction: 'up', value: '+12%' }}
/>
```

### AlertPanel

System alerts with severity levels and dismissal.

**Props:**
```typescript
interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'data' | 'api' | 'user' | 'revenue' | 'system';
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}
```

**Usage:**
```tsx
<AlertPanel
  alerts={[
    {
      id: 'alert-1',
      severity: 'high',
      category: 'user',
      message: '5 support tickets need response',
      dismissible: true
    }
  ]}
  onDismiss={(id) => handleDismiss(id)}
/>
```

### DataTable

Reusable data table with search, filtering, sorting, pagination, and bulk actions.

**Props:**
```typescript
interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  bulkActions?: {
    label: string;
    onClick: (selectedIds: string[]) => void;
    icon?: 'Mail' | 'Download' | 'Trash' | 'Edit';
  }[];
  rowActions?: {
    label: string;
    onClick: (item: T) => void;
    icon?: 'Eye' | 'Edit' | 'Trash' | 'Mail' | 'Ban';
  }[];
  pageSize?: number;
  emptyMessage?: string;
}
```

**Usage:**
```tsx
<DataTable
  data={users}
  columns={[
    {
      key: 'email',
      header: 'Email',
      render: (user) => user.email,
      sortable: true
    }
  ]}
  keyExtractor={(user) => user.id}
  bulkActions={[
    {
      label: 'Send Email',
      icon: 'Mail',
      onClick: (ids) => handleBulkEmail(ids)
    }
  ]}
  rowActions={[
    {
      label: 'View',
      icon: 'Eye',
      onClick: (user) => viewUser(user)
    }
  ]}
/>
```

### ChartWrapper

Wrapper for chart components with loading, error states, and consistent styling.

**Props:**
```typescript
interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string;
  actions?: ReactNode;
  delay?: number;
}
```

**Usage:**
```tsx
<ChartWrapper
  title="Revenue Trend"
  subtitle="Last 12 months"
  loading={isLoading}
  error={error}
>
  <LineChart data={revenueData} />
</ChartWrapper>
```

## Tabs

### 1. Overview Tab (Command Center)

**Current Status:** ✅ Fully Implemented

**Features:**
- Real-time alerts panel
- Key metrics grid (MRR, users, conversion, activation)
- Live activity feed
- System health indicators
- Quick action buttons

**Future Enhancements:**
- Server-Sent Events (SSE) for real-time updates
- Configurable quick actions
- Alert auto-refresh

### 2. Analytics Tab (Intel)

**Current Status:** 🚧 Placeholder (Phase 2)

**Planned Features:**
- Revenue sub-tab (MRR trends, conversion funnel, cohort analysis)
- Users sub-tab (growth charts, demographics, activation funnel)
- Engagement sub-tab (streaks, DAU/MAU, feature usage)
- Tools sub-tab (usage stats, success rates, error rates)

### 3. Users Tab (Personnel)

**Current Status:** 🚧 Placeholder (Phase 3)

**Planned Features:**
- Advanced search and filtering
- User management table with bulk actions
- User detail modal
- Actions: suspend, adjust tier, send email, impersonate

### 4. Content Tab (Assets)

**Current Status:** 🚧 Placeholder (Phase 4)

**Planned Features:**
- Listening Post integration
- Content Blocks management
- User submissions moderation
- Batch operations

### 5. System Tab (Ops Status)

**Current Status:** 🚧 Placeholder (Phase 4)

**Planned Features:**
- Data Sources monitoring
- API Health dashboard
- Error Logs viewer
- Configuration management

## Database Tables

### admin_actions

Audit trail of all administrative actions.

**Columns:**
- `id` (UUID): Primary key
- `admin_user_id` (TEXT): Clerk user ID of admin
- `action_type` (TEXT): Type of action (suspend_user, grant_premium, etc.)
- `target_type` (TEXT): Type of target (user, content, system)
- `target_id` (TEXT): ID of affected entity
- `details` (JSONB): Additional action details
- `created_at` (TIMESTAMP): When action occurred

**Helper Function:**
```sql
SELECT log_admin_action(
  'user_123',
  'suspend_user',
  'user',
  'user_456',
  '{"reason": "Terms violation"}'::jsonb
);
```

### system_alerts

System-wide alerts for monitoring.

**Columns:**
- `id` (UUID): Primary key
- `severity` (TEXT): critical, high, medium, low
- `category` (TEXT): data, api, user, revenue, system
- `message` (TEXT): Alert message
- `details` (JSONB): Additional details
- `resolved` (BOOLEAN): Whether alert is resolved
- `resolved_by` (TEXT): Admin who resolved it
- `resolved_at` (TIMESTAMP): When resolved
- `created_at` (TIMESTAMP): When created

**Helper Function:**
```sql
SELECT create_system_alert(
  'high',
  'data',
  'BAH data may be outdated',
  '{"last_update": "2024-01-01"}'::jsonb
);
```

### error_logs

Centralized error logging.

**Columns:**
- `id` (UUID): Primary key
- `level` (TEXT): error, warn, info
- `source` (TEXT): Component/feature that logged
- `message` (TEXT): Error message
- `stack_trace` (TEXT): Stack trace if available
- `user_id` (TEXT): Affected user if applicable
- `metadata` (JSONB): Additional context
- `created_at` (TIMESTAMP): When logged

**Helper Function:**
```sql
SELECT log_error(
  'error',
  'LES Auditor',
  'PDF parse failed',
  'Stack trace here...',
  'user_789',
  '{"file_size": 2048}'::jsonb
);
```

### user_tags

User segmentation tags.

**Columns:**
- `user_id` (TEXT): User ID
- `tag` (TEXT): Tag name
- `added_by` (TEXT): Admin who added tag
- `added_at` (TIMESTAMP): When added

## API Endpoints

### Future Endpoints (To be implemented)

```
/api/admin/
  users/
    search/route.ts          - Search users with filters
    [userId]/
      route.ts               - Get/update user details
      suspend/route.ts       - Suspend/unsuspend user
      entitlement/route.ts   - Adjust user tier
      activity/route.ts      - Get user activity log
      
  analytics/
    revenue/route.ts         - Revenue chart data
    users/route.ts           - User growth data
    engagement/route.ts      - Engagement metrics
    cohorts/route.ts         - Cohort analysis
    tools/route.ts           - Tool usage stats
    
  system/
    health/route.ts          - System health check
    alerts/route.ts          - Get/dismiss alerts
    errors/route.ts          - Error logs
    stream/route.ts          - SSE endpoint for real-time
```

## Development

### Adding a New Tab

1. Create tab component in `app/dashboard/admin/tabs/YourTab.tsx`
2. Add tab config to `AdminTabNavigation.tsx`
3. Add route case in `AdminDashboardClient.tsx`
4. Update keyboard shortcut if needed

### Adding Metrics to Overview

1. Update `getAdminData()` in `page.tsx` to fetch new data
2. Pass data to `OverviewTab` component
3. Add `MetricCard` or update existing cards

### Creating Alerts

Alerts are auto-generated based on system conditions in `getAdminData()`:

```typescript
if (condition) {
  alerts.push({
    id: 'unique-id',
    severity: 'high',
    category: 'user',
    message: 'Alert message',
    details: 'More details...',
    dismissible: true
  });
}
```

## Performance

### Optimization Strategies

- **Server-side data fetching**: Initial data loaded in `page.tsx`
- **Client-side state**: Tab switching doesn't refetch data
- **Lazy loading**: Charts loaded only when tab is viewed (future)
- **Pagination**: Large datasets paginated in DataTable

### Performance Targets

- Initial load: < 3 seconds
- Tab switch: < 200ms
- Table operations: < 500ms
- Real-time updates: < 1 second latency

## Security

### Admin Access Control

Only users in `ADMIN_USER_IDS` array can access admin dashboard:

```typescript
const ADMIN_USER_IDS = [
  'user_343xVqjkdILtBkaYAJfE5H8Wq0q', // slimmugnai@gmail.com
];
```

### RLS Policies

All admin tables have RLS enabled but policies allow admin access. Application-level checks in `ADMIN_USER_IDS` provide the actual security layer.

### Audit Trail

All admin actions should be logged:

```typescript
await supabase
  .from('admin_actions')
  .insert({
    admin_user_id: adminId,
    action_type: 'suspend_user',
    target_type: 'user',
    target_id: userId,
    details: { reason: 'Terms violation' }
  });
```

## Troubleshooting

### Tab not switching

- Check browser console for errors
- Verify URL parameter is updating
- Check `activeTab` state in React DevTools

### Data not loading

- Check server-side errors in Vercel logs
- Verify Supabase connection
- Check RLS policies
- Verify admin user ID in `ADMIN_USER_IDS`

### Keyboard shortcuts not working

- Ensure not in an input field
- Check browser console for errors
- Verify keyboard event listener is attached

## Migration Guide

### Applying Database Migration

```bash
# Via Supabase Dashboard SQL Editor
# Copy and paste contents of:
supabase-migrations/20251022_admin_dashboard_tables.sql
```

### Updating from Old Admin Dashboard

The new tab-based system replaces the old card-grid navigation. Old admin pages remain accessible but are being gradually integrated into tabs.

**Migration Path:**
- Phase 1: Overview tab (✅ Complete)
- Phase 2: Analytics tab (🚧 In Progress)
- Phase 3: Users tab (📋 Planned)
- Phase 4: Content & System tabs (📋 Planned)
- Phase 5: Real-time & Polish (📋 Planned)

## Future Roadmap

### Phase 2: Analytics (Next)
- Install recharts ✅
- Create chart data API endpoints
- Build Revenue, Users, Engagement, Tools sub-tabs

### Phase 3: User Management
- Build user search/filter API
- Create UserManagementTable component
- Implement user action endpoints
- Build UserDetailModal

### Phase 4: Content & System
- Migrate content curation to Content tab
- Build API health monitoring
- Implement error log viewer

### Phase 5: Real-Time & Polish
- Implement SSE for live updates
- Mobile optimization
- Performance tuning
- Comprehensive documentation

## Support

For questions or issues:
- Check SYSTEM_STATUS.md
- Review component source code
- Contact development team

