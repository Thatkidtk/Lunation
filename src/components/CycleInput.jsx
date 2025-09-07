import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { calculatePredictions } from '../utils/cycleCalculations';
import { toast } from '../ui/Toast';
import { ariaAnnounce } from '../ui/aria/LiveRegion';

function CycleInput() {
  const { state, dispatch } = useCycle();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    flowIntensity: 'medium',
    symptoms: []
  });

  const symptomOptions = [
    'Cramps', 'Bloating', 'Mood swings', 'Fatigue', 
    'Headache', 'Breast tenderness', 'Back pain', 'Acne'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.startDate) {
      alert('Please enter a start date');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = formData.endDate ? new Date(formData.endDate) : null;

    if (endDate && endDate < startDate) {
      alert('End date cannot be before start date');
      return;
    }
    if (endDate) {
      const bleedDays = Math.ceil((endDate - startDate) / 86400000) + 1;
      if (bleedDays < 2 || bleedDays > 10) {
        alert('Please enter a realistic period length (2-10 days).');
        return;
      }
    }
    
    const cycleLength = endDate 
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : null;

    const newCycle = {
      id: Date.now(),
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      length: cycleLength,
      flowIntensity: formData.flowIntensity,
      symptoms: formData.symptoms,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_CYCLE', payload: newCycle });

    const updatedCycles = [...state.cycles, newCycle];
    const predictions = calculatePredictions(updatedCycles);
    dispatch({ type: 'UPDATE_PREDICTIONS', payload: predictions });

    // Friendly feedback
    toast.success('Cycle added');
    ariaAnnounce('Cycle added');

    setFormData({
      startDate: '',
      endDate: '',
      flowIntensity: 'medium',
      symptoms: []
    });
  };

  return (
    <div className="card">
      <h2>Track Your Cycle</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Period Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Period End Date (optional)
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Flow Intensity
            </label>
            <select
              name="flowIntensity"
              value={formData.flowIntensity}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Symptoms
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {symptomOptions.map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`btn ${formData.symptoms.includes(symptom) ? '' : 'btn-secondary'}`}
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn">
          Add Cycle Data
        </button>
      </form>
    </div>
  );
}

export default CycleInput;
