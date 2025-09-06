import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';

function MedicationTracking() {
  const { state, dispatch } = useCycle();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'birth-control',
    dosage: '',
    frequency: 'daily',
    startDate: '',
    notes: ''
  });

  const medicationTypes = [
    { value: 'birth-control', label: '💊 Birth Control', icon: '💊' },
    { value: 'pain-relief', label: '🩹 Pain Relief', icon: '🩹' },
    { value: 'hormone', label: '⚗️ Hormone Therapy', icon: '⚗️' },
    { value: 'supplement', label: '🌿 Supplement/Vitamin', icon: '🌿' },
    { value: 'other', label: '💉 Other Medication', icon: '💉' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as-needed', label: 'As Needed' },
    { value: 'cycle-specific', label: 'Specific Cycle Days' }
  ];

  const medications = state.medications || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a medication name');
      return;
    }

    const newMedication = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    dispatch({ type: 'ADD_MEDICATION', payload: newMedication });

    // Reset form
    setFormData({
      name: '',
      type: 'birth-control',
      dosage: '',
      frequency: 'daily',
      startDate: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const toggleMedication = (medicationId) => {
    dispatch({ 
      type: 'TOGGLE_MEDICATION', 
      payload: { id: medicationId }
    });
  };

  const deleteMedication = (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      dispatch({ 
        type: 'DELETE_MEDICATION', 
        payload: { id: medicationId }
      });
    }
  };

  const getTypeInfo = (type) => {
    return medicationTypes.find(t => t.value === type) || medicationTypes[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>💊 Medication & Supplement Tracking</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn"
          style={{
            background: showAddForm ? '#6c757d' : '#28a745',
          }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Medication'}
        </button>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#c44569', marginBottom: '1rem' }}>Add New Medication</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Birth Control Pill, Ibuprofen, Iron Supplement"
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
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    {medicationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Dosage
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g., 200mg, 1 pill"
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
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
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
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this medication..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button type="submit" className="btn">
                💊 Add Medication
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Medications List */}
      {medications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#666',
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
          <h3 style={{ color: '#c44569' }}>No Medications Tracked</h3>
          <p>Add medications, supplements, or birth control to track their effects on your cycle.</p>
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#c44569', marginBottom: '1rem' }}>
            Current Medications ({medications.filter(m => m.isActive).length} active)
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {medications.map(medication => {
              const typeInfo = getTypeInfo(medication.type);
              return (
                <div key={medication.id} style={{
                  background: medication.isActive ? 'white' : '#f8f9fa',
                  border: medication.isActive ? '2px solid #28a745' : '1px solid #dee2e6',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  opacity: medication.isActive ? 1 : 0.7
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{typeInfo.icon}</span>
                        <h4 style={{ margin: 0, color: '#c44569' }}>{medication.name}</h4>
                        <span style={{
                          background: medication.isActive ? '#28a745' : '#6c757d',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {medication.isActive ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div><strong>Type:</strong> {typeInfo.label.replace(/.*?\s/, '')}</div>
                        {medication.dosage && <div><strong>Dosage:</strong> {medication.dosage}</div>}
                        <div><strong>Frequency:</strong> {frequencies.find(f => f.value === medication.frequency)?.label}</div>
                        <div><strong>Started:</strong> {formatDate(medication.startDate)}</div>
                      </div>
                      
                      {medication.notes && (
                        <div style={{ 
                          background: '#f8f9fa', 
                          padding: '0.75rem', 
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          marginBottom: '1rem'
                        }}>
                          <strong>Notes:</strong> {medication.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        onClick={() => toggleMedication(medication.id)}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          background: medication.isActive ? '#ffc107' : '#28a745'
                        }}
                      >
                        {medication.isActive ? '⏸️ Pause' : '▶️ Resume'}
                      </button>
                      <button
                        onClick={() => deleteMedication(medication.id)}
                        className="btn"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          background: '#dc3545'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Medication Insights */}
      {medications.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginTop: '2rem'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>💡 Medication Insights</h3>
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
            <div>
              <strong>Active Medications:</strong> {medications.filter(m => m.isActive).length} of {medications.length}
            </div>
            <div>
              <strong>Most Common Type:</strong> {
                (() => {
                  const types = medications.reduce((acc, med) => {
                    acc[med.type] = (acc[med.type] || 0) + 1;
                    return acc;
                  }, {});
                  const mostCommon = Object.entries(types).sort(([,a], [,b]) => b - a)[0];
                  return mostCommon ? getTypeInfo(mostCommon[0]).label.replace(/.*?\s/, '') : 'None';
                })()
              }
            </div>
            <div>
              <strong>Tip:</strong> Track how medications affect your cycle patterns in the Analytics section.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicationTracking;