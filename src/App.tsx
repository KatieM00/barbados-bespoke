import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';

import OnboardingPage from './pages/OnboardingPage';
import PlanPage from './pages/PlanPage';
import PassportPage from './pages/PassportPage';
import MyPlansPage from './pages/MyPlansPage';
import CheckinPage from './pages/CheckinPage';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LegalPage from './pages/LegalPage';
import SupportPage from './pages/SupportPage';

// Routes where the bottom nav should be hidden
const HIDE_NAV_ROUTES = ['/checkin'];

const AppShell: React.FC = () => {
  const location = useLocation();
  const hideNav = HIDE_NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      <Routes>
        <Route path="/"         element={<OnboardingPage />} />
        <Route path="/plan"     element={<PlanPage />} />
        <Route path="/passport" element={<PassportPage />} />
        <Route path="/plans"    element={<MyPlansPage />} />
        <Route path="/checkin"  element={<CheckinPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/account"  element={<AccountPage />} />
        <Route path="/terms"    element={<TermsPage />} />
        <Route path="/privacy"  element={<PrivacyPage />} />
        <Route path="/legal"    element={<LegalPage />} />
        <Route path="/support"  element={<SupportPage />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
