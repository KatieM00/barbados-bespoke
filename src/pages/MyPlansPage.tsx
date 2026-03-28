import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../components/layout/MobileHeader';

const MyPlansPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-20">
      <MobileHeader title="My Plans" />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center gap-3">
        <div className="text-5xl">🌴</div>
        <p className="font-semibold text-gray-700">No saved plans yet</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Generate your first Barbados itinerary to get started.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 bg-primary-600 text-white font-bold px-6 py-3 rounded-2xl"
        >
          Plan My Day
        </button>
      </div>
    </div>
  );
};

export default MyPlansPage;
