// Multi-Factor Analysis Engine
// Analyzes correlations between lifestyle factors and menstrual cycle patterns

/**
 * Multi-Factor Correlation Analysis System
 * Analyzes how stress, sleep, diet, exercise, and other lifestyle factors impact cycles
 */
export class MultiFactorAnalyzer {
  constructor(cycles = [], symptoms = [], lifestyleData = {}) {
    this.cycles = cycles;
    this.symptoms = symptoms;
    this.lifestyleData = lifestyleData; // { stress: [], sleep: [], diet: [], exercise: [], etc. }
    
    // Factor categories and their impact weights
    this.factorCategories = {
      stress: {
        weight: 0.8,
        dataTypes: ['stress_level', 'work_stress', 'personal_stress', 'anxiety_level'],
        impact_areas: ['cycle_length', 'symptom_severity', 'pms_intensity', 'ovulation_timing']
      },
      sleep: {
        weight: 0.7,
        dataTypes: ['sleep_hours', 'sleep_quality', 'sleep_consistency', 'bedtime_regularity'],
        impact_areas: ['hormone_balance', 'energy_levels', 'mood_stability', 'cycle_regularity']
      },
      diet: {
        weight: 0.6,
        dataTypes: ['nutrition_quality', 'sugar_intake', 'caffeine_intake', 'alcohol_intake', 'hydration'],
        impact_areas: ['inflammation', 'hormone_production', 'energy_levels', 'bloating']
      },
      exercise: {
        weight: 0.5,
        dataTypes: ['exercise_intensity', 'exercise_frequency', 'exercise_type', 'rest_days'],
        impact_areas: ['hormone_balance', 'stress_reduction', 'energy_levels', 'cycle_regularity']
      },
      environment: {
        weight: 0.4,
        dataTypes: ['season', 'weather', 'travel', 'timezone_changes', 'light_exposure'],
        impact_areas: ['seasonal_variation', 'circadian_rhythm', 'mood_changes']
      },
      social: {
        weight: 0.3,
        dataTypes: ['relationship_stress', 'social_support', 'work_environment', 'life_events'],
        impact_areas: ['stress_levels', 'mood_stability', 'hormone_fluctuation']
      }
    };

    // Correlation thresholds
    this.correlationThresholds = {
      strong: 0.7,
      moderate: 0.5,
      weak: 0.3
    };
  }

  /**
   * Perform comprehensive multi-factor analysis
   */
  performAnalysis() {
    if (this.cycles.length < 3) {
      return { 
        status: 'insufficient_data', 
        recommendations: ['Track at least 3 cycles for meaningful analysis'] 
      };
    }

    const analysis = {
      correlations: this.calculateFactorCorrelations(),
      patterns: this.identifyLifestylePatterns(),
      impacts: this.assessFactorImpacts(),
      recommendations: this.generateRecommendations(),
      riskFactors: this.identifyRiskFactors(),
      protectiveFactors: this.identifyProtectiveFactors(),
      personalProfile: this.buildPersonalProfile()
    };

    return {
      status: 'complete',
      ...analysis,
      confidence: this.calculateAnalysisConfidence(analysis),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate correlations between lifestyle factors and cycle characteristics
   */
  calculateFactorCorrelations() {
    const correlations = {};

    Object.keys(this.factorCategories).forEach(factorType => {
      correlations[factorType] = this.calculateFactorTypeCorrelations(factorType);
    });

    return correlations;
  }

  /**
   * Calculate correlations for a specific factor type
   */
  calculateFactorTypeCorrelations(factorType) {
    const factorData = this.lifestyleData[factorType] || [];
    if (factorData.length === 0) {
      return { status: 'no_data', correlations: {} };
    }

    const correlations = {};
    const impactAreas = this.factorCategories[factorType].impact_areas;

    impactAreas.forEach(area => {
      correlations[area] = this.calculateSpecificCorrelation(factorData, area);
    });

    return {
      status: 'calculated',
      correlations,
      dataPoints: factorData.length,
      strength: this.getOverallCorrelationStrength(correlations)
    };
  }

  /**
   * Calculate specific correlation between factor and cycle characteristic
   */
  calculateSpecificCorrelation(factorData, impactArea) {
    const cycleCharacteristics = this.extractCycleCharacteristics(impactArea);
    const alignedData = this.alignDataPoints(factorData, cycleCharacteristics);

    if (alignedData.length < 3) {
      return { correlation: 0, confidence: 'low', dataPoints: alignedData.length };
    }

    const correlation = this.pearsonCorrelation(
      alignedData.map(d => d.factor),
      alignedData.map(d => d.cycle)
    );

    return {
      correlation: Math.round(correlation * 100) / 100,
      confidence: this.getCorrelationConfidence(correlation, alignedData.length),
      dataPoints: alignedData.length,
      strength: this.getCorrelationStrength(correlation),
      significance: this.calculateSignificance(correlation, alignedData.length)
    };
  }

  /**
   * Extract cycle characteristics for analysis
   */
  extractCycleCharacteristics(impactArea) {
    switch (impactArea) {
      case 'cycle_length':
        return this.calculateCycleLengths();
      
      case 'symptom_severity':
        return this.calculateSymptomSeverity();
      
      case 'pms_intensity':
        return this.calculatePMSIntensity();
      
      case 'ovulation_timing':
        return this.calculateOvulationTiming();
      
      case 'hormone_balance':
        return this.estimateHormoneBalance();
      
      case 'energy_levels':
        return this.calculateEnergyLevels();
      
      case 'mood_stability':
        return this.calculateMoodStability();
      
      case 'cycle_regularity':
        return this.calculateCycleRegularity();
      
      default:
        return [];
    }
  }

  /**
   * Calculate cycle lengths for correlation
   */
  calculateCycleLengths() {
    const lengths = [];
    
    for (let i = 1; i < this.cycles.length; i++) {
      const current = new Date(this.cycles[i].startDate);
      const previous = new Date(this.cycles[i - 1].startDate);
      const length = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
      
      if (length >= 15 && length <= 60) {
        lengths.push({
          cycleIndex: i,
          date: this.cycles[i].startDate,
          value: length
        });
      }
    }
    
    return lengths;
  }

  /**
   * Calculate average symptom severity per cycle
   */
  calculateSymptomSeverity() {
    return this.cycles.map((cycle, index) => {
      const cycleSymptoms = this.getCycleSymptomsFor(cycle, index);
      const severity = this.getAverageSymptomSeverity(cycleSymptoms);
      
      return {
        cycleIndex: index,
        date: cycle.startDate,
        value: severity
      };
    });
  }

  /**
   * Calculate PMS intensity (symptoms in luteal phase)
   */
  calculatePMSIntensity() {
    return this.cycles.map((cycle, index) => {
      const cycleSymptoms = this.getCycleSymptomsFor(cycle, index);
      const cycleLength = cycle.length || this.estimateCycleLength(index);
      const pmsSymptoms = this.getPMSSymptoms(cycleSymptoms, cycle, cycleLength);
      
      return {
        cycleIndex: index,
        date: cycle.startDate,
        value: this.calculatePMSScore(pmsSymptoms)
      };
    });
  }

  /**
   * Get symptoms for a specific cycle
   */
  getCycleSymptomsFor(cycle, cycleIndex) {
    const cycleStart = new Date(cycle.startDate);
    const nextCycle = this.cycles[cycleIndex + 1];
    const cycleEnd = nextCycle ? 
      new Date(nextCycle.startDate) : 
      new Date(cycleStart.getTime() + (cycle.length || 28) * 24 * 60 * 60 * 1000);

    return this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate >= cycleStart && symptomDate < cycleEnd;
    });
  }

  /**
   * Get average symptom severity
   */
  getAverageSymptomSeverity(symptoms) {
    if (symptoms.length === 0) return 0;
    
    const severityScores = { mild: 1, moderate: 2, severe: 3, extreme: 4 };
    const totalScore = symptoms.reduce((sum, symptom) => 
      sum + (severityScores[symptom.severity] || 1), 0);
    
    return totalScore / symptoms.length;
  }

  /**
   * Get PMS symptoms (luteal phase symptoms)
   */
  getPMSSymptoms(cycleSymptoms, cycle, cycleLength) {
    const cycleStart = new Date(cycle.startDate);
    const lutealStart = new Date(cycleStart.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000);
    
    return cycleSymptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate >= lutealStart;
    });
  }

  /**
   * Calculate PMS score
   */
  calculatePMSScore(pmsSymptoms) {
    if (pmsSymptoms.length === 0) return 0;
    
    const pmsSymptomTypes = ['mood-swings', 'irritability', 'anxiety', 'bloating', 'breast-tenderness', 'fatigue', 'food-cravings'];
    const pmsRelevantSymptoms = pmsSymptoms.filter(s => pmsSymptomTypes.includes(s.type));
    
    if (pmsRelevantSymptoms.length === 0) return 0;
    
    return this.getAverageSymptomSeverity(pmsRelevantSymptoms);
  }

  /**
   * Align lifestyle data with cycle data by date
   */
  alignDataPoints(factorData, cycleData) {
    const aligned = [];
    
    cycleData.forEach(cyclePoint => {
      const cycleDate = new Date(cyclePoint.date);
      
      // Find closest factor data point (within 7 days)
      const closestFactor = factorData.find(factor => {
        const factorDate = new Date(factor.date);
        const daysDiff = Math.abs((cycleDate - factorDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      });
      
      if (closestFactor) {
        aligned.push({
          date: cyclePoint.date,
          cycle: cyclePoint.value,
          factor: closestFactor.value,
          cycleIndex: cyclePoint.cycleIndex
        });
      }
    });
    
    return aligned;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  pearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get correlation strength category
   */
  getCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= this.correlationThresholds.strong) return 'strong';
    if (abs >= this.correlationThresholds.moderate) return 'moderate';
    if (abs >= this.correlationThresholds.weak) return 'weak';
    return 'negligible';
  }

  /**
   * Get correlation confidence based on correlation value and sample size
   */
  getCorrelationConfidence(correlation, sampleSize) {
    const abs = Math.abs(correlation);
    
    if (sampleSize < 5) return 'very_low';
    if (sampleSize < 10 && abs < 0.5) return 'low';
    if (sampleSize >= 10 && abs >= 0.5) return 'high';
    if (sampleSize >= 15 && abs >= 0.3) return 'medium';
    
    return 'low';
  }

  /**
   * Calculate statistical significance
   */
  calculateSignificance(correlation, sampleSize) {
    if (sampleSize < 3) return 'not_significant';
    
    const abs = Math.abs(correlation);
    const criticalValues = {
      3: 0.997, 4: 0.950, 5: 0.878, 6: 0.811, 7: 0.754,
      8: 0.707, 9: 0.666, 10: 0.632, 15: 0.514, 20: 0.444
    };
    
    const n = Math.min(20, sampleSize);
    const criticalValue = criticalValues[n] || 0.4;
    
    return abs >= criticalValue ? 'significant' : 'not_significant';
  }

  /**
   * Identify lifestyle patterns that affect cycles
   */
  identifyLifestylePatterns() {
    const patterns = {};
    
    Object.keys(this.factorCategories).forEach(factorType => {
      patterns[factorType] = this.identifyFactorPatterns(factorType);
    });
    
    return patterns;
  }

  /**
   * Identify patterns for specific factor type
   */
  identifyFactorPatterns(factorType) {
    const factorData = this.lifestyleData[factorType] || [];
    if (factorData.length < 3) {
      return { status: 'insufficient_data' };
    }
    
    const patterns = {
      trends: this.identifyTrends(factorData),
      cyclical_patterns: this.identifyCyclicalPatterns(factorData, factorType),
      extreme_events: this.identifyExtremeEvents(factorData, factorType),
      consistency: this.calculateFactorConsistency(factorData)
    };
    
    return { status: 'analyzed', patterns };
  }

  /**
   * Identify trends in lifestyle data
   */
  identifyTrends(data) {
    if (data.length < 5) return { trend: 'insufficient_data' };
    
    const timePoints = data.map((d, i) => i);
    const values = data.map(d => d.value);
    const correlation = this.pearsonCorrelation(timePoints, values);
    
    return {
      trend: correlation > 0.3 ? 'improving' : correlation < -0.3 ? 'declining' : 'stable',
      strength: Math.abs(correlation),
      direction: correlation > 0 ? 'positive' : 'negative'
    };
  }

  /**
   * Identify cyclical patterns that align with menstrual cycle
   */
  identifyCyclicalPatterns(factorData, factorType) {
    const cycleAlignedData = this.alignFactorDataWithCycles(factorData);
    
    if (cycleAlignedData.length < 6) {
      return { pattern: 'insufficient_data' };
    }
    
    // Group by cycle phase
    const phaseGroups = {
      menstrual: [],
      follicular: [],
      ovulatory: [],
      luteal: []
    };
    
    cycleAlignedData.forEach(data => {
      const phase = this.getCyclePhaseForDay(data.cycleDay);
      if (phaseGroups[phase]) {
        phaseGroups[phase].push(data.value);
      }
    });
    
    // Calculate phase averages
    const phaseAverages = {};
    Object.keys(phaseGroups).forEach(phase => {
      const values = phaseGroups[phase];
      phaseAverages[phase] = values.length > 0 ? 
        values.reduce((sum, v) => sum + v, 0) / values.length : 0;
    });
    
    // Find phase with highest/lowest values
    const sortedPhases = Object.entries(phaseAverages)
      .sort(([,a], [,b]) => b - a);
    
    return {
      pattern: 'cyclical',
      phase_averages: phaseAverages,
      highest_phase: sortedPhases[0][0],
      lowest_phase: sortedPhases[sortedPhases.length - 1][0],
      variation: sortedPhases[0][1] - sortedPhases[sortedPhases.length - 1][1]
    };
  }

  /**
   * Align factor data with cycle days
   */
  alignFactorDataWithCycles(factorData) {
    const aligned = [];
    
    factorData.forEach(factor => {
      const factorDate = new Date(factor.date);
      const cycleInfo = this.getCycleInfoForDate(factorDate);
      
      if (cycleInfo) {
        aligned.push({
          ...factor,
          cycleIndex: cycleInfo.cycleIndex,
          cycleDay: cycleInfo.cycleDay,
          phase: this.getCyclePhaseForDay(cycleInfo.cycleDay)
        });
      }
    });
    
    return aligned;
  }

  /**
   * Get cycle information for specific date
   */
  getCycleInfoForDate(targetDate) {
    for (let i = 0; i < this.cycles.length; i++) {
      const cycleStart = new Date(this.cycles[i].startDate);
      const nextCycleStart = i < this.cycles.length - 1 ? 
        new Date(this.cycles[i + 1].startDate) :
        new Date(cycleStart.getTime() + 35 * 24 * 60 * 60 * 1000);
      
      if (targetDate >= cycleStart && targetDate < nextCycleStart) {
        const cycleDay = Math.ceil((targetDate - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
        return { cycleIndex: i, cycleDay };
      }
    }
    
    return null;
  }

  /**
   * Get cycle phase for specific day
   */
  getCyclePhaseForDay(day) {
    if (day <= 7) return 'menstrual';
    if (day <= 13) return 'follicular';
    if (day <= 16) return 'ovulatory';
    return 'luteal';
  }

  /**
   * Identify extreme events in lifestyle data
   */
  identifyExtremeEvents(data, factorType) {
    if (data.length < 5) return { events: [] };
    
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    
    const threshold = 2 * stdDev; // 2 standard deviations
    const extremeEvents = [];
    
    data.forEach(point => {
      const deviation = Math.abs(point.value - mean);
      if (deviation > threshold) {
        extremeEvents.push({
          date: point.date,
          value: point.value,
          type: point.value > mean ? 'high' : 'low',
          severity: deviation / stdDev,
          impact: this.assessExtremeEventImpact(point, factorType)
        });
      }
    });
    
    return { events: extremeEvents, threshold, mean, stdDev };
  }

  /**
   * Assess impact of extreme events on cycle
   */
  assessExtremeEventImpact(event, factorType) {
    const eventDate = new Date(event.date);
    const cycleInfo = this.getCycleInfoForDate(eventDate);
    
    if (!cycleInfo) return { impact: 'unknown' };
    
    // Look for cycle disruptions around this event
    const currentCycle = this.cycles[cycleInfo.cycleIndex];
    const nextCycle = this.cycles[cycleInfo.cycleIndex + 1];
    
    let impact = { severity: 'low', areas: [] };
    
    // Check for cycle length changes
    if (nextCycle) {
      const currentLength = this.estimateCycleLength(cycleInfo.cycleIndex);
      const avgLength = this.calculateAverageCycleLength();
      const lengthDifference = Math.abs(currentLength - avgLength);
      
      if (lengthDifference > 5) {
        impact.severity = 'high';
        impact.areas.push('cycle_length');
      }
    }
    
    // Check for symptom changes
    const cycleSymptoms = this.getCycleSymptomsFor(currentCycle, cycleInfo.cycleIndex);
    const symptomsNearEvent = cycleSymptoms.filter(s => {
      const symptomDate = new Date(s.date);
      const daysDiff = Math.abs((symptomDate - eventDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 3;
    });
    
    if (symptomsNearEvent.length > 0) {
      const avgSeverity = this.getAverageSymptomSeverity(symptomsNearEvent);
      if (avgSeverity > 2.5) {
        impact.severity = impact.severity === 'low' ? 'medium' : 'high';
        impact.areas.push('symptoms');
      }
    }
    
    return impact;
  }

  /**
   * Calculate consistency of lifestyle factor
   */
  calculateFactorConsistency(data) {
    if (data.length < 3) return { consistency: 'insufficient_data' };
    
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    let consistency;
    if (coefficientOfVariation < 0.1) consistency = 'very_high';
    else if (coefficientOfVariation < 0.2) consistency = 'high';
    else if (coefficientOfVariation < 0.4) consistency = 'moderate';
    else consistency = 'low';
    
    return {
      consistency,
      coefficient_of_variation: Math.round(coefficientOfVariation * 100) / 100,
      mean,
      variance: Math.round(variance * 100) / 100
    };
  }

  /**
   * Assess overall impact of each factor type
   */
  assessFactorImpacts() {
    const impacts = {};
    
    Object.keys(this.factorCategories).forEach(factorType => {
      impacts[factorType] = this.assessSingleFactorImpact(factorType);
    });
    
    return impacts;
  }

  /**
   * Assess impact of single factor type
   */
  assessSingleFactorImpact(factorType) {
    const correlations = this.calculateFactorTypeCorrelations(factorType);
    
    if (correlations.status !== 'calculated') {
      return { impact: 'unknown', reason: 'insufficient_data' };
    }
    
    const strongCorrelations = Object.values(correlations.correlations)
      .filter(corr => corr.strength === 'strong').length;
    const moderateCorrelations = Object.values(correlations.correlations)
      .filter(corr => corr.strength === 'moderate').length;
    
    const impactScore = strongCorrelations * 3 + moderateCorrelations * 2;
    const categoryWeight = this.factorCategories[factorType].weight;
    const weightedScore = impactScore * categoryWeight;
    
    let impact;
    if (weightedScore >= 4) impact = 'high';
    else if (weightedScore >= 2) impact = 'moderate';
    else if (weightedScore >= 1) impact = 'low';
    else impact = 'negligible';
    
    return {
      impact,
      impact_score: Math.round(weightedScore * 10) / 10,
      strong_correlations: strongCorrelations,
      moderate_correlations: moderateCorrelations,
      most_affected_areas: this.getMostAffectedAreas(correlations.correlations)
    };
  }

  /**
   * Get most affected areas by a factor
   */
  getMostAffectedAreas(correlations) {
    return Object.entries(correlations)
      .filter(([, corr]) => ['strong', 'moderate'].includes(corr.strength))
      .sort(([, a], [, b]) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3)
      .map(([area, corr]) => ({
        area,
        correlation: corr.correlation,
        strength: corr.strength
      }));
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const impacts = this.assessFactorImpacts();
    
    Object.entries(impacts).forEach(([factorType, impact]) => {
      if (impact.impact === 'high' || impact.impact === 'moderate') {
        recommendations.push(...this.getFactorRecommendations(factorType, impact));
      }
    });
    
    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Get recommendations for specific factor
   */
  getFactorRecommendations(factorType, impactData) {
    const recommendations = [];
    
    const factorSpecificRecs = {
      stress: [
        {
          type: 'stress_management',
          message: 'High stress levels are significantly affecting your cycle',
          actions: ['Practice daily meditation', 'Try stress-reduction techniques', 'Consider professional support'],
          priority: 'high'
        }
      ],
      sleep: [
        {
          type: 'sleep_hygiene',
          message: 'Sleep patterns are impacting your hormonal balance',
          actions: ['Maintain consistent bedtime', 'Aim for 7-9 hours nightly', 'Create relaxing bedtime routine'],
          priority: 'high'
        }
      ],
      diet: [
        {
          type: 'nutrition_optimization',
          message: 'Dietary factors are influencing your cycle symptoms',
          actions: ['Focus on anti-inflammatory foods', 'Reduce processed sugar intake', 'Stay well hydrated'],
          priority: 'medium'
        }
      ],
      exercise: [
        {
          type: 'exercise_balance',
          message: 'Exercise patterns are affecting your cycle regularity',
          actions: ['Balance intense workouts with rest', 'Include gentle exercise during menstruation', 'Listen to your body'],
          priority: 'medium'
        }
      ]
    };
    
    const baseRecs = factorSpecificRecs[factorType] || [];
    
    // Customize based on most affected areas
    impactData.most_affected_areas?.forEach(area => {
      recommendations.push({
        ...baseRecs[0],
        specific_area: area.area,
        correlation_strength: area.strength,
        customized: true
      });
    });
    
    return baseRecs;
  }

  /**
   * Prioritize recommendations by impact and urgency
   */
  prioritizeRecommendations(recommendations) {
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors() {
    const riskFactors = [];
    const impacts = this.assessFactorImpacts();
    
    Object.entries(impacts).forEach(([factorType, impact]) => {
      if (impact.impact === 'high') {
        const negativeCorrelations = impact.most_affected_areas?.filter(area => area.correlation < -0.5);
        
        if (negativeCorrelations?.length > 0) {
          riskFactors.push({
            factor: factorType,
            risk_level: 'high',
            affected_areas: negativeCorrelations.map(area => area.area),
            recommendation: `Monitor and improve ${factorType} to reduce cycle disruption`
          });
        }
      }
    });
    
    return riskFactors;
  }

  /**
   * Identify protective factors
   */
  identifyProtectiveFactors() {
    const protectiveFactors = [];
    const impacts = this.assessFactorImpacts();
    
    Object.entries(impacts).forEach(([factorType, impact]) => {
      const positiveCorrelations = impact.most_affected_areas?.filter(area => area.correlation > 0.5);
      
      if (positiveCorrelations?.length > 0) {
        protectiveFactors.push({
          factor: factorType,
          protection_level: impact.impact,
          beneficial_areas: positiveCorrelations.map(area => area.area),
          recommendation: `Continue maintaining good ${factorType} habits for cycle health`
        });
      }
    });
    
    return protectiveFactors;
  }

  /**
   * Build personal lifestyle profile
   */
  buildPersonalProfile() {
    const impacts = this.assessFactorImpacts();
    const totalFactors = Object.keys(impacts).length;
    const highImpactFactors = Object.values(impacts).filter(i => i.impact === 'high').length;
    const moderateImpactFactors = Object.values(impacts).filter(i => i.impact === 'moderate').length;
    
    let sensitivity;
    if (highImpactFactors >= 3) sensitivity = 'high';
    else if (highImpactFactors >= 1 || moderateImpactFactors >= 3) sensitivity = 'moderate';
    else sensitivity = 'low';
    
    return {
      lifestyle_sensitivity: sensitivity,
      most_influential_factors: this.getMostInfluentialFactors(impacts),
      adaptability_score: this.calculateAdaptabilityScore(impacts),
      wellness_profile: this.generateWellnessProfile(impacts)
    };
  }

  /**
   * Get most influential lifestyle factors
   */
  getMostInfluentialFactors(impacts) {
    return Object.entries(impacts)
      .filter(([, impact]) => ['high', 'moderate'].includes(impact.impact))
      .sort(([, a], [, b]) => b.impact_score - a.impact_score)
      .slice(0, 3)
      .map(([factor, impact]) => ({ factor, impact: impact.impact }));
  }

  /**
   * Calculate adaptability score
   */
  calculateAdaptabilityScore(impacts) {
    const scores = Object.values(impacts)
      .filter(i => typeof i.impact_score === 'number')
      .map(i => i.impact_score);
    
    if (scores.length === 0) return 50;
    
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.max(0, Math.min(100, 100 - avgScore * 20)); // Higher impact = lower adaptability
  }

  /**
   * Generate wellness profile
   */
  generateWellnessProfile(impacts) {
    const profile = {
      strengths: [],
      improvement_areas: [],
      stability: 'unknown'
    };
    
    Object.entries(impacts).forEach(([factor, impact]) => {
      if (impact.impact === 'low' || impact.impact === 'negligible') {
        profile.strengths.push(factor);
      } else if (impact.impact === 'high') {
        profile.improvement_areas.push(factor);
      }
    });
    
    // Determine overall stability
    const highImpact = Object.values(impacts).filter(i => i.impact === 'high').length;
    if (highImpact === 0) profile.stability = 'stable';
    else if (highImpact <= 2) profile.stability = 'moderately_stable';
    else profile.stability = 'variable';
    
    return profile;
  }

  /**
   * Calculate overall analysis confidence
   */
  calculateAnalysisConfidence(analysis) {
    let confidence = 0;
    let factors = 0;
    
    Object.values(analysis.correlations).forEach(corr => {
      if (corr.status === 'calculated') {
        const avgConfidence = Object.values(corr.correlations)
          .reduce((sum, c) => sum + this.getConfidenceScore(c.confidence), 0) / 
          Object.keys(corr.correlations).length;
        confidence += avgConfidence;
        factors++;
      }
    });
    
    return factors > 0 ? Math.round((confidence / factors) * 100) / 100 : 0;
  }

  /**
   * Convert confidence level to numerical score
   */
  getConfidenceScore(confidence) {
    const scores = { very_low: 0.1, low: 0.3, medium: 0.6, high: 0.8, very_high: 1.0 };
    return scores[confidence] || 0.3;
  }

  /**
   * Get overall correlation strength for factor type
   */
  getOverallCorrelationStrength(correlations) {
    const strengths = Object.values(correlations).map(c => Math.abs(c.correlation));
    const avgStrength = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
    
    return this.getCorrelationStrength(avgStrength);
  }

  /**
   * Estimate cycle length for incomplete cycles
   */
  estimateCycleLength(cycleIndex) {
    if (cycleIndex >= this.cycles.length - 1) return 28;
    
    const current = new Date(this.cycles[cycleIndex].startDate);
    const next = new Date(this.cycles[cycleIndex + 1].startDate);
    
    return Math.ceil((next - current) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate average cycle length for reference
   */
  calculateAverageCycleLength() {
    if (this.cycles.length < 2) return 28;
    
    const lengths = [];
    for (let i = 0; i < this.cycles.length - 1; i++) {
      lengths.push(this.estimateCycleLength(i));
    }
    
    return lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
  }

  // Additional methods for other cycle characteristics...
  calculateOvulationTiming() {
    return this.cycles.map((cycle, index) => ({
      cycleIndex: index,
      date: cycle.startDate,
      value: (cycle.length || 28) - 14 // Estimated ovulation day
    }));
  }

  estimateHormoneBalance() {
    return this.cycles.map((cycle, index) => {
      const symptoms = this.getCycleSymptomsFor(cycle, index);
      const hormonalSymptoms = symptoms.filter(s => 
        ['mood-swings', 'breast-tenderness', 'acne', 'bloating'].includes(s.type)
      );
      
      return {
        cycleIndex: index,
        date: cycle.startDate,
        value: hormonalSymptoms.length / Math.max(1, (cycle.length || 28) / 7) // Symptoms per week
      };
    });
  }

  calculateEnergyLevels() {
    return this.cycles.map((cycle, index) => {
      const symptoms = this.getCycleSymptomsFor(cycle, index);
      const energySymptoms = symptoms.filter(s => 
        ['fatigue', 'brain-fog', 'difficulty-concentrating'].includes(s.type)
      );
      
      return {
        cycleIndex: index,
        date: cycle.startDate,
        value: 5 - this.getAverageSymptomSeverity(energySymptoms) // Inverse for energy
      };
    });
  }

  calculateMoodStability() {
    return this.cycles.map((cycle, index) => {
      const symptoms = this.getCycleSymptomsFor(cycle, index);
      const moodSymptoms = symptoms.filter(s => 
        ['mood-swings', 'irritability', 'anxiety', 'depression'].includes(s.type)
      );
      
      return {
        cycleIndex: index,
        date: cycle.startDate,
        value: 5 - this.getAverageSymptomSeverity(moodSymptoms) // Inverse for stability
      };
    });
  }

  calculateCycleRegularity() {
    const lengths = this.calculateCycleLengths();
    if (lengths.length < 3) return [];
    
    return lengths.map((length, index) => {
      if (index < 2) return { ...length, value: 1 }; // Not enough data for first cycles
      
      const recent = lengths.slice(Math.max(0, index - 2), index + 1).map(l => l.value);
      const variance = this.calculateVariance(recent);
      const regularity = Math.max(0, 1 - (variance / 25)); // Normalize variance
      
      return {
        ...length,
        value: regularity
      };
    });
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}

/**
 * Factory function for creating multi-factor analyzer
 */
export function createMultiFactorAnalyzer(cycles, symptoms, lifestyleData) {
  return new MultiFactorAnalyzer(cycles, symptoms, lifestyleData);
}

/**
 * Quick analysis function for integration
 */
export function analyzeLifestyleFactors(cycles, symptoms, lifestyleData) {
  const analyzer = new MultiFactorAnalyzer(cycles, symptoms, lifestyleData);
  return analyzer.performAnalysis();
}