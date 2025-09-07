// Utility: clamp number
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Utility: sort by startDate
function sortByStartDate(arr) {
  return [...arr].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

// Robust stats helpers
function median(nums) {
  if (!nums.length) return NaN;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function mad(nums, med) {
  if (!nums.length) return 0;
  const absDev = nums.map((x) => Math.abs(x - med));
  return median(absDev);
}
function iqr(nums) {
  if (!nums.length) return { q1: 0, q3: 0, iqr: 0 };
  const sorted = [...nums].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)] ?? sorted[0];
  const q3 = sorted[Math.floor(sorted.length * 0.75)] ?? sorted[sorted.length - 1];
  return { q1, q3, iqr: q3 - q1 };
}

export function calculatePredictions(cycles) {
  if (!Array.isArray(cycles) || cycles.length === 0) {
    return {
      nextPeriod: null,
      ovulation: null,
      fertilityWindow: { start: null, end: null },
      confidence: { nextPeriod: 0, ovulation: 0 },
      accuracy: null
    };
  }

  const ordered = sortByStartDate(cycles);
  // Calculate cycle intervals (time between period starts)
  const cycleIntervals = [];
  for (let i = 1; i < ordered.length; i++) {
    const currentStart = new Date(ordered[i].startDate);
    const previousStart = new Date(ordered[i - 1].startDate);
    const days = Math.round((currentStart - previousStart) / 86400000);
    if (Number.isFinite(days) && days > 10 && days < 120) {
      cycleIntervals.push(days);
    }
  }

  // Typical ranges to avoid pathological predictions
  const TYPICAL_MIN = 21, TYPICAL_MAX = 45;

  let averageCycleLength = 28; // robust center
  let cycleLengthVariance = 0; // std-like
  let confidence = { nextPeriod: 30, ovulation: 20 }; // Base confidence

  if (cycleIntervals.length > 0) {
    // Robust center and spread
    const med = median(cycleIntervals);
    const MAD = mad(cycleIntervals, med);
    const robustSigma = MAD * 1.4826 || 2.5; // approx std dev

    // IQR-based outlier filter
    const { q1, q3, iqr: IQR } = iqr(cycleIntervals);
    const lowFence = q1 - 1.5 * IQR;
    const highFence = q3 + 1.5 * IQR;
    const cleaned = cycleIntervals.filter((d) => d >= lowFence && d <= highFence);

    // Exponentially weighted moving average (recent cycles heavier)
    const alpha = 0.5; // recency emphasis
    let ewma = cleaned.length ? cleaned[0] : med;
    for (let i = 1; i < cleaned.length; i++) ewma = alpha * cleaned[i] + (1 - alpha) * ewma;

    // Choose robust estimate then clamp to physiologic range
    averageCycleLength = Math.round(clamp(ewma || med || 28, TYPICAL_MIN, TYPICAL_MAX));
    cycleLengthVariance = Math.round((robustSigma + Math.max(0, (q3 - q1) / 2)) * 10) / 10;

    // Confidence blends volume and variability
    const n = cleaned.length;
    const variabilityPenalty = clamp(50 - robustSigma * 8, 0, 50);
    const volumeBonus = clamp(n * 10, 0, 40);
    confidence.nextPeriod = clamp(30 + variabilityPenalty + volumeBonus, 30, 95);
    confidence.ovulation = Math.min(90, confidence.nextPeriod - 8);
  }

  const lastCycle = ordered[ordered.length - 1];
  const lastPeriodStart = new Date(lastCycle.startDate);

  // Estimate typical bleed length from data (median), fallback 5
  const bleedLengths = ordered
    .map(c => (c.endDate ? Math.round((new Date(c.endDate) - new Date(c.startDate)) / 86400000) + 1 : null))
    .filter(v => Number.isFinite(v) && v >= 2 && v <= 10);
  const typicalBleed = clamp(Math.round(median(bleedLengths) || 5), 2, 8);

  // Predict next period start with robust mean + guard for ongoing cycle
  const today = new Date();
  const daysSinceLastStart = Math.round((today - lastPeriodStart) / 86400000);
  // If last cycle has no end date and is very recent, don't leap to the next prediction yet
  const ongoing = !lastCycle.endDate && daysSinceLastStart <= typicalBleed + 2;
  const baseNext = new Date(lastPeriodStart);
  baseNext.setDate(lastPeriodStart.getDate() + averageCycleLength);
  const nextPeriodDate = ongoing ? new Date(baseNext) : baseNext;

  // Adjust ovulation prediction based on cycle length patterns
  // Luteal phase varies little: ~14 ±2 days
  const lutealPhaseLength = averageCycleLength >= 32 ? 15 : averageCycleLength <= 26 ? 13 : 14;
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - lutealPhaseLength);

  // Fertility window calculation with better precision
  const fertilityStart = new Date(ovulationDate);
  fertilityStart.setDate(ovulationDate.getDate() - 5);
  
  const fertilityEnd = new Date(ovulationDate);
  fertilityEnd.setDate(ovulationDate.getDate() + 1);

  // Probability curve (±5 days around predicted start)
  const sigma = Math.max(1.5, cycleLengthVariance || 2.5);
  const normal = (x, mu, s) => Math.exp(-0.5 * Math.pow((x - mu) / s, 2));
  const probs = [];
  let sum = 0;
  for (let d = -5; d <= 5; d++) {
    const p = normal(d, 0, sigma);
    sum += p; probs.push({ offset: d, p });
  }
  const probabilityCurve = probs.map(({ offset, p }) => ({
    date: new Date(nextPeriodDate.getTime() + offset * 86400000).toISOString(),
    probability: p / sum
  }));

  // Calculate historical accuracy if we have enough data
  const accuracy = calculateHistoricalAccuracy(ordered);

  return {
    nextPeriod: nextPeriodDate.toISOString(),
    ovulation: ovulationDate.toISOString(),
    fertilityWindow: {
      start: fertilityStart.toISOString(),
      end: fertilityEnd.toISOString()
    },
    averageCycleLength,
    typicalBleed,
    cycleLengthVariance: Math.round((cycleLengthVariance) * 10) / 10,
    confidence,
    accuracy,
    probabilityCurve,
    predictionRange: {
      earliest: new Date(nextPeriodDate.getTime() - (Math.max(2, cycleLengthVariance)) * 86400000).toISOString(),
      latest: new Date(nextPeriodDate.getTime() + (Math.max(2, cycleLengthVariance)) * 86400000).toISOString()
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
  const bleed = 5;
  const luteal = cycleLength >= 32 ? 15 : cycleLength <= 26 ? 13 : 14;
  const ovuStart = cycleLength - luteal - 1; // around day cycleLength-14

  if (cycleDay <= bleed) return 'menstrual';
  if (cycleDay <= ovuStart) return 'follicular';
  if (cycleDay <= ovuStart + 2) return 'ovulation';
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
