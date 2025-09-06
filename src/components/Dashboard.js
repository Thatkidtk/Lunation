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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#28a745';
    if (confidence >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>
      
      {/* Main Stats Grid */}
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

      {/* Enhanced Predictions Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#c44569', marginBottom: '1rem' }}>🔮 Smart Predictions</h3>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Next Period:</strong> {formatDate(stats.nextPeriod)}
              </div>
              {predictions.confidence && (
                <div style={{
                  background: getConfidenceColor(predictions.confidence.nextPeriod),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {predictions.confidence.nextPeriod}% {getConfidenceText(predictions.confidence.nextPeriod)}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Fertility Window:</strong> {
                  stats.fertilityWindow.start && stats.fertilityWindow.end
                    ? `${formatDate(stats.fertilityWindow.start)} - ${formatDate(stats.fertilityWindow.end)}`
                    : 'Not calculated yet'
                }
              </div>
              {predictions.confidence && (
                <div style={{
                  background: getConfidenceColor(predictions.confidence.ovulation),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {predictions.confidence.ovulation}% {getConfidenceText(predictions.confidence.ovulation)}
                </div>
              )}
            </div>
            
            {predictions.accuracy !== null && (
              <div style={{ 
                background: '#e3f2fd',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                <strong>📈 Historical Accuracy:</strong> {predictions.accuracy}% 
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                  (based on past {cycles.length - 2} predictions)
                </span>
              </div>
            )}
            
            {predictions.cycleLengthVariance !== undefined && cycles.length > 2 && (
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <strong>Cycle Consistency:</strong> ±{predictions.cycleLengthVariance} days variation
                {predictions.cycleLengthVariance <= 3 && <span style={{ color: '#28a745' }}> (Very Regular)</span>}
                {predictions.cycleLengthVariance > 3 && predictions.cycleLengthVariance <= 7 && <span style={{ color: '#ffc107' }}> (Regular)</span>}
                {predictions.cycleLengthVariance > 7 && <span style={{ color: '#dc3545' }}> (Variable)</span>}
              </div>
            )}
          </div>
        </div>
        
        {cycles.length < 3 && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.9rem',
            color: '#856404'
          }}>
            <strong>💡 Tip:</strong> Track at least 3 cycles for more accurate predictions and confidence scoring!
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;