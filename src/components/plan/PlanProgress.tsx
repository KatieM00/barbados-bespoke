import React from 'react';

interface PlanProgressProps {
  visited: number;
  total: number;
}

const PlanProgress: React.FC<PlanProgressProps> = ({ visited, total }) => {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0;

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700">
          {visited} of {total} places visited
        </span>
        <span className="text-xs font-bold text-primary-600">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="text-center text-xs text-green-600 font-semibold mt-2 animate-fade-in">
          🎉 Amazing day! Don't forget to head back to the ship!
        </p>
      )}
    </div>
  );
};

export default PlanProgress;
