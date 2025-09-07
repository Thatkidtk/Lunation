import React, { useState, useEffect } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { createAnalysisEngine } from '../utils/aiPredictions';
import { toast } from '../ui/Toast';
import { ariaAnnounce } from '../ui/aria/LiveRegion';

function SymptomTracker() {
  const { state, dispatch } = useCycle();
  const { cycles, symptoms } = state;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomSeverity, setSymptomSeverity] = useState({});
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState('track'); // 'track', 'insights', 'history'

  const symptomCategories = {
    physical: {
      label: 'Physical Symptoms',
      icon: '🩺',
      symptoms: [
        { id: 'cramps', label: 'Cramps', icon: '😣' },
        { id: 'bloating', label: 'Bloating', icon: '🫃' },
        { id: 'breast-tenderness', label: 'Breast Tenderness', icon: '🤱' },
        { id: 'headache', label: 'Headache', icon: '🤕' },
        { id: 'back-pain', label: 'Back Pain', icon: '🔙' },
        { id: 'nausea', label: 'Nausea', icon: '🤢' },
        { id: 'fatigue', label: 'Fatigue', icon: '😴' },
        { id: 'hot-flashes', label: 'Hot Flashes', icon: '🔥' },
        { id: 'joint-pain', label: 'Joint Pain', icon: '🦴' }
      ]
    },
    emotional: {
      label: 'Emotional & Mental',
      icon: '🧠',
      symptoms: [
        { id: 'mood-swings', label: 'Mood Swings', icon: '🎭' },
        { id: 'irritability', label: 'Irritability', icon: '😤' },
        { id: 'anxiety', label: 'Anxiety', icon: '😰' },
        { id: 'depression', label: 'Depression', icon: '😢' },
        { id: 'mood-low', label: 'Low Mood', icon: '😔' },
        { id: 'emotional-sensitivity', label: 'Emotional Sensitivity', icon: '🥺' },
        { id: 'brain-fog', label: 'Brain Fog', icon: '🌫️' },
        { id: 'difficulty-concentrating', label: 'Difficulty Concentrating', icon: '🤔' }
      ]
    },
    skin: {
      label: 'Skin & Beauty',
      icon: '✨',
      symptoms: [
        { id: 'acne', label: 'Acne', icon: '😷' },
        { id: 'skin-dryness', label: 'Skin Dryness', icon: '🏜️' },
        { id: 'skin-oiliness', label: 'Skin Oiliness', icon: '💧' },
        { id: 'dark-circles', label: 'Dark Circles', icon: '🐼' },
        { id: 'hair-changes', label: 'Hair Changes', icon: '💇‍♀️' }
      ]
    },
    other: {
      label: 'Other Symptoms',
      icon: '📋',
      symptoms: [
        { id: 'food-cravings', label: 'Food Cravings', icon: '🍫' },
        { id: 'insomnia', label: 'Insomnia', icon: '🌙' },
        { id: 'increased-appetite', label: 'Increased Appetite', icon: '🍽️' },
        { id: 'decreased-appetite', label: 'Decreased Appetite', icon: '🚫' },
        { id: 'digestive-issues', label: 'Digestive Issues', icon: '🤢' },
        { id: 'water-retention', label: 'Water Retention', icon: '💧' }
      ]
    }
  };

  const severityLevels = [
    { value: 'mild', label: 'Mild', color: '#28a745', description: 'Barely noticeable' },
    { value: 'moderate', label: 'Moderate', color: '#ffc107', description: 'Noticeable but manageable' },
    { value: 'severe', label: 'Severe', color: '#fd7e14', description: 'Significantly affecting daily activities' },
    { value: 'extreme', label: 'Extreme', color: '#dc3545', description: 'Severely debilitating' }
  ];

  useEffect(() => {
    // Load symptoms for selected date
    const dateSymptoms = symptoms?.filter(s => s.date === selectedDate) || [];
    setSelectedSymptoms(dateSymptoms.map(s => s.type));
    
    const severityMap = {};
    dateSymptoms.forEach(s => {
      severityMap[s.type] = s.severity || 'mild';
    });
    setSymptomSeverity(severityMap);
    
    const dayNotes = dateSymptoms.find(s => s.notes)?.notes || '';
    setNotes(dayNotes);
  }, [selectedDate, symptoms]);

  const toggleSymptom = (symptomId) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(prev => prev.filter(id => id !== symptomId));
      setSymptomSeverity(prev => {
        const newSeverity = { ...prev };
        delete newSeverity[symptomId];
        return newSeverity;
      });
    } else {
      setSelectedSymptoms(prev => [...prev, symptomId]);
      setSymptomSeverity(prev => ({ ...prev, [symptomId]: 'mild' }));
    }
  };

  const updateSeverity = (symptomId, severity) => {
    setSymptomSeverity(prev => ({ ...prev, [symptomId]: severity }));
  };

  const saveSymptoms = () => {
    // Remove existing symptoms for this date
    const filteredSymptoms = symptoms?.filter(s => s.date !== selectedDate) || [];
    
    // Add new symptoms
    const newSymptoms = selectedSymptoms.map(symptomId => ({
      id: `${selectedDate}-${symptomId}`,
      type: symptomId,
      date: selectedDate,
      severity: symptomSeverity[symptomId] || 'mild',
      notes: notes,
      timestamp: new Date().toISOString()
    }));

    // Update state
    const allSymptoms = [...filteredSymptoms, ...newSymptoms];
    dispatch({
      type: 'LOAD_DATA',
      payload: { ...state, symptoms: allSymptoms }
    });

    // Feedback
    toast.success('Symptoms saved');
    ariaAnnounce('Symptoms saved');
  };

  const renderSymptomInsights = () => {
    if (cycles.length < 3) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'var(--surface)',
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          <h3 style={{ color: 'var(--accent)' }}>Insights Coming Soon</h3>
          <p>Track symptoms across 3+ cycles to see intelligent insights and patterns.</p>
        </div>
      );
    }

    const analysisEngine = createAnalysisEngine(cycles, symptoms || []);
    const correlations = analysisEngine.patterns.symptomCorrelations?.correlations || [];

    if (correlations.length === 0) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'var(--surface)',
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          <h3 style={{ color: 'var(--accent)' }}>No Patterns Yet</h3>
          <p>Keep tracking symptoms to discover personalized insights and correlations.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>🧠 AI Symptom Analysis</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Analyzing {symptoms?.length || 0} symptoms across {cycles.length} cycles
          </p>
        </div>

        {correlations.map((correlation, index) => {
          const symptomInfo = Object.values(symptomCategories)
            .flatMap(cat => cat.symptoms)
            .find(s => s.id === correlation.symptom);

          return (
            <div key={index} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{symptomInfo?.icon || '📊'}</span>
                <div>
                  <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
                    {correlation.symptom.replace('-', ' ')}
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Occurs {correlation.frequency}/{cycles.length} cycles ({Math.round((correlation.frequency/cycles.length)*100)}%)
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                    Typical Cycle Day
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    Day {correlation.averageDay}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                    Cycle Phase
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    color: correlation.phase === 'menstrual' ? '#dc3545' :
                           correlation.phase === 'follicular' ? '#28a745' :
                           correlation.phase === 'ovulatory' ? '#ffc107' : '#6f42c1',
                    textTransform: 'capitalize'
                  }}>
                    {correlation.phase}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                    Pattern
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text)', textTransform: 'capitalize' }}>
                    {correlation.pattern || 'Variable'}
                  </div>
                </div>
              </div>

              {/* Personalized recommendations based on symptom */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'var(--surface)', 
                borderRadius: '8px',
                borderLeft: '4px solid var(--accent)'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  💡 Personalized Insight
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {getSymptomInsight(correlation)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getSymptomInsight = (correlation) => {
    const insights = {
      'cramps': `Your cramps typically occur on day ${correlation.averageDay}. Consider pain relief 1-2 days before this.`,
      'mood-swings': `Mood changes happen around day ${correlation.averageDay}. Practice mindfulness during this time.`,
      'bloating': `Bloating peaks on day ${correlation.averageDay}. Reduce sodium intake 2-3 days before.`,
      'headache': `Headaches are common on day ${correlation.averageDay}. Stay hydrated and consider magnesium supplements.`,
      'fatigue': `Energy dips around day ${correlation.averageDay}. Plan lighter activities during this time.`,
      'food-cravings': `Cravings peak on day ${correlation.averageDay}. Prepare healthy alternatives in advance.`,
      'acne': `Skin breakouts occur around day ${correlation.averageDay}. Adjust skincare routine accordingly.`,
      'anxiety': `Anxiety increases around day ${correlation.averageDay}. Practice relaxation techniques.`
    };

    return insights[correlation.symptom] || 
           `This symptom typically occurs during your ${correlation.phase} phase. Track patterns to optimize management.`;
  };

  const renderSymptomHistory = () => {
    if (!symptoms || symptoms.length === 0) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'var(--surface)',
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          <h3 style={{ color: 'var(--accent)' }}>No Symptom History</h3>
          <p>Start tracking symptoms to build your personalized health history.</p>
        </div>
      );
    }

    const groupedSymptoms = symptoms.reduce((acc, symptom) => {
      if (!acc[symptom.date]) acc[symptom.date] = [];
      acc[symptom.date].push(symptom);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedSymptoms).sort((a, b) => new Date(b) - new Date(a));

    return (
      <div style={{ display: 'grid', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
        {sortedDates.slice(0, 20).map(date => ( // Show last 20 entries
          <div key={date} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: 'var(--accent)' }}>
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {groupedSymptoms[date].length} symptom{groupedSymptoms[date].length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {groupedSymptoms[date].map(symptom => {
                const symptomInfo = Object.values(symptomCategories)
                  .flatMap(cat => cat.symptoms)
                  .find(s => s.id === symptom.type);
                const severity = severityLevels.find(s => s.value === symptom.severity);

                return (
                  <div key={symptom.id} style={{
                    background: severity?.color + '20',
                    color: severity?.color,
                    border: `1px solid ${severity?.color}`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span>{symptomInfo?.icon}</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {symptom.type.replace('-', ' ')}
                    </span>
                    <span style={{ opacity: 0.8 }}>({symptom.severity})</span>
                  </div>
                );
              })}
            </div>

            {groupedSymptoms[date].find(s => s.notes) && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.5rem', 
                background: 'var(--surface)', 
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                color: 'var(--muted)'
              }}>
                "{groupedSymptoms[date].find(s => s.notes)?.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTrackingInterface = () => (
    <div>
      {/* Date Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Symptom Categories */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {Object.entries(symptomCategories).map(([categoryId, category]) => (
          <div key={categoryId}>
            <h3 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '1rem',
              color: 'var(--accent)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
              {category.label}
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              {category.symptoms.map(symptom => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <div key={symptom.id} style={{
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    background: isSelected ? 'var(--accent)10' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => toggleSymptom(symptom.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{symptom.icon}</span>
                      <span style={{ fontWeight: isSelected ? 'bold' : 'normal', color: 'var(--text)' }}>
                        {symptom.label}
                      </span>
                    </div>

                    {isSelected && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--muted)' }}>
                          Severity:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
                          {severityLevels.map(level => (
                            <label key={level.value} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="radio"
                                name={`severity-${symptom.id}`}
                                value={level.value}
                                checked={symptomSeverity[symptom.id] === level.value}
                                onChange={(e) => updateSeverity(symptom.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ accentColor: level.color }}
                              />
                              <span style={{ color: level.color }}>{level.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Notes Section */}
      {selectedSymptoms.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Additional Notes (optional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details about your symptoms..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Save Button */}
      {selectedSymptoms.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={saveSymptoms}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Save Symptoms for {new Date(selectedDate).toLocaleDateString()}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="card">
      <h2>🩺 Smart Symptom Tracker</h2>
      
      {/* View Mode Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem'
      }}>
        {[
          { id: 'track', label: '📝 Track Symptoms', icon: '📝' },
          { id: 'insights', label: '🧠 AI Insights', icon: '🧠' },
          { id: 'history', label: '📊 History', icon: '📊' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            style={{
              background: viewMode === mode.id ? 'var(--accent)' : 'transparent',
              color: viewMode === mode.id ? 'white' : 'var(--muted)',
              border: viewMode === mode.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'track' && renderTrackingInterface()}
      {viewMode === 'insights' && renderSymptomInsights()}
      {viewMode === 'history' && renderSymptomHistory()}
    </div>
  );
}

export default SymptomTracker;
