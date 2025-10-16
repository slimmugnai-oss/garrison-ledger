'use client';

import { useEffect, useState } from 'react';

export default function ScarcityTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate time until end of month
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const difference = endOfMonth.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white py-3 px-4 text-center">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span>⚡ Limited Time Offer: New Year Special Pricing Ends In:</span>
        </span>
        <div className="flex items-center gap-2 font-mono text-lg">
          <div className="bg-white/20 px-3 py-1 rounded-md backdrop-blur">
            {timeLeft.days}d
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-md backdrop-blur">
            {timeLeft.hours}h
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-md backdrop-blur">
            {timeLeft.minutes}m
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-md backdrop-blur">
            {timeLeft.seconds}s
          </div>
        </div>
      </div>
    </div>
  );
}

