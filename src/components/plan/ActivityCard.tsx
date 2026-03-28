import React, { useState } from 'react';
import { Navigation, Eye, CheckCircle, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
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
      className={`bg-white rounded-2xl shadow-sm border mx-1 overflow-hidden transition-all ${
        isCheckedIn ? 'border-green-300' : 'border-gray-100'
      }`}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Emoji + number */}
          <div className="flex-shrink-0 relative">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl">
              {emoji}
            </div>
            <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
              {index + 1}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{activity.name}</h3>
              {isCheckedIn && (
                <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              )}
            </div>
            {/* Time + cost row */}
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {activity.startTime} – {activity.endTime}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <DollarSign size={12} />
                {activity.cost_bbd === 0 ? 'Free' : `$${activity.cost_bbd} BBD`}
                {gbp > 0 && <span className="text-gray-400">(~£{gbp})</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable description */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary-600 mt-2 font-medium"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Less' : 'About this place'}
        </button>

        {expanded && (
          <div className="mt-2 space-y-2 animate-fade-in">
            <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
            {activity.why_special && (
              <div className="bg-accent-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-navy mb-0.5">Why it's special</p>
                <p className="text-xs text-gray-700">{activity.why_special}</p>
              </div>
            )}
            <p className="text-xs text-gray-400">{activity.address}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-gray-100">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-primary-600 text-sm font-medium border-r border-gray-100 active:bg-primary-50 transition-colors"
        >
          <Navigation size={16} />
          Directions
        </a>
        <button
          onClick={() => onStreetView(activity)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-primary-600 text-sm font-medium border-r border-gray-100 active:bg-primary-50 transition-colors"
        >
          <Eye size={16} />
          Street View
        </button>
        {onCheckin && (
          <button
            onClick={() => onCheckin(activity)}
            disabled={isCheckedIn}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium active:bg-green-50 transition-colors ${
              isCheckedIn ? 'text-green-500' : 'text-gray-500'
            }`}
          >
            <span className="text-base">{isCheckedIn ? '✅' : '🏷️'}</span>
            {isCheckedIn ? 'Stamped!' : 'Stamp'}
          </button>
        )}
      </div>

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
