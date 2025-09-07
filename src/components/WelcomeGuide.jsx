import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';

function WelcomeGuide({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    hasUsedTracker: false,
    primaryGoal: 'period-tracking',
    wantsNotifications: true,
    interestedInResearch: false
  });

  const steps = [
    {
      id: 'welcome',
      title: '🌙 Welcome to Lunation',
      content: 'Revolutionary AI-powered menstrual cycle tracking',
      description: 'Your privacy-first companion for reproductive health insights'
    },
    {
      id: 'features',
      title: '✨ What Makes Lunation Special',
      content: 'Advanced AI predictions, health insights, and research contributions',
      description: 'Unlike other apps, Lunation uses machine learning to provide personalized health intelligence'
    },
    {
      id: 'privacy',
      title: '🔒 Privacy-First Design',
      content: 'Your data stays on your device',
      description: '100% local storage means your personal information never leaves your device unless you choose to contribute to research'
    },
    {
      id: 'goals',
      title: '🎯 What\'s Your Primary Goal?',
      content: 'Help us personalize your experience',
      description: 'Choose what matters most to you'
    },
    {
      id: 'ready',
      title: '🚀 Ready to Start',
      content: 'Let\'s set up your first cycle',
      description: 'We\'ll guide you through tracking your first period to start building your health profile'
    }
  ];

  const currentStepData = steps[currentStep];

  const handlePreferenceUpdate = (key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  };

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and complete onboarding
      localStorage.setItem('lunation-onboarding-completed', 'true');
      localStorage.setItem('lunation-user-preferences', JSON.stringify(userPreferences));
      onComplete(userPreferences);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('lunation-onboarding-completed', 'true');
    onComplete({});
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '6rem', marginBottom: '2rem', lineHeight: 1 }}>
              <span style={{ 
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🌙
              </span>
            </div>
            <h1 style={{ 
              fontSize: '3rem', 
              margin: '0 0 1rem 0',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Lunation
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              The most advanced period tracking app ever created. Powered by AI, designed for privacy, built for your health.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>🎉 You're About to Experience:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '0.5rem' }}>🧠 AI Intelligence</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Machine learning predictions with 80%+ accuracy</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔒 Total Privacy</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Your data never leaves your device</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '0.5rem' }}>🩺 Health Insights</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Personalized recommendations and patterns</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔬 Research Impact</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Contribute to advancing women's health</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
              <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>What Makes Lunation Revolutionary</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                We've reimagined period tracking from the ground up with cutting-edge technology
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {[
                {
                  icon: '🤖',
                  title: 'Advanced AI Engine',
                  description: 'Machine learning algorithms analyze your unique patterns to provide predictions with confidence scores'
                },
                {
                  icon: '🧠',
                  title: 'Health Intelligence',
                  description: 'AI-powered anomaly detection, symptom correlations, and personalized health scoring'
                },
                {
                  icon: '🌍',
                  title: 'Population Insights',
                  description: 'Compare your cycles with anonymized data from thousands of users worldwide'
                },
                {
                  icon: '👩‍⚕️',
                  title: 'Clinical Integration',
                  description: 'Generate comprehensive reports for your healthcare provider with research-grade data'
                },
                {
                  icon: '📱',
                  title: 'Progressive Web App',
                  description: 'Works offline, installs like a native app, with smart notifications and sync'
                },
                {
                  icon: '🔬',
                  title: 'Research Contribution',
                  description: 'Help advance reproductive health research through anonymous data sharing'
                }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'var(--surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
                  <div>
                    <h4 style={{ color: 'var(--text)', margin: '0 0 0.5rem 0' }}>{feature.title}</h4>
                    <p style={{ color: 'var(--muted)', margin: 0, lineHeight: '1.5' }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Your Privacy is Our Priority</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Unlike other apps that collect and sell your data, Lunation keeps everything local
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--success-light), var(--info-light))',
              border: '1px solid var(--success)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '1rem' }}>🛡️ Zero Data Collection Guarantee</h3>
              <p style={{ color: 'var(--text)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Your menstrual data, symptoms, and personal information stay on YOUR device. 
                We can't see it, we don't collect it, and we never sell it.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                padding: '1.5rem',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
                <h4 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Local Storage</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
                  All your data is stored securely in your browser with optional encryption
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌐</div>
                <h4 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Works Offline</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
                  No internet required. Your data stays with you always
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔑</div>
                <h4 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>You Control Everything</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
                  Export, delete, or encrypt your data anytime
                </p>
              </div>
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
              <strong>Optional Research Contribution:</strong> You can choose to anonymously contribute to reproductive health research. 
              Even then, no personally identifiable information is shared - only anonymized patterns.
            </div>
          </div>
        );

      case 'goals':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
              <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>What's Your Primary Goal?</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
                Help us personalize your Lunation experience
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {[
                {
                  id: 'period-tracking',
                  icon: '📅',
                  title: 'Period Tracking',
                  description: 'Track periods and get accurate predictions'
                },
                {
                  id: 'fertility-planning',
                  icon: '🤱',
                  title: 'Fertility Planning',
                  description: 'Plan for conception with ovulation tracking'
                },
                {
                  id: 'health-insights',
                  icon: '🩺',
                  title: 'Health Insights',
                  description: 'Understand patterns and improve wellbeing'
                },
                {
                  id: 'symptom-management',
                  icon: '💊',
                  title: 'Symptom Management',
                  description: 'Track and manage cycle-related symptoms'
                }
              ].map(goal => (
                <label key={goal.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: userPreferences.primaryGoal === goal.id ? 'var(--accent-2)' + '20' : 'var(--surface)',
                  border: userPreferences.primaryGoal === goal.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="primaryGoal"
                    value={goal.id}
                    checked={userPreferences.primaryGoal === goal.id}
                    onChange={(e) => handlePreferenceUpdate('primaryGoal', e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem' }}>{goal.icon}</div>
                  <div>
                    <h4 style={{ color: 'var(--text)', margin: '0 0 0.5rem 0' }}>{goal.title}</h4>
                    <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>{goal.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div style={{
              background: 'var(--surface)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid var(--border)'
            }}>
              <h4 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Quick Questions:</h4>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={userPreferences.hasUsedTracker}
                    onChange={(e) => handlePreferenceUpdate('hasUsedTracker', e.target.checked)}
                    style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }}
                  />
                  <span style={{ color: 'var(--text)' }}>I've used period tracking apps before</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={userPreferences.wantsNotifications}
                    onChange={(e) => handlePreferenceUpdate('wantsNotifications', e.target.checked)}
                    style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }}
                  />
                  <span style={{ color: 'var(--text)' }}>Send me smart notifications and reminders</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={userPreferences.interestedInResearch}
                    onChange={(e) => handlePreferenceUpdate('interestedInResearch', e.target.checked)}
                    style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }}
                  />
                  <span style={{ color: 'var(--text)' }}>I'm interested in contributing to reproductive health research</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🚀</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>You're All Set!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              Welcome to the future of menstrual health tracking. Let's start by adding your first cycle data.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              color: 'white'
            }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>🎉 What Happens Next?</h3>
              <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    width: '2rem', 
                    height: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>1</div>
                  <span>Add your first period to start tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    width: '2rem', 
                    height: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>2</div>
                  <span>AI will learn your patterns (3+ cycles for best results)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    width: '2rem', 
                    height: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>3</div>
                  <span>Unlock advanced insights, predictions, and health scoring</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--surface)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid var(--border)',
              textAlign: 'left'
            }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>💡 Pro Tips:</h4>
              <ul style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0, paddingLeft: '1.5rem' }}>
                <li>Track symptoms daily for better AI insights</li>
                <li>Check the AI Insights tab after 3 cycles for personalized recommendations</li>
                <li>Use Smart Alerts to never miss important predictions</li>
                <li>Export your data anytime for healthcare appointments</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Progress Bar */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '3rem',
          right: '3rem',
          height: '4px',
          background: 'var(--border)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            borderRadius: '2px',
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border)'
        }}>
          <div>
            {currentStep > 0 && (
              <button
                onClick={goToPrevious}
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
                ← Previous
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              {currentStep + 1} of {steps.length}
            </span>
            
            <button
              onClick={skipOnboarding}
              style={{
                background: 'transparent',
                color: 'var(--muted)',
                border: 'none',
                padding: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Skip
            </button>

            <button
              onClick={goToNext}
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {currentStep === steps.length - 1 ? '🚀 Start Tracking' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeGuide;