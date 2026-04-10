import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Sparkles, Eye, Pencil, Check, Dice5, BookmarkPlus, Share2, GripVertical, Trash2, Plus, Search, X, Navigation, DollarSign, Sun, Footprints, Car, Bus } from 'lucide-react';
import type { BarbadosDayPlan, BarbadosActivity, ItineraryEvent, TransferLeg, CruiseTouristPreferences, ActivePlan } from '../types';
import { LOADING_MESSAGES, bbdToGbp, ACTIVE_PLAN_KEY } from '../types';
import { ActivityCard } from '../components/plan/ActivityCard';
import StreetViewModal from '../components/plan/StreetViewModal';
import MobileHeader from '../components/layout/MobileHeader';
import PlanForm from '../components/plan/PlanForm';
import type { PlanFormValues } from '../components/plan/PlanForm';
import { generateBarbadosPlan, searchActivities } from '../services/api';

const TRANSFER_ICONS: Record<string, React.ElementType> = {
  walking: Footprints, taxi: Car, minibus: Bus, driving: Car,
};

const SAVE_KEY = 'barbados_saved_plan';

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
    style={{ background: '#1d3e49', whiteSpace: 'nowrap' }}
  >
    {message}
  </div>
);

// ─── Add-more overlay ─────────────────────────────────────────────────────────

interface AddMoreOverlayProps {
  onAdd: (activity: BarbadosActivity) => void;
  onClose: () => void;
}

const AddMoreOverlay: React.FC<AddMoreOverlayProps> = ({ onAdd, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BarbadosActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const found = await searchActivities(query.trim());
      setResults(found);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-base font-bold" style={{ color: '#1d3e49' }}>Add to your day</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. rum tour, beach, history…"
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                border: '1.5px solid #c3dfe8',
                color: '#1d3e49',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: '#E6D055', color: '#1d3e49' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-3">
          {!searched && (
            <p className="text-xs text-center text-gray-400 pt-4">
              Search for a place, vibe, or type of activity
            </p>
          )}
          {searched && !loading && results.length === 0 && (
            <p className="text-xs text-center text-gray-400 pt-4">No results found — try a different search</p>
          )}
          {results.map((activity) => {
            const emoji = activity.emoji ?? '📍';
            const gbp = bbdToGbp(activity.cost_bbd);
            return (
              <button
                key={activity.id}
                onClick={() => { onAdd(activity); onClose(); }}
                className="w-full flex items-start gap-3 p-4 rounded-2xl text-left active:scale-[0.99] transition-all"
                style={{ background: '#f0f7fa', border: '1.5px solid #c3dfe8' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: '#ddeef5' }}
                >
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#1d3e49' }}>{activity.name}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#4a7a8a' }}>{activity.description}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#4A9CB8' }}>
                    {activity.cost_bbd === 0 ? 'Free' : `$${activity.cost_bbd} BBD`}
                    {gbp > 0 && <span className="text-gray-400"> (~£{gbp})</span>}
                  </p>
                </div>
                <Plus size={16} className="flex-shrink-0 mt-1" style={{ color: '#4A9CB8' }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const PlanPage: React.FC = () => {
  const [plan, setPlan] = useState<BarbadosDayPlan | null>(null);
  const [currentPreferences, setCurrentPreferences] = useState<CruiseTouristPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [streetViewActivity, setStreetViewActivity] = useState<BarbadosActivity | null>(null);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());

  const [isEditing, setIsEditing] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [goModal, setGoModal] = useState<{ mapsUrl: string; planStartTime: string; currentTime: string } | null>(null);

  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ── Generation ───────────────────────────────────────────────────────────────

  const runGeneration = async (preferences: CruiseTouristPreferences, surprise: boolean) => {
    setIsLoading(true);
    setError(null);
    setSurpriseMode(surprise);
    setRevealedCount(0);
    setIsEditing(false);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2000);

    try {
      const generated = await generateBarbadosPlan(preferences);
      clearInterval(msgInterval);
      console.log('PLAN_GENERATED: plan =', generated);
      const actCount = generated.events.filter((e) => e.type === 'activity').length;
      setRevealedCount(surprise ? (actCount > 0 ? 1 : 0) : actCount);
      setPlan(generated);
      // Store venue names from this plan to avoid repetition in future generations this session
      const venueNames = generated.events
        .filter((e) => e.type === 'activity')
        .map((e) => (e.data as BarbadosActivity).name)
        .filter(Boolean);
      setSessionSuggestions((prev) => [...new Set([...prev, ...venueNames])]);
      sessionStorage.setItem('plan_ready', '1');
      window.dispatchEvent(new Event('plan_ready'));
      window.scrollTo(0, 0);
    } catch (err) {
      clearInterval(msgInterval);
      setError(err instanceof Error ? err.message : 'Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Track venue names suggested this session to avoid repetition
  // TODO: Replace sessionSuggestions with user's full Supabase plan history when history saving is implemented
  const [sessionSuggestions, setSessionSuggestions] = useState<string[]>([]);

  const handleSubmit = async (values: PlanFormValues) => {
    console.log('PLAN_FORM_SUBMIT: startLocation =', values.startLocation);
    const preferences: CruiseTouristPreferences = {
      shipDetails: values.shipDetails,
      groupType: values.groupType,
      vibes: values.vibes,
      mustDos: values.mustDos,
      meals: values.meals,
      budgetGbp: values.budgetGbp,
      transportPreferences: values.transportPreferences,
      planDate: new Date().toISOString().split('T')[0],
      previouslySuggested: sessionSuggestions.length > 0 ? sessionSuggestions.join(', ') : undefined,
    };
    console.log('PLAN_PREFERENCES: startLocation =', preferences.shipDetails);
    setCurrentPreferences(preferences);
    await runGeneration(preferences, values.surpriseMode);
  };

  const handleRollDice = async () => {
    if (!currentPreferences) return;
    await runGeneration(currentPreferences, surpriseMode);
  };

  // ── Reveal ───────────────────────────────────────────────────────────────────

  const handleRevealMore = () => {
    if (!plan) return;
    const actCount = plan.events.filter((e) => e.type === 'activity').length;
    setRevealedCount((prev) => Math.min(prev + 1, actCount));
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleStartOver = () => {
    setPlan(null);
    setError(null);
    setRevealedCount(0);
    setIsEditing(false);
    sessionStorage.removeItem('plan_ready');
    window.dispatchEvent(new Event('plan_ready'));
    window.scrollTo(0, 0);
  };

  const handleCheckin = (activity: BarbadosActivity) => {
    setCheckedInIds((prev) => new Set([...prev, activity.id]));
  };

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!plan) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(plan));
      showToast('Plan saved ✓');
    } catch {
      showToast('Could not save — storage full');
    }
  };

  // ── Go (from bottom nav) — full multi-stop Maps flow ─────────────────────────

  useEffect(() => {
    const handleGo = () => {
      if (!plan) return;

      console.log('GO_PRESSED: startLocation =', plan.preferences.shipDetails);
      console.log('GO_FLOW: saving plan and checking start time');

      try { localStorage.setItem(SAVE_KEY, JSON.stringify(plan)); } catch { /* storage full */ }

      // Times
      const planStartTime = plan.preferences.shipDetails.startTime; // HH:mm
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      console.log('GO_FLOW: planStartTime =', planStartTime, 'deviceTime =', currentTime);

      // Origin
      const origin = plan.preferences.shipDetails.departurePort || 'Bridgetown Cruise Terminal, Barbados';
      console.log('GO_FLOW: origin =', origin);

      // Waypoints — all activities, capped at 9
      const allWaypoints = plan.events
        .filter((e) => e.type === 'activity')
        .map((e) => (e.data as BarbadosActivity).google_maps_search_query || (e.data as BarbadosActivity).address)
        .filter(Boolean);
      const waypoints = allWaypoints.slice(0, 9);
      if (allWaypoints.length > 9) console.log('GO_FLOW: waypoints capped at 9');
      console.log('GO_FLOW: waypoints =', waypoints);

      // Destination
      const destination = plan.preferences.shipDetails.endLocation || origin;
      console.log('GO_FLOW: destination =', destination);

      // Travel mode
      const modeMap: Record<string, string> = { walk: 'walking', 'public-transport': 'transit', taxi: 'driving' };
      const firstPref = plan.preferences.transportPreferences?.[0] ?? 'taxi';
      const travelMode = modeMap[firstPref] ?? 'driving';
      console.log('GO_FLOW: travelMode =', travelMode);

      // Build URL
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${waypoints.map(encodeURIComponent).join('|')}&travelmode=${travelMode}`;
      console.log('GO_FLOW: mapsUrl =', mapsUrl);

      // Transport mode for ActivePlan
      const activePlanMode = (travelMode as 'walking' | 'transit' | 'driving');

      const buildActivePlan = (hasStarted: boolean): ActivePlan => ({
        plan,
        startLocation: origin,
        endLocation: destination,
        primaryTransportMode: activePlanMode,
        activatedAt: new Date().toISOString(),
        hasStarted,
      });

      if (currentTime >= planStartTime) {
        // Start now
        try { localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(buildActivePlan(true))); } catch { /* storage full */ }
        navigate('/');
        window.open(mapsUrl, '_blank');
        console.log('GO_FLOW: plan started immediately');
      } else {
        // Show early-start modal
        try { localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(buildActivePlan(false))); } catch { /* storage full */ }
        setGoModal({ mapsUrl, planStartTime, currentTime });
      }
    };

    window.addEventListener('go_pressed', handleGo);
    return () => window.removeEventListener('go_pressed', handleGo);
  }, [plan, navigate]);

  // ── Edit: drag-and-drop ───────────────────────────────────────────────────────

  const handleDragEnd = (result: DropResult) => {
    if (!plan || !result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    // Extract only activity events in order
    const activityEvents = plan.events.filter((e) => e.type === 'activity');
    const transferEvents = plan.events.filter((e) => e.type === 'transfer');

    // Reorder activities
    const reordered = [...activityEvents];
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    // Interleave with transfers (keep same transfers, just reorder activities between them)
    const newEvents: ItineraryEvent[] = [];
    reordered.forEach((actEvent, i) => {
      newEvents.push(actEvent);
      if (i < transferEvents.length) newEvents.push(transferEvents[i]);
    });

    setPlan({ ...plan, events: newEvents });
  };

  // ── Edit: delete ─────────────────────────────────────────────────────────────

  const handleDeleteActivity = (activityId: string) => {
    if (!plan) return;
    const events = plan.events;
    const actIdx = events.findIndex(
      (e) => e.type === 'activity' && (e.data as BarbadosActivity).id === activityId
    );
    if (actIdx === -1) return;
    const newEvents = [...events];
    if (actIdx > 0 && newEvents[actIdx - 1].type === 'transfer') {
      newEvents.splice(actIdx - 1, 2);
    } else {
      newEvents.splice(actIdx, 1);
    }
    setPlan({ ...plan, events: newEvents });
  };

  // ── Add more ─────────────────────────────────────────────────────────────────

  const handleAddActivity = (activity: BarbadosActivity) => {
    if (!plan) return;
    // Append a transfer divider + the new activity at the end
    const lastActivity = [...plan.events].reverse().find((e) => e.type === 'activity');
    const lastEndTime = lastActivity
      ? (lastActivity.data as BarbadosActivity).endTime
      : plan.preferences.shipDetails.startTime;

    const transferLeg: TransferLeg = {
      id: `tr-added-${Date.now()}`,
      from: lastActivity ? (lastActivity.data as BarbadosActivity).name : 'Previous stop',
      to: activity.name,
      startTime: lastEndTime,
      endTime: lastEndTime, // approximate — no routing available
      duration_minutes: 15,
      mode: 'taxi',
      cost_bbd: 0,
    };

    const newActivity: BarbadosActivity = {
      ...activity,
      id: `${activity.id}-${Date.now()}`,
      startTime: lastEndTime,
      endTime: lastEndTime,
    };

    setPlan({
      ...plan,
      events: [
        ...plan.events,
        { type: 'transfer', data: transferLeg },
        { type: 'activity', data: newActivity },
      ],
    });
    showToast(`${activity.name} added ✓`);
  };

  // ── Share ─────────────────────────────────────────────────────────────────────

  const handlePrint = () => {
    setShowShareSheet(false);
    setTimeout(() => window.print(), 150);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 pb-28">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 max-w-xl w-full mx-auto text-center py-12">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <div className="absolute top-0 left-0 w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-primary-800 mb-2">Building Your Perfect Day</h3>
              <p className="text-neutral-600 min-h-[1.5rem] transition-all duration-300 animate-pulse">
                {loadingMsg}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 pb-28">
        <div className="bg-white rounded-lg shadow-md p-4 max-w-xl w-full mx-auto text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return <PlanForm onSubmit={handleSubmit} />;

  // Extract activity list for surprise mode
  const activityEvents = plan.events.filter(
    (e): e is ItineraryEvent & { type: 'activity' } => e.type === 'activity'
  );
  const activities = activityEvents.map((e) => e.data as BarbadosActivity);
  const allRevealed = revealedCount >= activities.length;

  // Build draggable activity list (only activities, interleaved with static transfers in render)
  const activityOnlyEvents = plan.events.filter((e) => e.type === 'activity');

  // Plan header metadata
  const totalGbp = Math.round(bbdToGbp(plan.totalCost_bbd));

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <MobileHeader title="🌴 Barbados" showBack onBack={handleStartOver} />

      {/* Plan header card */}
      <div className="mx-3 mt-3 mb-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="px-4 pt-4 pb-3"
          style={{ background: 'linear-gradient(160deg, #1d3e49 0%, #2c5e6e 40%, #3b7d93 100%)' }}
        >
          <h2 className="text-white font-bold text-lg leading-tight">{plan.title}</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-white/80">
              <DollarSign size={12} />
              {plan.totalCost_bbd === 0 ? 'Free' : (
                <span className="flex flex-col leading-tight">
                  <span>BBD ${plan.totalCost_bbd}</span>
                  <span className="text-white/60 text-[10px]">≈ £{totalGbp}</span>
                </span>
              )}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/70">
              <Sun size={12} />
              28°C · Sunny
            </span>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex border-t border-gray-100 divide-x divide-gray-100">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold active:bg-gray-50 transition-colors"
            style={{ color: '#1d3e49' }}
          >
            <BookmarkPlus size={15} />
            Save Plan
          </button>
          <button
            onClick={() => setShowShareSheet(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold active:bg-gray-50 transition-colors"
            style={{ color: '#1d3e49' }}
          >
            <Share2 size={15} />
            Share
          </button>
          <button
            onClick={() => setIsEditing((v) => !v)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
              isEditing ? 'text-white' : 'active:bg-gray-50'
            }`}
            style={isEditing ? { background: '#4A9CB8', color: 'white' } : { color: '#1d3e49' }}
          >
            {isEditing ? <Check size={15} /> : <Pencil size={15} />}
            {isEditing ? 'Done' : 'Edit Plan'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mx-3 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
          <GripVertical size={14} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Drag to reorder · tap <Trash2 size={11} className="inline" /> to remove
          </p>
        </div>
      )}

      {surpriseMode && !allRevealed && !isEditing && (
        <div className="mx-3 mb-2 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🎲</span>
          <div>
            <p className="text-xs font-semibold text-primary-700">Surprise Mode</p>
            <p className="text-xs text-primary-600">
              {revealedCount} of {activities.length} stops revealed — tap Reveal to uncover the next one!
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 pb-28 px-3 pt-1">
        {isEditing ? (
          // ── Drag-and-drop mode ────────────────────────────────────────────────
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="activities">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                  {activityOnlyEvents.map((event, idx) => {
                    const activity = event.data as BarbadosActivity;
                    return (
                      <Draggable key={activity.id} draggableId={activity.id} index={idx}>
                        {(drag, snapshot) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            className={`py-1 transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <div className="relative">
                              {/* Drag handle + delete */}
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1">
                                <div
                                  {...drag.dragHandleProps}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical size={14} />
                                </div>
                              </div>
                              <div className="ml-6">
                                <ActivityCard
                                  activity={activity}
                                  index={idx}
                                  isCheckedIn={false}
                                  onStreetView={setStreetViewActivity}
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="absolute -right-1 top-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-400 active:bg-red-100 z-10"
                                aria-label="Remove"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          // ── Normal view (with transfers interleaved) ──────────────────────────
          <div className="space-y-1">
            {(() => {
              let actIdx = 0;
              return plan.events.map((event, i) => {
                if (event.type === 'activity') {
                  const activity = event.data as BarbadosActivity;
                  const aIdx = actIdx++;

                  if (surpriseMode && aIdx >= revealedCount) {
                    return (
                      <div key={activity.id || i} className="py-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-1 px-4 py-5 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-neutral-400 text-2xl">?</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-neutral-400 text-base">Mystery Stop {aIdx + 1}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Reveal when you're ready</p>
                          </div>
                          {aIdx === revealedCount && (
                            <button
                              onClick={handleRevealMore}
                              className="flex items-center gap-1 bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg active:scale-95 transition-all"
                            >
                              <Eye size={14} /> Reveal
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={activity.id || i} className="py-1">
                      <ActivityCard
                        activity={activity}
                        index={aIdx}
                        isCheckedIn={checkedInIds.has(activity.id)}
                        onStreetView={setStreetViewActivity}
                        onCheckin={handleCheckin}
                      />
                    </div>
                  );
                }

                if (event.type === 'transfer') {
                  const t = event.data as TransferLeg;
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(t.to)}&origin=${encodeURIComponent(t.from)}&travelmode=${t.mode === 'walking' ? 'walking' : 'driving'}`;
                  const TransportIcon = TRANSFER_ICONS[t.mode] ?? Car;
                  return (
                    <a
                      key={i}
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl active:bg-blue-50 transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#ddeef5' }}
                      >
                        <TransportIcon size={14} style={{ color: '#4A9CB8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600">
                          {t.mode.charAt(0).toUpperCase() + t.mode.slice(1)} to next stop
                        </p>
                        <p className="text-xs text-gray-400">~{t.duration_minutes} min{t.cost_bbd > 0 ? ` · $${t.cost_bbd} BBD` : ''}</p>
                      </div>
                      <Navigation size={12} className="text-gray-300 flex-shrink-0" />
                    </a>
                  );
                }
                return null;
              });
            })()}
          </div>
        )}

        {isEditing ? (
          /* Edit mode footer */
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => setShowAddMore(true)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ borderColor: '#4A9CB8', color: '#4A9CB8' }}
            >
              <Plus size={16} />
              Add more
            </button>
            {currentPreferences && (
              <button
                onClick={handleRollDice}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                style={{ background: '#E6D055', color: '#1d3e49' }}
              >
                <Dice5 size={18} />
                Roll the dice — try a different plan
              </button>
            )}
            <button
              onClick={handleStartOver}
              className="w-full py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-medium text-sm active:bg-primary-50 transition-all"
            >
              Plan a New Day
            </button>
          </div>
        ) : null}
      </div>

      {/* Share sheet */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareSheet(false)} />
          <div className="relative bg-white rounded-t-2xl px-5 pt-5 pb-10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Share your plan</h2>
              <button onClick={() => setShowShareSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-3 w-full px-4 py-4 rounded-xl bg-neutral-50 border border-gray-100 text-left active:bg-neutral-100 transition-colors"
            >
              <span className="text-2xl">🖨️</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Save as PDF</p>
                <p className="text-xs text-gray-500 mt-0.5">Print or save to your files</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Add-more overlay */}
      {showAddMore && (
        <AddMoreOverlay
          onAdd={handleAddActivity}
          onClose={() => setShowAddMore(false)}
        />
      )}

      {/* Early-start modal */}
      {goModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setGoModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl px-6 py-6 w-full max-w-sm flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-700 leading-relaxed text-center">
              Your plan has been saved and is due to start at{' '}
              <span className="font-bold text-gray-900">{goModal.planStartTime}</span> — it's currently{' '}
              <span className="font-bold text-gray-900">{goModal.currentTime}</span>. Do you want to start now anyway?
            </p>
            <button
              onClick={() => {
                const stored = localStorage.getItem(ACTIVE_PLAN_KEY);
                if (stored) {
                  try {
                    const ap: ActivePlan = JSON.parse(stored);
                    localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify({ ...ap, hasStarted: true }));
                  } catch { /* ignore */ }
                }
                setGoModal(null);
                navigate('/');
                window.open(goModal.mapsUrl, '_blank');
                console.log('GO_FLOW: user chose to start early');
              }}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: '#E6D055', color: '#1d3e49' }}
            >
              Yes, let's go!
            </button>
            <button
              onClick={() => {
                setGoModal(null);
                navigate('/');
                console.log('GO_FLOW: user deferred start, redirecting to home');
              }}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
            >
              No, remind me later
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}

      <StreetViewModal activity={streetViewActivity} onClose={() => setStreetViewActivity(null)} />
    </div>
  );
};

export default PlanPage;
