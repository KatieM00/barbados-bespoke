import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { GroupType, ActivityVibe, BudgetLevel } from '../../types';
import { VIBE_OPTIONS, BUDGET_OPTIONS, GROUP_OPTIONS } from '../../types';

interface VibeStepProps {
  onNext: (data: { groupType: GroupType; vibes: ActivityVibe[]; budget: BudgetLevel }) => void;
  onBack: () => void;
  error?: string;
}

const VibeStep: React.FC<VibeStepProps> = ({ onNext, onBack, error: externalError }) => {
  const [groupType, setGroupType] = useState<GroupType>('couple');
  const [selectedVibes, setSelectedVibes] = useState<ActivityVibe[]>([]);
  const [budget, setBudget] = useState<BudgetLevel>('mid');
  const [error, setError] = useState('');

  const toggleVibe = (vibe: ActivityVibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleGenerate = () => {
    if (selectedVibes.length === 0) {
      setError('Pick at least one vibe for your day.');
      return;
    }
    setError('');
    onNext({ groupType, vibes: selectedVibes, budget });
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 pt-12 pb-8">
        <button onClick={onBack} className="text-primary-200 text-sm mb-4 flex items-center gap-1">
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-1">Your Vibe</h2>
        <p className="text-primary-100 text-sm">
          Tell us what kind of day you want — we'll handle the rest.
        </p>
      </div>

      <div className="flex-1 px-6 py-6 space-y-7">
        {/* Group type */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Who's exploring?</h3>
          <div className="grid grid-cols-4 gap-2">
            {GROUP_OPTIONS.map(({ id, emoji, label }) => (
              <button
                key={id}
                onClick={() => setGroupType(id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  groupType === id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vibes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">What are you into?</h3>
          <p className="text-xs text-gray-400 mb-3">Pick all that apply</p>
          <div className="grid grid-cols-2 gap-2">
            {VIBE_OPTIONS.map(({ id, emoji, label }) => (
              <button
                key={id}
                onClick={() => toggleVibe(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  selectedVibes.includes(id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <span className="text-sm font-medium leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Budget?</h3>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map(({ id, symbol, label }) => (
              <button
                key={id}
                onClick={() => setBudget(id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  budget === id
                    ? 'border-accent-DEFAULT bg-accent-50 text-navy'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <span className="text-lg font-bold text-coral-500">{symbol}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {(error || externalError) && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error || externalError}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 safe-area-pb">
        <button
          onClick={handleGenerate}
          className="w-full bg-coral-DEFAULT text-white font-bold text-lg py-4 rounded-2xl shadow-md active:scale-95 transition-all"
        >
          🎲 Surprise Me!
        </button>
        <p className="text-center text-gray-400 text-xs mt-3">
          AI-powered · Updated daily · Local knowledge
        </p>
      </div>
    </div>
  );
};

export default VibeStep;
