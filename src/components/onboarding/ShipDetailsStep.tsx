import React, { useState, useEffect } from 'react';
import { Ship, Clock, AlertCircle } from 'lucide-react';
import type { ShipDetails } from '../../types';

interface ShipDetailsStepProps {
  onNext: (details: ShipDetails) => void;
  onBack: () => void;
}

function getNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function calcAvailableHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  // Subtract 30 min buffer each way
  const available = (endMins - startMins - 60) / 60;
  return Math.max(0, Math.round(available * 10) / 10);
}

const ShipDetailsStep: React.FC<ShipDetailsStepProps> = ({ onNext, onBack }) => {
  const [startTime, setStartTime] = useState(getNow());
  const [returnTime, setReturnTime] = useState('16:00');
  const [availableHours, setAvailableHours] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setAvailableHours(calcAvailableHours(startTime, returnTime));
  }, [startTime, returnTime]);

  const handleContinue = () => {
    if (availableHours <= 0) {
      setError('Your return time must be at least 1 hour after your start time.');
      return;
    }
    setError('');
    onNext({
      departurePort: 'Bridgetown Cruise Terminal, Barbados',
      startTime,
      returnTime,
      availableHours,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 pt-12 pb-8">
        <button onClick={onBack} className="text-primary-200 text-sm mb-4 flex items-center gap-1">
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Ship size={28} />
          <h2 className="text-2xl font-bold">Your Ship Details</h2>
        </div>
        <p className="text-primary-100 text-sm">
          Tell us your schedule so we can fit the perfect day in.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Port — read only */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Port of Departure
          </label>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
            <span className="text-xl">⚓</span>
            <span className="text-gray-700 font-medium">Bridgetown Cruise Terminal, Barbados</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">All itineraries start and end here.</p>
        </div>

        {/* Start time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Clock size={15} /> When are you starting?
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 border border-gray-200 text-gray-900 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <p className="text-xs text-gray-400 mt-1">Default is now — change if you've already been ashore.</p>
        </div>

        {/* Return time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Clock size={15} /> What time must you be back onboard?
          </label>
          <input
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 border border-gray-200 text-gray-900 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <p className="text-xs text-gray-400 mt-1">Check your ship's all-aboard time.</p>
        </div>

        {/* Available hours badge */}
        {availableHours > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-center animate-fade-in">
            <p className="text-primary-700 font-semibold text-base">
              You have <span className="text-2xl font-bold">{availableHours}h</span> to explore
            </p>
            <p className="text-primary-500 text-xs mt-0.5">
              (includes 30 min walk back to terminal each end)
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 safe-area-pb">
        <button
          onClick={handleContinue}
          disabled={availableHours <= 0}
          className="w-full bg-primary-600 disabled:bg-gray-300 text-white font-bold text-lg py-4 rounded-2xl shadow-md active:scale-95 transition-all"
        >
          Choose Your Vibe →
        </button>
      </div>
    </div>
  );
};

export default ShipDetailsStep;
