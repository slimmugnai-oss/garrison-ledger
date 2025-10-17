'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';

interface TicketActionsProps {
  ticketId: string;
  ticketNumber: string;
  email: string;
  subject: string;
  currentStatus: string;
}

export default function TicketActions({
  ticketId,
  ticketNumber,
  email,
  subject,
  currentStatus
}: TicketActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusUpdate = async (newStatus: string) => {
    if (currentStatus === newStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ticket');
      }

      // Refresh the page to show updated data
      router.refresh();

    } catch (err) {
      console.error('Error updating ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Error Message */}
      {error && (
        <div className="text-sm text-danger bg-danger-subtle border border-danger rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Reply via Email */}
        <a
          href={`mailto:${email}?subject=Re: ${ticketNumber} - ${subject}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-info hover:bg-info/90 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Icon name="Mail" className="h-4 w-4" />
          Reply via Email
        </a>

        {/* Mark In Progress */}
        {currentStatus !== 'in_progress' && currentStatus !== 'resolved' && currentStatus !== 'closed' && (
          <button
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={isUpdating}
            className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-text-body hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="Timer" className="h-4 w-4" />
                Mark In Progress
              </span>
            )}
          </button>
        )}

        {/* Mark Resolved */}
        {currentStatus !== 'resolved' && currentStatus !== 'closed' && (
          <button
            onClick={() => handleStatusUpdate('resolved')}
            disabled={isUpdating}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4" />
                Mark Resolved
              </span>
            )}
          </button>
        )}

        {/* Reopen (if resolved/closed) */}
        {(currentStatus === 'resolved' || currentStatus === 'closed') && (
          <button
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={isUpdating}
            className="px-4 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="RefreshCw" className="h-4 w-4" />
                Reopen
              </span>
            )}
          </button>
        )}

        {/* Close (if resolved) */}
        {currentStatus === 'resolved' && (
          <button
            onClick={() => handleStatusUpdate('closed')}
            disabled={isUpdating}
            className="px-4 py-2 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="Archive" className="h-4 w-4" />
                Close Ticket
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

