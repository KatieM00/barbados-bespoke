import React from 'react';
import type { Location, Checkin } from '../../types';
import StampCard from './StampCard';

interface StampPassportProps {
  locations: Location[];
  checkins: Checkin[];
}

const StampPassport: React.FC<StampPassportProps> = ({ locations, checkins }) => {
  const checkinMap = new Map(checkins.map((c) => [c.location_id, c]));
  const collectedCount = locations.filter((l) => checkinMap.has(l.id)).length;

  return (
    <div className="space-y-4">
      {/* Passport header card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-xs font-medium uppercase tracking-widest mb-1">
              Barbados Bespoke
            </p>
            <h2 className="text-2xl font-bold">My Passport</h2>
            <p className="text-primary-100 text-sm mt-1">Authentic Barbados Explorer</p>
          </div>
          <div className="text-5xl">🗺️</div>
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{collectedCount}</span>
          <span className="text-primary-200 text-sm">/ {locations.length} stamps collected</span>
        </div>
        {collectedCount > 0 && (
          <div className="mt-3 h-2 bg-primary-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-DEFAULT rounded-full transition-all duration-700"
              style={{ width: `${Math.round((collectedCount / locations.length) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Stamps grid */}
      {locations.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">🏖️</p>
          <p className="font-medium">No locations yet</p>
          <p className="text-sm mt-1">Locations will appear as they're added to the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {locations.map((location) => {
            const checkin = checkinMap.get(location.id);
            return (
              <StampCard
                key={location.id}
                location={location}
                isCollected={!!checkin}
                checkedInAt={checkin?.checked_in_at}
              />
            );
          })}
        </div>
      )}

      {collectedCount === 0 && locations.length > 0 && (
        <p className="text-center text-sm text-gray-400 pb-2">
          Scan QR codes at participating locations to collect stamps! 🎯
        </p>
      )}
    </div>
  );
};

export default StampPassport;
