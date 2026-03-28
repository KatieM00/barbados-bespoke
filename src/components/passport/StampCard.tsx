import React from 'react';
import type { Location } from '../../types';

interface StampCardProps {
  location: Location;
  isCollected: boolean;
  checkedInAt?: string;
}

const StampCard: React.FC<StampCardProps> = ({ location, isCollected, checkedInAt }) => {
  return (
    <div
      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
        isCollected
          ? 'border-primary-400 bg-primary-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      {/* Stamp circle */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 transition-all ${
          isCollected
            ? 'border-primary-400 bg-white shadow-md'
            : 'border-gray-300 bg-gray-200 grayscale opacity-50'
        }`}
      >
        {location.stamp_emoji}
      </div>

      {/* Name */}
      <p className={`text-[11px] font-semibold text-center leading-tight ${
        isCollected ? 'text-primary-700' : 'text-gray-400'
      }`}>
        {location.stamp_name}
      </p>

      {/* Check-in date */}
      {isCollected && checkedInAt && (
        <p className="text-[9px] text-gray-400">
          {new Date(checkedInAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      )}

      {/* Collected badge */}
      {isCollected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-bold shadow">
          ✓
        </div>
      )}
    </div>
  );
};

export default StampCard;
