import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';

function CycleCalendar() {
  const { state } = useCycle();
  const { cycles, predictions } = state;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getDayType = (date) => {
    
    for (const cycle of cycles) {
      const startDate = new Date(cycle.startDate);
      const endDate = cycle.endDate ? new Date(cycle.endDate) : null;
      
      if (isSameDay(date, startDate)) {
        return 'period-start';
      }
      
      if (endDate && date >= startDate && date <= endDate) {
        return 'period';
      }
      
      if (!endDate && isSameDay(date, startDate)) {
        return 'period-start';
      }
    }
    
    if (predictions.nextPeriod && isSameDay(date, new Date(predictions.nextPeriod))) {
      return 'predicted-period';
    }
    
    if (predictions.fertilityWindow.start && predictions.fertilityWindow.end) {
      const fertileStart = new Date(predictions.fertilityWindow.start);
      const fertileEnd = new Date(predictions.fertilityWindow.end);
      if (date >= fertileStart && date <= fertileEnd) {
        return 'fertile';
      }
    }
    
    return 'normal';
  };

  const getDayStyle = (type) => {
    const baseStyle = {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.2s'
    };

    switch (type) {
      case 'period-start':
        return { ...baseStyle, backgroundColor: '#9158ff', color: 'white', fontWeight: 'bold' };
      case 'period':
        return { ...baseStyle, backgroundColor: '#5e4bd8', color: 'white' };
      case 'predicted-period':
        return { ...baseStyle, backgroundColor: '#3a2e8f', color: '#e6e8ef', border: '2px dashed #9b8cff' };
      case 'fertile':
        return { ...baseStyle, backgroundColor: '#2a7c7c', color: '#c7f2f2' };
      default:
        return { ...baseStyle };
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '40px', height: '40px' }}></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayType = getDayType(date);
      
      days.push(
        <div
          key={day}
          style={getDayStyle(dayType)}
          title={`${date.toDateString()} - ${dayType.replace('-', ' ')}`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Cycle Calendar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigateMonth(-1)} className="btn btn-secondary">←</button>
          <h3 style={{ margin: 0, color: 'var(--accent)' }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button onClick={() => navigateMonth(1)} className="btn btn-secondary">→</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '1rem' }}>
        {dayNames.map(day => (
          <div key={day} style={{ 
            textAlign: 'center', 
            fontWeight: '600', 
            color: '#666',
            padding: '0.5rem'
          }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', justifyItems: 'center' }}>
        {renderCalendar()}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Legend</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ ...getDayStyle('period-start'), width: '20px', height: '20px', fontSize: '0.75rem' }}>●</div>
            Period Start
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ ...getDayStyle('period'), width: '20px', height: '20px', fontSize: '0.75rem' }}>●</div>
            Period
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ ...getDayStyle('fertile'), width: '20px', height: '20px', fontSize: '0.75rem' }}>●</div>
            Fertile Window
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ ...getDayStyle('predicted-period'), width: '20px', height: '20px', fontSize: '0.75rem' }}>○</div>
            Predicted Period
          </div>
        </div>
      </div>
    </div>
  );
}

export default CycleCalendar;
