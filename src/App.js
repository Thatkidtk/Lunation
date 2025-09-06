import React from 'react';
import { CycleProvider } from './contexts/CycleContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CycleCalendar from './components/CycleCalendar';
import CycleInput from './components/CycleInput';

function App() {
  return (
    <CycleProvider>
      <div className="app">
        <Header />
        <div className="container">
          <Dashboard />
          <CycleInput />
          <CycleCalendar />
        </div>
      </div>
    </CycleProvider>
  );
}

export default App;