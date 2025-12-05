import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ETACountdown({ eta, orderDate }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!eta) {
      setTimeRemaining(null);
      return;
    }

    const parseETA = (etaString) => {
      // Handle formats like "Today, 6:30 PM" or ISO date strings
      if (etaString.includes('Today')) {
        const timeMatch = etaString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          const [, hours, minutes, period] = timeMatch;
          let hour24 = parseInt(hours);
          if (period.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
          if (period.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
          
          const today = new Date();
          today.setHours(hour24, parseInt(minutes), 0, 0);
          return today;
        }
      }
      
      // Try parsing as ISO date
      const parsed = new Date(etaString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      return null;
    };

    const calculateTimeRemaining = () => {
      const etaDate = parseETA(eta);
      if (!etaDate) {
        setTimeRemaining(null);
        return;
      }

      const now = new Date();
      const diff = etaDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, total: diff });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [eta]);

  if (!timeRemaining) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock size={16} />
        <span>ETA: {eta || 'Not set'}</span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <Clock size={16} />
        <span>ETA Passed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock size={16} className="text-primary" />
      <div className="flex items-center gap-1">
        <span className="text-gray-600">ETA in:</span>
        <span className="font-semibold text-primary">
          {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
          {timeRemaining.minutes}m {timeRemaining.seconds}s
        </span>
      </div>
    </div>
  );
}

