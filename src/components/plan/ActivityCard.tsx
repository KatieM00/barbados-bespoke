import React, { useState } from 'react';
import { Navigation, Eye, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { BarbadosActivity, TransferLeg } from '../../types';
import { CATEGORY_EMOJIS, bbdToGbp } from '../../types';

interface ActivityCardProps {
  activity: BarbadosActivity;
  index: number;
  isCheckedIn?: boolean;
  onStreetView: (activity: BarbadosActivity) => void;
  onCheckin?: (activity: BarbadosActivity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  isCheckedIn = false,
  onStreetView,
  onCheckin,
}) => {
  const [expanded, setExpanded] = useState(false);
  const emoji = activity.emoji || CATEGORY_EMOJIS[activity.category] || '📍';
  const gbp = bbdToGbp(activity.cost_bbd);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    activity.google_maps_search_query || activity.address
  )}&travelmode=walking`;

  return (
    <div
      className={`bg-white rounded-xl border mx-1 overflow-hidden transition-all ${
        isCheckedIn ? 'border-green-300' : 'border-gray-100'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon circle + number */}
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{ background: '#ddeef5' }}
          >
            {emoji}
          </div>
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
            style={{ background: '#4A9CB8' }}
          >
            {index + 1}
          </div>
        </div>

        {/* Name + time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">{activity.name}</h3>
            {isCheckedIn && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {activity.startTime} – {activity.endTime}
          </p>
        </div>

        {/* Cost */}
        <div className="text-right flex-shrink-0">
          <p className="text-base font-semibold" style={{ color: '#4A9CB8' }}>
            {activity.cost_bbd === 0 ? 'Free' : `£${gbp}`}
          </p>
          {activity.cost_bbd > 0 && (
            <p className="text-[10px] text-gray-400">${activity.cost_bbd} BBD</p>
          )}
        </div>
      </div>

      {/* Show Details toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: '#4A9CB8' }}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Show Less' : 'Show Details'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
          {activity.why_special && (
            <div className="rounded-lg px-3 py-2" style={{ background: '#f0f7fa' }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#1d3e49' }}>Why it's special</p>
              <p className="text-xs text-gray-600">{activity.why_special}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">{activity.address}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors active:bg-gray-50"
              style={{ borderColor: '#4A9CB8', color: '#4A9CB8' }}
            >
              <Navigation size={13} />
              Get Directions
            </a>
            <button
              onClick={() => onStreetView(activity)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors active:bg-gray-50"
              style={{ borderColor: '#4A9CB8', color: '#4A9CB8' }}
            >
              <Eye size={13} />
              Street View
            </button>
            {onCheckin && (
              <button
                onClick={() => onCheckin(activity)}
                disabled={isCheckedIn}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  isCheckedIn ? 'border-green-200 text-green-500' : 'border-gray-200 text-gray-500 active:bg-gray-50'
                }`}
              >
                <span className="text-sm">{isCheckedIn ? '✅' : '🏷️'}</span>
                {isCheckedIn ? 'Stamped!' : 'Stamp'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Transfer card (simpler)
interface TransferCardProps {
  transfer: TransferLeg;
}

export const TransferCard: React.FC<TransferCardProps> = ({ transfer }) => {
  const modeEmoji: Record<string, string> = {
    walking: '🚶',
    taxi: '🚕',
    minibus: '🚌',
    driving: '🚗',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 mx-1">
      <div className="flex-shrink-0 text-xl">{modeEmoji[transfer.mode] || '🚕'}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 leading-snug">{transfer.notes || `${transfer.mode} to next stop`}</p>
        <p className="text-xs text-gray-400">{transfer.duration_minutes} min · {transfer.cost_bbd === 0 ? 'Free' : `$${transfer.cost_bbd} BBD`}</p>
      </div>
      <div className="text-gray-300 text-xl">↓</div>
    </div>
  );
};

export default ActivityCard;
