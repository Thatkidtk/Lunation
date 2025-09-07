import React, { useState, useEffect } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { createAnalysisEngine } from '../utils/aiPredictions';

function SmartNotifications() {
  const { state } = useCycle();
  const { cycles, symptoms, medications } = state;
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    periodReminder: true,
    fertilityAlert: true,
    medicationReminder: true,
    healthInsights: true,
    anomalyAlerts: true
  });

  useEffect(() => {
    if (cycles.length >= 3) {
      generateSmartNotifications();
    }
  }, [cycles, symptoms, medications, preferences]);

  const generateSmartNotifications = () => {
    const analysisEngine = createAnalysisEngine(cycles, symptoms || []);
    const aiPredictions = analysisEngine.generateAdvancedPredictions();
    const newNotifications = [];

    // Period reminders
    if (preferences.periodReminder && aiPredictions.nextPeriod.daysFromNow <= 3 && aiPredictions.nextPeriod.daysFromNow >= 0) {
      newNotifications.push({
        id: 'period-reminder',
        type: 'reminder',
        priority: 'high',
        title: '🩸 Period Starting Soon',
        message: `Your period is expected to start in ${aiPredictions.nextPeriod.daysFromNow} day${aiPredictions.nextPeriod.daysFromNow !== 1 ? 's' : ''}`,
        confidence: aiPredictions.nextPeriod.confidence,
        action: 'Prepare supplies',
        timestamp: new Date()
      });
    }

    // Fertility window alerts
    if (preferences.fertilityAlert && aiPredictions.fertilityWindow.start) {
      const fertilityStart = new Date(aiPredictions.fertilityWindow.start);
      const daysToFertility = Math.ceil((fertilityStart - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysToFertility <= 2 && daysToFertility >= -1) {
        newNotifications.push({
          id: 'fertility-window',
          type: 'alert',
          priority: 'medium',
          title: '🥚 Fertility Window Active',
          message: daysToFertility > 0 
            ? `Your fertility window starts in ${daysToFertility} day${daysToFertility !== 1 ? 's' : ''}`
            : 'You are currently in your fertility window',
          action: 'Track intimacy',
          timestamp: new Date()
        });
      }
    }

    // Medication reminders
    if (preferences.medicationReminder && medications.length > 0) {
      const activeMedications = medications.filter(med => med.isActive);
      if (activeMedications.length > 0) {
        newNotifications.push({
          id: 'medication-reminder',
          type: 'reminder',
          priority: 'medium',
          title: '💊 Medication Reminder',
          message: `Don't forget to take your ${activeMedications.length} active medication${activeMedications.length !== 1 ? 's' : ''}`,
          medications: activeMedications.map(med => med.name),
          action: 'Mark as taken',
          timestamp: new Date()
        });
      }
    }

    // Health insights
    if (preferences.healthInsights) {
      const healthScore = analysisEngine.patterns.healthScore;
      if (healthScore.score < 70) {
        newNotifications.push({
          id: 'health-insight',
          type: 'insight',
          priority: 'medium',
          title: '🏥 Health Insight Available',
          message: `Your health score is ${healthScore.score}. Consider reviewing your cycle patterns.`,
          category: healthScore.category,
          action: 'View insights',
          timestamp: new Date()
        });
      }

      // Symptom pattern insights
      const symptomCorrelations = analysisEngine.patterns.symptomCorrelations?.correlations || [];
      const frequentSymptoms = symptomCorrelations.filter(c => c.frequency > cycles.length * 0.7);
      
      if (frequentSymptoms.length > 0) {
        newNotifications.push({
          id: 'symptom-pattern',
          type: 'insight',
          priority: 'low',
          title: '📊 Pattern Detected',
          message: `${frequentSymptoms[0].symptom.replace('-', ' ')} occurs frequently during your ${frequentSymptoms[0].phase} phase`,
          symptoms: frequentSymptoms,
          action: 'View details',
          timestamp: new Date()
        });
      }
    }

    // Anomaly alerts
    if (preferences.anomalyAlerts) {
      const anomalies = analysisEngine.patterns.anomalies?.anomalies || [];
      const recentAnomalies = anomalies.filter(a => {
        const anomalyDate = new Date(a.date);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return anomalyDate >= oneMonthAgo;
      });

      if (recentAnomalies.length > 0) {
        const highSeverity = recentAnomalies.filter(a => a.severity === 'high');
        newNotifications.push({
          id: 'anomaly-alert',
          type: 'alert',
          priority: highSeverity.length > 0 ? 'high' : 'medium',
          title: '⚠️ Health Alert',
          message: `${recentAnomalies.length} cycle anomal${recentAnomalies.length !== 1 ? 'ies' : 'y'} detected in the past month`,
          anomalies: recentAnomalies,
          action: highSeverity.length > 0 ? 'Consider consulting doctor' : 'Review patterns',
          timestamp: new Date()
        });
      }
    }

    setNotifications(newNotifications);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updatePreferences = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      default: return '#28a745';
    }
  };

  const getPriorityIcon = (type) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'alert': return '🚨';
      case 'insight': return '💡';
      default: return '📱';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (cycles.length < 3) {
    return (
      <div className="card">
        <h2>🔔 Smart Notifications</h2>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderRadius: '12px',
          color: 'var(--muted)'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Smart Alerts Coming Soon</h3>
          <p>Track at least 3 cycles to enable intelligent notifications and personalized health alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🔔 Smart Notifications</h2>
      
      {/* Notification Preferences */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Notification Preferences</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {Object.entries(preferences).map(([key, value]) => (
            <label key={key} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--surface)',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid var(--border)'
            }}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updatePreferences(key, e.target.checked)}
                style={{ 
                  accentColor: 'var(--accent)',
                  transform: 'scale(1.2)'
                }}
              />
              <span style={{ 
                textTransform: 'capitalize',
                fontSize: '0.9rem'
              }}>
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Notifications */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
          Active Notifications ({notifications.length})
        </h3>
        
        {notifications.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            background: 'var(--surface)',
            borderRadius: '8px',
            color: 'var(--muted)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            <p>All caught up! No new notifications.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {notifications.map(notification => (
              <div key={notification.id} style={{
                background: 'var(--surface)',
                border: `1px solid ${getPriorityColor(notification.priority)}`,
                borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                borderRadius: '8px',
                padding: '1.5rem',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getPriorityIcon(notification.type)}</span>
                    <h4 style={{ margin: 0, color: 'var(--text)' }}>{notification.title}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {getTimeAgo(notification.timestamp)}
                    </span>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '4px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>
                  {notification.message}
                </p>

                {notification.confidence && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--muted)', 
                    marginBottom: '1rem' 
                  }}>
                    Confidence: {notification.confidence}%
                  </div>
                )}

                {notification.medications && (
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--muted)', 
                    marginBottom: '1rem' 
                  }}>
                    Medications: {notification.medications.join(', ')}
                  </div>
                )}

                {notification.symptoms && (
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--muted)', 
                    marginBottom: '1rem' 
                  }}>
                    Related symptoms: {notification.symptoms.map(s => s.symptom.replace('-', ' ')).join(', ')}
                  </div>
                )}

                <div style={{
                  background: getPriorityColor(notification.priority),
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  display: 'inline-block',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {notification.action}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartNotifications;