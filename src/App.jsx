import React, { useState, useEffect } from 'react';
import { CycleProvider } from './contexts/CycleContext';
import Header from './components/Header';
import WelcomeGuide from './components/WelcomeGuide';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import CycleCalendar from './components/CycleCalendar';
import CycleInput from './components/CycleInput';
import Analytics from './components/Analytics';
import DataExport from './components/DataExport';
import MedicationTracking from './components/MedicationTracking';
import HealthInsights from './components/HealthInsights';
import SmartNotifications from './components/SmartNotifications';
import SymptomTracker from './components/SymptomTracker';
import ResearchHub from './components/ResearchHub';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('lunation-onboarding-completed');
    if (!hasCompletedOnboarding) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeComplete = (preferences) => {
    setShowWelcome(false);
    // Show auth modal after welcome completion
    setShowAuth(true);
    
    if (preferences.primaryGoal) {
      // Set initial tab based on user's primary goal
      if (preferences.primaryGoal === 'fertility-planning') {
        setActiveTab('calendar');
      } else if (preferences.primaryGoal === 'symptom-management') {
        setActiveTab('symptoms');
      } else if (preferences.primaryGoal === 'health-insights') {
        setActiveTab('insights');
      } else {
        setActiveTab('tracking'); // Default to tracking for period-tracking goal
      }
    }
  };

  const handleAuthSuccess = (userInfo) => {
    setCurrentUser(userInfo);
    setShowAuth(false);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'tracking', label: 'Track Cycle' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'insights', label: 'AI Insights' },
    { id: 'notifications', label: 'Smart Alerts' },
    { id: 'research', label: 'Research' },
    { id: 'medications', label: 'Medications' },
    { id: 'export', label: 'Export Data' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CycleCalendar />;
      case 'tracking':
        return <CycleInput />;
      case 'symptoms':
        return <SymptomTracker />;
      case 'analytics':
        return <Analytics />;
      case 'insights':
        return <HealthInsights />;
      case 'notifications':
        return <SmartNotifications />;
      case 'research':
        return <ResearchHub />;
      case 'medications':
        return <MedicationTracking />;
      case 'export':
        return <DataExport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <CycleProvider>
      <div className="app">
        <Header />
        
        {/* Navigation Tabs */}
        <div style={{
          background: 'transparent',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: '0',
          zIndex: 100
        }}>
          <div className="container" style={{ padding: '0 2rem' }}>
            <nav style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '0.5rem',
              paddingBottom: '0',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="container">
          {renderContent()}
        </div>

        <Footer />

        {/* Welcome Guide Modal */}
        {showWelcome && <WelcomeGuide onComplete={handleWelcomeComplete} />}
        
        {/* Authentication Modal */}
        {showAuth && (
          <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
            onAuthSuccess={handleAuthSuccess} 
          />
        )}
      </div>
    </CycleProvider>
  );
}

export default App;
