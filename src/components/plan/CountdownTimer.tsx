import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  returnTime: string; // HH:mm
}

function getSecondsRemaining(returnTime: string): number {
  const now = new Date();
  const [h, m] = returnTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  // If target is in the past, add a day
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function formatHMS(seconds: number): { hours: number; minutes: number; seconds: number } {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { hours: h, minutes: m, seconds: s };
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ returnTime }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsRemaining(returnTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsRemaining(returnTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [returnTime]);

  const { hours, minutes, seconds } = formatHMS(secondsLeft);
  const isWarning = secondsLeft < 3600; // less than 1h
  const isUrgent = secondsLeft < 1800;  // less than 30min

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm ${
        isUrgent
          ? 'bg-red-600 text-white'
          : isWarning
          ? 'bg-amber-400 text-navy'
          : 'bg-primary-700 text-white'
      }`}
    >
      <div className="flex-shrink-0">
        {isWarning ? (
          <AlertTriangle size={20} className={isUrgent ? 'text-white' : 'text-navy'} />
        ) : (
          <span className="text-xl">⏳</span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium opacity-80">Back to ship by {returnTime}</p>
        <div className="flex items-baseline gap-0.5 mt-0.5">
          <span className="text-2xl font-bold tabular-nums">
            {String(hours).padStart(2, '0')}
          </span>
          <span className="font-bold opacity-60">:</span>
          <span className="text-2xl font-bold tabular-nums">
            {String(minutes).padStart(2, '0')}
          </span>
          <span className="font-bold opacity-60">:</span>
          <span className="text-2xl font-bold tabular-nums">
            {String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs ml-1 opacity-70">remaining</span>
        </div>
      </div>
      {isUrgent && (
        <p className="text-xs font-bold animate-pulse">Head back NOW!</p>
      )}
    </div>
  );
};

export default CountdownTimer;
