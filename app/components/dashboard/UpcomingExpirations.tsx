"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../ui/Icon";

interface Reminder {
  id: string;
  display_name: string;
  folder: string;
  expires_on: string;
}

export default function UpcomingExpirations() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function loadReminders() {
      try {
        const response = await fetch("/api/binder/reminders?days=60");
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setReminders(data.reminders || []);
        setIsPremium(data.isPremium);
      } catch {
        // Failed to load reminders - show empty state
        setReminders([]);
        
        if (process.env.NODE_ENV === 'development') {
          // Failed to load - non-critical widget
        }
      } finally {
        setLoading(false);
      }
    }

    loadReminders();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-subtle p-6 shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
          <Icon name="Calendar" className="w-5 h-5 mr-2 text-info" />
          Upcoming Expirations
        </h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-hover rounded w-3/4"></div>
          <div className="h-4 bg-surface-hover rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return null;
  }


  return (
    <div className="bg-surface rounded-xl border border-subtle p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary flex items-center">
          <Icon name="Calendar" className="w-5 h-5 mr-2 text-info" />
          Upcoming Expirations
        </h3>
        <Link
          href="/dashboard/binder"
          className="text-sm text-info hover:text-info font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {reminders.slice(0, 5).map((reminder) => {
          const daysUntil = Math.ceil(
            (new Date(reminder.expires_on).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );
          const isUrgent = daysUntil <= 30;
          const isCritical = daysUntil <= 7;

          return (
            <div
              key={reminder.id}
              className={`p-3 rounded-lg border ${
                isCritical
                  ? "bg-red-50 border-red-200"
                  : isUrgent
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">
                    {reminder.display_name}
                  </p>
                  <p className="text-sm text-body mt-1">
                    {reminder.folder}
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isCritical
                        ? "text-red-700"
                        : isUrgent
                        ? "text-yellow-700"
                        : "text-gray-700"
                    }`}
                  >
                    {daysUntil === 0
                      ? "Today"
                      : daysUntil === 1
                      ? "Tomorrow"
                      : `${daysUntil} days`}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(reminder.expires_on).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isPremium && reminders.length > 3 && (
        <div className="mt-4 p-3 bg-info-subtle border border-info rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Upgrade to Premium</strong> to set unlimited reminders and
            never miss an expiration.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="mt-2 inline-block text-sm font-medium text-info hover:text-info"
          >
            Learn More →
          </Link>
        </div>
      )}
    </div>
  );
}

