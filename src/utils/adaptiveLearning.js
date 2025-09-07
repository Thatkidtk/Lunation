// Personal Adaptation Learning System
// Continuously improves predictions based on user feedback and actual outcomes

/**
 * Adaptive Learning Engine for Personalized Cycle Predictions
 * Learns from prediction accuracy and adjusts models accordingly
 */
export class AdaptiveLearningEngine {
  constructor(cycles = [], symptoms = [], predictions = []) {
    this.cycles = cycles;
    this.symptoms = symptoms;
    this.predictions = predictions; // Historical predictions with outcomes
    this.learningRate = 0.1;
    this.personalFactors = this.initializePersonalFactors();
    this.modelWeights = this.initializeModelWeights();
    this.feedbackHistory = [];
    this.accuracyMetrics = {
      overall: 0,
      by_phase: {},
      by_symptom: {},
      improvement_trend: []
    };
  }

  /**
   * Initialize personal adaptation factors
   */
  initializePersonalFactors() {
    return {
      // Personal response patterns
      stress_sensitivity: 0.5,
      hormone_sensitivity: 0.5,
      lifestyle_impact: 0.5,
      seasonal_variation: 0.5,
      
      // Prediction adjustment factors
      cycle_length_stability: 0.5,
      symptom_predictability: 0.5,
      ovulation_timing_precision: 0.5,
      flow_pattern_consistency: 0.5,
      
      // Learning parameters
      adaptation_speed: 0.1,
      confidence_threshold: 0.7,
      feedback_weight: 0.3,
      historical_weight: 0.7
    };
  }

  /**
   * Initialize adaptive model weights
   */
  initializeModelWeights() {
    return {
      // Feature importance weights (learned over time)
      cycle_length: 0.8,
      symptom_severity: 0.6,
      hormonal_phase: 0.7,
      lifestyle_factors: 0.4,
      seasonal_factors: 0.3,
      stress_indicators: 0.5,
      
      // Temporal weights for different data ages
      recent_cycles: 0.8,    // Last 3 cycles
      medium_term: 0.6,      // 4-8 cycles ago
      long_term: 0.4,        // 9+ cycles ago
      
      // Prediction type weights
      period_prediction: 0.9,
      ovulation_prediction: 0.7,
      symptom_prediction: 0.6,
      flow_prediction: 0.5
    };
  }

  /**
   * Main adaptation function - learns from new data and feedback
   */
  adaptToNewData(newCycle, actualSymptoms, userFeedback) {
    // Record feedback for learning
    this.recordFeedback(newCycle, actualSymptoms, userFeedback);
    
    // Analyze prediction accuracy
    const accuracyAnalysis = this.analyzePredictionAccuracy(newCycle, actualSymptoms);
    
    // Update personal factors based on accuracy
    this.updatePersonalFactors(accuracyAnalysis);
    
    // Adjust model weights
    this.adjustModelWeights(accuracyAnalysis);
    
    // Learn from pattern changes
    this.learnFromPatternChanges(newCycle, actualSymptoms);
    
    // Update accuracy metrics
    this.updateAccuracyMetrics(accuracyAnalysis);
    
    return {
      adaptation_applied: true,
      accuracy_improvement: this.calculateAccuracyImprovement(),
      updated_factors: this.personalFactors,
      next_predictions: this.generateAdaptedPredictions()
    };
  }

  /**
   * Record user feedback for learning
   */
  recordFeedback(cycle, symptoms, feedback) {
    const feedbackRecord = {
      timestamp: new Date().toISOString(),
      cycle_id: cycle.id || Date.now(),
      feedback_type: feedback.type, // 'accurate', 'early', 'late', 'missed', 'unexpected'
      prediction_type: feedback.prediction_type, // 'period', 'ovulation', 'symptom'
      actual_vs_predicted: {
        predicted: feedback.predicted,
        actual: feedback.actual,
        difference: feedback.difference
      },
      user_rating: feedback.rating, // 1-5 star rating
      confidence_level: feedback.confidence || 'medium',
      notes: feedback.notes || ''
    };

    this.feedbackHistory.push(feedbackRecord);
    
    // Keep only last 50 feedback records to prevent memory issues
    if (this.feedbackHistory.length > 50) {
      this.feedbackHistory = this.feedbackHistory.slice(-50);
    }
  }

  /**
   * Analyze prediction accuracy against actual outcomes
   */
  analyzePredictionAccuracy(cycle, actualSymptoms) {
    const analysis = {
      period_accuracy: 0,
      ovulation_accuracy: 0,
      symptom_accuracy: 0,
      overall_accuracy: 0,
      error_patterns: [],
      improvement_areas: []
    };

    // Find matching prediction for this cycle
    const matchingPrediction = this.findMatchingPrediction(cycle);
    
    if (matchingPrediction) {
      // Analyze period prediction accuracy
      if (matchingPrediction.nextPeriod && cycle.startDate) {
        const predictedDate = new Date(matchingPrediction.nextPeriod.date);
        const actualDate = new Date(cycle.startDate);
        const daysDifference = Math.abs((actualDate - predictedDate) / (1000 * 60 * 60 * 24));
        
        analysis.period_accuracy = Math.max(0, (7 - daysDifference) / 7); // 7-day tolerance
        
        if (daysDifference > 3) {
          analysis.error_patterns.push({
            type: 'period_timing',
            severity: daysDifference > 7 ? 'high' : 'medium',
            difference: daysDifference,
            direction: actualDate > predictedDate ? 'late' : 'early'
          });
        }
      }

      // Analyze symptom prediction accuracy
      if (matchingPrediction.symptoms && actualSymptoms) {
        const symptomAccuracy = this.calculateSymptomPredictionAccuracy(
          matchingPrediction.symptoms, 
          actualSymptoms
        );
        analysis.symptom_accuracy = symptomAccuracy.overall;
        analysis.error_patterns.push(...symptomAccuracy.errors);
      }

      // Calculate overall accuracy
      analysis.overall_accuracy = (analysis.period_accuracy + analysis.symptom_accuracy) / 2;
    }

    return analysis;
  }

  /**
   * Find matching prediction for a cycle
   */
  findMatchingPrediction(cycle) {
    const cycleDate = new Date(cycle.startDate);
    
    // Find prediction made before this cycle that would predict this period
    return this.predictions.find(prediction => {
      const predictionDate = new Date(prediction.generated_date);
      const predictedPeriodDate = new Date(prediction.nextPeriod?.date);
      
      return predictionDate < cycleDate && 
             Math.abs(predictedPeriodDate - cycleDate) < 14 * 24 * 60 * 60 * 1000; // Within 2 weeks
    });
  }

  /**
   * Calculate symptom prediction accuracy
   */
  calculateSymptomPredictionAccuracy(predictedSymptoms, actualSymptoms) {
    if (!predictedSymptoms.length && !actualSymptoms.length) {
      return { overall: 1, errors: [] };
    }

    let correct = 0;
    let total = 0;
    const errors = [];

    // Check predicted symptoms against actual
    predictedSymptoms.forEach(predicted => {
      const actual = actualSymptoms.find(a => a.type === predicted.type);
      total++;

      if (actual) {
        // Check if timing was close (within 3 days)
        const predictedDate = new Date(predicted.predictedDate);
        const actualDate = new Date(actual.date);
        const dayDifference = Math.abs((actualDate - predictedDate) / (1000 * 60 * 60 * 24));

        if (dayDifference <= 3) {
          correct++;
        } else {
          errors.push({
            type: 'symptom_timing',
            symptom: predicted.type,
            difference: dayDifference,
            severity: 'medium'
          });
        }
      } else {
        errors.push({
          type: 'symptom_false_positive',
          symptom: predicted.type,
          severity: 'low'
        });
      }
    });

    // Check for unpredicted symptoms (false negatives)
    actualSymptoms.forEach(actual => {
      const predicted = predictedSymptoms.find(p => p.type === actual.type);
      if (!predicted) {
        errors.push({
          type: 'symptom_false_negative',
          symptom: actual.type,
          severity: 'medium'
        });
      }
    });

    return {
      overall: total > 0 ? correct / total : 1,
      errors
    };
  }

  /**
   * Update personal factors based on accuracy analysis
   */
  updatePersonalFactors(analysis) {
    const adaptationRate = this.personalFactors.adaptation_speed;

    // Adjust stress sensitivity based on prediction errors
    if (analysis.error_patterns.some(e => e.type === 'period_timing' && e.severity === 'high')) {
      this.personalFactors.stress_sensitivity = Math.min(1, 
        this.personalFactors.stress_sensitivity + adaptationRate);
    }

    // Adjust hormone sensitivity based on symptom prediction accuracy
    if (analysis.symptom_accuracy < 0.7) {
      this.personalFactors.hormone_sensitivity = Math.min(1,
        this.personalFactors.hormone_sensitivity + adaptationRate);
    }

    // Adjust cycle length stability
    if (analysis.period_accuracy > 0.8) {
      this.personalFactors.cycle_length_stability = Math.min(1,
        this.personalFactors.cycle_length_stability + adaptationRate);
    } else {
      this.personalFactors.cycle_length_stability = Math.max(0.1,
        this.personalFactors.cycle_length_stability - adaptationRate);
    }

    // Adjust symptom predictability
    this.personalFactors.symptom_predictability = 
      this.personalFactors.symptom_predictability * (1 - adaptationRate) + 
      analysis.symptom_accuracy * adaptationRate;
  }

  /**
   * Adjust model weights based on accuracy
   */
  adjustModelWeights(analysis) {
    const adjustment = this.learningRate * (analysis.overall_accuracy - 0.5);

    // Increase weight of features that led to accurate predictions
    if (analysis.period_accuracy > 0.8) {
      this.modelWeights.cycle_length += adjustment;
      this.modelWeights.recent_cycles += adjustment * 0.5;
    }

    if (analysis.symptom_accuracy > 0.8) {
      this.modelWeights.symptom_severity += adjustment;
      this.modelWeights.hormonal_phase += adjustment;
    }

    // Normalize weights to prevent unbounded growth
    this.normalizeWeights();
  }

  /**
   * Normalize model weights to reasonable ranges
   */
  normalizeWeights() {
    Object.keys(this.modelWeights).forEach(key => {
      this.modelWeights[key] = Math.max(0.1, Math.min(1.0, this.modelWeights[key]));
    });
  }

  /**
   * Learn from pattern changes over time
   */
  learnFromPatternChanges(newCycle, actualSymptoms) {
    // Detect if user's patterns are changing
    const recentCycles = this.cycles.slice(-6); // Last 6 cycles
    const olderCycles = this.cycles.slice(-12, -6); // Previous 6 cycles

    if (recentCycles.length >= 3 && olderCycles.length >= 3) {
      // Compare cycle length patterns
      const recentAvgLength = this.calculateAverageLength(recentCycles);
      const olderAvgLength = this.calculateAverageLength(olderCycles);
      const lengthChange = Math.abs(recentAvgLength - olderAvgLength);

      if (lengthChange > 3) {
        // Significant change detected - increase adaptation speed temporarily
        this.personalFactors.adaptation_speed = Math.min(0.3, 
          this.personalFactors.adaptation_speed * 1.5);
      } else {
        // Stable patterns - can reduce adaptation speed
        this.personalFactors.adaptation_speed = Math.max(0.05,
          this.personalFactors.adaptation_speed * 0.95);
      }

      // Learn symptom pattern changes
      this.learnSymptomPatternChanges(recentCycles, olderCycles);
    }
  }

  /**
   * Learn from changes in symptom patterns
   */
  learnSymptomPatternChanges(recentCycles, olderCycles) {
    const recentSymptoms = this.getSymptomFrequency(recentCycles);
    const olderSymptoms = this.getSymptomFrequency(olderCycles);

    Object.keys(recentSymptoms).forEach(symptomType => {
      const recentFreq = recentSymptoms[symptomType] || 0;
      const olderFreq = olderSymptoms[symptomType] || 0;
      const change = Math.abs(recentFreq - olderFreq);

      if (change > 0.3) { // 30% change in frequency
        // Adjust symptom prediction weights
        this.adjustSymptomPredictionWeight(symptomType, change);
      }
    });
  }

  /**
   * Get symptom frequency for given cycles
   */
  getSymptomFrequency(cycles) {
    const frequency = {};
    const totalCycles = cycles.length;

    cycles.forEach(cycle => {
      const cycleSymptoms = this.getCycleSymptomsFor(cycle);
      const uniqueSymptoms = [...new Set(cycleSymptoms.map(s => s.type))];
      
      uniqueSymptoms.forEach(symptomType => {
        frequency[symptomType] = (frequency[symptomType] || 0) + 1;
      });
    });

    // Convert to percentages
    Object.keys(frequency).forEach(symptomType => {
      frequency[symptomType] = frequency[symptomType] / totalCycles;
    });

    return frequency;
  }

  /**
   * Get symptoms for a specific cycle
   */
  getCycleSymptomsFor(cycle) {
    const cycleStart = new Date(cycle.startDate);
    const cycleEnd = new Date(cycleStart.getTime() + (cycle.length || 28) * 24 * 60 * 60 * 1000);

    return this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate >= cycleStart && symptomDate < cycleEnd;
    });
  }

  /**
   * Calculate average cycle length
   */
  calculateAverageLength(cycles) {
    if (cycles.length < 2) return 28;

    let totalLength = 0;
    let validCycles = 0;

    for (let i = 1; i < cycles.length; i++) {
      const current = new Date(cycles[i].startDate);
      const previous = new Date(cycles[i - 1].startDate);
      const length = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));

      if (length >= 15 && length <= 60) {
        totalLength += length;
        validCycles++;
      }
    }

    return validCycles > 0 ? totalLength / validCycles : 28;
  }

  /**
   * Adjust symptom prediction weight
   */
  adjustSymptomPredictionWeight(symptomType, change) {
    // Create symptom-specific weights if they don't exist
    if (!this.modelWeights.symptom_weights) {
      this.modelWeights.symptom_weights = {};
    }

    const currentWeight = this.modelWeights.symptom_weights[symptomType] || 0.5;
    const adjustment = change * this.learningRate;
    
    this.modelWeights.symptom_weights[symptomType] = Math.max(0.1, 
      Math.min(1.0, currentWeight + adjustment));
  }

  /**
   * Update accuracy metrics over time
   */
  updateAccuracyMetrics(analysis) {
    // Update overall accuracy
    this.accuracyMetrics.overall = this.accuracyMetrics.overall * 0.8 + analysis.overall_accuracy * 0.2;

    // Track improvement trend
    this.accuracyMetrics.improvement_trend.push({
      timestamp: new Date().toISOString(),
      accuracy: analysis.overall_accuracy,
      period_accuracy: analysis.period_accuracy,
      symptom_accuracy: analysis.symptom_accuracy
    });

    // Keep only last 20 measurements
    if (this.accuracyMetrics.improvement_trend.length > 20) {
      this.accuracyMetrics.improvement_trend = this.accuracyMetrics.improvement_trend.slice(-20);
    }
  }

  /**
   * Calculate accuracy improvement over time
   */
  calculateAccuracyImprovement() {
    if (this.accuracyMetrics.improvement_trend.length < 5) {
      return { trend: 'insufficient_data', improvement: 0 };
    }

    const recent = this.accuracyMetrics.improvement_trend.slice(-5);
    const older = this.accuracyMetrics.improvement_trend.slice(-10, -5);

    if (older.length === 0) return { trend: 'stable', improvement: 0 };

    const recentAvg = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, o) => sum + o.accuracy, 0) / older.length;

    const improvement = recentAvg - olderAvg;

    return {
      trend: improvement > 0.05 ? 'improving' : improvement < -0.05 ? 'declining' : 'stable',
      improvement: Math.round(improvement * 100),
      recent_accuracy: Math.round(recentAvg * 100),
      baseline_accuracy: Math.round(olderAvg * 100)
    };
  }

  /**
   * Generate adapted predictions using learned factors
   */
  generateAdaptedPredictions() {
    if (this.cycles.length < 2) return null;

    const lastCycle = this.cycles[this.cycles.length - 1];
    const recentCycles = this.cycles.slice(-6);
    
    // Calculate adapted cycle length prediction
    const adaptedCycleLength = this.calculateAdaptedCycleLength(recentCycles);
    
    // Calculate adapted next period date
    const lastPeriodStart = new Date(lastCycle.startDate);
    const nextPeriodDate = new Date(lastPeriodStart.getTime() + adaptedCycleLength * 24 * 60 * 60 * 1000);
    
    // Generate adapted symptom predictions
    const adaptedSymptomPredictions = this.generateAdaptedSymptomPredictions(nextPeriodDate, adaptedCycleLength);
    
    // Calculate confidence based on personal factors
    const confidence = this.calculateAdaptedConfidence();

    return {
      nextPeriod: {
        date: nextPeriodDate.toISOString().split('T')[0],
        predictedLength: Math.round(adaptedCycleLength),
        confidence: Math.round(confidence * 100),
        adaptation_factors: {
          personal_stability: this.personalFactors.cycle_length_stability,
          stress_adjustment: this.personalFactors.stress_sensitivity,
          historical_learning: this.modelWeights.recent_cycles
        }
      },
      symptoms: adaptedSymptomPredictions,
      ovulation: this.calculateAdaptedOvulation(nextPeriodDate, adaptedCycleLength),
      modelVersion: 'adaptive-v1',
      adaptationLevel: this.getAdaptationLevel()
    };
  }

  /**
   * Calculate adapted cycle length using personal factors
   */
  calculateAdaptedCycleLength(recentCycles) {
    const lengths = [];
    
    for (let i = 1; i < recentCycles.length; i++) {
      const current = new Date(recentCycles[i].startDate);
      const previous = new Date(recentCycles[i - 1].startDate);
      const length = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
      
      if (length >= 15 && length <= 60) {
        lengths.push(length);
      }
    }

    if (lengths.length === 0) return 28;

    // Apply personal stability factor
    const stabilityFactor = this.personalFactors.cycle_length_stability;
    const recentWeight = this.modelWeights.recent_cycles;
    
    // Weighted average with emphasis on recent cycles and stability
    let weightedSum = 0;
    let totalWeight = 0;
    
    lengths.reverse().forEach((length, index) => {
      const weight = Math.pow(recentWeight, index) * stabilityFactor;
      weightedSum += length * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 28;
  }

  /**
   * Generate adapted symptom predictions
   */
  generateAdaptedSymptomPredictions(nextPeriodDate, cycleLength) {
    const predictions = [];
    const recentSymptoms = this.getRecentSymptomPatterns();
    
    Object.entries(recentSymptoms).forEach(([symptomType, pattern]) => {
      const predictability = this.personalFactors.symptom_predictability;
      const symptomWeight = this.modelWeights.symptom_weights?.[symptomType] || 0.5;
      
      if (pattern.frequency >= 0.5 && predictability > 0.4) {
        const adaptedDay = Math.round(pattern.averageDay * (cycleLength / 28));
        const predictedDate = new Date(nextPeriodDate.getTime() + (adaptedDay - 1) * 24 * 60 * 60 * 1000);
        
        predictions.push({
          type: symptomType,
          predictedDate: predictedDate.toISOString().split('T')[0],
          probability: Math.round(pattern.frequency * symptomWeight * predictability * 100),
          expectedSeverity: pattern.averageSeverity,
          cycleDay: adaptedDay,
          adaptationFactors: {
            personal_predictability: predictability,
            symptom_weight: symptomWeight,
            frequency_based: pattern.frequency
          }
        });
      }
    });

    return predictions;
  }

  /**
   * Get recent symptom patterns for adaptation
   */
  getRecentSymptomPatterns() {
    const recentCycles = this.cycles.slice(-4); // Last 4 cycles
    const patterns = {};

    recentCycles.forEach(cycle => {
      const cycleSymptoms = this.getCycleSymptomsFor(cycle);
      const cycleStart = new Date(cycle.startDate);
      
      cycleSymptoms.forEach(symptom => {
        if (!patterns[symptom.type]) {
          patterns[symptom.type] = { 
            occurrences: 0, 
            totalDay: 0, 
            severities: [] 
          };
        }
        
        const cycleDay = Math.ceil((new Date(symptom.date) - cycleStart) / (1000 * 60 * 60 * 24));
        patterns[symptom.type].occurrences++;
        patterns[symptom.type].totalDay += cycleDay;
        patterns[symptom.type].severities.push(symptom.severity);
      });
    });

    // Convert to usable format
    Object.keys(patterns).forEach(symptomType => {
      const pattern = patterns[symptomType];
      patterns[symptomType] = {
        frequency: pattern.occurrences / recentCycles.length,
        averageDay: Math.round(pattern.totalDay / pattern.occurrences),
        averageSeverity: this.getMostCommonSeverity(pattern.severities)
      };
    });

    return patterns;
  }

  /**
   * Get most common severity level
   */
  getMostCommonSeverity(severities) {
    const counts = {};
    severities.forEach(severity => {
      counts[severity] = (counts[severity] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  /**
   * Calculate adapted ovulation prediction
   */
  calculateAdaptedOvulation(nextPeriodDate, cycleLength) {
    const ovulationPrecision = this.personalFactors.ovulation_timing_precision;
    const baseLutealLength = cycleLength > 30 ? 15 : cycleLength < 25 ? 13 : 14;
    
    // Adjust based on personal precision factor
    const adaptedLutealLength = Math.round(baseLutealLength * (0.8 + 0.4 * ovulationPrecision));
    const ovulationDate = new Date(nextPeriodDate.getTime() - adaptedLutealLength * 24 * 60 * 60 * 1000);
    
    return {
      date: ovulationDate.toISOString().split('T')[0],
      confidence: Math.round(ovulationPrecision * 100),
      adaptationFactors: {
        timing_precision: ovulationPrecision,
        luteal_length_adaptation: adaptedLutealLength
      }
    };
  }

  /**
   * Calculate adapted confidence level
   */
  calculateAdaptedConfidence() {
    const factors = [
      this.personalFactors.cycle_length_stability,
      this.personalFactors.symptom_predictability,
      this.accuracyMetrics.overall,
      this.personalFactors.ovulation_timing_precision
    ];

    const weights = [0.3, 0.25, 0.3, 0.15];
    
    return factors.reduce((sum, factor, index) => sum + factor * weights[index], 0);
  }

  /**
   * Get current adaptation level
   */
  getAdaptationLevel() {
    const totalFeedback = this.feedbackHistory.length;
    const accuracyTrend = this.accuracyMetrics.improvement_trend.length;
    
    if (totalFeedback >= 20 && accuracyTrend >= 10) {
      return 'advanced';
    } else if (totalFeedback >= 10 && accuracyTrend >= 5) {
      return 'intermediate';
    } else if (totalFeedback >= 5) {
      return 'basic';
    } else {
      return 'initial';
    }
  }

  /**
   * Get adaptation insights for user
   */
  getAdaptationInsights() {
    const improvement = this.calculateAccuracyImprovement();
    const adaptationLevel = this.getAdaptationLevel();
    
    return {
      adaptation_level: adaptationLevel,
      accuracy_trend: improvement,
      key_learnings: this.getKeyLearnings(),
      personalization_strength: this.getPersonalizationStrength(),
      recommendations: this.getAdaptationRecommendations()
    };
  }

  /**
   * Get key learnings from adaptation
   */
  getKeyLearnings() {
    const learnings = [];
    
    if (this.personalFactors.stress_sensitivity > 0.7) {
      learnings.push({
        type: 'stress_sensitivity',
        message: 'Your cycles appear sensitive to stress levels',
        confidence: 'high',
        actionable: true
      });
    }
    
    if (this.personalFactors.cycle_length_stability > 0.8) {
      learnings.push({
        type: 'cycle_regularity',
        message: 'Your cycles are very regular and predictable',
        confidence: 'high',
        actionable: false
      });
    }
    
    if (this.personalFactors.symptom_predictability > 0.7) {
      learnings.push({
        type: 'symptom_patterns',
        message: 'Your symptoms follow consistent patterns',
        confidence: 'medium',
        actionable: true
      });
    }

    return learnings;
  }

  /**
   * Get personalization strength
   */
  getPersonalizationStrength() {
    const factors = [
      this.personalFactors.cycle_length_stability,
      this.personalFactors.symptom_predictability,
      this.personalFactors.hormone_sensitivity
    ];
    
    const average = factors.reduce((sum, f) => sum + f, 0) / factors.length;
    
    if (average >= 0.8) return 'very_strong';
    if (average >= 0.6) return 'strong';
    if (average >= 0.4) return 'moderate';
    return 'developing';
  }

  /**
   * Get recommendations for improving adaptation
   */
  getAdaptationRecommendations() {
    const recommendations = [];
    
    if (this.feedbackHistory.length < 10) {
      recommendations.push({
        type: 'data_collection',
        message: 'Continue tracking consistently to improve predictions',
        priority: 'high'
      });
    }
    
    if (this.personalFactors.symptom_predictability < 0.5) {
      recommendations.push({
        type: 'symptom_tracking',
        message: 'Track symptoms more consistently to improve pattern recognition',
        priority: 'medium'
      });
    }
    
    if (this.accuracyMetrics.overall < 0.6) {
      recommendations.push({
        type: 'accuracy_improvement',
        message: 'Consider tracking additional factors like stress or sleep',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

/**
 * Factory function for creating adaptive learning engine
 */
export function createAdaptiveLearningEngine(cycles, symptoms, predictions = []) {
  return new AdaptiveLearningEngine(cycles, symptoms, predictions);
}

/**
 * Quick adaptation function for integration
 */
export function adaptPredictions(cycles, symptoms, predictions, newData, feedback) {
  const engine = new AdaptiveLearningEngine(cycles, symptoms, predictions);
  return engine.adaptToNewData(newData.cycle, newData.symptoms, feedback);
}