import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, User, ShoppingBag, ScrollText, Play } from 'lucide-react';

const SAVE_KEY = 'barbados_saved_plan';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPlanPage = location.pathname === '/plan';

  const [planReady, setPlanReady] = useState(false);

  useEffect(() => {
    // Check on mount and whenever location changes
    setPlanReady(isPlanPage && sessionStorage.getItem('plan_ready') === '1');

    const handlePlanReady = () => {
      setPlanReady(isPlanPage && sessionStorage.getItem('plan_ready') === '1');
    };
    window.addEventListener('plan_ready', handlePlanReady);
    return () => window.removeEventListener('plan_ready', handlePlanReady);
  }, [location, isPlanPage]);

  const handleGoPress = () => {
    // Dispatch a save request to PlanPage, then open Maps
    window.dispatchEvent(new Event('go_pressed'));
  };

  const showGo = isPlanPage && planReady;
  const centerLabel = showGo ? 'Go!' : isHome ? 'New Plan' : 'Home';
  const centerAction = showGo
    ? handleGoPress
    : isHome
    ? () => navigate('/plan')
    : () => navigate('/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div
        className="mx-3 mb-3 rounded-2xl border border-white/20 flex items-center px-2 py-2 gap-1"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        <NavBtn
          icon={<Settings size={20} />}
          label="Settings"
          active={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
        />
        <NavBtn
          icon={<User size={20} />}
          label="Profile"
          active={location.pathname === '/account'}
          onClick={() => navigate('/account')}
        />

        {/* Centre button — gold by default, green "Go!" once a plan is generated */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={centerAction}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-lg active:scale-95 transition-transform -mt-6"
            style={showGo ? { background: '#22c55e', color: 'white' } : { background: '#E6D055', color: '#1d3e49' }}
            aria-label={centerLabel}
          >
            {showGo ? (
              <Play size={20} className="ml-0.5" />
            ) : (
              <span className="text-xl leading-none">{isHome ? '✏️' : '🏠'}</span>
            )}
            <span className="text-[9px] font-bold mt-0.5 leading-tight">{centerLabel}</span>
          </button>
        </div>

        <NavBtn
          icon={<ShoppingBag size={20} />}
          label="Passport"
          active={location.pathname === '/passport'}
          onClick={() => navigate('/passport')}
        />
        <NavBtn
          icon={<ScrollText size={20} />}
          label="History"
          active={location.pathname === '/plans'}
          onClick={() => navigate('/plans')}
        />
      </div>
    </nav>
  );
};

const NavBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors ${
      active ? 'text-primary-600' : 'text-neutral-400 hover:text-neutral-600'
    }`}
    aria-label={label}
  >
    {icon}
    <span className={`text-[10px] font-medium leading-tight ${active ? 'text-primary-600' : 'text-neutral-400'}`}>
      {label}
    </span>
  </button>
);

export default BottomNav;
