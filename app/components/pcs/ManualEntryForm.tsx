'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/Icon';

interface ManualEntryFormProps {
  documentType: 'orders' | 'weigh_ticket' | 'lodging_receipt' | 'fuel_receipt' | 'meal_receipt' | 'other';
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  initialData?: Record<string, unknown>;
}

export default function ManualEntryForm({ 
  documentType, 
  onSubmit, 
  onCancel,
  initialData 
}: ManualEntryFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderForm = () => {
    switch (documentType) {
      case 'orders':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Member Name *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.member_name as string) || ''}
                  onChange={(e) => updateField('member_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="Last, First M."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rank *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.rank as string) || ''}
                  onChange={(e) => updateField('rank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., E5, O3, W2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Orders Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.orders_date as string) || ''}
                  onChange={(e) => updateField('orders_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Report Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.report_date as string) || ''}
                  onChange={(e) => updateField('report_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Origin Base *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.origin_base as string) || ''}
                  onChange={(e) => updateField('origin_base', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., Fort Liberty, NC"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Destination Base *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.destination_base as string) || ''}
                  onChange={(e) => updateField('destination_base', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., JBLM, WA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Number of Dependents Authorized
              </label>
              <input
                type="number"
                min="0"
                value={(formData.dependents_authorized as number) || 0}
                onChange={(e) => updateField('dependents_authorized', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
            </div>
          </div>
        );

      case 'weigh_ticket':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Reminder:</strong> You need both empty (before loading) and full (after loading) weight tickets from a certified scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Weigh Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.weigh_date as string) || ''}
                  onChange={(e) => updateField('weigh_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ticket Type *
                </label>
                <select
                  required
                  value={(formData.ticket_type as string) || ''}
                  onChange={(e) => updateField('ticket_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                >
                  <option value="">Select...</option>
                  <option value="empty">Empty Weight (before loading)</option>
                  <option value="full">Full Weight (after loading)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={(formData.weight as number) || ''}
                  onChange={(e) => updateField('weight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., 12500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Make/Model *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.vehicle_info as string) || ''}
                  onChange={(e) => updateField('vehicle_info', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., U-Haul 26ft"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.location as string) || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., CAT Scale - Denver, CO"
                />
              </div>
            </div>
          </div>
        );

      case 'lodging_receipt':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hotel/Lodging Name *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.vendor as string) || ''}
                  onChange={(e) => updateField('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., Holiday Inn Express"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.location as string) || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Check-In Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.check_in_date as string) || ''}
                  onChange={(e) => updateField('check_in_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Check-Out Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.check_out_date as string) || ''}
                  onChange={(e) => updateField('check_out_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Total Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={(formData.total_amount as number) || ''}
                    onChange={(e) => updateField('total_amount', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nightly Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(formData.room_rate as number) || ''}
                    onChange={(e) => updateField('room_rate', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirmation #
                </label>
                <input
                  type="text"
                  value={(formData.confirmation_number as string) || ''}
                  onChange={(e) => updateField('confirmation_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        );

      case 'fuel_receipt':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gas Station *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.vendor as string) || ''}
                  onChange={(e) => updateField('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="E.g., Shell, Chevron"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.location as string) || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.date as string) || ''}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gallons
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={(formData.gallons as number) || ''}
                  onChange={(e) => updateField('gallons', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Total Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={(formData.total_amount as number) || ''}
                    onChange={(e) => updateField('total_amount', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'meal_receipt':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Restaurant/Vendor *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.vendor as string) || ''}
                  onChange={(e) => updateField('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={(formData.location as string) || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.date as string) || ''}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Total Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={(formData.total_amount as number) || ''}
                    onChange={(e) => updateField('total_amount', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <input
                type="text"
                required
                value={(formData.description as string) || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={(formData.date as string) || ''}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={(formData.amount as number) || ''}
                    onChange={(e) => updateField('amount', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const getFormTitle = () => {
    const titles = {
      orders: 'PCS Orders',
      weigh_ticket: 'Weigh Ticket',
      lodging_receipt: 'Lodging Receipt',
      fuel_receipt: 'Fuel Receipt',
      meal_receipt: 'Meal Receipt',
      other: 'Other Document'
    };
    return titles[documentType] || 'Document Entry';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="Edit" className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Manual Entry: {getFormTitle()}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Icon name="X" className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {renderForm()}

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Icon name="Save" className="w-5 h-5" />
          Save Entry
        </button>
      </div>

      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <Icon name="Info" className="w-4 h-4 inline mr-1" />
          <strong>Tip:</strong> You can attach the receipt image after saving for your records (optional).
        </p>
      </div>
    </form>
  );
}

