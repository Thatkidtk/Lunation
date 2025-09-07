import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { createAnalysisEngine } from '../utils/aiPredictions';

function HealthInsights() {
  const { state } = useCycle();
  const { cycles, symptoms } = state;
  const [selectedInsight, setSelectedInsight] = useState('overview');

  if (cycles.length < 3) {
    return (
      <div className="card">
        <h2>🧠 AI Health Insights</h2>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderRadius: '12px',
          margin: '1rem 0'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Building Your Health Profile</h3>
          <p style={{ marginBottom: '1rem' }}>
            Track at least 3 cycles to unlock advanced AI-powered health insights and personalized recommendations.
          </p>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            <strong>What you'll get:</strong><br />
            • Pattern recognition & anomaly detection<br />
            • Personalized health scoring<br />
            • Predictive confidence analysis<br />
            • Smart recommendations
          </div>
        </div>
      </div>
    );
  }

  const analysisEngine = createAnalysisEngine(cycles, symptoms);
  const analysis = analysisEngine.patterns;
  const predictions = analysisEngine.generateAdvancedPredictions();

  const insightTabs = [
    { id: 'overview', label: '🏥 Health Overview', icon: '🏥' },
    { id: 'patterns', label: '📊 Cycle Patterns', icon: '📊' },
    { id: 'predictions', label: '🔮 AI Predictions', icon: '🔮' },
    { id: 'anomalies', label: '⚠️ Health Alerts', icon: '⚠️' },
    { id: 'recommendations', label: '💡 Recommendations', icon: '💡' }
  ];

  const renderHealthScore = () => {
    const score = analysis.healthScore.score;
    const category = analysis.healthScore.category;
    
    const getScoreColor = (score) => {
      if (score >= 90) return '#28a745';
      if (score >= 75) return '#20c997';
      if (score >= 60) return '#ffc107';
      return '#dc3545';
    };

    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        border: '1px solid var(--border)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Your Health Score</h3>
        <div style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: getScoreColor(score),
          marginBottom: '0.5rem'
        }}>
          {score}
        </div>
        <div style={{
          fontSize: '1.2rem',
          color: 'var(--accent)',
          textTransform: 'capitalize',
          marginBottom: '1rem'
        }}>
          {category.replace('-', ' ')}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Cycle Regularity</div>
            <div style={{ color: 'var(--text)', fontWeight: '500' }}>
              {analysis.healthScore.factors.cycleRegularity}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Anomaly Risk</div>
            <div style={{ color: 'var(--text)', fontWeight: '500' }}>
              {analysis.healthScore.factors.anomalyRisk}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Symptom Severity</div>
            <div style={{ color: 'var(--text)', fontWeight: '500' }}>
              {analysis.healthScore.factors.symptomSeverity}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div>
      {renderHealthScore()}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎯 Prediction Confidence
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                background: `linear-gradient(to right, var(--accent) ${predictions.confidence.score}%, transparent ${predictions.confidence.score}%)`,
                height: '8px',
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>{predictions.confidence.score}% Confidence</span>
              <span style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>
                {predictions.confidence.level}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Based on {cycles.length} cycles of data
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📈 Cycle Consistency
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              {analysis.cycleVariability.consistency}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              Variability: {analysis.cycleVariability.variability}%
            </div>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Average length: <strong>{analysis.cycleVariability.mean} days</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatterns = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>📊 Cycle Variability Analysis</h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Average Length:</span>
            <strong>{analysis.cycleVariability.mean} days</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Standard Deviation:</span>
            <strong>{analysis.cycleVariability.standardDeviation} days</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Variability:</span>
            <strong>{analysis.cycleVariability.variability}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Consistency:</span>
            <strong style={{ 
              color: analysis.cycleVariability.consistency === 'high' ? '#28a745' : 
                     analysis.cycleVariability.consistency === 'moderate' ? '#ffc107' : '#dc3545',
              textTransform: 'capitalize'
            }}>
              {analysis.cycleVariability.consistency}
            </strong>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🩸 Flow Pattern Analysis</h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Most Common:</span>
            <strong style={{ textTransform: 'capitalize' }}>{analysis.flowConsistency.mostCommon}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Consistency:</span>
            <strong>{analysis.flowConsistency.consistency}%</strong>
          </div>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          Pattern: <span style={{ 
            color: analysis.flowConsistency.pattern === 'consistent' ? '#28a745' : 
                   analysis.flowConsistency.pattern === 'variable' ? '#ffc107' : '#dc3545',
            textTransform: 'capitalize'
          }}>
            {analysis.flowConsistency.pattern}
          </span>
        </div>
      </div>

      {analysis.symptomCorrelations?.correlations?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1rem' }}>🔍 Symptom Correlations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {analysis.symptomCorrelations.correlations.map((correlation, index) => (
              <div key={index} style={{
                background: 'var(--surface)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                  {correlation.symptom.replace('-', ' ')}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                  Frequency: {correlation.frequency}/{cycles.length} cycles
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                  Avg Cycle Day: {correlation.averageDay}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'capitalize' }}>
                  Phase: {correlation.phase}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPredictions = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔮 Next Period Prediction
        </h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
            {new Date(predictions.nextPeriod.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {predictions.nextPeriod.daysFromNow > 0 
              ? `In ${predictions.nextPeriod.daysFromNow} days`
              : predictions.nextPeriod.daysFromNow === 0
                ? 'Today'
                : `${Math.abs(predictions.nextPeriod.daysFromNow)} days overdue`
            }
          </div>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          Predicted length: {predictions.nextPeriod.predictedLength} days
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          Confidence: {predictions.nextPeriod.confidence}%
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🥚 Fertility Window
        </h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
            {predictions.fertilityWindow.start && predictions.fertilityWindow.end ? (
              `${new Date(predictions.fertilityWindow.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
               ${new Date(predictions.fertilityWindow.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            ) : 'Calculating...'}
          </div>
        </div>
        {predictions.ovulation.date && (
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Peak fertility: {new Date(predictions.ovulation.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 Prediction Factors
        </h3>
        <div style={{ fontSize: '0.9rem' }}>
          {Object.entries(predictions.confidence.factors).map(([factor, score]) => (
            <div key={factor} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{factor.replace(/([A-Z])/g, ' $1')}:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  background: 'var(--surface)',
                  borderRadius: '4px',
                  width: '60px',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'var(--accent)',
                    height: '100%',
                    width: `${(score/40)*100}%`,
                    borderRadius: '4px'
                  }}></div>
                </div>
                <span style={{ minWidth: '30px', textAlign: 'right' }}>{Math.round(score)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnomalies = () => {
    const anomalies = analysis.anomalies?.anomalies || [];
    
    if (anomalies.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderRadius: '12px',
          color: 'var(--muted)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>All Clear!</h3>
          <p>No significant anomalies detected in your cycle patterns.</p>
        </div>
      );
    }

    return (
      <div>
        <div style={{
          background: analysis.anomalies.riskLevel === 'high' ? '#dc354520' :
                     analysis.anomalies.riskLevel === 'moderate' ? '#ffc10720' : '#28a74520',
          border: `1px solid ${analysis.anomalies.riskLevel === 'high' ? '#dc3545' :
                                analysis.anomalies.riskLevel === 'moderate' ? '#ffc107' : '#28a745'}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            color: analysis.anomalies.riskLevel === 'high' ? '#dc3545' :
                   analysis.anomalies.riskLevel === 'moderate' ? '#ffc107' : '#28a745',
            marginBottom: '1rem'
          }}>
            Risk Level: {analysis.anomalies.riskLevel.charAt(0).toUpperCase() + analysis.anomalies.riskLevel.slice(1)}
          </h3>
          <p style={{ color: 'var(--muted)' }}>
            {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected in your recent cycles.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {anomalies.map((anomaly, index) => (
            <div key={index} className="card" style={{ 
              padding: '1.5rem',
              borderLeft: `4px solid ${anomaly.severity === 'high' ? '#dc3545' : '#ffc107'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h4 style={{ 
                  color: 'var(--text)',
                  textTransform: 'capitalize',
                  margin: 0
                }}>
                  {anomaly.type.replace('-', ' ')}
                </h4>
                <span style={{
                  background: anomaly.severity === 'high' ? '#dc354520' : '#ffc10720',
                  color: anomaly.severity === 'high' ? '#dc3545' : '#ffc107',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}>
                  {anomaly.severity}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                Cycle {anomaly.cycle}: {anomaly.length} days
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                Date: {new Date(anomaly.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    const recommendations = analysis.anomalies?.recommendations || [];
    
    if (recommendations.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderRadius: '12px',
          color: 'var(--muted)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>You're doing great!</h3>
          <p>No specific recommendations at this time. Keep tracking your cycles for continued insights.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {recommendations.map((rec, index) => (
          <div key={index} className="card" style={{ 
            padding: '1.5rem',
            borderLeft: `4px solid ${rec.priority === 'high' ? '#dc3545' : rec.priority === 'medium' ? '#ffc107' : '#28a745'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>
                  {rec.type === 'medical' ? '🏥' : 
                   rec.type === 'lifestyle' ? '🧘' : 
                   rec.type === 'tracking' ? '📊' : '💡'}
                </span>
                <span style={{
                  background: rec.priority === 'high' ? '#dc354520' : 
                             rec.priority === 'medium' ? '#ffc10720' : '#28a74520',
                  color: rec.priority === 'high' ? '#dc3545' : 
                         rec.priority === 'medium' ? '#ffc107' : '#28a745',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}>
                  {rec.priority} Priority
                </span>
              </div>
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>{rec.message}</p>
            <div style={{ 
              background: 'var(--accent)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              display: 'inline-block'
            }}>
              {rec.action}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedInsight) {
      case 'overview': return renderOverview();
      case 'patterns': return renderPatterns();
      case 'predictions': return renderPredictions();
      case 'anomalies': return renderAnomalies();
      case 'recommendations': return renderRecommendations();
      default: return renderOverview();
    }
  };

  return (
    <div className="card">
      <h2>🧠 AI Health Insights</h2>
      
      {/* Insight Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem',
        overflowX: 'auto'
      }}>
        {insightTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedInsight(tab.id)}
            style={{
              background: selectedInsight === tab.id ? 'var(--accent)' : 'transparent',
              color: selectedInsight === tab.id ? 'white' : 'var(--muted)',
              border: selectedInsight === tab.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

export default HealthInsights;