import React from 'react';
import MobileHeader from '../components/layout/MobileHeader';
import { Stamp } from 'lucide-react';

const PassportPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#f5f0eb' }}>
      <MobileHeader title="Stamps" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        {/* Stamp icon */}
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(160deg, #1d3e49 0%, #3b7d93 100%)' }}
        >
          <Stamp size={44} color="white" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>Your Stamp Collection</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Every place you visit in Barbados earns you a unique stamp. Build your collection as you explore — beaches, rum shops, historic sites and more.
          </p>
        </div>

        {/* Coming soon badge */}
        <div
          className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide"
          style={{ background: '#E6D055', color: '#1d3e49' }}
        >
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default PassportPage;
