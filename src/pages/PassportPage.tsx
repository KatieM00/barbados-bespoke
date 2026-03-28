import React, { useEffect, useState } from 'react';
import MobileHeader from '../components/layout/MobileHeader';
import StampPassport from '../components/passport/StampPassport';
import { useCheckins } from '../hooks/useCheckins';
import type { Location } from '../types';

const PassportPage: React.FC = () => {
  const { getAllLocations } = useCheckins();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLocations()
      .then(setLocations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-20">
      <MobileHeader title="My Passport 🗺️" />
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <StampPassport locations={locations} checkins={[]} />
        )}
      </div>
    </div>
  );
};

export default PassportPage;
