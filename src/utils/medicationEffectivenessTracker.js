export class MedicationEffectivenessTracker {
  constructor() {
    this.medications = new Map();
    this.supplements = new Map();
    this.adherenceTracker = new AdherenceTracker();
    this.effectivenessAnalyzer = new EffectivenessAnalyzer();
    this.sideEffectMonitor = new SideEffectMonitor();
    this.interactionChecker = new InteractionChecker();
    this.dosageOptimizer = new DosageOptimizer();
    this.outcomePredictor = new OutcomePredictor();
  }

  addMedication(medicationData) {
    const medication = this.processMedicationData(medicationData);
    this.medications.set(medication.id, medication);
    
    return {
      medicationId: medication.id,
      initialAssessment: this.performInitialAssessment(medication),
      monitoringPlan: this.createMonitoringPlan(medication),
      interactions: this.interactionChecker.checkInteractions(medication, this.getAllMedications()),
      recommendations: this.generateInitialRecommendations(medication)
    };
  }

  addSupplement(supplementData) {
    const supplement = this.processSupplementData(supplementData);
    this.supplements.set(supplement.id, supplement);
    
    return {
      supplementId: supplement.id,
      initialAssessment: this.performSupplementAssessment(supplement),
      evidenceBase: this.getEvidenceBase(supplement),
      interactions: this.interactionChecker.checkSupplementInteractions(supplement, this.getAllMedications()),
      recommendations: this.generateSupplementRecommendations(supplement)
    };
  }

  recordDose(medicationId, doseData) {
    const medication = this.medications.get(medicationId) || this.supplements.get(medicationId);
    if (!medication) {
      throw new Error('Medication/supplement not found');
    }

    const doseRecord = this.processDoseRecord(doseData, medication);
    medication.doseHistory.push(doseRecord);
    
    this.adherenceTracker.updateAdherence(medicationId, doseRecord);
    
    return {
      adherenceStatus: this.adherenceTracker.getAdherenceStatus(medicationId),
      nextDoseReminder: this.calculateNextDose(medication),
      effectivenessUpdate: this.updateEffectiveness(medicationId),
      sideEffectAlert: this.sideEffectMonitor.checkForAlerts(medicationId, doseRecord)
    };
  }

  recordSymptoms(medicationId, symptomData) {
    const medication = this.medications.get(medicationId) || this.supplements.get(medicationId);
    if (!medication) {
      throw new Error('Medication/supplement not found');
    }

    const symptomRecord = this.processSymptomRecord(symptomData);
    medication.symptomHistory.push(symptomRecord);
    
    return {
      effectiveness: this.effectivenessAnalyzer.analyzeEffectiveness(medication),
      sideEffects: this.sideEffectMonitor.analyzeSideEffects(medication),
      recommendations: this.generateEffectivenessRecommendations(medication),
      dosageAdjustment: this.dosageOptimizer.suggestAdjustments(medication)
    };
  }

  performComprehensiveAnalysis(medicationId, timeframe = 30) {
    const medication = this.medications.get(medicationId) || this.supplements.get(medicationId);
    if (!medication) {
      throw new Error('Medication/supplement not found');
    }

    const cutoffDate = Date.now() - (timeframe * 24 * 60 * 60 * 1000);
    const recentData = this.getRecentData(medication, cutoffDate);
    
    const analysis = {
      overallEffectiveness: this.calculateOverallEffectiveness(recentData),
      adherenceAnalysis: this.adherenceTracker.getDetailedAnalysis(medicationId, timeframe),
      sideEffectProfile: this.sideEffectMonitor.getProfile(medicationId, timeframe),
      cycleCorrelations: this.analyzeCycleCorrelations(medication, recentData),
      optimalTiming: this.analyzeOptimalTiming(medication, recentData),
      dosageEfficiency: this.analyzeDosageEfficiency(medication, recentData),
      qualityOfLife: this.assessQualityOfLifeImpact(medication, recentData),
      predictions: this.outcomePredictor.predict(medication, recentData),
      recommendations: this.generateComprehensiveRecommendations(medication, recentData)
    };
    
    return analysis;
  }

  processMedicationData(data) {
    return {
      id: data.id || this.generateId(),
      name: data.name,
      type: data.type || 'medication',
      dosage: data.dosage,
      frequency: data.frequency,
      route: data.route || 'oral',
      indication: data.indication,
      prescriber: data.prescriber,
      startDate: data.startDate || Date.now(),
      endDate: data.endDate,
      instructions: data.instructions || '',
      targetSymptoms: data.targetSymptoms || [],
      expectedEffects: data.expectedEffects || [],
      contraindications: data.contraindications || [],
      monitoringParameters: data.monitoringParameters || [],
      doseHistory: [],
      symptomHistory: [],
      adherenceScore: 1.0,
      effectivenessScore: 0,
      sideEffects: new Map(),
      notes: data.notes || ''
    };
  }

  processSupplementData(data) {
    return {
      id: data.id || this.generateId(),
      name: data.name,
      type: 'supplement',
      dosage: data.dosage,
      frequency: data.frequency,
      form: data.form || 'capsule',
      brand: data.brand,
      indication: data.indication,
      startDate: data.startDate || Date.now(),
      endDate: data.endDate,
      targetBenefits: data.targetBenefits || [],
      evidenceLevel: this.assessEvidenceLevel(data.name),
      qualityRating: data.qualityRating,
      doseHistory: [],
      symptomHistory: [],
      adherenceScore: 1.0,
      effectivenessScore: 0,
      costEffectiveness: 0,
      notes: data.notes || ''
    };
  }

  processDoseRecord(doseData, medication) {
    return {
      timestamp: doseData.timestamp || Date.now(),
      actualDosage: doseData.actualDosage || medication.dosage,
      scheduledTime: doseData.scheduledTime,
      actualTime: doseData.actualTime || Date.now(),
      adherence: this.calculateDoseAdherence(doseData, medication),
      context: {
        withFood: doseData.withFood,
        cycleDay: this.estimateCycleDay(doseData.timestamp),
        symptoms: doseData.symptoms || [],
        mood: doseData.mood,
        sideEffects: doseData.sideEffects || [],
        effectiveness: doseData.effectiveness,
        notes: doseData.notes || ''
      }
    };
  }

  calculateOverallEffectiveness(recentData) {
    if (recentData.length === 0) return { score: 0, confidence: 0 };
    
    const effectivenessScores = recentData
      .filter(record => record.context && record.context.effectiveness !== undefined)
      .map(record => record.context.effectiveness);
    
    if (effectivenessScores.length === 0) {
      return { score: 0, confidence: 0, message: 'No effectiveness data recorded' };
    }
    
    const averageEffectiveness = effectivenessScores.reduce((sum, score) => sum + score, 0) / effectivenessScores.length;
    const confidence = Math.min(0.95, effectivenessScores.length / 30); // More data = higher confidence
    
    const trend = this.calculateTrend(effectivenessScores);
    
    return {
      score: averageEffectiveness,
      confidence,
      trend,
      category: this.getEffectivenessCategory(averageEffectiveness),
      sampleSize: effectivenessScores.length,
      recommendation: this.getEffectivenessRecommendation(averageEffectiveness, trend)
    };
  }

  getEffectivenessCategory(score) {
    if (score >= 8) return 'highly_effective';
    if (score >= 6) return 'moderately_effective';
    if (score >= 4) return 'somewhat_effective';
    if (score >= 2) return 'minimally_effective';
    return 'ineffective';
  }

  analyzeCycleCorrelations(medication, recentData) {
    const cycleData = recentData
      .filter(record => record.context && record.context.cycleDay)
      .map(record => ({
        cycleDay: record.context.cycleDay,
        effectiveness: record.context.effectiveness || 0,
        sideEffects: record.context.sideEffects?.length || 0,
        mood: record.context.mood || 5
      }));
    
    if (cycleData.length < 10) {
      return { message: 'Insufficient data for cycle correlation analysis' };
    }
    
    const phaseAnalysis = this.analyzeByPhase(cycleData);
    const optimalPhases = this.identifyOptimalPhases(phaseAnalysis);
    
    return {
      phaseAnalysis,
      optimalPhases,
      recommendations: this.generateCycleBasedRecommendations(phaseAnalysis, optimalPhases),
      confidence: Math.min(0.9, cycleData.length / 50)
    };
  }

  analyzeByPhase(cycleData) {
    const phases = {
      menstrual: { days: [1, 2, 3, 4, 5], data: [] },
      follicular: { days: [6, 7, 8, 9, 10, 11, 12, 13], data: [] },
      ovulation: { days: [14, 15, 16], data: [] },
      luteal: { days: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], data: [] }
    };
    
    cycleData.forEach(record => {
      const phase = this.getPhaseForDay(record.cycleDay);
      if (phase && phases[phase]) {
        phases[phase].data.push(record);
      }
    });
    
    Object.keys(phases).forEach(phase => {
      if (phases[phase].data.length > 0) {
        phases[phase].averageEffectiveness = this.calculateAverage(phases[phase].data, 'effectiveness');
        phases[phase].averageSideEffects = this.calculateAverage(phases[phase].data, 'sideEffects');
        phases[phase].averageMood = this.calculateAverage(phases[phase].data, 'mood');
        phases[phase].sampleSize = phases[phase].data.length;
      }
    });
    
    return phases;
  }

  getPhaseForDay(cycleDay) {
    if (cycleDay <= 5) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 16) return 'ovulation';
    if (cycleDay <= 28) return 'luteal';
    return null;
  }

  analyzeOptimalTiming(medication, recentData) {
    const timingData = recentData
      .filter(record => record.actualTime && record.context?.effectiveness)
      .map(record => ({
        hour: new Date(record.actualTime).getHours(),
        effectiveness: record.context.effectiveness,
        sideEffects: record.context.sideEffects?.length || 0
      }));
    
    if (timingData.length < 10) {
      return { message: 'Insufficient data for timing analysis' };
    }
    
    const hourlyAnalysis = this.groupByHour(timingData);
    const optimalHours = this.identifyOptimalHours(hourlyAnalysis);
    
    return {
      hourlyAnalysis,
      optimalHours,
      currentTiming: this.getCurrentTiming(medication),
      recommendations: this.generateTimingRecommendations(optimalHours, medication),
      confidence: Math.min(0.85, timingData.length / 30)
    };
  }

  groupByHour(timingData) {
    const hourlyStats = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = {
        effectiveness: [],
        sideEffects: [],
        count: 0
      };
    }
    
    timingData.forEach(record => {
      const hour = record.hour;
      if (hourlyStats[hour]) {
        hourlyStats[hour].effectiveness.push(record.effectiveness);
        hourlyStats[hour].sideEffects.push(record.sideEffects);
        hourlyStats[hour].count++;
      }
    });
    
    Object.keys(hourlyStats).forEach(hour => {
      const stats = hourlyStats[hour];
      if (stats.count > 0) {
        stats.averageEffectiveness = stats.effectiveness.reduce((sum, val) => sum + val, 0) / stats.count;
        stats.averageSideEffects = stats.sideEffects.reduce((sum, val) => sum + val, 0) / stats.count;
        stats.score = stats.averageEffectiveness - (stats.averageSideEffects * 0.5);
      }
    });
    
    return hourlyStats;
  }

  generateComprehensiveRecommendations(medication, recentData) {
    const recommendations = [];
    
    const effectiveness = this.calculateOverallEffectiveness(recentData);
    const adherence = this.adherenceTracker.getAdherenceStatus(medication.id);
    
    // Effectiveness recommendations
    if (effectiveness.score < 5) {
      if (effectiveness.trend < -0.1) {
        recommendations.push({
          type: 'effectiveness',
          priority: 'high',
          message: 'Medication effectiveness is declining',
          actions: [
            'Consult prescriber about dosage adjustment',
            'Review timing and administration',
            'Consider alternative treatments'
          ]
        });
      } else {
        recommendations.push({
          type: 'effectiveness',
          priority: 'medium',
          message: 'Low effectiveness detected',
          actions: [
            'Ensure proper administration technique',
            'Track symptoms more consistently',
            'Discuss with healthcare provider'
          ]
        });
      }
    }
    
    // Adherence recommendations
    if (adherence.score < 0.8) {
      recommendations.push({
        type: 'adherence',
        priority: 'high',
        message: 'Adherence below optimal level',
        actions: [
          'Set up dose reminders',
          'Identify barriers to taking medication',
          'Consider simplifying regimen'
        ]
      });
    }
    
    // Cycle-based recommendations
    const cycleCorrelations = this.analyzeCycleCorrelations(medication, recentData);
    if (cycleCorrelations.optimalPhases) {
      recommendations.push({
        type: 'cycle_optimization',
        priority: 'medium',
        message: 'Effectiveness varies by cycle phase',
        actions: [
          `Best effectiveness during ${cycleCorrelations.optimalPhases[0]} phase`,
          'Consider phase-specific dosing',
          'Track symptoms by cycle phase'
        ]
      });
    }
    
    return this.prioritizeRecommendations(recommendations);
  }

  prioritizeRecommendations(recommendations) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
      .slice(0, 5); // Top 5 recommendations
  }

  calculateTrend(values) {
    if (values.length < 3) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  calculateAverage(data, field) {
    if (data.length === 0) return 0;
    const values = data.map(item => item[field]).filter(val => val !== undefined);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  generateId() {
    return 'med_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  estimateCycleDay(timestamp) {
    const date = new Date(timestamp);
    const dayOfMonth = date.getDate();
    return ((dayOfMonth - 1) % 28) + 1;
  }

  getAllMedications() {
    return [...this.medications.values(), ...this.supplements.values()];
  }

  exportMedicationData() {
    return {
      medications: Array.from(this.medications.entries()),
      supplements: Array.from(this.supplements.entries()),
      adherenceData: this.adherenceTracker.exportData(),
      effectivenessData: this.effectivenessAnalyzer.exportData(),
      metadata: {
        totalMedications: this.medications.size,
        totalSupplements: this.supplements.size,
        dateRange: this.getDateRange()
      }
    };
  }

  getDateRange() {
    const allData = [];
    this.getAllMedications().forEach(med => {
      allData.push(...med.doseHistory.map(dose => dose.timestamp));
      allData.push(med.startDate);
    });
    
    if (allData.length === 0) return null;
    
    return {
      start: new Date(Math.min(...allData)),
      end: new Date(Math.max(...allData)),
      totalDays: Math.ceil((Math.max(...allData) - Math.min(...allData)) / (1000 * 60 * 60 * 24))
    };
  }
}

class AdherenceTracker {
  constructor() {
    this.adherenceData = new Map();
  }

  updateAdherence(medicationId, doseRecord) {
    if (!this.adherenceData.has(medicationId)) {
      this.adherenceData.set(medicationId, {
        totalDoses: 0,
        adherentDoses: 0,
        missedDoses: 0,
        latedoses: 0,
        earlyDoses: 0,
        recentPattern: [],
        streaks: { current: 0, longest: 0 }
      });
    }

    const data = this.adherenceData.get(medicationId);
    data.totalDoses++;
    
    if (doseRecord.adherence >= 0.8) {
      data.adherentDoses++;
      data.streaks.current++;
      data.streaks.longest = Math.max(data.streaks.longest, data.streaks.current);
    } else {
      data.streaks.current = 0;
      if (doseRecord.adherence === 0) {
        data.missedDoses++;
      } else {
        data.latedoses++;
      }
    }
    
    data.recentPattern.push(doseRecord.adherence);
    if (data.recentPattern.length > 30) {
      data.recentPattern.shift();
    }
  }

  getAdherenceStatus(medicationId) {
    const data = this.adherenceData.get(medicationId);
    if (!data || data.totalDoses === 0) {
      return { score: 1, message: 'No adherence data available' };
    }

    const score = data.adherentDoses / data.totalDoses;
    const recentScore = data.recentPattern.length > 0 ?
      data.recentPattern.reduce((sum, val) => sum + val, 0) / data.recentPattern.length : score;
    
    return {
      score,
      recentScore,
      category: this.getAdherenceCategory(score),
      streaks: data.streaks,
      missedDoses: data.missedDoses,
      totalDoses: data.totalDoses,
      trend: this.calculateAdherenceTrend(data.recentPattern),
      recommendations: this.getAdherenceRecommendations(score, recentScore)
    };
  }

  getAdherenceCategory(score) {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.8) return 'good';
    if (score >= 0.6) return 'moderate';
    if (score >= 0.4) return 'poor';
    return 'very_poor';
  }

  calculateAdherenceTrend(recentPattern) {
    if (recentPattern.length < 5) return 0;
    
    const recent = recentPattern.slice(-7);
    const earlier = recentPattern.slice(-14, -7);
    
    if (earlier.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;
    
    return recentAvg - earlierAvg;
  }

  getAdherenceRecommendations(score, recentScore) {
    const recommendations = [];
    
    if (score < 0.8) {
      recommendations.push('Consider setting up medication reminders');
      recommendations.push('Identify and address barriers to taking medication');
    }
    
    if (recentScore < score - 0.1) {
      recommendations.push('Recent adherence declining - review current routine');
    }
    
    if (score >= 0.9) {
      recommendations.push('Excellent adherence! Keep up the good work');
    }
    
    return recommendations;
  }

  exportData() {
    return Array.from(this.adherenceData.entries());
  }
}

class EffectivenessAnalyzer {
  constructor() {
    this.effectivenessData = new Map();
  }

  analyzeEffectiveness(medication) {
    const recentSymptoms = medication.symptomHistory.slice(-30);
    const targetSymptoms = medication.targetSymptoms || [];
    
    if (recentSymptoms.length === 0 || targetSymptoms.length === 0) {
      return { message: 'Insufficient data for effectiveness analysis' };
    }
    
    const effectiveness = {
      overall: this.calculateOverallEffectiveness(recentSymptoms, targetSymptoms),
      bySymptom: this.analyzeSymptomSpecific(recentSymptoms, targetSymptoms),
      timeToEffect: this.calculateTimeToEffect(medication),
      durationOfEffect: this.calculateDurationOfEffect(recentSymptoms),
      doseResponse: this.analyzeDoseResponse(medication),
      consistency: this.analyzeConsistency(recentSymptoms)
    };
    
    this.effectivenessData.set(medication.id, effectiveness);
    return effectiveness;
  }

  calculateOverallEffectiveness(symptoms, targets) {
    const targetScores = targets.map(target => {
      const relevantSymptoms = symptoms.filter(symptom => 
        symptom.type === target || symptom.relatedTo?.includes(target)
      );
      
      if (relevantSymptoms.length === 0) return 0;
      
      const improvement = this.calculateImprovement(relevantSymptoms);
      return improvement;
    });
    
    const averageImprovement = targetScores.reduce((sum, score) => sum + score, 0) / targetScores.length;
    
    return {
      score: Math.max(0, Math.min(10, averageImprovement)),
      confidence: Math.min(0.9, symptoms.length / 20),
      targetsCovered: targetScores.filter(score => score > 0).length
    };
  }

  calculateImprovement(symptoms) {
    if (symptoms.length < 2) return 0;
    
    // Compare recent symptoms to earlier ones
    const recent = symptoms.slice(-7);
    const earlier = symptoms.slice(0, 7);
    
    const recentAvg = recent.reduce((sum, s) => sum + (s.severity || 5), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, s) => sum + (s.severity || 5), 0) / earlier.length;
    
    // Improvement = reduction in severity
    return Math.max(0, (earlierAvg - recentAvg) * 2); // Scale to 0-10
  }

  exportData() {
    return Array.from(this.effectivenessData.entries());
  }
}

class SideEffectMonitor {
  constructor() {
    this.sideEffectData = new Map();
    this.alertThresholds = this.initializeThresholds();
  }

  checkForAlerts(medicationId, doseRecord) {
    const sideEffects = doseRecord.context?.sideEffects || [];
    const alerts = [];
    
    sideEffects.forEach(effect => {
      const severity = effect.severity || 1;
      const threshold = this.alertThresholds[effect.type] || { moderate: 5, severe: 8 };
      
      if (severity >= threshold.severe) {
        alerts.push({
          type: 'severe_side_effect',
          effect: effect.type,
          severity,
          recommendation: 'Contact healthcare provider immediately'
        });
      } else if (severity >= threshold.moderate) {
        alerts.push({
          type: 'moderate_side_effect',
          effect: effect.type,
          severity,
          recommendation: 'Monitor closely and consider medical consultation'
        });
      }
    });
    
    return alerts;
  }

  analyzeSideEffects(medication) {
    const allSideEffects = [];
    medication.doseHistory.forEach(dose => {
      if (dose.context?.sideEffects) {
        allSideEffects.push(...dose.context.sideEffects.map(effect => ({
          ...effect,
          timestamp: dose.timestamp
        })));
      }
    });
    
    if (allSideEffects.length === 0) {
      return { message: 'No side effects reported' };
    }
    
    return {
      frequency: this.calculateSideEffectFrequency(allSideEffects),
      severity: this.analyzeSeverity(allSideEffects),
      patterns: this.identifySideEffectPatterns(allSideEffects),
      riskAssessment: this.assessOverallRisk(allSideEffects),
      recommendations: this.generateSideEffectRecommendations(allSideEffects)
    };
  }

  calculateSideEffectFrequency(sideEffects) {
    const frequency = {};
    sideEffects.forEach(effect => {
      frequency[effect.type] = (frequency[effect.type] || 0) + 1;
    });
    
    const total = sideEffects.length;
    Object.keys(frequency).forEach(type => {
      frequency[type] = {
        count: frequency[type],
        percentage: (frequency[type] / total) * 100
      };
    });
    
    return frequency;
  }

  initializeThresholds() {
    return {
      nausea: { moderate: 4, severe: 7 },
      headache: { moderate: 5, severe: 8 },
      dizziness: { moderate: 4, severe: 7 },
      fatigue: { moderate: 6, severe: 8 },
      mood_changes: { moderate: 5, severe: 8 },
      skin_reaction: { moderate: 3, severe: 6 },
      gastrointestinal: { moderate: 4, severe: 7 }
    };
  }
}

class InteractionChecker {
  constructor() {
    this.interactionDatabase = this.initializeInteractionDatabase();
  }

  checkInteractions(newMedication, existingMedications) {
    const interactions = [];
    
    existingMedications.forEach(existing => {
      if (existing.id !== newMedication.id) {
        const interaction = this.checkPairwiseInteraction(newMedication, existing);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    });
    
    return {
      interactions,
      riskLevel: this.assessOverallInteractionRisk(interactions),
      recommendations: this.generateInteractionRecommendations(interactions)
    };
  }

  checkPairwiseInteraction(med1, med2) {
    // Simplified interaction checking - would use comprehensive database in production
    const key = this.generateInteractionKey(med1.name, med2.name);
    const interaction = this.interactionDatabase[key];
    
    if (interaction) {
      return {
        medications: [med1.name, med2.name],
        severity: interaction.severity,
        mechanism: interaction.mechanism,
        effect: interaction.effect,
        management: interaction.management
      };
    }
    
    return null;
  }

  generateInteractionKey(name1, name2) {
    return [name1, name2].sort().join('_');
  }

  initializeInteractionDatabase() {
    // Simplified database - would be comprehensive in production
    return {
      'ibuprofen_aspirin': {
        severity: 'moderate',
        mechanism: 'Increased bleeding risk',
        effect: 'Enhanced anticoagulation',
        management: 'Monitor for bleeding signs'
      }
      // Many more interactions would be included
    };
  }
}

class DosageOptimizer {
  constructor() {
    this.optimizationHistory = new Map();
  }

  suggestAdjustments(medication) {
    const effectiveness = this.analyzeCurrentEffectiveness(medication);
    const sideEffects = this.analyzeSideEffectBurden(medication);
    const adherence = this.analyzeAdherence(medication);
    
    const suggestions = [];
    
    // Low effectiveness suggestions
    if (effectiveness.score < 5 && sideEffects.severity < 5) {
      suggestions.push({
        type: 'increase_dose',
        rationale: 'Low effectiveness with tolerable side effects',
        suggestion: 'Consider gradual dose increase',
        caution: 'Consult prescriber before making changes'
      });
    }
    
    // High side effect burden
    if (sideEffects.severity > 7 && effectiveness.score < 8) {
      suggestions.push({
        type: 'reduce_dose',
        rationale: 'High side effect burden',
        suggestion: 'Consider dose reduction or alternative',
        caution: 'May reduce effectiveness'
      });
    }
    
    // Poor adherence due to frequency
    if (adherence.score < 0.7 && medication.frequency > 2) {
      suggestions.push({
        type: 'reduce_frequency',
        rationale: 'Poor adherence with frequent dosing',
        suggestion: 'Consider extended-release formulation',
        benefit: 'May improve adherence'
      });
    }
    
    return {
      suggestions,
      currentOptimality: this.assessCurrentOptimality(effectiveness, sideEffects, adherence),
      confidence: this.calculateOptimizationConfidence(medication)
    };
  }

  analyzeCurrentEffectiveness(medication) {
    const recentDoses = medication.doseHistory.slice(-14);
    if (recentDoses.length === 0) return { score: 0 };
    
    const effectivenessScores = recentDoses
      .filter(dose => dose.context?.effectiveness)
      .map(dose => dose.context.effectiveness);
    
    return {
      score: effectivenessScores.length > 0 ?
        effectivenessScores.reduce((sum, score) => sum + score, 0) / effectivenessScores.length : 0,
      trend: this.calculateEffectivenessTrend(effectivenessScores),
      consistency: this.calculateConsistency(effectivenessScores)
    };
  }

  calculateEffectivenessTrend(scores) {
    if (scores.length < 3) return 0;
    
    const recent = scores.slice(-5);
    const earlier = scores.slice(-10, -5);
    
    if (earlier.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;
    
    return recentAvg - earlierAvg;
  }

  calculateConsistency(values) {
    if (values.length < 2) return 1;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.max(0, 1 - (Math.sqrt(variance) / 10)); // Normalize to 0-1
  }
}

class OutcomePredictor {
  constructor() {
    this.predictionModels = this.initializePredictionModels();
  }

  predict(medication, recentData) {
    if (recentData.length < 7) {
      return { message: 'Insufficient data for predictions' };
    }
    
    const predictions = {
      nextWeekEffectiveness: this.predictEffectiveness(medication, recentData),
      adherenceLikelihood: this.predictAdherence(medication, recentData),
      sideEffectRisk: this.predictSideEffects(medication, recentData),
      optimalOutcome: this.predictOptimalOutcome(medication, recentData),
      discontinuationRisk: this.assessDiscontinuationRisk(medication, recentData)
    };
    
    return predictions;
  }

  predictEffectiveness(medication, recentData) {
    const effectivenessHistory = recentData
      .filter(record => record.context?.effectiveness)
      .map(record => record.context.effectiveness);
    
    if (effectivenessHistory.length < 3) {
      return { prediction: 'unknown', confidence: 0 };
    }
    
    const trend = this.calculateTrend(effectivenessHistory);
    const current = effectivenessHistory[effectivenessHistory.length - 1];
    const predicted = Math.max(0, Math.min(10, current + trend * 7)); // Project 7 days forward
    
    return {
      prediction: predicted,
      confidence: Math.min(0.8, effectivenessHistory.length / 20),
      trend: trend > 0.1 ? 'improving' : trend < -0.1 ? 'declining' : 'stable'
    };
  }

  calculateTrend(values) {
    if (values.length < 3) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  initializePredictionModels() {
    return {
      effectiveness: 'linear_regression_v1',
      adherence: 'logistic_regression_v1',
      sideEffects: 'risk_assessment_v1'
    };
  }
}