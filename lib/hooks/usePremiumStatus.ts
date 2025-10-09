import { useEffect, useState } from 'react';

export function usePremiumStatus() {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const res = await fetch('/api/subscription-status', { 
          cache: 'no-store',
          credentials: 'include'
        });
        
        if (!res.ok) throw new Error('status ' + res.status);
        
        const json = await res.json();
        if (!cancelled) {
          setIsPremium(!!json.isPremium);
        }
      } catch (error) {
        console.error('Error fetching premium status:', error);
        if (!cancelled) {
          setIsPremium(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    
    return () => { 
      cancelled = true; 
    };
  }, []);

  return { isPremium, loading };
}
