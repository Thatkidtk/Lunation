import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';

function DataExport() {
  const { state } = useCycle();
  const { cycles } = state;
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const formatDateForExport = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const generateCSV = () => {
    const headers = [
      'Cycle Number',
      'Start Date',
      'End Date',
      'Cycle Length (days)',
      'Flow Intensity',
      'Symptoms',
      'Notes'
    ];

    const rows = cycles.map((cycle, index) => {
      const startDate = formatDateForExport(cycle.startDate);
      const endDate = formatDateForExport(cycle.endDate);
      const cycleLength = cycle.length || '';
      const flowIntensity = cycle.flowIntensity || '';
      const symptoms = cycle.symptoms ? cycle.symptoms.join('; ') : '';
      const notes = cycle.notes || '';

      return [
        index + 1,
        startDate,
        endDate,
        cycleLength,
        flowIntensity,
        symptoms,
        notes
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const generateJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      appVersion: '0.1.0-beta',
      totalCycles: cycles.length,
      data: cycles.map((cycle, index) => ({
        cycleNumber: index + 1,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        cycleLength: cycle.length,
        flowIntensity: cycle.flowIntensity,
        symptoms: cycle.symptoms || [],
        notes: cycle.notes || '',
        createdAt: cycle.createdAt
      })),
      summary: {
        averageCycleLength: cycles.length > 1 
          ? Math.round(cycles.slice(1).reduce((sum, cycle, index) => {
              const prevCycle = cycles[index];
              const currentStart = new Date(cycle.startDate);
              const prevStart = new Date(prevCycle.startDate);
              const length = Math.ceil((currentStart - prevStart) / (1000 * 60 * 60 * 24));
              return sum + length;
            }, 0) / (cycles.length - 1))
          : null,
        mostCommonSymptoms: getMostCommonSymptoms(),
        flowIntensityDistribution: getFlowDistribution()
      }
    };

    return JSON.stringify(exportData, null, 2);
  };

  const getMostCommonSymptoms = () => {
    const symptomFreq = {};
    cycles.forEach(cycle => {
      if (cycle.symptoms) {
        cycle.symptoms.forEach(symptom => {
          symptomFreq[symptom] = (symptomFreq[symptom] || 0) + 1;
        });
      }
    });
    
    return Object.entries(symptomFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom, count]) => ({ symptom, count }));
  };

  const getFlowDistribution = () => {
    const flowDist = { light: 0, medium: 0, heavy: 0 };
    cycles.forEach(cycle => {
      if (cycle.flowIntensity) {
        flowDist[cycle.flowIntensity]++;
      }
    });
    return flowDist;
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (cycles.length === 0) {
      alert('No cycle data to export. Please add some cycles first.');
      return;
    }

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      let content, filename, contentType;

      if (exportFormat === 'csv') {
        content = generateCSV();
        filename = `lunation-cycle-data-${timestamp}.csv`;
        contentType = 'text/csv;charset=utf-8;';
      } else {
        content = generateJSON();
        filename = `lunation-cycle-data-${timestamp}.json`;
        contentType = 'application/json;charset=utf-8;';
      }

      // Simulate brief processing time for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      downloadFile(content, filename, contentType);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to clear ALL your cycle data?\n\n' +
      'This action cannot be undone. Consider exporting your data first.\n\n' +
      'Type "DELETE" to confirm this action.'
    );

    if (confirmed) {
      const confirmation = prompt('Type "DELETE" to confirm:');
      if (confirmation === 'DELETE') {
        localStorage.removeItem('lunation-data');
        window.location.reload();
      }
    }
  };

  return (
    <div className="card">
      <h2>📤 Data Management</h2>
      
      {cycles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#666',
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ color: '#c44569' }}>No Data to Export</h3>
          <p>Start tracking your cycles to enable data export functionality.</p>
        </div>
      ) : (
        <>
          {/* Export Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#c44569', marginBottom: '1rem' }}>Export Your Data</h3>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1.5rem', 
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>📊 Ready to Export:</strong> {cycles.length} cycles tracked
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <strong>CSV</strong> - Spreadsheet format (Excel, Google Sheets)
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <strong>JSON</strong> - Complete data with analytics
                  </label>
                </div>

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn"
                  style={{
                    background: isExporting ? '#ccc' : '#28a745',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isExporting ? '⏳ Preparing Download...' : `📥 Download ${exportFormat.toUpperCase()}`}
                </button>
              </div>
            </div>

            {/* Export Info */}
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              background: '#e3f2fd',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>💡 Export Information</h4>
              <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                <li><strong>CSV Format:</strong> Perfect for spreadsheet analysis, healthcare providers</li>
                <li><strong>JSON Format:</strong> Complete backup with all data and computed insights</li>
                <li><strong>Privacy:</strong> Files are generated locally, nothing sent to external servers</li>
                <li><strong>Compatible:</strong> Works with Excel, Google Sheets, Numbers, and other apps</li>
              </ul>
            </div>
          </div>

          {/* Data Preview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#c44569', marginBottom: '1rem' }}>📋 Data Preview</h3>
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#e9ecef',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #dee2e6',
                fontWeight: '600'
              }}>
                Recent Cycles ({Math.min(5, cycles.length)} of {cycles.length})
              </div>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {cycles.slice(-5).reverse().map((cycle, index) => (
                  <div key={cycle.id} style={{
                    padding: '0.75rem 1rem',
                    borderBottom: index < 4 ? '1px solid #f1f3f4' : 'none',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong>{formatDateForExport(cycle.startDate)}</strong>
                        {cycle.endDate && ` - ${formatDateForExport(cycle.endDate)}`}
                      </div>
                      <div>
                        Flow: {cycle.flowIntensity || 'Not specified'} | 
                        Symptoms: {cycle.symptoms?.length || 0}
                      </div>
                      <div style={{ color: '#666' }}>
                        {cycle.length ? `${cycle.length} days` : 'Ongoing'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{
            background: 'linear-gradient(135deg, #fff5f5, #fed7d7)',
            border: '1px solid #feb2b2',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ color: '#e53e3e', marginBottom: '1rem' }}>⚠️ Danger Zone</h3>
            <p style={{ marginBottom: '1rem', color: '#744210' }}>
              <strong>Clear All Data:</strong> Permanently delete all your cycle data from this browser.
              This action cannot be undone.
            </p>
            <button
              onClick={handleClearData}
              className="btn"
              style={{
                background: '#e53e3e',
                color: 'white',
                border: 'none'
              }}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DataExport;