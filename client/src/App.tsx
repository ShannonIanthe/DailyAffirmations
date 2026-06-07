import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import MyAffirmations from './pages/MyAffirmations';
import CreateAffirmation from './pages/CreateAffirmation';
import Library from './pages/Library';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-brand-bg">
        <div className="text-center animate-pulse-soft">
          <img src="/assets/daily-affirm-logo.png" alt="Daily Affirm" className="w-20 h-20 mx-auto mb-4 object-contain rounded-2xl" />
          <p className="text-brand-lavender font-medium font-sans">Daily Affirm</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding />;
  }

  const isOnboarded = user.name && user.email;

  return (
    <div className="min-h-dvh bg-brand-bg pb-24">
      {!isOnboarded ? (
        <Onboarding />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-affirmations" element={<MyAffirmations />} />
            <Route path="/create" element={<CreateAffirmation />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}