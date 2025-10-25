'use client';

import Badge from '@/app/components/ui/Badge';
import Icon from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  label: string;
  value: string;
  autoFilled: boolean;
  onChange: (val: string) => void;
  onOverride?: () => void;
  helpText?: string;
  optional?: boolean;
  className?: string;
}

/**
 * CurrencyInput - Reusable currency input with auto-fill indicator
 * 
 * Shows green badge when value is auto-filled from profile.
 * Calls onOverride when user edits an auto-filled value.
 */
export default function CurrencyInput({
  label,
  value,
  autoFilled,
  onChange,
  onOverride,
  helpText,
  optional = false,
  className
}: CurrencyInputProps) {
  return (
    <div className={className}>
      <label className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">
          {label}
          {optional && <span className="text-gray-500 font-normal ml-1">(Optional)</span>}
        </span>
        {autoFilled && (
          <Badge variant="success" className="text-xs">
            <Icon name="CheckCircle" className="w-3 h-3 mr-1" />
            Auto-filled
          </Badge>
        )}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">$</span>
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (autoFilled && onOverride) {
              onOverride();
            }
          }}
          className={cn(
            "w-full pl-8 pr-4 py-3 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
            autoFilled 
              ? "border-green-300 bg-green-50 focus:bg-white" 
              : "border-gray-300 bg-white"
          )}
          placeholder="0.00"
        />
      </div>
      {helpText && (
        <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
          <Icon name="Info" className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {helpText}
        </p>
      )}
    </div>
  );
}

