import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin, Eye, EyeOff, Ship, AlertCircle,
} from 'lucide-react';
import type { ShipDetails, GroupType, ActivityVibe, MustDo, TransportMode, MealPreference } from '../../types';
import { GROUP_OPTIONS, VIBE_OPTIONS, MUST_DO_OPTIONS } from '../../types';
import LocationInput from '../common/LocationInput';

export interface PlanFormValues {
  startLocation: string;
  shipDetails: ShipDetails;
  groupType: GroupType;
  vibes: ActivityVibe[];
  mustDos: MustDo[];
  meals: MealPreference[];
  budgetGbp: number;
  transportPreferences: TransportMode[];
  surpriseMode: boolean;
}

interface PlanFormProps {
  onSubmit: (values: PlanFormValues) => void;
}

// ─── Scroll drum time picker ─────────────────────────────────────────────────

const HOURS   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const MINUTES = ['00','15','30','45'];
const PERIODS = ['AM','PM'];
const ITEM_H = 48;
const PAD    = 0;

const RollerCol: React.FC<{
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}> = ({ items, selected, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (items[clamped] !== selected) onSelect(items[clamped]);
  };

  const padded = [...Array(PAD).fill(null), ...items, ...Array(PAD).fill(null)];

  return (
    <div className="relative flex-1 overflow-hidden select-none" style={{ height: ITEM_H }}>
      <div
        className="absolute inset-x-0 z-10 pointer-events-none"
        style={{
          top: 0,
          height: ITEM_H,
          background: 'transparent',
          borderTop: '1px solid #c3dfe8',
          borderBottom: '1px solid #c3dfe8',
        }}
      />
      <div
        ref={ref}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        onScroll={handleScroll}
      >
        {padded.map((item, i) => (
          <div
            key={i}
            style={{
              height: ITEM_H,
              scrollSnapAlign: 'center',
              color: item === selected ? '#1d3e49' : '#94c5d6',
            } as React.CSSProperties}
            className={`flex items-center justify-center font-semibold transition-colors cursor-pointer ${
              item === selected ? 'text-2xl' : item ? 'text-base' : ''
            }`}
            onClick={() => { if (item) onSelect(item); }}
          >
            {item ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
};

function parseTime(value: string) {
  const [hStr, mStr] = value.split(':');
  const h24 = parseInt(hStr, 10);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const hour12 = h24 === 0 ? '12' : h24 > 12 ? String(h24 - 12) : String(h24);
  const rawMin = parseInt(mStr, 10);
  const slotMin = Math.round(rawMin / 15) * 15;
  const snapMin = slotMin >= 60 ? '45' : String(slotMin).padStart(2, '0');
  return { hour12, minute: snapMin, period };
}

function composeTime(hour12: string, minute: string, period: string): string {
  let h = parseInt(hour12, 10);
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

const TimeRoller: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const { hour12, minute, period } = parseTime(value);
  const update = (h: string, m: string, p: string) => onChange(composeTime(h, m, p));
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 overflow-hidden w-full max-w-xs"
      style={{
        background: '#ffffff',
        border: '1.5px solid #c3dfe8',
        borderRadius: 16,
        boxShadow: '0 1px 4px rgba(44,94,110,0.08)',
      }}
    >
      <RollerCol items={HOURS}   selected={hour12} onSelect={h => update(h, minute, period)} />
      <span className="font-bold text-2xl flex-shrink-0 pb-1" style={{ color: '#94c5d6' }}>:</span>
      <RollerCol items={MINUTES} selected={minute} onSelect={m => update(hour12, m, period)} />
      <RollerCol items={PERIODS} selected={period} onSelect={p => update(hour12, minute, p)} />
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNowSlot(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const roundedM = Math.ceil(m / 15) * 15;
  const finalH = roundedM === 60 ? h + 1 : h;
  const finalM = roundedM === 60 ? 0 : roundedM;
  return `${String(Math.min(finalH, 23)).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
}

function calcAvailableHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(0, Math.round((diff / 60) * 10) / 10);
}

// ─── Step dot indicator ───────────────────────────────────────────────────────

const TOTAL_STEPS = 10;

const StepDots: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center gap-1.5 mb-6 flex-shrink-0">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <div
        key={i}
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: step === i + 1 ? 32 : 8,
          background: step === i + 1 ? '#E6D055' : step > i + 1 ? '#4A9CB8' : '#d1e8ef',
        }}
      />
    ))}
  </div>
);

// ─── Shared button primitives ─────────────────────────────────────────────────

const NextBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children, disabled, ...props
}) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      width: '100%',
      padding: '14px 24px',
      borderRadius: 12,
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: '0.01em',
      background: disabled ? '#e8edf0' : '#E6D055',
      color: disabled ? '#9bb5c0' : '#1d3e49',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 150ms ease-in-out',
      boxShadow: disabled ? 'none' : '0 2px 8px rgba(230,208,85,0.35)',
    }}
  >
    {children}
  </button>
);

const BackBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '10px 24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
      color: '#4A9CB8',
    }}
  >
    ← Back
  </button>
);

const ChoiceBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }> = ({
  children, selected, ...props
}) => (
  <button
    {...props}
    style={{
      borderRadius: 16,
      border: selected ? '2px solid #4A9CB8' : '2px solid #c3dfe8',
      background: selected ? '#4A9CB8' : '#ffffff',
      color: selected ? '#ffffff' : '#2c5e6e',
      cursor: 'pointer',
      transition: 'all 150ms ease-in-out',
      fontWeight: 600,
    }}
  >
    {children}
  </button>
);

// ─── Transport priority colours ───────────────────────────────────────────────

const TRANSPORT_OPTIONS: { id: TransportMode; emoji: string; label: string }[] = [
  { id: 'walk',             emoji: '🚶', label: 'Walk' },
  { id: 'public-transport', emoji: '🚌', label: 'Public Transport' },
  { id: 'taxi',             emoji: '🚕', label: 'Taxi / Private Car' },
];

const PRIORITY_COLOURS = ['#4A9CB8', '#E6D055', '#6BBF8A'];

// ─── Budget slider ────────────────────────────────────────────────────────────

const BudgetSlider: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const MAX = 200;
  const pct = (value / MAX) * 100;
  const displayValue = value >= MAX ? '£200+' : `£${value}`;

  return (
    <div className="w-full px-2">
      {/* Tooltip above thumb */}
      <div className="relative mb-2" style={{ height: 28 }}>
        <div
          className="absolute -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{
            left: `${pct}%`,
            background: '#1d3e49',
            whiteSpace: 'nowrap',
            bottom: 0,
          }}
        >
          {displayValue}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ background: '#1d3e49', bottom: -4 }}
          />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={MAX}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          accentColor: '#4A9CB8',
          height: 6,
        }}
      />

      <div className="flex justify-between text-xs mt-1" style={{ color: '#94c5d6' }}>
        <span>£0</span>
        <span>£200+</span>
      </div>

      <p className="text-xs text-center mt-3 leading-relaxed" style={{ color: '#7aabb8' }}>
        Estimated per person for the full day including activities, food and transport
      </p>
    </div>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────

const PlanForm: React.FC<PlanFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);

  const [startLocation, setStartLocation] = useState('');
  const [useCustomEnd, setUseCustomEnd] = useState(false);
  const [endLocation, setEndLocation] = useState('');
  const [locationError, setLocationError] = useState('');

  const [startTime, setStartTime] = useState(getNowSlot());
  const [returnTime, setReturnTime] = useState('16:00');
  const [groupType, setGroupType] = useState<GroupType>('couple');
  const [selectedVibes, setSelectedVibes] = useState<ActivityVibe[]>([]);
  const [vibeError, setVibeError] = useState('');
  const [selectedMustDos, setSelectedMustDos] = useState<MustDo[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<MealPreference[]>([]);
  const [budgetGbp, setBudgetGbp] = useState(60);
  const [transportPrefs, setTransportPrefs] = useState<TransportMode[]>([]);
  const [transportError, setTransportError] = useState('');

  const availableHours = calcAvailableHours(startTime, returnTime);
  const validTimes = returnTime > startTime;

  const toggleVibe = (vibe: ActivityVibe) => {
    setSelectedVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
    setVibeError('');
  };

  const toggleMustDo = (item: MustDo) => {
    setSelectedMustDos(prev =>
      prev.includes(item) ? prev.filter(v => v !== item) : [...prev, item]
    );
  };

  const toggleTransport = (mode: TransportMode) => {
    setTransportPrefs(prev => {
      if (prev.includes(mode)) {
        return prev.filter(m => m !== mode);
      }
      return [...prev, mode];
    });
    setTransportError('');
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleSubmit = (surpriseMode: boolean) => {
    onSubmit({
      startLocation,
      shipDetails: {
        departurePort: 'Bridgetown Cruise Terminal, Barbados',
        endLocation: useCustomEnd && endLocation.trim() ? endLocation.trim() : undefined,
        startTime,
        returnTime,
        availableHours,
      },
      groupType,
      vibes: selectedVibes,
      mustDos: selectedMustDos,
      meals: selectedMeals,
      budgetGbp,
      transportPreferences: transportPrefs,
      surpriseMode,
    });
  };

  // ── Step content ─────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#4A9CB8' }} />
        <span className="text-sm font-medium" style={{ color: '#4A9CB8' }}>Starting point</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>Where are you?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>Set your starting point for the day.</p>
      </div>

      <LocationInput
        value={startLocation}
        onChange={(v) => { setStartLocation(v); setLocationError(''); }}
        placeholder="Start typing a location..."
        error={locationError}
      />

      {!useCustomEnd ? (
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-xl"
          style={{ background: '#f0f7fa', border: '1px solid #c3dfe8' }}
        >
          <Ship className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#4A9CB8' }} />
          <div className="flex-1">
            <p className="text-xs leading-snug" style={{ color: '#2c5e6e' }}>
              Your day will end at the same location unless you specify otherwise.
            </p>
            <button
              type="button"
              onClick={() => setUseCustomEnd(true)}
              className="mt-1.5 text-xs font-semibold underline underline-offset-2"
              style={{ color: '#3b7d93' }}
            >
              Set a different end location
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4a7a8a' }}>End location</p>
            <button
              type="button"
              onClick={() => { setUseCustomEnd(false); setEndLocation(''); }}
              className="text-xs"
              style={{ color: '#4A9CB8' }}
            >
              ✕ Remove
            </button>
          </div>
          <LocationInput value={endLocation} onChange={setEndLocation} placeholder="Where does your day end?" />
        </div>
      )}

      {locationError && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {locationError}
        </div>
      )}

      <NextBtn
        disabled={!startLocation.trim()}
        onClick={() => {
          if (!startLocation.trim()) { setLocationError('Please enter your starting location.'); return; }
          setLocationError('');
          next();
        }}
      >
        Next →
      </NextBtn>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-4 w-full items-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center" style={{ color: '#1d3e49' }}>When are you starting?</h2>
        <p className="text-sm text-center mt-1" style={{ color: '#4a7a8a' }}>Scroll each column to set the time.</p>
      </div>
      <TimeRoller value={startTime} onChange={setStartTime} />
      <p className="text-xs text-center max-w-xs" style={{ color: '#7aabb8' }}>
        Defaults to now — change if you've already been ashore.
      </p>
      <div className="flex flex-col gap-1 w-full mt-1">
        <NextBtn onClick={next}>Next →</NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-4 w-full items-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center" style={{ color: '#1d3e49' }}>When must you be back?</h2>
        <p className="text-sm text-center mt-1" style={{ color: '#4a7a8a' }}>Check your ship's all-aboard time.</p>
      </div>
      <TimeRoller value={returnTime} onChange={setReturnTime} />

      {validTimes && availableHours > 0 ? (
        <div
          className="px-6 py-4 text-center w-full max-w-xs rounded-xl"
          style={{ background: '#f0f7fa', border: '1px solid #c3dfe8' }}
        >
          <p className="font-semibold text-base" style={{ color: '#1d3e49' }}>
            You have{' '}
            <span className="text-3xl font-bold" style={{ color: '#3b7d93' }}>{availableHours}h</span>
            {' '}to explore
          </p>
        </div>
      ) : (!validTimes && startTime && returnTime) ? (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 w-full max-w-xs rounded-xl"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Return time must be after start time.
        </div>
      ) : null}

      <div className="flex flex-col gap-1 w-full mt-1">
        <NextBtn disabled={!validTimes || availableHours <= 0} onClick={next}>Next →</NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>Who's exploring?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>We'll tailor the itinerary to your group.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GROUP_OPTIONS.map(({ id, emoji, label }) => (
          <ChoiceBtn
            key={id}
            selected={groupType === id}
            onClick={() => setGroupType(id)}
            className="flex flex-col items-center justify-center gap-3 py-7"
          >
            <span className="text-4xl">{emoji}</span>
            <span className="font-semibold text-base">{label}</span>
          </ChoiceBtn>
        ))}
      </div>

      <div className="flex flex-col gap-1 mt-1">
        <NextBtn onClick={next}>Next →</NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>What's your vibe?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>Pick everything that calls to you.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {VIBE_OPTIONS.map(({ id, label, emoji }) => (
          <ChoiceBtn
            key={id}
            selected={selectedVibes.includes(id)}
            onClick={() => toggleVibe(id)}
            className="flex flex-col items-center justify-center gap-2 py-5"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="font-semibold text-sm text-center leading-tight px-1">{label}</span>
          </ChoiceBtn>
        ))}
      </div>

      {vibeError && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {vibeError}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <NextBtn
          disabled={selectedVibes.length === 0}
          onClick={() => {
            if (selectedVibes.length === 0) { setVibeError('Pick at least one vibe.'); return; }
            next();
          }}
        >
          Next →
        </NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>Any must-dos?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>Pick specific types, or skip to let us decide.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MUST_DO_OPTIONS.map(({ id, label, emoji }) => (
          <ChoiceBtn
            key={id}
            selected={selectedMustDos.includes(id)}
            onClick={() => toggleMustDo(id)}
            className="flex flex-col items-center justify-center gap-2 py-5"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="font-medium text-sm text-center leading-tight px-2">{label}</span>
          </ChoiceBtn>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <NextBtn onClick={next}>
          {selectedMustDos.length > 0 ? 'Next →' : 'Skip →'}
        </NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const toggleMeal = (meal: MealPreference) => {
    if (meal === 'skip') {
      setSelectedMeals(['skip']);
    } else {
      setSelectedMeals(prev => {
        const without = prev.filter(m => m !== 'skip');
        return without.includes(meal) ? without.filter(m => m !== meal) : [...without, meal];
      });
    }
  };

  const renderStep7 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>Any meals planned?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>We'll build meal stops into your day.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([
          { id: 'breakfast' as MealPreference, label: 'Breakfast',        icon: '🍳' },
          { id: 'lunch'     as MealPreference, label: 'Lunch',            icon: '🍽️' },
          { id: 'dinner'    as MealPreference, label: 'Dinner',           icon: '🌙' },
          { id: 'drinks'    as MealPreference, label: 'Drinks & Cocktails', icon: '🍹' },
        ]).map(({ id, label, icon }) => (
          <ChoiceBtn
            key={id}
            selected={selectedMeals.includes(id)}
            onClick={() => toggleMeal(id)}
            className="flex flex-col items-center justify-center gap-2 py-5"
          >
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold text-sm text-center leading-tight px-1">{label}</span>
          </ChoiceBtn>
        ))}
      </div>

      <ChoiceBtn
        selected={selectedMeals.includes('skip')}
        onClick={() => toggleMeal('skip')}
        className="flex items-center justify-center gap-2 py-4 w-full"
      >
        <span className="text-lg">🚫</span>
        <span className="font-semibold text-sm">No meals — activities only</span>
      </ChoiceBtn>

      <div className="flex flex-col gap-1">
        <NextBtn
          disabled={selectedMeals.length === 0}
          onClick={() => { if (selectedMeals.length > 0) next(); }}
        >
          Next →
        </NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>What's your budget?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>Drag the slider to set your budget per person.</p>
      </div>

      <BudgetSlider value={budgetGbp} onChange={setBudgetGbp} />

      <div className="flex flex-col gap-1 mt-2">
        <NextBtn onClick={next}>Next →</NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep9 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>How will you get around?</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>Choose your transport options and set your priority order.</p>
      </div>

      <div className="flex flex-col gap-3">
        {TRANSPORT_OPTIONS.map(({ id, emoji, label }) => {
          const priorityIdx = transportPrefs.indexOf(id);
          const isSelected = priorityIdx !== -1;
          const priorityNum = isSelected ? priorityIdx + 1 : null;
          const priorityColour = isSelected ? PRIORITY_COLOURS[priorityIdx] : undefined;

          return (
            <button
              key={id}
              onClick={() => toggleTransport(id)}
              className="relative flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
              style={{
                border: isSelected ? `2px solid ${priorityColour}` : '2px solid #c3dfe8',
                background: isSelected ? `${priorityColour}18` : '#ffffff',
              }}
            >
              {priorityNum !== null && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: priorityColour }}
                >
                  {priorityNum}
                </div>
              )}
              <span className="text-3xl">{emoji}</span>
              <span className="font-semibold text-base" style={{ color: '#1d3e49' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {transportError && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {transportError}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <NextBtn
          disabled={transportPrefs.length === 0}
          onClick={() => {
            if (transportPrefs.length === 0) { setTransportError('Select at least one transport option.'); return; }
            next();
          }}
        >
          Next →
        </NextBtn>
        <BackBtn onClick={back} />
      </div>
    </div>
  );

  const renderStep10 = () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d3e49' }}>One last thing…</h2>
        <p className="text-sm mt-1" style={{ color: '#4a7a8a' }}>How do you want to experience your day?</p>
      </div>

      <button
        onClick={() => handleSubmit(false)}
        className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-150 active:scale-[0.98] text-left"
        style={{
          background: '#f0f7fa',
          border: '2px solid #c3dfe8',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#4A9CB8'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#c3dfe8'; }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A9CB8'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#c3dfe8'; }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#ddeef5' }}
        >
          <Eye className="h-6 w-6" style={{ color: '#3b7d93' }} />
        </div>
        <div>
          <p className="font-bold text-base" style={{ color: '#1d3e49' }}>See it all upfront</p>
          <ul className="text-xs space-y-1 list-disc ml-4 mt-1" style={{ color: '#4a7a8a' }}>
            <li>Full itinerary shown immediately</li>
            <li>All destinations and activities revealed</li>
            <li>Perfect if you like to plan ahead</li>
          </ul>
        </div>
      </button>

      <button
        onClick={() => handleSubmit(true)}
        className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-150 active:scale-[0.98] text-left"
        style={{
          background: '#fffdf0',
          border: '2px solid #e7df97',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#b8a644'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#e7df97'; }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8a644'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7df97'; }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#fdf7d0' }}
        >
          <EyeOff className="h-6 w-6" style={{ color: '#8a7d33' }} />
        </div>
        <div>
          <p className="font-bold text-base" style={{ color: '#1d3e49' }}>Keep it a surprise</p>
          <ul className="text-xs space-y-1 list-disc ml-4 mt-1" style={{ color: '#4a7a8a' }}>
            <li>Destinations hidden until you tap Reveal</li>
            <li>Spontaneous adventure, one stop at a time</li>
            <li>Perfect for thrill-seekers</li>
          </ul>
        </div>
      </button>

      <BackBtn onClick={back} />
    </div>
  );

  const steps = [
    renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
    renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  ];

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #1d3e49 0%, #2c5e6e 40%, #3b7d93 100%)',
        padding: '0 16px 32px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="flex items-center gap-2 w-full"
        style={{ maxWidth: 480, paddingTop: 48, paddingBottom: 24 }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
        >
          🌴
        </div>
        <span className="text-white font-bold text-lg tracking-tight">BarbadosBespoke</span>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#ffffff',
          borderRadius: 20,
          padding: '28px 24px',
          boxSizing: 'border-box',
          boxShadow: '0 8px 32px rgba(14,31,36,0.22)',
        }}
      >
        <StepDots step={step} />
        {steps[step - 1]?.()}
      </div>
    </div>
  );
};

export default PlanForm;
