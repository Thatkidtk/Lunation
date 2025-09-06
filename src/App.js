import React, { useState } from 'react';
import { CycleProvider } from './contexts/CycleContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CycleCalendar from './components/CycleCalendar';
import CycleInput from './components/CycleInput';
import Analytics from './components/Analytics';
import DataExport from './components/DataExport';
import MedicationTracking from './components/MedicationTracking';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'calendar', label: '📅 Calendar', icon: '📅' },
    { id: 'tracking', label: '📝 Track Cycle', icon: '📝' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'medications', label: '💊 Medications', icon: '💊' },
    { id: 'export', label: '📤 Export Data', icon: '📤' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CycleCalendar />;
      case 'tracking':
        return <CycleInput />;
      case 'analytics':
        return <Analytics />;
      case 'medications':
        return <MedicationTracking />;
      case 'export':
        return <DataExport />;
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
          background: 'white',
          borderBottom: '1px solid #e9ecef',
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
                    color: activeTab === tab.id ? '#c44569' : '#666',
                    borderBottom: activeTab === tab.id ? '3px solid #c44569' : '3px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span className="tab-label">{tab.label.replace(/.*?\s/, '')}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="container">
          {renderContent()}
        </div>
      </div>
    </CycleProvider>
  );
}

export default App;