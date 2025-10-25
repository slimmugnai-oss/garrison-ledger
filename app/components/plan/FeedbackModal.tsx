'use client';

import { useState } from 'react';

import Icon from '../ui/Icon';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [helpfulness, setHelpfulness] = useState(0);
  const [actionability, setActionability] = useState(0);
  const [relevance, setRelevance] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (helpfulness === 0 || actionability === 0 || relevance === 0) {
      alert('Please rate all three categories');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/plan/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helpfulness,
          actionability,
          relevance,
          comments: comments.trim() || undefined
        })
      });

      if (response.ok) {
        setSubmitted(true);
        if (onSubmit) onSubmit();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    label: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-all hover:scale-110"
          >
            <Icon 
              name="Star" 
              className={`h-8 w-8 ${
                star <= value 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'fill-none text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
          <p className="text-slate-600">
            Your feedback helps us improve plans for all military families.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">How was your plan?</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <StarRating
            value={helpfulness}
            onChange={setHelpfulness}
            label="How helpful was the content?"
          />

          <StarRating
            value={actionability}
            onChange={setActionability}
            label="How actionable are the recommendations?"
          />

          <StarRating
            value={relevance}
            onChange={setRelevance}
            label="How relevant is this to your situation?"
          />

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional comments (optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What could we improve?"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={submitting || helpfulness === 0 || actionability === 0 || relevance === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Icon name="Loader" className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon name="Send" className="h-5 w-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

