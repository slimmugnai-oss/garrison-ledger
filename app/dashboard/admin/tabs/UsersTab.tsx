'use client';

import { useState, useEffect } from 'react';

import Badge from '@/app/components/ui/Badge';

import DataTable, { Column } from '../components/DataTable';
import MetricCard from '../components/MetricCard';
import UserDetailModal from '../components/UserDetailModal';

interface User {
  user_id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  rank: string | null;
  branch: string | null;
  created_at: string;
  profile_completed: boolean | null;
  tier: string;
  subscription_status: string;
  has_active_subscription: boolean;
  paygrade: string | null;
  rank_category: string | null;
}

interface UsersTabProps {
  initialTotal?: number;
}

export default function UsersTab({ initialTotal = 0 }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, tierFilter, branchFilter, profileFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        tier: tierFilter,
        branch: branchFilter,
        page: '1',
        pageSize: '50',
      });

      const res = await fetch(`/api/admin/users/search?${params}`);
      if (!res.ok) throw new Error('Failed to load users');

      const data = await res.json();
      
      // Apply profile filter client-side
      let filteredUsers = data.users;
      if (profileFilter === 'complete') {
        filteredUsers = data.users.filter((u: User) => u.profile_completed);
      } else if (profileFilter === 'incomplete') {
        filteredUsers = data.users.filter((u: User) => !u.profile_completed);
      }
      
      setUsers(filteredUsers);
      setTotal(filteredUsers.length);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEmail = async (selectedIds: string[]) => {
    alert(`Would send email to ${selectedIds.length} users`);
    // TODO: Implement bulk email
  };

  const handleBulkExport = async (selectedIds: string[]) => {
    const selectedUsers = users.filter(u => selectedIds.includes(u.user_id));
    const csv = [
      'User ID,Email,First Name,Last Name,Profile Status,Rank,Branch,Tier,Subscription Status,Joined',
      ...selectedUsers.map(u =>
        `${u.user_id},${u.email || ''},${u.firstName || ''},${u.lastName || ''},${u.profile_completed ? 'Complete' : 'Incomplete'},${u.rank || ''},${u.branch || ''},${u.tier},${u.subscription_status},${u.created_at}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garrison-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (user) => (
        <span className="text-sm">{user.email || '-'}</span>
      ),
    },
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (user) => (
        <span className="font-semibold text-sm">
          {user.firstName || user.lastName
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
            : '-'}
        </span>
      ),
    },
    {
      key: 'user_id',
      header: 'User ID',
      sortable: true,
      render: (user) => (
        <span className="font-mono text-xs text-text-muted">{user.user_id.substring(0, 20)}...</span>
      ),
    },
    {
      key: 'profile_completed',
      header: 'Profile',
      sortable: true,
      render: (user) => (
        user.profile_completed ? (
          <Badge variant="success">Complete</Badge>
        ) : (
          <Badge variant="warning">Incomplete</Badge>
        )
      ),
    },
    {
      key: 'rank',
      header: 'Rank',
      sortable: true,
      render: (user) => (
        <span className="font-semibold">{user.rank || '-'}</span>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      sortable: true,
      render: (user) => (
        <span className="text-sm">{user.branch || '-'}</span>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      sortable: true,
      render: (user) => (
        <Badge variant={user.tier === 'premium' ? 'success' : 'secondary'} size="sm">
          {user.tier.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'subscription_status',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <Badge
          variant={
            user.subscription_status === 'active' ? 'success' :
            user.subscription_status === 'canceled' ? 'danger' :
            'secondary'
          }
          size="sm"
        >
          {user.subscription_status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'profile_completed',
      header: 'Profile',
      render: (user) => (
        <Badge variant={user.profile_completed ? 'success' : 'warning'} size="sm">
          {user.profile_completed ? 'Complete' : 'Incomplete'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-text-muted">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Calculate stats
  const premiumUsers = users.filter(u => u.tier === 'premium' && u.has_active_subscription).length;
  const completedProfiles = users.filter(u => u.profile_completed).length;
  const conversionRate = users.length > 0 ? (premiumUsers / users.length * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={total}
          icon="Users"
          variant="info"
        />
        <MetricCard
          title="Premium"
          value={premiumUsers}
          subtitle={`${conversionRate}% conversion`}
          icon="Crown"
          variant="success"
        />
        <MetricCard
          title="Complete Profiles"
          value={completedProfiles}
          subtitle={`${users.length > 0 ? (completedProfiles / users.length * 100).toFixed(0) : 0}% rate`}
          icon="CheckCircle"
          variant="default"
        />
        <MetricCard
          title="Showing"
          value={users.length}
          subtitle="in current view"
          icon="Activity"
          variant="default"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, or User ID..."
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
        </select>

        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Branches</option>
          <option value="Army">Army</option>
          <option value="Navy">Navy</option>
          <option value="Air Force">Air Force</option>
          <option value="Marine Corps">Marine Corps</option>
          <option value="Coast Guard">Coast Guard</option>
          <option value="Space Force">Space Force</option>
        </select>

        <select
          value={profileFilter}
          onChange={(e) => setProfileFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Profiles</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
        </select>

        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
        >
          Refresh
        </button>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-text-muted">Loading users...</p>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          keyExtractor={(user) => user.user_id}
          searchPlaceholder="Search users..."
          bulkActions={[
            {
              label: 'Send Email',
              icon: 'Mail',
              onClick: handleBulkEmail,
            },
            {
              label: 'Export CSV',
              icon: 'Download',
              onClick: handleBulkExport,
            },
          ]}
          rowActions={[
            {
              label: 'View Details',
              onClick: (user) => setSelectedUser(user.user_id),
            },
            {
              label: 'Send Email',
              icon: 'Mail',
              onClick: (user) => window.open(`mailto:${user.user_id}@example.com`),
            },
          ]}
          emptyMessage="No users found"
        />
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
