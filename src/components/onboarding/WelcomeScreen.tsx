import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrencyPicker, { COUNTRIES, CountryOption } from '../common/CurrencyPicker';
import type { ActivePlan, BarbadosActivity } from '../../types';
import { ACTIVE_PLAN_KEY } from '../../types';

const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === 'GB')!;

function getNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function calcCountdown(targetHHmm: string): string {
  const now = new Date();
  const [th, tm] = targetHHmm.split(':').map(Number);
  const target = new Date(now);
  target.setHours(th, tm, 0, 0);
  let diff = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  return `${h}h ${m}m ${s}s`;
}

function calcTimeRemaining(returnHHmm: string): string {
  const now = new Date();
  const [rh, rm] = returnHHmm.split(':').map(Number);
  const end = new Date(now);
  end.setHours(rh, rm, 0, 0);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [country, setCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [currencyOverride, setCurrencyOverride] = useState<{ currency: string; symbol: string } | undefined>();
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [countdown, setCountdown] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [nextActivity, setNextActivity] = useState<string>('');

  const handleCountryChange = (c: CountryOption) => {
    setCountry(c);
    setCurrencyOverride(undefined);
  };

  // Read active plan from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(ACTIVE_PLAN_KEY);
    if (!raw) {
      console.log('WELCOME_SCREEN: activePlan =', null);
      return;
    }
    try {
      const ap: ActivePlan = JSON.parse(raw);
      console.log('WELCOME_SCREEN: activePlan =', ap);

      // Check if plan's last activity has ended — if so, clear it
      const activities = ap.plan.events
        .filter(e => e.type === 'activity')
        .map(e => e.data as BarbadosActivity);
      const lastActivity = activities[activities.length - 1];
      if (lastActivity) {
        const now = getNow();
        if (now >= lastActivity.endTime) {
          localStorage.removeItem(ACTIVE_PLAN_KEY);
          return;
        }
      }

      setActivePlan(ap);
    } catch {
      console.log('WELCOME_SCREEN: activePlan = (parse error)');
    }
  }, []);

  // Countdown timer for scheduled (hasStarted: false) plans
  useEffect(() => {
    if (!activePlan || activePlan.hasStarted) return;
    const startTime = activePlan.plan.preferences.shipDetails.startTime;
    setCountdown(calcCountdown(startTime));
    const id = setInterval(() => setCountdown(calcCountdown(startTime)), 1000);
    return () => clearInterval(id);
  }, [activePlan]);

  // Live current/next activity and time remaining for in-progress plans
  useEffect(() => {
    if (!activePlan || !activePlan.hasStarted) return;

    const update = () => {
      const now = getNow();
      const activities = activePlan.plan.events
        .filter(e => e.type === 'activity')
        .map(e => e.data as BarbadosActivity);

      const currentIdx = activities.findIndex(a => now >= a.startTime && now < a.endTime);
      if (currentIdx !== -1) {
        setCurrentActivity(activities[currentIdx].name);
        setNextActivity(activities[currentIdx + 1]?.name ?? '');
      } else {
        // Before first or after last
        const upcoming = activities.find(a => now < a.startTime);
        setCurrentActivity(upcoming ? '' : 'All done!');
        setNextActivity(upcoming?.name ?? '');
      }

      setTimeRemaining(calcTimeRemaining(activePlan.plan.preferences.shipDetails.returnTime));
    };

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [activePlan]);

  // Determine which state to show
  const planScheduled = activePlan && !activePlan.hasStarted;
  const planInProgress = activePlan && activePlan.hasStarted;
  const startTime = activePlan?.plan.preferences.shipDetails.startTime ?? '';

  return (
    <div
      className="flex flex-col min-h-screen overflow-y-auto pb-24"
      style={{ background: 'linear-gradient(160deg, #1d3e49 0%, #2c5e6e 40%, #3b7d93 100%)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg">
            🌴
          </div>
          <span className="text-white font-bold text-lg tracking-tight">BarbadosBespoke</span>
        </div>
        <CurrencyPicker
          country={country}
          onCountryChange={handleCountryChange}
          onCurrencyOverride={(currency, symbol) => setCurrencyOverride({ currency, symbol })}
          currencyOverride={currencyOverride}
        />
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <div className="text-center mb-10">
          <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-3">Welcome!</p>
          <h1 className="text-4xl font-bold text-white leading-tight mb-2">
            Skip the tour bus.<br />
            <span style={{ color: '#E6D055' }}>Go local.</span>
          </h1>
        </div>

        {/* ── CTA Buttons ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-10">
          <button
            onClick={() => navigate('/plan')}
            className="w-full font-bold text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            style={{ background: '#E6D055', color: '#1d3e49' }}
          >
            Create New Plan
          </button>

          <button
            onClick={() => navigate(activePlan ? '/plan' : '/plans')}
            className="w-full font-bold text-base py-4 rounded-2xl border-2 border-white/40 text-white bg-white/10 active:scale-95 transition-transform"
          >
            {activePlan ? "Open Today's Plan" : 'See Saved Plans'}
          </button>
        </div>

        {/* ── Conditional centre stage ─────────────────────────────── */}
        {planInProgress ? (
          /* State B: plan in progress */
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Plan in Progress</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white/50 text-xs mb-1">Current Stop</p>
                <p className="text-white font-semibold text-sm">{currentActivity || '—'}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white/50 text-xs mb-1">Next Stop</p>
                <p className="text-white font-semibold text-sm">{nextActivity || '—'}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/50 text-xs mb-1">Time Remaining</p>
              <p className="font-bold text-2xl" style={{ color: '#E6D055' }}>{timeRemaining}</p>
            </div>
          </div>
        ) : planScheduled ? (
          /* State B-scheduled: plan saved but not started yet */
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4 text-center">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Plan Scheduled 🗓️</p>
            <p className="text-white text-sm">Your day starts at <span className="font-bold">{startTime}</span></p>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/50 text-xs mb-1">Starting in</p>
              <p className="font-bold text-2xl" style={{ color: '#E6D055' }}>{countdown}</p>
            </div>
            <button
              onClick={() => navigate('/plan')}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: '#E6D055', color: '#1d3e49' }}
            >
              Open Today's Plan
            </button>
          </div>
        ) : (
          /* State A: no plan — How It Works */
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest text-center mb-5">
              How It Works
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '🕐', title: 'Set your Schedule', desc: 'Tell us when you arrive & need to be back.' },
                { emoji: '🎯', title: 'Pick your Vibe',    desc: 'Choose your interests, group & budget.' },
                { emoji: '🗺️', title: 'Get your Perfect Day', desc: 'We craft a real local itinerary just for you.' },
              ].map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-5 px-2 text-center"
                >
                  <span className="text-2xl">{emoji}</span>
                  <p className="text-white text-xs font-semibold leading-snug">{title}</p>
                  <p className="text-white/50 text-[10px] leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer note ─────────────────────────────────────────────── */}
      <p className="text-center text-white/30 text-xs pb-4">
        Free to use · No cruise company affiliation
      </p>
    </div>
  );
};

export default WelcomeScreen;
