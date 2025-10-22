'use client';

import { useState, useMemo } from 'react';
import Icon from '@/app/components/ui/Icon';

export interface Column<T> {
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
    icon?: 'Mail' | 'Download' | 'Trash2' | 'Edit';
  }[];
  rowActions?: {
    label: string;
    onClick: (item: T) => void;
    icon?: 'Edit' | 'Trash2' | 'Mail';
  }[];
  pageSize?: number;
  emptyMessage?: string;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search...',
  onSearch,
  bulkActions = [],
  rowActions = [],
  pageSize = 20,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = String((a as never)[sortConfig.key] || '');
      const bValue = String((b as never)[sortConfig.key] || '');
      
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  }, [data, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(keyExtractor)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allSelected = paginatedData.length > 0 && selectedIds.size === paginatedData.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < paginatedData.length;

  return (
    <div className="space-y-4">
      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {bulkActions.length > 0 && selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">
              {selectedIds.size} selected
            </span>
            {bulkActions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.onClick(Array.from(selectedIds))}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                {action.icon && <Icon name={action.icon} className="h-4 w-4" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full">
          <thead className="bg-surface-hover border-b border-border">
            <tr>
              {(bulkActions.length > 0 || rowActions.length > 0) && (
                <th className="px-4 py-3 text-left w-12">
                  {bulkActions.length > 0 && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someSelected;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  )}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-text-muted ${
                    column.width || ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-text-body"
                    >
                      {column.header}
                      {sortConfig?.key === column.key && (
                        <Icon
                          name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                          className="h-4 w-4"
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {rowActions.length > 0 && (
                <th className="px-4 py-3 text-right w-24">
                  <span className="text-sm font-semibold text-text-muted">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions.length > 0 || rowActions.length > 0 ? 2 : 0)}
                  className="px-4 py-12 text-center text-text-muted"
                >
                  <Icon name="FolderOpen" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds.has(id);

                return (
                  <tr
                    key={id}
                    className={`hover:bg-surface-hover transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {(bulkActions.length > 0 || rowActions.length > 0) && (
                      <td className="px-4 py-3">
                        {bulkActions.length > 0 && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                        )}
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-text-body">
                        {column.render(item)}
                      </td>
                    ))}
                    {rowActions.length > 0 && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rowActions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => action.onClick(item)}
                              className="p-2 text-text-muted hover:text-text-body hover:bg-surface-hover rounded transition-colors"
                              title={action.label}
                            >
                              {action.icon && <Icon name={action.icon as never} className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-border rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
            >
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </button>
            <span className="text-sm text-text-body">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-border rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
            >
              <Icon name="ChevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

