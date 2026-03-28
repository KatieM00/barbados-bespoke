import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Camera, Eye, EyeOff, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import MobileHeader from '../components/layout/MobileHeader';

// ── Shared sub-components ──────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, expanded, onToggle, children }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
          {icon}
        </div>
        <span className="font-semibold text-neutral-800">{title}</span>
      </div>
      {expanded
        ? <ChevronUp size={18} className="text-neutral-400" />
        : <ChevronDown size={18} className="text-neutral-400" />}
    </button>
    {expanded && (
      <div className="px-4 pb-5 space-y-4 border-t border-neutral-50 pt-4">{children}</div>
    )}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{label}</label>
    {children}
  </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ style, ...props }) => (
  <input
    {...props}
    style={{ fontSize: '16px', ...style }}
    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-800 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
  />
);

const SaveButton: React.FC<{ label?: string; onClick?: () => void }> = ({ label = 'Save Changes', onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-primary-600 text-white font-bold text-sm py-3 rounded-xl active:bg-primary-700 transition-colors"
  >
    {label}
  </button>
);

// ── Main page ──────────────────────────────────────────────────────────────

const AccountPage: React.FC = () => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    profile: true,
    security: false,
    display: false,
  });
  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Display
  const [language, setLanguage] = useState('en');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-24">
      <MobileHeader title="My Profile" showBack onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-4 space-y-4">

        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={36} className="text-primary-400" />
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <p className="mt-2 text-sm font-semibold text-neutral-700">
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Your Name'}
          </p>
          <p className="text-xs text-neutral-400">{email || 'your@email.com'}</p>
        </div>

        {/* Profile info */}
        <Section title="Profile Info" icon={<User size={16} />} expanded={expanded.profile} onToggle={() => toggle('profile')}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <TextInput value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
            </Field>
            <Field label="Last name">
              <TextInput value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" />
            </Field>
          </div>
          <Field label="Email">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <TextInput
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                style={{ paddingLeft: '2.25rem', fontSize: '16px' }}
              />
            </div>
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <TextInput
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                style={{ paddingLeft: '2.25rem', fontSize: '16px' }}
              />
            </div>
          </Field>
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-800 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none"
              style={{ fontSize: '16px' }}
            />
          </Field>
          <SaveButton label="Save Profile" />
        </Section>

        {/* Security */}
        <Section title="Security" icon={<Lock size={16} />} expanded={expanded.security} onToggle={() => toggle('security')}>
          <p className="text-xs text-neutral-400">Change your password. Leave blank to keep your current one.</p>
          {([
            { label: 'Current password', value: currentPw, set: setCurrentPw, show: showCurrentPw, toggleShow: () => setShowCurrentPw(v => !v) },
            { label: 'New password',     value: newPw,     set: setNewPw,     show: showNewPw,     toggleShow: () => setShowNewPw(v => !v) },
            { label: 'Confirm password', value: confirmPw, set: setConfirmPw, show: showNewPw,     toggleShow: () => setShowNewPw(v => !v) },
          ]).map(({ label, value, set, show, toggleShow }) => (
            <Field key={label} label={label}>
              <div className="relative">
                <TextInput
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: '2.5rem', fontSize: '16px' }}
                />
                <button type="button" onClick={toggleShow}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          ))}
          <SaveButton label="Update Password" />
        </Section>

        {/* Display preferences */}
        <Section title="Display Preferences" icon={<Mail size={16} />} expanded={expanded.display} onToggle={() => toggle('display')}>
          <Field label="Language">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-800 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-400 appearance-none"
              style={{ fontSize: '16px' }}
            >
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="ar">🇸🇦 العربية</option>
            </select>
          </Field>
          <Field label="Time format">
            <div className="flex gap-2">
              {(['12h', '24h'] as const).map(f => (
                <button key={f} onClick={() => setTimeFormat(f)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                    timeFormat === f
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-200 text-neutral-500 bg-neutral-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>
          <SaveButton label="Save Preferences" />
        </Section>

      </div>
    </div>
  );
};

export default AccountPage;
