// Advanced AI-powered predictive intelligence for menstrual cycle analysis
// Phase 3: Revolutionary pattern recognition and anomaly detection

export class CycleAnalysisEngine {
  constructor(cycles = [], symptoms = []) {
    this.cycles = cycles;
    this.symptoms = symptoms;
    this.patterns = this.analyzePatterns();
  }

  // Advanced pattern recognition using statistical analysis
  analyzePatterns() {
    if (this.cycles.length < 3) {
      return { confidence: 'low', patterns: [] };
    }

    const cycleLengths = this.cycles.map(c => c.length || 28);
    const flowPatterns = this.cycles.map(c => c.flowIntensity || 'medium');
    const symptomPatterns = this.analyzeSymptomPatterns();

    return {
      cycleVariability: this.calculateVariability(cycleLengths),
      flowConsistency: this.analyzeFlowConsistency(flowPatterns),
      symptomCorrelations: symptomPatterns,
      anomalies: this.detectAnomalies(),
      confidence: this.calculateConfidence(),
      healthScore: this.calculateHealthScore()
    };
  }

  // Calculate cycle length variability using coefficient of variation
  calculateVariability(lengths) {
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;

    return {
      mean: Math.round(mean * 10) / 10,
      standardDeviation: Math.round(stdDev * 10) / 10,
      variability: Math.round(coefficientOfVariation * 10) / 10,
      consistency: coefficientOfVariation < 10 ? 'high' : coefficientOfVariation < 20 ? 'moderate' : 'low'
    };
  }

  // Analyze flow intensity patterns
  analyzeFlowConsistency(flowPatterns) {
    const flowCounts = flowPatterns.reduce((acc, flow) => {
      acc[flow] = (acc[flow] || 0) + 1;
      return acc;
    }, {});

    const mostCommon = Object.keys(flowCounts).reduce((a, b) => 
      flowCounts[a] > flowCounts[b] ? a : b
    );

    const consistency = (flowCounts[mostCommon] / flowPatterns.length) * 100;

    return {
      distribution: flowCounts,
      mostCommon,
      consistency: Math.round(consistency),
      pattern: consistency > 70 ? 'consistent' : consistency > 40 ? 'variable' : 'irregular'
    };
  }

  // Advanced symptom correlation analysis
  analyzeSymptomPatterns() {
    if (!this.symptoms.length) return { correlations: [], insights: [] };

    const symptomFrequency = {};
    const cycleDayCorrelations = {};

    this.symptoms.forEach(symptom => {
      const cycleDay = this.getCycleDayForSymptom(symptom);
      if (cycleDay) {
        if (!cycleDayCorrelations[symptom.type]) {
          cycleDayCorrelations[symptom.type] = [];
        }
        cycleDayCorrelations[symptom.type].push(cycleDay);
      }
      
      symptomFrequency[symptom.type] = (symptomFrequency[symptom.type] || 0) + 1;
    });

    const correlations = Object.keys(cycleDayCorrelations).map(symptomType => {
      const days = cycleDayCorrelations[symptomType];
      const avgDay = days.reduce((sum, day) => sum + day, 0) / days.length;
      
      return {
        symptom: symptomType,
        averageDay: Math.round(avgDay),
        frequency: symptomFrequency[symptomType],
        phase: this.getCyclePhase(avgDay),
        pattern: this.identifySymptomPattern(days)
      };
    });

    return {
      correlations,
      insights: this.generateSymptomInsights(correlations)
    };
  }

  // Detect cycle anomalies and irregularities
  detectAnomalies() {
    if (this.cycles.length < 5) return { anomalies: [], riskLevel: 'insufficient-data' };

    const anomalies = [];
    const cycleLengths = this.cycles.map(c => c.length || 28);
    const mean = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
    const stdDev = Math.sqrt(
      cycleLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / cycleLengths.length
    );

    // Detect unusually long or short cycles (outside 2 standard deviations)
    this.cycles.forEach((cycle, index) => {
      const length = cycle.length || 28;
      const zScore = Math.abs(length - mean) / stdDev;
      
      if (zScore > 2) {
        anomalies.push({
          type: 'unusual-length',
          cycle: index + 1,
          length,
          severity: zScore > 3 ? 'high' : 'moderate',
          date: cycle.startDate
        });
      }

      // Detect missing periods
      if (length > 45) {
        anomalies.push({
          type: 'missed-period',
          cycle: index + 1,
          length,
          severity: 'high',
          date: cycle.startDate
        });
      }

      // Detect very short cycles
      if (length < 21) {
        anomalies.push({
          type: 'short-cycle',
          cycle: index + 1,
          length,
          severity: length < 18 ? 'high' : 'moderate',
          date: cycle.startDate
        });
      }
    });

    const riskLevel = this.calculateRiskLevel(anomalies, cycleLengths);

    return { anomalies, riskLevel, recommendations: this.generateRecommendations(anomalies) };
  }

  // Calculate overall prediction confidence
  calculateConfidence() {
    const factors = {
      dataAmount: Math.min(this.cycles.length / 12, 1) * 40, // Up to 40% for data amount
      consistency: this.getConsistencyScore() * 30, // Up to 30% for cycle consistency
      recentData: this.getRecentDataScore() * 20, // Up to 20% for recent data
      completeness: this.getDataCompletenessScore() * 10 // Up to 10% for data completeness
    };

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
    
    return {
      score: Math.round(totalScore),
      factors,
      level: totalScore >= 80 ? 'high' : totalScore >= 60 ? 'medium' : 'low'
    };
  }

  // Calculate comprehensive health score
  calculateHealthScore() {
    let baseScore = 85; // Start with good baseline

    // Adjust based on cycle regularity
    const variability = this.patterns.cycleVariability?.variability || 15;
    if (variability < 10) baseScore += 10;
    else if (variability > 25) baseScore -= 15;

    // Adjust based on anomalies
    const anomalies = this.patterns.anomalies?.anomalies || [];
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
    baseScore -= highSeverityAnomalies * 10;

    // Adjust based on symptom patterns
    if (this.symptoms.length > 0) {
      const severeSymptoms = this.symptoms.filter(s => s.severity === 'severe').length;
      baseScore -= severeSymptoms * 5;
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(baseScore))),
      category: this.getHealthCategory(baseScore),
      factors: {
        cycleRegularity: variability < 10 ? 'excellent' : variability < 20 ? 'good' : 'needs-attention',
        anomalyRisk: highSeverityAnomalies === 0 ? 'low' : 'elevated',
        symptomSeverity: this.getOverallSymptomSeverity()
      }
    };
  }

  // Advanced prediction algorithms
  generateAdvancedPredictions() {
    if (this.cycles.length < 2) {
      return this.getBasicPredictions();
    }

    const predictions = {
      nextPeriod: this.predictNextPeriod(),
      ovulation: this.predictOvulation(),
      fertilityWindow: this.predictFertilityWindow(),
      symptoms: this.predictSymptoms(),
      riskAssessment: this.assessUpcomingRisks()
    };

    return {
      ...predictions,
      confidence: this.calculateConfidence(),
      lastUpdated: new Date().toISOString()
    };
  }

  // Predict next period with advanced algorithms
  predictNextPeriod() {
    const recentCycles = this.cycles.slice(-6); // Use last 6 cycles for better accuracy
    const weights = [0.5, 0.3, 0.15, 0.04, 0.009, 0.001]; // Exponential decay weights
    
    let weightedAverage = 0;
    let totalWeight = 0;
    
    recentCycles.reverse().forEach((cycle, index) => {
      if (cycle.length && index < weights.length) {
        weightedAverage += cycle.length * weights[index];
        totalWeight += weights[index];
      }
    });

    const predictedLength = Math.round(weightedAverage / totalWeight) || 28;
    const lastPeriod = new Date(this.cycles[this.cycles.length - 1].startDate);
    const nextPeriod = new Date(lastPeriod.getTime() + predictedLength * 24 * 60 * 60 * 1000);

    return {
      date: nextPeriod.toISOString().split('T')[0],
      predictedLength,
      confidence: this.calculatePredictionConfidence('period'),
      daysFromNow: Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24))
    };
  }

  // Helper methods
  getCycleDayForSymptom(symptom) {
    const symptomDate = new Date(symptom.date);
    const relatedCycle = this.cycles.find(cycle => {
      const cycleStart = new Date(cycle.startDate);
      const cycleEnd = cycle.endDate ? new Date(cycle.endDate) : 
        new Date(cycleStart.getTime() + (cycle.length || 28) * 24 * 60 * 60 * 1000);
      return symptomDate >= cycleStart && symptomDate <= cycleEnd;
    });

    if (relatedCycle) {
      const cycleStart = new Date(relatedCycle.startDate);
      return Math.ceil((symptomDate - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
    }
    return null;
  }

  getCyclePhase(day) {
    if (day <= 7) return 'menstrual';
    if (day <= 13) return 'follicular';
    if (day <= 16) return 'ovulatory';
    return 'luteal';
  }

  getConsistencyScore() {
    const variability = this.patterns.cycleVariability?.variability || 20;
    return Math.max(0, (25 - variability) / 25);
  }

  getRecentDataScore() {
    if (this.cycles.length === 0) return 0;
    const lastCycle = new Date(this.cycles[this.cycles.length - 1].startDate);
    const daysSince = (new Date() - lastCycle) / (1000 * 60 * 60 * 24);
    return Math.max(0, (45 - daysSince) / 45);
  }

  getDataCompletenessScore() {
    const totalCycles = this.cycles.length;
    const completeCycles = this.cycles.filter(c => c.startDate && c.length).length;
    return totalCycles > 0 ? completeCycles / totalCycles : 0;
  }

  calculateRiskLevel(anomalies, cycleLengths) {
    const highSeverityCount = anomalies.filter(a => a.severity === 'high').length;
    const recentAnomalies = anomalies.filter(a => {
      const anomalyDate = new Date(a.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return anomalyDate >= sixMonthsAgo;
    }).length;

    if (highSeverityCount >= 2 || recentAnomalies >= 3) return 'high';
    if (highSeverityCount >= 1 || recentAnomalies >= 2) return 'moderate';
    return 'low';
  }

  getHealthCategory(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'needs-attention';
  }

  getOverallSymptomSeverity() {
    if (!this.symptoms.length) return 'none';
    const severeCounts = this.symptoms.filter(s => s.severity === 'severe').length;
    const moderateCounts = this.symptoms.filter(s => s.severity === 'moderate').length;
    
    if (severeCounts > this.symptoms.length * 0.3) return 'high';
    if (moderateCounts > this.symptoms.length * 0.5) return 'moderate';
    return 'low';
  }

  generateRecommendations(anomalies) {
    const recommendations = [];
    
    anomalies.forEach(anomaly => {
      switch (anomaly.type) {
        case 'missed-period':
          recommendations.push({
            type: 'medical',
            priority: 'high',
            message: 'Consider consulting a healthcare provider about missed periods.',
            action: 'Schedule appointment'
          });
          break;
        case 'unusual-length':
          recommendations.push({
            type: 'tracking',
            priority: 'medium',
            message: 'Continue tracking to monitor cycle length variations.',
            action: 'Monitor closely'
          });
          break;
        case 'short-cycle':
          recommendations.push({
            type: 'lifestyle',
            priority: 'medium',
            message: 'Consider stress management and adequate sleep.',
            action: 'Review lifestyle factors'
          });
          break;
      }
    });

    return recommendations;
  }

  generateSymptomInsights(correlations) {
    return correlations.map(correlation => {
      const insights = [];
      
      if (correlation.frequency > this.cycles.length * 0.7) {
        insights.push(`${correlation.symptom} occurs frequently (${correlation.frequency}/${this.cycles.length} cycles)`);
      }
      
      if (correlation.phase === 'menstrual') {
        insights.push(`${correlation.symptom} typically occurs during menstruation`);
      } else if (correlation.phase === 'ovulatory') {
        insights.push(`${correlation.symptom} may be related to ovulation`);
      }

      return {
        symptom: correlation.symptom,
        insights
      };
    });
  }
}

// Factory function for easy instantiation
export function createAnalysisEngine(cycles, symptoms) {
  return new CycleAnalysisEngine(cycles, symptoms);
}

// Export utility functions
export {
  calculatePredictions as basicPredictions
} from './cycleCalculations.js';