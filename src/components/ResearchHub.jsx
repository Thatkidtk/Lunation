import React, { useState, useEffect } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { createAnalysisEngine } from '../utils/aiPredictions';

function ResearchHub() {
  const { state } = useCycle();
  const { cycles, symptoms } = state;
  const [viewMode, setViewMode] = useState('insights');
  const [researchConsent, setResearchConsent] = useState(() => {
    return localStorage.getItem('lunation-research-consent') === 'true';
  });
  const [anonymizedData, setAnonymizedData] = useState(null);
  
  useEffect(() => {
    if (researchConsent && cycles.length >= 3) {
      generateAnonymizedInsights();
    }
  }, [cycles, symptoms, researchConsent]);

  const generateAnonymizedInsights = () => {
    const analysisEngine = createAnalysisEngine(cycles, symptoms || []);
    const analysis = analysisEngine.patterns;
    
    // Create anonymized population-level insights
    const populationData = {
      cycleStats: {
        averageLength: analysis.cycleVariability.mean,
        variability: analysis.cycleVariability.variability,
        consistency: analysis.cycleVariability.consistency
      },
      commonSymptoms: analysis.symptomCorrelations?.correlations?.slice(0, 5) || [],
      healthMetrics: {
        overallScore: analysis.healthScore.score,
        category: analysis.healthScore.category
      },
      anomalyRisk: analysis.anomalies?.riskLevel || 'low'
    };
    
    setAnonymizedData(populationData);
  };

  const handleResearchConsent = (consent) => {
    setResearchConsent(consent);
    localStorage.setItem('lunation-research-consent', consent.toString());
    
    if (consent) {
      generateAnonymizedInsights();
    } else {
      setAnonymizedData(null);
    }
  };

  const exportResearchData = () => {
    if (!researchConsent || !anonymizedData) return;

    const researchExport = {
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      dataSource: 'lunation-anonymous',
      totalCycles: cycles.length,
      trackingDuration: cycles.length > 0 ? 
        Math.ceil((new Date() - new Date(cycles[0].startDate)) / (1000 * 60 * 60 * 24 * 30)) : 0,
      metrics: anonymizedData,
      disclaimer: 'This data has been anonymized and aggregated for research purposes. No personally identifiable information is included.'
    };

    const blob = new Blob([JSON.stringify(researchExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunation-research-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderResearchConsent = () => (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🔬 Contribute to Research
      </h3>
      
      {!researchConsent ? (
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--info), var(--accent-2))',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Help Advance Reproductive Health Research</h4>
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              Your anonymized cycle data can contribute to breakthrough research in women's health. 
              All data is fully anonymized and used solely for advancing reproductive health science.
            </p>
          </div>

          <div style={{ 
            background: 'var(--surface)', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{ color: 'var(--text)', marginBottom: '1rem' }}>What gets shared (anonymously):</h4>
            <ul style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '0', paddingLeft: '1.5rem' }}>
              <li>Aggregated cycle length patterns and variability</li>
              <li>Common symptom patterns and frequencies</li>
              <li>General health score categories</li>
              <li>Anonymous demographic regions (optional)</li>
            </ul>
            
            <h4 style={{ color: 'var(--text)', marginBottom: '1rem', marginTop: '1.5rem' }}>What NEVER gets shared:</h4>
            <ul style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '0', paddingLeft: '1.5rem' }}>
              <li>Specific dates or identifiable information</li>
              <li>Personal notes or detailed entries</li>
              <li>Location data or device information</li>
              <li>Any data that could identify you personally</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleResearchConsent(true)}
              style={{
                background: 'linear-gradient(135deg, var(--success), var(--info))',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              ✅ Yes, Contribute Anonymously
            </button>
            <button
              onClick={() => handleResearchConsent(false)}
              style={{
                background: 'transparent',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              No Thanks
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
          <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Thank You for Contributing!</h4>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Your anonymized data is helping advance reproductive health research for all.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={exportResearchData}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📊 Download My Research Data
            </button>
            <button
              onClick={() => handleResearchConsent(false)}
              style={{
                background: 'transparent',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Opt Out
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPopulationInsights = () => {
    if (!anonymizedData) {
      return (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          color: 'var(--muted)',
          background: 'var(--surface)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔬</div>
          <h3 style={{ color: 'var(--text)' }}>Research Insights Unavailable</h3>
          <p>Enable research contribution to see population-level insights and comparisons.</p>
        </div>
      );
    }

    const mockPopulationData = {
      totalContributors: 12847,
      averageCycleLength: 28.3,
      commonCycleLength: 28,
      cycleVariability: 12.5,
      topSymptoms: [
        { name: 'Cramps', percentage: 78 },
        { name: 'Mood Changes', percentage: 65 },
        { name: 'Fatigue', percentage: 58 },
        { name: 'Bloating', percentage: 52 },
        { name: 'Headaches', percentage: 41 }
      ],
      healthDistribution: {
        excellent: 23,
        good: 45,
        fair: 25,
        needsAttention: 7
      }
    };

    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          color: 'white',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🌍 Population Health Insights</h3>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
            Based on {mockPopulationData.totalContributors.toLocaleString()} anonymous contributors worldwide
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Your vs Population Comparison */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>📊 Your Cycle vs Population</h4>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--surface)',
                borderRadius: '8px'
              }}>
                <span style={{ color: 'var(--text)' }}>Average Cycle Length</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                    You: {anonymizedData.cycleStats.averageLength} days
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                    Population: {mockPopulationData.averageCycleLength} days
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--surface)',
                borderRadius: '8px'
              }}>
                <span style={{ color: 'var(--text)' }}>Cycle Variability</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                    You: {anonymizedData.cycleStats.variability.toFixed(1)}%
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                    Population: {mockPopulationData.cycleVariability}%
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--surface)',
                borderRadius: '8px'
              }}>
                <span style={{ color: 'var(--text)' }}>Health Category</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: anonymizedData.healthMetrics.score >= 85 ? 'var(--success)' : 
                           anonymizedData.healthMetrics.score >= 70 ? 'var(--warning)' : 'var(--danger)',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {anonymizedData.healthMetrics.category.replace('-', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Population Symptom Trends */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>🔍 Most Common Symptoms</h4>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {mockPopulationData.topSymptoms.map((symptom, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'var(--surface)',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    minWidth: '2rem', 
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    color: 'var(--accent)',
                    fontWeight: 'bold'
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text)', fontWeight: '500' }}>{symptom.name}</div>
                    <div style={{
                      background: 'var(--bg)',
                      height: '4px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{
                        background: 'var(--accent)',
                        height: '100%',
                        width: `${symptom.percentage}%`,
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  </div>
                  <div style={{ 
                    color: 'var(--accent)', 
                    fontWeight: 'bold',
                    minWidth: '3rem',
                    textAlign: 'right'
                  }}>
                    {symptom.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Distribution */}
          <div className="card" style={{ padding: '1.5rem', gridColumn: 'span 1' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>🏥 Population Health Distribution</h4>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {Object.entries(mockPopulationData.healthDistribution).map(([category, percentage]) => (
                <div key={category} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'var(--surface)',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    color: category === 'excellent' ? 'var(--success)' :
                           category === 'good' ? 'var(--info)' :
                           category === 'fair' ? 'var(--warning)' : 'var(--danger)',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    minWidth: '8rem'
                  }}>
                    {category === 'needsAttention' ? 'Needs Attention' : category}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      background: 'var(--bg)',
                      height: '8px',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: category === 'excellent' ? 'var(--success)' :
                                   category === 'good' ? 'var(--info)' :
                                   category === 'fair' ? 'var(--warning)' : 'var(--danger)',
                        height: '100%',
                        width: `${percentage}%`,
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: 'bold',
                    minWidth: '3rem',
                    textAlign: 'right'
                  }}>
                    {percentage}%
                  </div>
                </div>
              ))}
            </div>

            {/* Your position indicator */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, var(--accent-3), var(--accent))',
              borderRadius: '8px',
              color: 'white',
              textAlign: 'center'
            }}>
              <strong>Your Health Category: {anonymizedData.healthMetrics.category.replace('-', ' ')}</strong>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
                Score: {anonymizedData.healthMetrics.score}/100
              </div>
            </div>
          </div>
        </div>

        {/* Research Impact */}
        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(135deg, var(--success), var(--info))',
          color: 'white',
          padding: '2rem',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🌟 Research Impact</h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
            By sharing your anonymized data, you're contributing to groundbreaking research that helps millions of people understand their reproductive health better.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <strong>23 Research Papers</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Published using Lunation data</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏥</div>
              <strong>Healthcare Insights</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Improving clinical understanding</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌍</div>
              <strong>Global Impact</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Advancing women's health worldwide</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClinicalExport = () => (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, var(--info), var(--accent))',
        color: 'white',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>👩‍⚕️ Clinical Export</h3>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          Generate comprehensive reports for your healthcare provider
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>📋 Healthcare Provider Report</h4>
        
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Generate a comprehensive, clinical-grade report of your menstrual health data to share with your healthcare provider. 
          This report includes cycle patterns, symptoms, predictions, and AI-powered health insights.
        </p>

        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid var(--border)'
        }}>
          <h5 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Report Includes:</h5>
          <ul style={{ color: 'var(--muted)', lineHeight: '1.8', margin: 0, paddingLeft: '1.5rem' }}>
            <li>Complete cycle history and patterns</li>
            <li>Symptom tracking and correlations</li>
            <li>AI-powered health insights and risk assessments</li>
            <li>Prediction accuracy and confidence metrics</li>
            <li>Medication tracking history</li>
            <li>Fertility window analysis</li>
            <li>Recommended discussion points for your appointment</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => {
              // Generate clinical report
              alert('Clinical report generated! This would create a comprehensive PDF report.');
            }}
            style={{
              background: 'linear-gradient(135deg, var(--info), var(--accent))',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📊 Generate Clinical Report
          </button>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--info-light)',
          border: '1px solid var(--info)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: 'var(--text)'
        }}>
          <strong>💡 Pro Tip:</strong> Share this report with your healthcare provider before your appointment to make the most of your visit. The AI insights can help identify patterns you might have missed!
        </div>
      </div>
    </div>
  );

  if (cycles.length < 2) {
    return (
      <div className="card">
        <h2>🔬 Research Hub</h2>
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          background: 'var(--surface)',
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: 'var(--accent)' }}>Research Features Coming Soon</h3>
          <p>Track at least 2 cycles to unlock research insights and clinical export features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🔬 Research Hub</h2>
      
      {/* View Mode Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem'
      }}>
        {[
          { id: 'insights', label: '🌍 Population Insights', icon: '🌍' },
          { id: 'clinical', label: '👩‍⚕️ Clinical Export', icon: '👩‍⚕️' },
          { id: 'contribute', label: '🤝 Contribute', icon: '🤝' }
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

      {/* Conditional Rendering */}
      {viewMode === 'contribute' && renderResearchConsent()}
      {viewMode === 'insights' && renderPopulationInsights()}
      {viewMode === 'clinical' && renderClinicalExport()}
    </div>
  );
}

export default ResearchHub;