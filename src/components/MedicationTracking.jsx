import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { toast } from '../ui/Toast';
import { ariaAnnounce } from '../ui/aria/LiveRegion';
import * as Sentry from '@sentry/react';

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
    { value: 'birth-control', label: 'Birth Control' },
    { value: 'pain-relief', label: 'Pain Relief' },
    { value: 'hormone', label: 'Hormone Therapy' },
    { value: 'supplement', label: 'Supplement/Vitamin' },
    { value: 'other', label: 'Other Medication' }
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

  const [newId, setNewId] = useState(null);

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
    try { Sentry.addBreadcrumb({ category: 'medication', message: 'add', level: 'info', data: { name: newMedication.name, type: newMedication.type } }); } catch (_) {}
    setNewId(newMedication.id);

    // Feedback
    toast.success(`Medication “${newMedication.name}” added`);
    ariaAnnounce(`Medication ${newMedication.name} added`);

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

  const deleteMedication = (medication) => {
    // Immediate UI removal
    dispatch({ type: 'DELETE_MEDICATION', payload: { id: medication.id } });
    try { Sentry.addBreadcrumb({ category: 'medication', message: 'delete', level: 'info', data: { id: medication.id, name: medication.name } }); } catch (_) {}
    // Undo pattern via toast action (6s)
    toast.infoAction(`Deleted “${medication.name}”`, 6000, {
      label: 'Undo',
      onClick: () => {
        dispatch({ type: 'ADD_MEDICATION', payload: medication });
        toast.success(`Restored “${medication.name}”`);
        ariaAnnounce(`Restored ${medication.name}`);
        setNewId(medication.id);
      }
    });
    ariaAnnounce(`Deleted ${medication.name}. Undo available`);
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
        <h2>Medication & Supplement Tracking</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn"
          data-testid="add-medication-toggle"
          style={{
            background: showAddForm ? '#6c757d' : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Medication'}
        </button>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Add New Medication</h3>
          
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
                    data-testid="medication-name-input"
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

              <button type="submit" className="btn" data-testid="submit-add-medication">
                Add Medication
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
          color: 'var(--muted)',
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: 'var(--accent)' }}>No Medications Tracked</h3>
          <p>Add medications, supplements, or birth control to track their effects on your cycle.</p>
        </div>
      ) : (
        <div>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
            Current Medications ({medications.filter(m => m.isActive).length} active)
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {medications.map(medication => {
              const typeInfo = getTypeInfo(medication.type);
              return (
                <div key={medication.id} data-testid={`medication-card-${medication.id}`} style={{
                  background: medication.isActive ? 'var(--surface)' : 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  opacity: medication.isActive ? 1 : 0.7
                }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className={newId === medication.id ? 'scale-in' : ''} onAnimationEnd={() => { if (newId === medication.id) setNewId(null); }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--accent)' }}>{medication.name}</h4>
                        <span style={{
                          background: medication.isActive ? 'var(--success)' : '#6c757d',
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
                        <div><strong>Type:</strong> {typeInfo.label}</div>
                        {medication.dosage && <div><strong>Dosage:</strong> {medication.dosage}</div>}
                        <div><strong>Frequency:</strong> {frequencies.find(f => f.value === medication.frequency)?.label}</div>
                        <div><strong>Started:</strong> {formatDate(medication.startDate)}</div>
                      </div>
                      
                      {medication.notes && (
                        <div style={{ 
                          background: 'var(--surface-2)', 
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
                          background: medication.isActive ? 'var(--warning)' : 'var(--success)'
                        }}
                      >
                        {medication.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => deleteMedication(medication)}
                        className="btn"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          background: 'var(--danger)'
                        }}
                        aria-label={`Delete medication ${medication.name}`}
                      >
                        Delete
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
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          padding: '1.5rem',
          borderRadius: '12px',
          marginTop: '2rem'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Medication Insights</h3>
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
