import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrencyPicker, { COUNTRIES, CountryOption } from '../common/CurrencyPicker';

// DEMO MODE: toggle to preview the "plan in progress" state
const IS_PLAN_ACTIVE = false;
const DEMO_CURRENT_LOCATION = 'Carlisle Bay Beach';
const DEMO_NEXT_LOCATION = "Harrison's Cave";
const DEMO_TIME_REMAINING = '2h 15m';

const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === 'GB')!;

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [country, setCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [currencyOverride, setCurrencyOverride] = useState<{ currency: string; symbol: string } | undefined>();

  const handleCountryChange = (c: CountryOption) => {
    setCountry(c);
    setCurrencyOverride(undefined); // reset override when country changes
  };

  return (
    <div
      className="flex flex-col min-h-screen overflow-y-auto pb-24"
      style={{ background: 'linear-gradient(160deg, #1d3e49 0%, #2c5e6e 40%, #3b7d93 100%)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg">
            🌴
          </div>
          <span className="text-white font-bold text-lg tracking-tight">BarbadosBespoke</span>
        </div>

        {/* Interactive country / currency pill */}
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
            onClick={() => navigate(IS_PLAN_ACTIVE ? '/plan' : '/plans')}
            className="w-full font-bold text-base py-4 rounded-2xl border-2 border-white/40 text-white bg-white/10 active:scale-95 transition-transform"
          >
            {IS_PLAN_ACTIVE ? "Open Today's Plan" : 'See Saved Plans'}
          </button>
        </div>

        {/* ── Conditional centre stage ─────────────────────────────── */}
        {IS_PLAN_ACTIVE ? (
          /* State B: plan in progress — status dashboard */
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Plan in Progress</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white/50 text-xs mb-1">Current Stop</p>
                <p className="text-white font-semibold text-sm">{DEMO_CURRENT_LOCATION}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white/50 text-xs mb-1">Next Stop</p>
                <p className="text-white font-semibold text-sm">{DEMO_NEXT_LOCATION}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/50 text-xs mb-1">Time Remaining</p>
              <p className="font-bold text-2xl" style={{ color: '#E6D055' }}>{DEMO_TIME_REMAINING}</p>
            </div>
          </div>
        ) : (
          /* State A: no plan — How It Works */
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest text-center mb-5">
              How It Works
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  emoji: '🕐',
                  title: 'Set your Schedule',
                  desc: 'Tell us when you arrive & need to be back.',
                },
                {
                  emoji: '🎯',
                  title: 'Pick your Vibe',
                  desc: 'Choose your interests, group & budget.',
                },
                {
                  emoji: '🗺️',
                  title: 'Get your Perfect Day',
                  desc: 'We craft a real local itinerary just for you.',
                },
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
