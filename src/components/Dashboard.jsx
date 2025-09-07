import React from 'react';
import { useCycle } from '../contexts/CycleContext';
import { createAnalysisEngine } from '../utils/aiPredictions';

function Dashboard() {
  const { state } = useCycle();
  const { cycles, predictions, symptoms } = state;

  // Use AI predictions if we have enough data
  const analysisEngine = cycles.length >= 3 ? createAnalysisEngine(cycles, symptoms || []) : null;
  const aiPredictions = analysisEngine ? analysisEngine.generateAdvancedPredictions() : null;
  const healthScore = analysisEngine ? analysisEngine.patterns.healthScore : null;

  const stats = {
    totalCycles: cycles.length,
    averageLength: cycles.length > 0 
      ? Math.round(cycles.reduce((sum, cycle) => sum + (cycle.length || 28), 0) / cycles.length)
      : 28,
    nextPeriod: aiPredictions ? aiPredictions.nextPeriod.date : predictions.nextPeriod,
    fertilityWindow: aiPredictions ? aiPredictions.fertilityWindow : predictions.fertilityWindow,
    confidence: aiPredictions ? aiPredictions.confidence.score : null
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
      <h2>Dashboard</h2>
      
      {/* Main Stats Grid with AI Enhancement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0' }}>{stats.totalCycles}</h3>
          <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>Cycles Tracked</p>
          {stats.confidence && (
            <div style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '0.5rem' }}>
              🤖 {stats.confidence}% AI Confidence
            </div>
          )}
        </div>

        <div style={{ 
          background: healthScore ? 
            `linear-gradient(135deg, ${healthScore.score >= 85 ? '#28a745, #20c997' : 
                                     healthScore.score >= 70 ? '#20c997, #3aa6a6' : 
                                     '#ffc107, #fd7e14'})` :
            'linear-gradient(135deg, #3aa6a6, #5ce0ff)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0' }}>
            {healthScore ? healthScore.score : stats.averageLength}
          </h3>
          <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>
            {healthScore ? 'Health Score' : 'Average Cycle Length'}
          </p>
          {healthScore && (
            <div style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '0.5rem', textTransform: 'capitalize' }}>
              {healthScore.category.replace('-', ' ')}
            </div>
          )}
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #9158ff, #3a2e8f)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0' }}>
            {getDaysUntil(stats.nextPeriod) !== null 
              ? getDaysUntil(stats.nextPeriod) > 0
                ? `${getDaysUntil(stats.nextPeriod)} days`
                : getDaysUntil(stats.nextPeriod) === 0
                  ? 'Today'
                  : `${Math.abs(getDaysUntil(stats.nextPeriod))} days late`
              : 'N/A'
            }
          </h3>
          <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>
            {getDaysUntil(stats.nextPeriod) !== null && getDaysUntil(stats.nextPeriod) < 0 
              ? 'Period Status' 
              : 'Until Next Period'
            }
          </p>
          {aiPredictions && (
            <div style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '0.5rem' }}>
              🎯 {aiPredictions.nextPeriod.confidence}% accurate
            </div>
          )}
        </div>

        {healthScore && analysisEngine && (
          <div style={{ 
            background: 'linear-gradient(135deg, #6f42c1, #e83e8c)', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem', margin: '0' }}>
              {analysisEngine.patterns.anomalies?.anomalies?.length || 0}
            </h3>
            <p style={{ opacity: '0.9', margin: '0.5rem 0 0 0' }}>Health Alerts</p>
            <div style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '0.5rem', textTransform: 'capitalize' }}>
              {analysisEngine.patterns.anomalies?.riskLevel || 'low'} risk
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Predictions Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Smart Predictions</h3>
        
              <div style={{ 
                background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
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
                background: 'var(--surface-2)',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                <strong>Historical Accuracy:</strong> {predictions.accuracy}% 
                <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>
                  (based on past {cycles.length - 2} predictions)
                </span>
              </div>
            )}
            
            {predictions.cycleLengthVariance !== undefined && cycles.length > 2 && (
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                <strong>Cycle Consistency:</strong> ±{predictions.cycleLengthVariance} days variation
                {predictions.cycleLengthVariance <= 3 && <span style={{ color: 'var(--success)' }}> (Very Regular)</span>}
                {predictions.cycleLengthVariance > 3 && predictions.cycleLengthVariance <= 7 && <span style={{ color: 'var(--warning)' }}> (Regular)</span>}
                {predictions.cycleLengthVariance > 7 && <span style={{ color: 'var(--danger)' }}> (Variable)</span>}
              </div>
            )}
          </div>
        </div>
        
        {cycles.length < 3 && (
          <div style={{
            background: 'rgba(155,140,255,0.12)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.9rem'
          }}>
            <strong>Tip:</strong> Track at least 3 cycles for more accurate predictions and confidence scoring.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
