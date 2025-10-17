'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';

interface ProgressSaveButtonProps {
  answers: Record<string, string | string[]>;
  questionsAsked: string[];
  lastQuestionId?: string;
  progressPercentage: number;
  onSaved?: () => void;
}

export default function ProgressSaveButton({ 
  answers, 
  questionsAsked, 
  lastQuestionId,
  progressPercentage,
  onSaved 
}: ProgressSaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/assessment/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partial_responses: answers,
          questions_asked: questionsAsked,
          last_question_id: lastQuestionId,
          progress_percentage: progressPercentage
        })
      });

      if (response.ok) {
        setSaved(true);
        if (onSaved) onSaved();
        
        // Reset saved state after 2 seconds
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation min-h-[48px] flex-1 sm:flex-initial"
    >
      {saving ? (
        <>
          <Icon name="Loader2" className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : saved ? (
        <>
          <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
          Saved!
        </>
      ) : (
        <>
          <Icon name="Save" className="h-4 w-4" />
          Save & Continue Later
        </>
      )}
    </button>
  );
}

