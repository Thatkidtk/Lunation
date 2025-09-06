export function calculatePredictions(cycles) {
  if (cycles.length === 0) {
    return {
      nextPeriod: null,
      ovulation: null,
      fertilityWindow: { start: null, end: null },
      confidence: { nextPeriod: 0, ovulation: 0 },
      accuracy: null
    };
  }

  // Calculate cycle intervals (time between periods)
  const cycleIntervals = [];
  for (let i = 1; i < cycles.length; i++) {
    const currentStart = new Date(cycles[i].startDate);
    const previousStart = new Date(cycles[i - 1].startDate);
    const interval = Math.ceil((currentStart - previousStart) / (1000 * 60 * 60 * 24));
    cycleIntervals.push(interval);
  }

  let averageCycleLength = 28;
  let cycleLengthVariance = 0;
  let confidence = { nextPeriod: 30, ovulation: 20 }; // Base confidence

  if (cycleIntervals.length > 0) {
    // Use weighted average giving more weight to recent cycles
    const weights = cycleIntervals.map((_, index) => Math.pow(1.2, index));
    const weightedSum = cycleIntervals.reduce((sum, length, index) => sum + length * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    averageCycleLength = Math.round(weightedSum / totalWeight);

    // Calculate variance for confidence scoring
    const variance = cycleIntervals.reduce((sum, length) => {
      return sum + Math.pow(length - averageCycleLength, 2);
    }, 0) / cycleIntervals.length;
    cycleLengthVariance = Math.sqrt(variance);

    // Improve confidence based on data quality
    const cycleCount = cycleIntervals.length;
    const consistencyBonus = Math.max(0, 50 - cycleLengthVariance * 5);
    const dataVolumeBonus = Math.min(40, cycleCount * 8);
    
    confidence.nextPeriod = Math.min(95, 30 + consistencyBonus + dataVolumeBonus);
    confidence.ovulation = Math.min(90, confidence.nextPeriod - 10);
  }

  const lastCycle = cycles[cycles.length - 1];
  const lastPeriodStart = new Date(lastCycle.startDate);

  // Enhanced prediction with confidence intervals
  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(lastPeriodStart.getDate() + averageCycleLength);

  // Adjust ovulation prediction based on cycle length patterns
  const lutealPhaseLength = averageCycleLength > 35 ? 16 : averageCycleLength < 21 ? 12 : 14;
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - lutealPhaseLength);

  // Fertility window calculation with better precision
  const fertilityStart = new Date(ovulationDate);
  fertilityStart.setDate(ovulationDate.getDate() - 5);
  
  const fertilityEnd = new Date(ovulationDate);
  fertilityEnd.setDate(ovulationDate.getDate() + 2);

  // Calculate historical accuracy if we have enough data
  const accuracy = calculateHistoricalAccuracy(cycles);

  return {
    nextPeriod: nextPeriodDate.toISOString(),
    ovulation: ovulationDate.toISOString(),
    fertilityWindow: {
      start: fertilityStart.toISOString(),
      end: fertilityEnd.toISOString()
    },
    averageCycleLength,
    cycleLengthVariance: Math.round(cycleLengthVariance * 10) / 10,
    confidence,
    accuracy,
    predictionRange: {
      earliest: new Date(nextPeriodDate.getTime() - cycleLengthVariance * 24 * 60 * 60 * 1000).toISOString(),
      latest: new Date(nextPeriodDate.getTime() + cycleLengthVariance * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

function calculateHistoricalAccuracy(cycles) {
  if (cycles.length < 3) return null;

  let correctPredictions = 0;
  let totalPredictions = 0;

  // Test predictions against actual data for cycles 3 onwards
  for (let i = 2; i < cycles.length; i++) {
    const historicalCycles = cycles.slice(0, i);
    const predictions = calculatePredictions(historicalCycles);
    const actualNextCycle = cycles[i];

    if (predictions.nextPeriod) {
      const predictedDate = new Date(predictions.nextPeriod);
      const actualDate = new Date(actualNextCycle.startDate);
      const differenceInDays = Math.abs((actualDate - predictedDate) / (1000 * 60 * 60 * 24));

      if (differenceInDays <= 2) {
        correctPredictions++;
      }
      totalPredictions++;
    }
  }

  return totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : null;
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