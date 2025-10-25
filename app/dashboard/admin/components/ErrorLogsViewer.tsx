"use client";

import { useState, useEffect } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

import DataTable, { Column } from "./DataTable";

interface ErrorLog {
  id: string;
  level: string;
  source: string;
  message: string;
  stack_trace: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ErrorGroup {
  message: string;
  count: number;
  level: string;
  latest: string;
}

export default function ErrorLogsViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [errorGroups, setErrorGroups] = useState<ErrorGroup[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  // Filters
  const [levelFilter, setLevelFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");

  useEffect(() => {
    loadErrorLogs();
  }, [levelFilter, sourceFilter, timeRange]);

  const loadErrorLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        level: levelFilter,
        source: sourceFilter,
        timeRange,
        page: "1",
        pageSize: "100",
      });

      const res = await fetch(`/api/admin/error-logs?${params}`);
      if (!res.ok) throw new Error("Failed to load error logs");

      const data = await res.json();
      setLogs(data.logs);
      setErrorGroups(data.errorGroups);
      setSources(data.uniqueSources);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "danger";
      case "warn":
        return "warning";
      case "info":
        return "info";
      default:
        return "secondary";
    }
  };

  const columns: Column<ErrorLog>[] = [
    {
      key: "created_at",
      header: "Time",
      sortable: true,
      width: "w-32",
      render: (log) => (
        <span className="text-text-muted text-xs">
          {new Date(log.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "level",
      header: "Level",
      sortable: true,
      width: "w-24",
      render: (log) => (
        <Badge variant={getLevelBadgeVariant(log.level)} size="sm">
          {log.level.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "source",
      header: "Source",
      sortable: true,
      width: "w-40",
      render: (log) => <span className="text-text-body text-sm font-semibold">{log.source}</span>,
    },
    {
      key: "message",
      header: "Message",
      render: (log) => <span className="text-text-body line-clamp-2 text-sm">{log.message}</span>,
    },
    {
      key: "user_id",
      header: "User",
      width: "w-32",
      render: (log) => (
        <span className="text-text-muted font-mono text-xs">
          {log.user_id ? log.user_id.substring(0, 12) + "..." : "-"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading error logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AnimatedCard className="border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-muted mb-1 text-sm">Total Logs</div>
              <div className="text-text-headings text-2xl font-black">{logs.length}</div>
            </div>
            <Icon name="File" className="h-8 w-8 text-primary" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-100 p-4"
          delay={50}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-red-700">Errors</div>
              <div className="text-2xl font-black text-red-900">
                {logs.filter((l) => l.level === "error").length}
              </div>
            </div>
            <Icon name="XCircle" className="h-8 w-8 text-red-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-4"
          delay={100}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-amber-700">Warnings</div>
              <div className="text-2xl font-black text-amber-900">
                {logs.filter((l) => l.level === "warn").length}
              </div>
            </div>
            <Icon name="AlertTriangle" className="h-8 w-8 text-amber-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
          delay={150}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-blue-700">Info</div>
              <div className="text-2xl font-black text-blue-900">
                {logs.filter((l) => l.level === "info").length}
              </div>
            </div>
            <Icon name="Info" className="h-8 w-8 text-blue-600" />
          </div>
        </AnimatedCard>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors Only</option>
            <option value="warn">Warnings Only</option>
            <option value="info">Info Only</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Sources</option>
            {sources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-hover flex items-center gap-2 rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("grouped")}
              className={`rounded px-3 py-1 text-sm font-semibold transition-colors ${
                viewMode === "grouped"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded px-3 py-1 text-sm font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={loadErrorLogs}
            className="hover:bg-primary-hover rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors"
          >
            <Icon name="RefreshCw" className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {logs.length === 0 ? (
        <AnimatedCard className="border border-border bg-card p-12 text-center">
          <Icon name="CheckCircle" className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h3 className="text-text-headings mb-2 text-xl font-bold">No Errors Found</h3>
          <p className="text-text-muted">
            No errors logged in the selected time range. System is running smoothly!
          </p>
        </AnimatedCard>
      ) : viewMode === "grouped" ? (
        <AnimatedCard delay={200} className="border border-border bg-card">
          <h3 className="text-text-headings mb-4 px-6 pt-6 text-lg font-bold">
            Grouped by Error Type
          </h3>
          <div className="divide-y divide-border">
            {errorGroups.map((group, index) => (
              <div
                key={index}
                className="hover:bg-surface-hover cursor-pointer p-4 transition-colors"
                onClick={() => {
                  const matchingLog = logs.find((l) => l.message === group.message);
                  if (matchingLog) setSelectedLog(matchingLog);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={getLevelBadgeVariant(group.level)} size="sm">
                        {group.level.toUpperCase()}
                      </Badge>
                      <span className="text-2xl font-black text-primary">{group.count}×</span>
                    </div>
                    <p className="text-text-body text-sm font-medium">{group.message}</p>
                    <p className="text-text-muted mt-1 text-xs">
                      Latest: {new Date(group.latest).toLocaleString()}
                    </p>
                  </div>
                  <Icon name="ChevronRight" className="text-text-muted h-5 w-5 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      ) : (
        <DataTable
          data={logs}
          columns={columns}
          keyExtractor={(log) => log.id}
          rowActions={[
            {
              label: "View Details",
              onClick: (log) => setSelectedLog(log),
            },
          ]}
          pageSize={50}
          emptyMessage="No error logs found"
        />
      )}

      {/* Error Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-card shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-border bg-card p-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={getLevelBadgeVariant(selectedLog.level)}>
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                  <span className="text-text-muted text-sm font-semibold">
                    {selectedLog.source}
                  </span>
                </div>
                <h3 className="text-text-headings text-lg font-bold">Error Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-text-muted hover:text-text-body"
              >
                <Icon name="X" className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <h4 className="text-text-muted mb-2 text-sm font-semibold">Message</h4>
                <p className="text-text-body">{selectedLog.message}</p>
              </div>

              <div>
                <h4 className="text-text-muted mb-2 text-sm font-semibold">Timestamp</h4>
                <p className="text-text-body">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>

              {selectedLog.user_id && (
                <div>
                  <h4 className="text-text-muted mb-2 text-sm font-semibold">Affected User</h4>
                  <code className="bg-surface-hover rounded px-2 py-1 font-mono text-xs">
                    {selectedLog.user_id}
                  </code>
                </div>
              )}

              {selectedLog.stack_trace && (
                <div>
                  <h4 className="text-text-muted mb-2 text-sm font-semibold">Stack Trace</h4>
                  <pre className="max-h-64 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                    {selectedLog.stack_trace}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4 className="text-text-muted mb-2 text-sm font-semibold">Metadata</h4>
                  <pre className="bg-surface-hover overflow-x-auto rounded-lg p-4 text-xs">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
