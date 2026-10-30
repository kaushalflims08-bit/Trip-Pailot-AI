import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useTripStore } from './store/useTripStore';
import { TopNav } from './components/layout/TopNav';
import { BottomNav } from './components/layout/BottomNav';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { AssistantDrawer } from './components/assistant/AssistantDrawer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Splash } from './pages/Splash';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { SlideshowWrapper } from './pages/SlideshowWrapper';
import { TrackViewer } from './pages/TrackViewer';
import { TripStartOverlay } from './components/layout/TripStartOverlay';
import { TripFinishOverlay } from './components/layout/TripFinishOverlay';

function MainApp() {
  const {
    user,
    darkMode,
    currentStep,
    setCurrentStep,
    hasSeenSplashThisSession,
    setSplashSeen,
  } = useTripStore();

  const [activeView, setActiveView] = useState<'home' | 'slideshow'>('home');
  const [showSplash, setShowSplash] = useState(!hasSeenSplashThisSession);
  const [showTripStart, setShowTripStart] = useState(false);
  const [showTripFinish, setShowTripFinish] = useState(false);

  // Sync dark mode class to HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // If splash should show on first load of browser session
  if (showSplash) {
    return (
      <Splash
        onComplete={() => {
          setShowSplash(false);
          setSplashSeen(true);
        }}
      />
    );
  }

  // If not logged in, show cinematic Login
  if (!user) {
    return <Login onLoginSuccess={() => setActiveView('home')} />;
  }

  // Variant for animated background
  let bgVariant: any = 'home';
  if (activeView === 'slideshow') {
    const variants: Record<number, any> = {
      1: 'planner',
      2: 'package',
      3: 'verification',
      4: 'companion',
      5: 'replanning',
      6: 'dossier',
    };
    bgVariant = variants[currentStep] || 'home';
  }

  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background System */}
      <AnimatedBackground variant={bgVariant} />

      {/* Top Navigation */}
      <TopNav
        activeView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onNavigateSlide={(slideNum) => {
          setCurrentStep(slideNum);
          setActiveView('slideshow');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <ErrorBoundary fallbackTitle="Error loading travel cockpit">
          {activeView === 'home' ? (
            <Home
              onStartPlanner={() => {
                setCurrentStep(1);
                setActiveView('slideshow');
              }}
              onNavigateSlide={(slideNum) => {
                setCurrentStep(slideNum);
                setActiveView('slideshow');
              }}
            />
          ) : (
            <SlideshowWrapper
              onStartTripClick={() => setShowTripStart(true)}
              onFinishTripClick={() => setShowTripFinish(true)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onNavigateSlide={(slideNum) => {
          setCurrentStep(slideNum);
          setActiveView('slideshow');
        }}
      />

      {/* Persistent Floating AI Assistant Drawer */}
      <AssistantDrawer
        onNavigateSlide={(slideNum) => {
          setCurrentStep(slideNum);
          setActiveView('slideshow');
        }}
      />

      {/* Full-Screen Journey Start Overlay Animation */}
      {showTripStart && (
        <TripStartOverlay onClose={() => setShowTripStart(false)} />
      )}

      {/* Full-Screen Journey Finish Overlay Animation */}
      {showTripFinish && (
        <TripFinishOverlay
          onClose={() => setShowTripFinish(false)}
          onViewDossier={() => {
            setCurrentStep(6);
            setActiveView('slideshow');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/track/:id" element={<TrackViewer />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
