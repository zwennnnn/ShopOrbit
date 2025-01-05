import { useState, useEffect } from 'react';

const CountdownTimer = ({ endDate }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endDate) - new Date();
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center justify-center space-x-2 text-sm">
      {timeLeft.days > 0 && (
        <>
          <span className="font-semibold">{timeLeft.days}</span>
          <span>gün</span>
        </>
      )}
      <span className="font-semibold">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span>:</span>
      <span className="font-semibold">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span>:</span>
      <span className="font-semibold">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
};

export default CountdownTimer;
