'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

type Question = {
  id: string;
  question: string;
  type: 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  context?: string;
};

export default function AdaptiveAssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load first question on mount
  useState(() => {
    loadNextQuestion({}, []);
  });

  async function loadNextQuestion(newAnswers: Record<string, string | string[]>, asked: string[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assessment/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers, questionsAsked: asked })
      });

      if (!res.ok) throw new Error('Failed to load question');

      const data = await res.json();

      if (data.needsMore && data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setCurrentAnswer('');
      } else {
        // Assessment complete - save and redirect
        await saveAssessment(newAnswers);
      }
    } catch {
      setError('Failed to load next question');
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    const newQuestionsAsked = [...questionsAsked, currentQuestion.id];

    setAnswers(newAnswers);
    setQuestionsAsked(newQuestionsAsked);

    await loadNextQuestion(newAnswers, newQuestionsAsked);
  }

  async function saveAssessment(finalAnswers: Record<string, string | string[]>) {
    setSaving(true);
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adaptive: finalAnswers })
      });

      if (!res.ok) throw new Error('Failed to save');

      // Redirect to plan
      router.push('/dashboard/plan');
    } catch {
      setError('Failed to save assessment');
      setSaving(false);
    }
  }

  const progress = Math.round((questionsAsked.length / 10) * 100);

  if (saving) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
            <p className="text-2xl font-serif font-bold text-text">Generating your personalized plan...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-black text-text mb-2">Quick Assessment</h1>
            <p className="text-xl text-muted">AI-powered assessment that adapts to your situation</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted">Progress</span>
              <span className="text-sm font-bold text-blue-600">{questionsAsked.length} / ~10 questions</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
              {error}
            </div>
          )}

          {currentQuestion && (
            <AnimatedCard className="p-8 md:p-10 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-xl">
              <div className="mb-8">
                <div className="text-sm text-blue-600 font-bold mb-3 uppercase tracking-wider">
                  Question {questionsAsked.length + 1}
                </div>
                <h2 className="text-3xl font-serif font-black text-text mb-3">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.context && (
                  <p className="text-muted italic">{currentQuestion.context}</p>
                )}
              </div>

              {/* Render question based on type */}
              {currentQuestion.type === 'select' && currentQuestion.options && (
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map(option => (
                    <button
                      key={option}
                      onClick={() => setCurrentAnswer(option)}
                      className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                        currentAnswer === option
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white hover:border-blue-300 text-text'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <div className="mb-8">
                  <input
                    type="text"
                    value={currentAnswer as string}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg"
                    placeholder="Your answer..."
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (questionsAsked.length > 0) {
                      const lastQ = questionsAsked[questionsAsked.length - 1];
                      setQuestionsAsked(prev => prev.slice(0, -1));
                      const newAnswers = { ...answers };
                      delete newAnswers[lastQ];
                      setAnswers(newAnswers);
                      loadNextQuestion(newAnswers, questionsAsked.slice(0, -1));
                    }
                  }}
                  disabled={questionsAsked.length === 0 || loading}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!currentAnswer || loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Next →'}
                </button>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

