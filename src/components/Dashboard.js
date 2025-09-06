import React from 'react';
import { useCycle } from '../contexts/CycleContext';

function Dashboard() {
  const { state } = useCycle();
  const { cycles, predictions } = state;

  const stats = {
    totalCycles: cycles.length,
    averageLength: cycles.length > 0 
      ? Math.round(cycles.reduce((sum, cycle) => sum + (cycle.length || 28), 0) / cycles.length)
      : 28,
    nextPeriod: predictions.nextPeriod,
    fertilityWindow: predictions.fertilityWindow
  };

  const formatDate = (date) => {
    if (!date) return 'Not calculated yet';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date) => {
    if (!date) return null;
    const today = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b9d, #c44569)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0' }}>{stats.totalCycles}</h3>
          <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>Cycles Tracked</p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #a8e6cf, #7fcdcd)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0' }}>{stats.averageLength}</h3>
          <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>Average Cycle Length</p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #ffd93d, #ff9068)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0' }}>
            {getDaysUntil(stats.nextPeriod) !== null 
              ? `${getDaysUntil(stats.nextPeriod)} days`
              : 'N/A'
            }
          </h3>
          <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>Until Next Period</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#c44569', marginBottom: '1rem' }}>Predictions</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div>
            <strong>Next Period:</strong> {formatDate(stats.nextPeriod)}
          </div>
          <div>
            <strong>Fertility Window:</strong> {
              stats.fertilityWindow.start && stats.fertilityWindow.end
                ? `${formatDate(stats.fertilityWindow.start)} - ${formatDate(stats.fertilityWindow.end)}`
                : 'Not calculated yet'
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;