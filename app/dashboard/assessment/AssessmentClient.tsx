'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import ProgressSaveButton from '@/app/components/assessment/ProgressSaveButton';
import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Badge from '@/app/components/ui/Badge';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';

type Question = {
  id: string;
  question: string;
  type: 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  context?: string;
};

interface AssessmentClientProps {
  isPremium: boolean;
}

export default function AssessmentClient({ isPremium }: AssessmentClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canTakeAssessment, setCanTakeAssessment] = useState(true);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [hasResumedProgress, setHasResumedProgress] = useState(false);

  // Track analytics
  const trackAnalytics = async (eventType: string, questionId?: string, timeSpent?: number) => {
    try {
      await fetch('/api/assessment/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          question_id: questionId,
          time_spent_seconds: timeSpent,
          metadata: {
            device: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            resumed: hasResumedProgress
          }
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  // Check eligibility on mount
  useEffect(() => {
    async function checkEligibility() {
      try {
        const res = await fetch('/api/assessment/can-take');
        if (res.ok) {
          const data = await res.json();
          setCanTakeAssessment(data.canTake);
          if (!data.canTake) {
            setRateLimitMessage(data.reason || 'Rate limit exceeded');
          }
        }
      } catch (err) {
        console.error('Failed to check eligibility:', err);
      }
    }
    checkEligibility();
  }, []);

  // Load first question on mount (or resume progress)
  useEffect(() => {
    if (!canTakeAssessment) return; // Don't load questions if rate limited
    
    async function init() {
      // Check for saved progress first
      const progressRes = await fetch('/api/assessment/progress');
      if (progressRes.ok) {
        const { progress } = await progressRes.json();
        
        if (progress && Object.keys(progress.partial_responses).length > 0) {
          // Resume from saved progress
          setAnswers(progress.partial_responses);
          setQuestionsAsked(progress.questions_asked);
          setHasResumedProgress(true);
          await trackAnalytics('resumed');
          
          // Load next question based on saved progress
          const res = await fetch('/api/assessment/adaptive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              answers: progress.partial_responses, 
              questionsAsked: progress.questions_asked 
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.nextQuestion) {
              setCurrentQuestion(data.nextQuestion);
            }
          }
          return;
        }
      }
      
      // No saved progress, start fresh
      await trackAnalytics('started');
      
      const res = await fetch('/api/assessment/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: {}, questionsAsked: [] })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // If profile data exists, pre-fill answers
        if (data.preAnswered) {
          setAnswers(data.preAnswered);
          // Mark pre-answered questions as already asked
          const preAnsweredIds = Object.keys(data.preAnswered);
          setQuestionsAsked(preAnsweredIds);
        }
        
        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
        }
      }
    }
    init();
  }, [canTakeAssessment]);

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

    // Track question answered
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await trackAnalytics('question_answered', currentQuestion.id, timeSpent);
    setStartTime(Date.now()); // Reset timer for next question

    await loadNextQuestion(newAnswers, newQuestionsAsked);
  }

  async function saveAssessment(finalAnswers: Record<string, string | string[]>) {
    setSaving(true);
    try {
      // Track completion
      await trackAnalytics('completed');
      
      // Clear saved progress since we're completing
      await fetch('/api/assessment/progress', { method: 'DELETE' }).catch(() => {});
      
      // Save assessment responses
      console.log('[Assessment] Saving responses:', finalAnswers);
      const saveRes = await fetch('/api/assessment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: finalAnswers })
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        console.error('[Assessment] Save failed:', errorData);
        throw new Error(errorData.details || 'Failed to save assessment');
      }

      console.log('[Assessment] ✅ Responses saved, generating AI plan...');

      // Generate AI-powered personalized plan
      const planRes = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!planRes.ok) {
        const errorData = await planRes.json();
        console.error('[Assessment] Plan generation failed:', errorData);
        throw new Error(errorData.details || 'Failed to generate plan');
      }

      console.log('[Assessment] ✅ AI plan generated!');

      // Redirect to plan
      router.push('/dashboard/plan');
    } catch (err) {
      console.error('Assessment save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete assessment';
      setError(errorMessage);
      setSaving(false);
    }
  }

  const progress = Math.round((questionsAsked.length / 6) * 100);

  // Rate limit screen
  if (!canTakeAssessment) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
          
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <AnimatedCard className="text-center p-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <Icon name="Timer" className="w-10 h-10 text-orange-600" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-text mb-4">Assessment Limit Reached</h1>
              <p className="text-lg text-text-body mb-6">{rateLimitMessage}</p>
              
              {!isPremium && (
                <div className="bg-info-subtle rounded-lg p-6 mb-6">
                  <p className="text-blue-900 font-semibold mb-3">Want to update your plan more frequently?</p>
                  <p className="text-info mb-4">
                    <strong>Premium:</strong> 10 plans/month ($9.99/mo)<br />
                    <strong>Pro:</strong> 30 plans/month ($24.99/mo)<br />
                    Stay current with PCS orders, deployments, and major financial decisions.
                  </p>
                  <Link
                    href="/dashboard/upgrade"
                    className="inline-block px-6 py-3 bg-info text-white font-bold rounded-lg hover:bg-info transition-colors"
                  >
                    View Pricing Options
                  </Link>
                </div>
              )}
              
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 border-2 border-blue-600 text-info font-semibold rounded-lg hover:bg-info-subtle transition-colors"
              >
                Return to Dashboard
              </Link>
            </AnimatedCard>
          </div>
        </div>
      </>
    );
  }

  if (saving) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
            <p className="text-2xl font-serif font-bold text-text mb-3">Generating your personalized plan...</p>
            <p className="text-base text-text-body">AI is analyzing your profile and curating 8-10 expert content blocks tailored to your situation. This may take 20-30 seconds.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Badge variant="primary">AI-Powered Assessment</Badge>
          </div>
          <PageHeader 
            title="Quick Assessment"
            subtitle="Adaptive questions that generate your AI-curated personalized plan"
          />

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-body">Progress</span>
              <span className="text-sm font-bold text-info">{questionsAsked.length} / ~6 questions</span>
            </div>
            <div className="w-full bg-surface-hover h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-slate-900 to-slate-800 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-subtle border-2 border-danger rounded-xl text-danger">
              {error}
            </div>
          )}

          {currentQuestion && (
            <AnimatedCard className="p-8 md:p-10 bg-card border-2 border-border shadow-xl">
              <div className="mb-8">
                <div className="text-sm text-info font-bold mb-3 uppercase tracking-wider">
                  Question {questionsAsked.length + 1}
                </div>
                <h2 className="text-3xl font-serif font-black text-text-headings mb-3">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.context && (
                  <p className="text-text-body italic">{currentQuestion.context}</p>
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
                          : 'border-border bg-card hover:border-blue-300 text-text-headings'
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
                    className="w-full border-2 border-border rounded-xl px-4 py-3 text-lg bg-card"
                    placeholder="Your answer..."
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                  className="px-6 py-3 bg-card hover:bg-surface-hover text-text-headings border border-border rounded-xl font-bold transition-all disabled:opacity-50 touch-manipulation min-h-[48px]"
                >
                  ← Back
                </button>
                
                {/* Progress Save Button - Only show if we have at least 1 answer */}
                {Object.keys(answers).length > 0 && (
                  <ProgressSaveButton
                    answers={answers}
                    questionsAsked={questionsAsked}
                    lastQuestionId={currentQuestion?.id}
                    progressPercentage={progress}
                  />
                )}
                
                <button
                  onClick={handleNext}
                  disabled={!currentAnswer || loading}
                  className="px-8 py-3 bg-info hover:bg-info text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 touch-manipulation min-h-[48px]"
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
