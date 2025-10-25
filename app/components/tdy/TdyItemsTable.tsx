/**
 * TDY ITEMS TABLE
 * 
 * Displays and allows inline editing of parsed line items
 */

'use client';

import type { TdyItem } from '@/app/types/tdy';

import Icon from '../ui/Icon';

interface Props {
  items: TdyItem[];
  onItemsChange: (items: TdyItem[]) => void;
}

export default function TdyItemsTable({ items, onItemsChange: _onItemsChange }: Props) {
  
  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Icon name="File" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No line items yet. Upload receipts to populate.</p>
      </div>
    );
  }

  // Group by type
  const grouped = {
    lodging: items.filter(i => i.item_type === 'lodging'),
    meals: items.filter(i => i.item_type === 'meals'),
    mileage: items.filter(i => i.item_type === 'mileage'),
    misc: items.filter(i => i.item_type === 'misc')
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Line Items ({items.length})</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Lodging */}
        {grouped.lodging.length > 0 && (
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Home" className="w-4 h-4" />
              Lodging ({grouped.lodging.length})
            </h4>
            <div className="space-y-2">
              {grouped.lodging.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.vendor || 'Hotel'}</p>
                    <p className="text-gray-600 text-xs">
                      {item.tx_date} • {item.meta?.nights || 1} night{(item.meta?.nights || 1) > 1 ? 's' : ''}
                      {item.meta?.nightly_rate_cents && ` • ${formatCents(item.meta.nightly_rate_cents)}/night`}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCents(item.amount_cents)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meals */}
        {grouped.meals.length > 0 && (
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="DollarSign" className="w-4 h-4" />
              Meals ({grouped.meals.length})
            </h4>
            <div className="space-y-2">
              {grouped.meals.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.vendor || 'Meal'}</p>
                    <p className="text-gray-600 text-xs">{item.tx_date}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCents(item.amount_cents)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mileage */}
        {grouped.mileage.length > 0 && (
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="MapPin" className="w-4 h-4" />
              Mileage ({grouped.mileage.length})
            </h4>
            <div className="space-y-2">
              {grouped.mileage.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.description || 'Mileage'}</p>
                    <p className="text-gray-600 text-xs">
                      {item.meta?.miles} miles × $0.67 = {formatCents(item.amount_cents)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCents(item.amount_cents)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Misc */}
        {grouped.misc.length > 0 && (
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="File" className="w-4 h-4" />
              Miscellaneous ({grouped.misc.length})
            </h4>
            <div className="space-y-2">
              {grouped.misc.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.description || item.vendor || 'Expense'}</p>
                    <p className="text-gray-600 text-xs">{item.tx_date}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCents(item.amount_cents)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Total Expenses</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCents(items.reduce((sum, i) => sum + i.amount_cents, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

