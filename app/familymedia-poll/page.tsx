'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface PollOption {
  label: string;
  count: number;
  message: string;
  toolUrl: string;
}

interface PollData {
  tsp: PollOption;
  housing: PollOption;
  retirement: PollOption;
}

function PollContent() {
  const searchParams = useSearchParams();
  const [currentVote, setCurrentVote] = useState<string | null>(null);
  const [pollData, setPollData] = useState<PollData>({
    tsp: { 
      label: 'How do I optimize my TSP allocations?',
      count: 142,
      message: '<strong>Smart choice!</strong> TSP optimization is one of the highest-impact financial decisions you can make. The difference between good and great allocation can mean hundreds of thousands at retirement.',
      toolUrl: 'https://garrisonledger.com/dashboard/tools/tsp-modeler?utm_source=familymedia&utm_medium=poll&utm_campaign=202511_tsp'
    },
    housing: { 
      label: 'Should I use my VA loan or save it?',
      count: 98,
      message: '<strong>Great question!</strong> The VA loan is one of your most valuable military benefits. Understanding when to use it (and when to save it) can save you tens of thousands over your career.',
      toolUrl: 'https://garrisonledger.com/dashboard/tools/house-hacking?utm_source=familymedia&utm_medium=poll&utm_campaign=202511_housing'
    },
    retirement: { 
      label: 'How does BRS vs High-3 affect retirement?',
      count: 76,
      message: '<strong>Critical question!</strong> BRS vs High-3 is one of the most important financial decisions in your military career. The right choice depends on your career timeline and retirement goals.',
      toolUrl: 'https://garrisonledger.com/dashboard/ask?utm_source=familymedia&utm_medium=poll&utm_campaign=202511_retirement'
    }
  });
  const [showBars, setShowBars] = useState(false);

  useEffect(() => {
    const initialAnswer = searchParams.get('answer');
    if (initialAnswer && (initialAnswer === 'tsp' || initialAnswer === 'housing' || initialAnswer === 'retirement')) {
      setCurrentVote(initialAnswer);
    }
    
    // Trigger bar animation
    setTimeout(() => setShowBars(true), 200);
  }, [searchParams]);

  const calculatePercentages = () => {
    const total = pollData.tsp.count + pollData.housing.count + pollData.retirement.count;
    return {
      tsp: Math.round((pollData.tsp.count / total) * 100),
      housing: Math.round((pollData.housing.count / total) * 100),
      retirement: Math.round((pollData.retirement.count / total) * 100)
    };
  };

  const handleVote = (answer: 'tsp' | 'housing' | 'retirement') => {
    setPollData(prev => {
      const newData = { ...prev };
      
      // If changing vote, adjust counts
      if (currentVote && currentVote !== answer) {
        newData[currentVote as keyof PollData].count--;
      }
      
      // If new vote or different vote, increment
      if (!currentVote || currentVote !== answer) {
        newData[answer].count++;
      }
      
      return newData;
    });
    
    setCurrentVote(answer);
    
    // Update URL without reload
    window.history.replaceState(null, '', `?answer=${answer}`);
  };

  const percentages = calculatePercentages();
  const currentData = currentVote ? pollData[currentVote as keyof PollData] : null;

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: Arial, Helvetica, sans-serif;
          background-color: #FDFBF5;
          color: #2F3A45;
          line-height: 1.6;
          padding: 20px;
        }
        
        .poll-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        
        .poll-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 40px 32px;
          box-shadow: 0 4px 12px rgba(47, 58, 69, 0.08);
          margin-bottom: 24px;
        }
        
        .poll-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .logo-container {
          margin-bottom: 20px;
        }
        
        .logo-container img {
          width: 220px;
          max-width: 100%;
          height: auto;
          margin: 0 auto;
          display: block;
        }
        
        .checkmark-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .poll-h1 {
          font-size: 32px;
          font-weight: 700;
          color: #2F3A45;
          margin-bottom: 12px;
          line-height: 1.2;
        }
        
        .poll-subtitle {
          font-size: 18px;
          color: #6c757d;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .poll-description {
          font-size: 15px;
          color: #6c757d;
          max-width: 560px;
          margin: 0 auto;
        }
        
        .poll-voting {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .poll-question {
          font-size: 18px;
          font-weight: 700;
          color: #2F3A45;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .vote-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .vote-option {
          background: #ffffff;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 16px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        
        .vote-option:hover {
          border-color: #10B981;
          background: #f0fdf4;
          transform: translateX(4px);
        }
        
        .vote-option.selected {
          border-color: #10B981;
          background: #E8F5E8;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .vote-option.selected::after {
          content: '✓';
          position: absolute;
          right: 20px;
          font-size: 20px;
          font-weight: 700;
          color: #10B981;
        }
        
        .vote-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #dee2e6;
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
          transition: all 0.2s ease;
        }
        
        .vote-option.selected .vote-radio {
          border-color: #10B981;
          background: #10B981;
        }
        
        .vote-option.selected .vote-radio::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
        
        .vote-label {
          font-size: 15px;
          font-weight: 600;
          color: #2F3A45;
          flex: 1;
        }
        
        .change-vote-hint {
          text-align: center;
          font-size: 13px;
          color: #6c757d;
          margin-top: 12px;
          font-style: italic;
        }
        
        .poll-results {
          margin: 32px 0;
        }
        
        .results-title {
          font-size: 20px;
          font-weight: 700;
          color: #2F3A45;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .poll-item {
          margin-bottom: 20px;
        }
        
        .poll-header-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        
        .poll-label {
          font-size: 15px;
          font-weight: 600;
          color: #2F3A45;
        }
        
        .poll-count {
          font-size: 13px;
          color: #6c757d;
        }
        
        .poll-bar-container {
          background: #f3f4f6;
          border-radius: 8px;
          height: 40px;
          overflow: hidden;
          position: relative;
        }
        
        .poll-bar {
          background: linear-gradient(90deg, #10B981, #059669);
          height: 100%;
          transition: width 0.8s ease-out;
          display: flex;
          align-items: center;
          padding: 0 12px;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px 0 0 8px;
        }
        
        .poll-bar.your-vote {
          background: linear-gradient(90deg, #1e293b, #0F172A);
          box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.2);
        }
        
        .thank-you {
          background: #E8F5E8;
          border-left: 4px solid #10B981;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
        }
        
        .thank-you p {
          font-size: 15px;
          color: #2F3A45;
          line-height: 1.6;
          margin-bottom: 0;
        }
        
        .share-story {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        
        .share-story h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 700;
          color: #2F3A45;
        }
        
        .share-story p {
          margin: 0 0 20px 0;
          font-size: 15px;
          color: #2F3A45;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .cta-section {
          text-align: center;
          margin-top: 32px;
        }
        
        .poll-btn {
          display: inline-block;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          font-size: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin: 8px;
        }
        
        .btn-primary {
          background: #2F3A45;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(47, 58, 69, 0.2);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(47, 58, 69, 0.3);
        }
        
        .btn-secondary {
          background: #10B981;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }
        
        .poll-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #dee2e6;
        }
        
        .poll-footer p {
          font-size: 13px;
          color: #6c757d;
          margin-bottom: 8px;
        }
        
        .poll-footer a {
          color: #2F3A45;
          text-decoration: underline;
          font-weight: 600;
        }
        
        @media screen and (max-width: 600px) {
          .poll-container {
            padding: 20px 16px;
          }
          
          .poll-card {
            padding: 28px 20px;
          }
          
          .poll-h1 {
            font-size: 26px;
          }
          
          .poll-btn {
            display: block;
            margin: 8px 0;
          }
          
          .vote-option {
            padding: 14px 16px;
          }
        }
      `}</style>

      <div className="poll-container">
        <div className="poll-card">
          {/* Header */}
          <div className="poll-header">
            <div className="logo-container">
              <img src="https://i.imgur.com/YourFamilyLogoHere.png" alt="Family Magazine Logo" />
            </div>
            
            <div className="checkmark-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className="poll-h1">
              {currentVote ? 'Thanks for Voting!' : 'Community Poll'}
            </h1>
            <p className="poll-subtitle">
              {currentVote ? `Your vote: ${pollData[currentVote as keyof PollData].label}` : 'Cast your vote and see the results!'}
            </p>
            <p className="poll-description">
              See how the military community is answering this month&apos;s poll question.
            </p>
          </div>
          
          {/* Interactive Poll Voting */}
          <div className="poll-voting">
            <h2 className="poll-question">What&apos;s your biggest military finance question right now?</h2>
            <div className="vote-options">
              <div 
                className={`vote-option ${currentVote === 'tsp' ? 'selected' : ''}`}
                onClick={() => handleVote('tsp')}
              >
                <div className="vote-radio"></div>
                <div className="vote-label">How do I optimize my TSP allocations?</div>
              </div>
              <div 
                className={`vote-option ${currentVote === 'housing' ? 'selected' : ''}`}
                onClick={() => handleVote('housing')}
              >
                <div className="vote-radio"></div>
                <div className="vote-label">Should I use my VA loan or save it?</div>
              </div>
              <div 
                className={`vote-option ${currentVote === 'retirement' ? 'selected' : ''}`}
                onClick={() => handleVote('retirement')}
              >
                <div className="vote-radio"></div>
                <div className="vote-label">How does BRS vs High-3 affect my retirement?</div>
              </div>
            </div>
            <p className="change-vote-hint">Click any option to vote or change your answer</p>
          </div>
          
          {/* Poll Results */}
          <div className="poll-results">
            <h2 className="results-title">Community Poll Results</h2>
            
            <div className="poll-item">
              <div className="poll-header-row">
                <span className="poll-label">How do I optimize my TSP allocations?</span>
                <span className="poll-count">{pollData.tsp.count} votes</span>
              </div>
              <div className="poll-bar-container">
                <div 
                  className={`poll-bar ${currentVote === 'tsp' ? 'your-vote' : ''}`}
                  style={{ width: showBars ? `${percentages.tsp}%` : '0%' }}
                >
                  <span>{percentages.tsp}%</span>
                </div>
              </div>
            </div>
            
            <div className="poll-item">
              <div className="poll-header-row">
                <span className="poll-label">Should I use my VA loan or save it?</span>
                <span className="poll-count">{pollData.housing.count} votes</span>
              </div>
              <div className="poll-bar-container">
                <div 
                  className={`poll-bar ${currentVote === 'housing' ? 'your-vote' : ''}`}
                  style={{ width: showBars ? `${percentages.housing}%` : '0%' }}
                >
                  <span>{percentages.housing}%</span>
                </div>
              </div>
            </div>
            
            <div className="poll-item">
              <div className="poll-header-row">
                <span className="poll-label">How does BRS vs High-3 affect retirement?</span>
                <span className="poll-count">{pollData.retirement.count} votes</span>
              </div>
              <div className="poll-bar-container">
                <div 
                  className={`poll-bar ${currentVote === 'retirement' ? 'your-vote' : ''}`}
                  style={{ width: showBars ? `${percentages.retirement}%` : '0%' }}
                >
                  <span>{percentages.retirement}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Thank You Message */}
          {currentData && (
            <div className="thank-you">
              <p dangerouslySetInnerHTML={{ __html: currentData.message }} />
            </div>
          )}
          
          {!currentVote && (
            <div className="thank-you">
              <p>
                <strong>Great question!</strong> This is one of the most important financial decisions for military families. Family Magazine partners with experts to bring you trusted resources and tools to help you make informed decisions.
              </p>
            </div>
          )}
          
          {/* Share Your Story Section */}
          <div className="share-story">
            <h3>Share Your Success Story</h3>
            <p>
              Did Garrison Ledger help you save thousands on a PCS? Optimize your TSP? Make a smart housing decision? We want to hear from you!
            </p>
            <a 
              href="mailto:support@garrisonledger.com?subject=Success%20Story%20Submission&body=I'd%20like%20to%20share%20my%20success%20story%20with%20Garrison%20Ledger%3A%0A%0A" 
              className="poll-btn btn-secondary"
            >
              Share Your Story via Email
            </a>
          </div>
          
          {/* CTAs */}
          <div className="cta-section">
            <a 
              href="https://familymedia.com?utm_source=poll&utm_medium=landing&utm_campaign=202511_Newsletter" 
              className="poll-btn btn-primary"
            >
              Return to FamilyMedia.com
            </a>
            <a 
              href={currentData ? currentData.toolUrl : 'https://garrisonledger.com/dashboard?utm_source=familymedia&utm_medium=poll&utm_campaign=202511_Newsletter'} 
              className="poll-btn btn-secondary"
            >
              Explore Financial Tools
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <div className="poll-footer">
          <p>This poll is part of the <strong>Family Magazine Guide Newsletter</strong></p>
          <p>
            Sponsored by <a href="https://garrisonledger.com?utm_source=familymedia&utm_medium=poll_footer&utm_campaign=202511" target="_blank" rel="noopener">Garrison Ledger</a> - Military Financial Intelligence
          </p>
          <p style={{ marginTop: '16px' }}>
            <a href="https://familymedia.com?utm_source=poll&utm_medium=footer&utm_campaign=202511">Visit FamilyMedia.com</a> | 
            <a href="https://familymedia.com/newsletter?utm_source=poll&utm_medium=footer&utm_campaign=202511"> Subscribe to Newsletter</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default function FamilyMediaPoll() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#6c757d'
      }}>
        Loading poll...
      </div>
    }>
      <PollContent />
    </Suspense>
  );
}

