import React from 'react';
import { useCycle } from '../contexts/CycleContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analytics() {
  const { state } = useCycle();
  const { cycles } = state;

  if (cycles.length < 2) {
    return (
      <div className="card">
        <h2>Analytics Dashboard</h2>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--muted)',
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderRadius: '12px',
          margin: '1rem 0'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>More Data Needed</h3>
          <p>Track at least 2 cycles to see detailed analytics and trends.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            Your insights will appear here as you add more cycle data!
          </p>
        </div>
      </div>
    );
  }

  // Prepare cycle length data
  const cycleLengthData = cycles.map((cycle, index) => {
    if (index === 0) return 28; // Default for first cycle
    const prevCycle = cycles[index - 1];
    const currentStart = new Date(cycle.startDate);
    const prevStart = new Date(prevCycle.startDate);
    return Math.ceil((currentStart - prevStart) / (1000 * 60 * 60 * 24));
  }).slice(1); // Remove the default first value

  const cycleLabels = cycles.slice(1).map((_, index) => `Cycle ${index + 2}`);

  // Prepare symptom frequency data
  const symptomFrequency = {};
  cycles.forEach(cycle => {
    if (cycle.symptoms) {
      cycle.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    }
  });

  // Flow intensity distribution
  const flowDistribution = { light: 0, medium: 0, heavy: 0 };
  cycles.forEach(cycle => {
    if (cycle.flowIntensity) {
      flowDistribution[cycle.flowIntensity]++;
    }
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const cycleLengthChartData = {
    labels: cycleLabels,
    datasets: [
      {
        label: 'Cycle Length (days)',
        data: cycleLengthData,
        borderColor: '#9b8cff',
        backgroundColor: 'rgba(155, 140, 255, 0.15)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const symptomChartData = {
    labels: Object.keys(symptomFrequency),
    datasets: [
      {
        label: 'Symptom Frequency',
        data: Object.values(symptomFrequency),
        backgroundColor: [
          '#9b8cff',
          '#5ce0ff',
          '#3a2e8f',
          '#2a7c7c',
          '#9158ff',
          '#483a97',
          '#9b8cff',
          '#5ce0ff'
        ],
        borderWidth: 0
      }
    ]
  };

  const flowChartData = {
    labels: ['Light Flow', 'Medium Flow', 'Heavy Flow'],
    datasets: [
      {
        data: [flowDistribution.light, flowDistribution.medium, flowDistribution.heavy],
        backgroundColor: ['#2a7c7c', '#5ce0ff', '#9158ff'],
        borderWidth: 0
      }
    ]
  };

  // Calculate statistics
  const avgCycleLength = cycleLengthData.length > 0 
    ? Math.round(cycleLengthData.reduce((sum, length) => sum + length, 0) / cycleLengthData.length)
    : 28;
  
  const shortestCycle = cycleLengthData.length > 0 ? Math.min(...cycleLengthData) : 28;
  const longestCycle = cycleLengthData.length > 0 ? Math.max(...cycleLengthData) : 28;
  const cycleVariability = longestCycle - shortestCycle;

  const mostCommonSymptom = Object.keys(symptomFrequency).reduce((a, b) => 
    symptomFrequency[a] > symptomFrequency[b] ? a : b, 'None');

  return (
    <div className="card">
      <h2>Analytics Dashboard</h2>
      
      {/* Key Insights */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2.5rem', margin: '0' }}>{avgCycleLength}</h3>
          <p style={{ margin: '0.5rem 0 0 0', opacity: '0.9' }}>Average Cycle Length</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3aa6a6, #5ce0ff)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2.5rem', margin: '0' }}>{cycleVariability}</h3>
          <p style={{ margin: '0.5rem 0 0 0', opacity: '0.9' }}>Days Variability</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9158ff, #3a2e8f)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0' }}>{mostCommonSymptom}</h3>
          <p style={{ margin: '0.5rem 0 0 0', opacity: '0.9' }}>Most Common Symptom</p>
        </div>
      </div>

      {/* Charts Grid */}
        <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Cycle Length Trend */}
        <div>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Cycle Length Trends</h3>
          <div style={{ height: '300px' }}>
            <Line data={cycleLengthChartData} options={chartOptions} />
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
            <p><strong>Range:</strong> {shortestCycle} - {longestCycle} days</p>
            <p><strong>Consistency:</strong> {cycleVariability <= 3 ? 'Very Regular' : cycleVariability <= 7 ? 'Regular' : 'Variable'}</p>
          </div>
        </div>

        {/* Symptoms and Flow Charts Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Symptom Frequency */}
          {Object.keys(symptomFrequency).length > 0 && (
            <div>
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Symptom Patterns</h3>
              <div style={{ height: '250px' }}>
                <Bar data={symptomChartData} options={{
                  ...chartOptions,
                  scales: { ...chartOptions.scales, x: { ticks: { maxRotation: 45 } } }
                }} />
              </div>
            </div>
          )}

          {/* Flow Distribution */}
          <div>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Flow Intensity</h3>
            <div style={{ height: '250px' }}>
              <Doughnut data={flowChartData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          padding: '1.5rem',
          borderRadius: '12px',
          marginTop: '1rem'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Cycle Insights</h3>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div>
              <strong>Cycle Regularity:</strong> 
              <span style={{ marginLeft: '0.5rem' }}>
                {cycleVariability <= 3 ? '🟢 Very consistent cycles' : 
                 cycleVariability <= 7 ? '🟡 Regular with minor variation' : 
                 '🟠 Variable cycle lengths - consider tracking lifestyle factors'}
              </span>
            </div>
            
            {Object.keys(symptomFrequency).length > 0 && (
              <div>
                <strong>Symptom Patterns:</strong>
                <span style={{ marginLeft: '0.5rem' }}>
                  {mostCommonSymptom} appears most frequently ({symptomFrequency[mostCommonSymptom]} times)
                </span>
              </div>
            )}
            
            <div>
              <strong>Data Quality:</strong>
              <span style={{ marginLeft: '0.5rem' }}>
                {cycles.length >= 6 ? '🟢 Excellent - sufficient data for accurate predictions' :
                 cycles.length >= 3 ? '🟡 Good - building reliable patterns' :
                 '🟠 Limited - continue tracking for better insights'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
