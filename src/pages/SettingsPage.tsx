import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, Sun, Moon, Monitor, Clock, Calendar, ChevronRight, FileText, Shield, Scale, HelpCircle } from 'lucide-react';
import MobileHeader from '../components/layout/MobileHeader';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [dateFormat, setDateFormat] = useState<'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'>('DD/MM/YYYY');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-24">
      <MobileHeader title="Settings" showBack onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-4 space-y-4">

        {/* Appearance */}
        <Section title="Appearance">
          <SettingRow label="Theme" description="Choose your preferred colour scheme">
            <div className="flex gap-2">
              {([
                { val: 'light', icon: <Sun size={15} />, label: 'Light' },
                { val: 'system', icon: <Monitor size={15} />, label: 'System' },
                { val: 'dark',  icon: <Moon size={15} />,  label: 'Dark'  },
              ] as const).map(({ val, icon, label }) => (
                <button
                  key={val}
                  onClick={() => setTheme(val)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    theme === val
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-200 text-neutral-500 bg-white'
                  }`}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Font size" description="Adjust text size across the app">
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    fontSize === size
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-200 text-neutral-500 bg-white'
                  }`}
                >
                  <Type size={fontSize === 'small' ? 11 : fontSize === 'medium' ? 14 : 17} />
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* Accessibility */}
        <Section title="Accessibility">
          <ToggleRow
            label="Reduce motion"
            description="Minimise animations and transitions"
            value={reduceMotion}
            onChange={setReduceMotion}
          />
          <ToggleRow
            label="High contrast"
            description="Increase contrast for better readability"
            value={highContrast}
            onChange={setHighContrast}
          />
        </Section>

        {/* Formats */}
        <Section title="Date & Time">
          <SettingRow label="Time format" description="12-hour or 24-hour clock">
            <div className="flex gap-2">
              {(['12h', '24h'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFormat(f)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    timeFormat === f
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-200 text-neutral-500 bg-white'
                  }`}
                >
                  <Clock size={13} />{f}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Date format" description="How dates are displayed">
            <div className="flex flex-col gap-1.5">
              {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDateFormat(f)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    dateFormat === f
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-200 text-neutral-500 bg-white'
                  }`}
                >
                  <Calendar size={13} />{f}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* Legal */}
        <Section title="Legal">
          <LinkRow icon={<Scale size={16} />} label="Legal Information" onPress={() => navigate('/legal')} />
          <LinkRow icon={<FileText size={16} />} label="Terms of Service" onPress={() => navigate('/terms')} />
          <LinkRow icon={<Shield size={16} />} label="Privacy Policy" onPress={() => navigate('/privacy')} />
          <LinkRow icon={<HelpCircle size={16} />} label="Help & Report an Issue" onPress={() => navigate('/support')} />
        </Section>

        {/* About */}
        <Section title="About">
          <div className="px-1 py-2 space-y-1 text-sm text-neutral-500">
            <p>Version 1.0.0 (Demo)</p>
            <p>Free to use · No cruise company affiliation</p>
          </div>
        </Section>

      </div>
    </div>
  );
};

// ── Shared sub-components ──────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
    <p className="px-4 pt-4 pb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">{title}</p>
    <div className="divide-y divide-neutral-50">{children}</div>
  </div>
);

const SettingRow: React.FC<{ label: string; description: string; children: React.ReactNode }> = ({
  label, description, children,
}) => (
  <div className="px-4 py-3 flex flex-col gap-2">
    <div>
      <p className="font-semibold text-sm text-neutral-800">{label}</p>
      <p className="text-xs text-neutral-400">{description}</p>
    </div>
    {children}
  </div>
);

const LinkRow: React.FC<{ icon?: React.ReactNode; label: string; onPress: () => void }> = ({
  icon, label, onPress,
}) => (
  <button
    onClick={onPress}
    className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors"
  >
    <div className="flex items-center gap-2">
      {icon && <span className="text-neutral-400">{icon}</span>}
      <p className="font-semibold text-sm text-neutral-800">{label}</p>
    </div>
    <ChevronRight size={16} className="text-neutral-300 flex-shrink-0" />
  </button>
);

const ToggleRow: React.FC<{ label: string; description: string; value: boolean; onChange: (v: boolean) => void }> = ({
  label, description, value, onChange,
}) => (
  <div className="px-4 py-3 flex items-center justify-between gap-4">
    <div className="flex-1">
      <p className="font-semibold text-sm text-neutral-800">{label}</p>
      <p className="text-xs text-neutral-400">{description}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary-600' : 'bg-neutral-200'}`}
      aria-label={label}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : ''}`} />
    </button>
  </div>
);

export default SettingsPage;
