'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../ui/Icon';

interface ContactFormProps {
  variant?: 'public' | 'dashboard';
  userEmail?: string;
  userName?: string;
  userId?: string;
}

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'bug', label: 'Report a Bug' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - General question', color: 'text-gray-400' },
  { value: 'medium', label: 'Medium - Needs attention', color: 'text-yellow-400' },
  { value: 'high', label: 'High - Urgent issue', color: 'text-red-400' },
];

export default function ContactForm({ variant = 'public', userEmail, userName, userId }: ContactFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    subject: 'general',
    urgency: 'low',
    message: '',
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          variant,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Redirect to success page
      router.push(`/contact/success?ref=${data.ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDashboard = variant === 'dashboard';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-2 text-disabled">
          Your Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={submitting}
          className={`w-full px-4 py-3 bg-[#0A0F1E] border rounded-lg text-white placeholder-gray-400 transition-all ${
            fieldErrors.name
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-[#2A2F3E] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]'
          } disabled:opacity-50`}
          placeholder="John Doe"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <Icon name="AlertTriangle" className="w-4 h-4" />
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-disabled">
          Email Address <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={submitting}
          className={`w-full px-4 py-3 bg-[#0A0F1E] border rounded-lg text-white placeholder-gray-400 transition-all ${
            fieldErrors.email
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-[#2A2F3E] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]'
          } disabled:opacity-50`}
          placeholder="john@example.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <Icon name="AlertTriangle" className="w-4 h-4" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold mb-2 text-disabled">
          Subject
        </label>
        <select
          id="subject"
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          disabled={submitting}
          className="w-full px-4 py-3 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-white focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0] transition-all disabled:opacity-50"
        >
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Urgency (Dashboard only) */}
      {isDashboard && (
        <div>
          <label className="block text-sm font-semibold mb-3 text-disabled">
            Priority Level
          </label>
          <div className="space-y-2">
            {URGENCY_LEVELS.map((level) => (
              <label
                key={level.value}
                className={`flex items-center p-3 bg-[#0A0F1E] border rounded-lg cursor-pointer transition-all ${
                  formData.urgency === level.value
                    ? 'border-[#00E5A0] bg-[#00E5A0]/10'
                    : 'border-[#2A2F3E] hover:border-[#3A3F4E]'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={level.value}
                  checked={formData.urgency === level.value}
                  onChange={(e) => handleChange('urgency', e.target.value)}
                  disabled={submitting}
                  className="mr-3 w-4 h-4 text-[#00E5A0] focus:ring-[#00E5A0]"
                />
                <span className={`flex-1 ${level.color}`}>{level.label}</span>
                {formData.urgency === level.value && (
                  <Icon name="Check" className="w-5 h-5 text-[#00E5A0]" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold mb-2 text-disabled">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          disabled={submitting}
          rows={6}
          className={`w-full px-4 py-3 bg-[#0A0F1E] border rounded-lg text-white placeholder-gray-400 resize-none transition-all ${
            fieldErrors.message
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-[#2A2F3E] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]'
          } disabled:opacity-50`}
          placeholder="Tell us how we can help you..."
        />
        {fieldErrors.message && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <Icon name="AlertTriangle" className="w-4 h-4" />
            {fieldErrors.message}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          {formData.message.length} characters (minimum 10)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <Icon name="AlertTriangle" className="w-5 h-5" />
            {error}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-4 bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-lg font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Icon name="Send" className="w-5 h-5" />
            Send Message
          </>
        )}
      </button>

      {/* Privacy Note */}
      <p className="text-xs text-muted text-center">
        Your information is secure and will only be used to respond to your inquiry.
      </p>
    </form>
  );
}

