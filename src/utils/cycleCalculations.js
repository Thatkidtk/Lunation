export function calculatePredictions(cycles) {
  if (cycles.length === 0) {
    return {
      nextPeriod: null,
      ovulation: null,
      fertilityWindow: { start: null, end: null }
    };
  }

  const completedCycles = cycles.filter(cycle => cycle.endDate);
  let averageCycleLength = 28;
  
  if (completedCycles.length > 0) {
    const cycleLengths = completedCycles.map(cycle => {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    });
    
    averageCycleLength = Math.round(
      cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
    );
  }

  const lastCycle = cycles[cycles.length - 1];
  const lastPeriodStart = new Date(lastCycle.startDate);

  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(lastPeriodStart.getDate() + averageCycleLength);

  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14);

  const fertilityStart = new Date(ovulationDate);
  fertilityStart.setDate(ovulationDate.getDate() - 5);
  
  const fertilityEnd = new Date(ovulationDate);
  fertilityEnd.setDate(ovulationDate.getDate() + 1);

  return {
    nextPeriod: nextPeriodDate.toISOString(),
    ovulation: ovulationDate.toISOString(),
    fertilityWindow: {
      start: fertilityStart.toISOString(),
      end: fertilityEnd.toISOString()
    },
    averageCycleLength
  };
}

export function calculateCycleDay(cycles, date) {
  if (cycles.length === 0) return null;

  const targetDate = new Date(date);
  
  for (let i = cycles.length - 1; i >= 0; i--) {
    const cycle = cycles[i];
    const cycleStart = new Date(cycle.startDate);
    
    if (targetDate >= cycleStart) {
      const daysDiff = Math.floor((targetDate - cycleStart) / (1000 * 60 * 60 * 24));
      return daysDiff + 1;
    }
  }
  
  return null;
}

export function getCyclePhase(cycleDay, cycleLength = 28) {
  if (!cycleDay) return 'unknown';
  
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 15) return 'ovulation';
  if (cycleDay <= cycleLength) return 'luteal';
  
  return 'late';
}

export function getPredictionAccuracy(cycles, predictions) {
  if (cycles.length < 2) return null;
  
  let accurateCount = 0;
  let totalPredictions = 0;
  
  for (let i = 1; i < cycles.length; i++) {
    const actualStart = new Date(cycles[i].startDate);
    const previousCycle = cycles[i - 1];
    const previousStart = new Date(previousCycle.startDate);
    
    const estimatedCycleLength = i === 1 ? 28 : 
      Math.round(cycles.slice(0, i).reduce((sum, cycle, idx) => {
        if (idx === 0) return 28;
        const prevStart = new Date(cycles[idx - 1].startDate);
        const currentStart = new Date(cycle.startDate);
        return sum + Math.ceil((currentStart - prevStart) / (1000 * 60 * 60 * 24));
      }, 0) / (i - 1));
    
    const predictedStart = new Date(previousStart);
    predictedStart.setDate(previousStart.getDate() + estimatedCycleLength);
    
    const daysDiff = Math.abs((actualStart - predictedStart) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 2) {
      accurateCount++;
    }
    totalPredictions++;
  }
  
  return totalPredictions > 0 ? (accurateCount / totalPredictions) * 100 : 0;
}