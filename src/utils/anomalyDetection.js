// Enhanced Anomaly Detection with Medical Insight Recommendations
// Advanced system for identifying cycle irregularities and providing medical guidance

import { analyzeHormonalPatterns } from './hormonalPatterns.js';
import { analyzeLifestyleFactors } from './multiFactor.js';

/**
 * Medical-Grade Anomaly Detection System
 * Identifies cycle irregularities and provides evidence-based recommendations
 */
export class MedicalAnomalyDetector {
  constructor(cycles = [], symptoms = [], medications = [], lifestyleData = {}) {
    this.cycles = cycles;
    this.symptoms = symptoms;
    this.medications = medications;
    this.lifestyleData = lifestyleData;
    
    // Medical reference ranges and thresholds
    this.medicalThresholds = {
      cycle_length: { min: 21, max: 35, optimal: [26, 30] },
      cycle_variation: { normal: 7, concerning: 14, severe: 21 },
      flow_duration: { min: 2, max: 8, optimal: [3, 7] },
      symptom_severity: { mild: 1, moderate: 2, severe: 3, extreme: 4 },
      pms_duration: { normal: 7, concerning: 14, severe: 21 }
    };

    // Medical condition patterns
    this.conditionPatterns = {
      pcos: {
        indicators: ['irregular_cycles', 'long_cycles', 'acne', 'weight_gain', 'excessive_hair'],
        cycle_patterns: { length_variation: 14, average_length: 35 },
        confidence_threshold: 0.7
      },
      endometriosis: {
        indicators: ['severe_cramps', 'heavy_flow', 'chronic_pain', 'painful_periods'],
        symptom_patterns: { severity: 3, duration: 5 },
        confidence_threshold: 0.6
      },
      thyroid_dysfunction: {
        indicators: ['irregular_cycles', 'mood_changes', 'weight_changes', 'fatigue'],
        cycle_patterns: { unpredictable_length: true },
        confidence_threshold: 0.5
      },
      hormonal_imbalance: {
        indicators: ['mood_swings', 'acne', 'weight_changes', 'irregular_cycles'],
        symptom_patterns: { hormonal_symptoms: 3 },
        confidence_threshold: 0.6
      },
      perimenopause: {
        indicators: ['irregular_cycles', 'hot_flashes', 'mood_changes', 'sleep_issues'],
        age_factor: { min: 35, typical: 45 },
        confidence_threshold: 0.7
      }
    };

    // Urgency levels for medical consultation
    this.urgencyLevels = {
      emergency: {
        description: 'Seek immediate medical attention',
        timeframe: 'within 24 hours',
        color: '#dc3545'
      },
      urgent: {
        description: 'Schedule appointment within 1-2 weeks',
        timeframe: 'within 2 weeks',
        color: '#fd7e14'
      },
      routine: {
        description: 'Discuss at next routine appointment',
        timeframe: 'within 1-3 months',
        color: '#ffc107'
      },
      monitoring: {
        description: 'Continue monitoring, mention if persists',
        timeframe: 'ongoing observation',
        color: '#28a745'
      }
    };
  }

  /**
   * Perform comprehensive anomaly detection
   */
  detectAnomalies() {
    if (this.cycles.length < 2) {
      return {
        status: 'insufficient_data',
        recommendations: ['Track at least 2 cycles for anomaly detection']
      };
    }

    const analysis = {
      cycle_anomalies: this.detectCycleAnomalies(),
      symptom_anomalies: this.detectSymptomAnomalies(),
      pattern_disruptions: this.detectPatternDisruptions(),
      medical_flags: this.identifyMedicalFlags(),
      risk_assessment: this.assessOverallRisk(),
      recommendations: [],
      urgent_concerns: []
    };

    // Generate comprehensive recommendations
    analysis.recommendations = this.generateMedicalRecommendations(analysis);
    analysis.urgent_concerns = this.identifyUrgentConcerns(analysis);

    return {
      status: 'complete',
      ...analysis,
      confidence: this.calculateDetectionConfidence(analysis),
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Detect cycle-related anomalies
   */
  detectCycleAnomalies() {
    const anomalies = [];
    const cycleLengths = this.calculateCycleLengths();
    
    if (cycleLengths.length < 2) return anomalies;

    // Analyze cycle length patterns
    const lengthStats = this.calculateLengthStatistics(cycleLengths);
    
    // Detect consistently short cycles (oligomenorrhea risk)
    if (lengthStats.average < this.medicalThresholds.cycle_length.min) {
      anomalies.push({
        type: 'short_cycles',
        severity: 'moderate',
        description: 'Consistently short menstrual cycles detected',
        average_length: lengthStats.average,
        medical_concern: 'Possible hormonal imbalance or ovulation issues',
        urgency: 'routine',
        recommendation: 'Consider hormone level testing'
      });
    }

    // Detect consistently long cycles (PCOS risk)
    if (lengthStats.average > this.medicalThresholds.cycle_length.max) {
      anomalies.push({
        type: 'long_cycles',
        severity: 'moderate',
        description: 'Consistently long menstrual cycles detected',
        average_length: lengthStats.average,
        medical_concern: 'Possible PCOS or thyroid dysfunction',
        urgency: 'urgent',
        recommendation: 'Hormone panel and PCOS screening recommended'
      });
    }

    // Detect high cycle variation (irregular cycles)
    if (lengthStats.variation > this.medicalThresholds.cycle_variation.concerning) {
      const severity = lengthStats.variation > this.medicalThresholds.cycle_variation.severe ? 'high' : 'moderate';
      anomalies.push({
        type: 'irregular_cycles',
        severity,
        description: 'High cycle length variability detected',
        variation: lengthStats.variation,
        medical_concern: 'Possible hormonal imbalance or underlying condition',
        urgency: severity === 'high' ? 'urgent' : 'routine',
        recommendation: 'Comprehensive hormone evaluation recommended'
      });
    }

    // Detect missed periods (amenorrhea risk)
    const missedPeriods = this.detectMissedPeriods();
    if (missedPeriods.count > 0) {
      anomalies.push({
        type: 'missed_periods',
        severity: missedPeriods.count > 2 ? 'high' : 'moderate',
        description: `${missedPeriods.count} missed period(s) detected`,
        details: missedPeriods.details,
        medical_concern: 'Possible pregnancy, hormonal imbalance, or medical condition',
        urgency: missedPeriods.count > 2 ? 'urgent' : 'routine',
        recommendation: 'Pregnancy test and medical evaluation if negative'
      });
    }

    // Detect very frequent periods (polymenorrhea)
    const frequentPeriods = cycleLengths.filter(l => l < 21);
    if (frequentPeriods.length >= 3) {
      anomalies.push({
        type: 'frequent_periods',
        severity: 'moderate',
        description: 'Frequent menstrual cycles detected',
        occurrences: frequentPeriods.length,
        medical_concern: 'Possible hormonal imbalance or uterine issues',
        urgency: 'routine',
        recommendation: 'Hormone testing and pelvic examination'
      });
    }

    return anomalies;
  }

  /**
   * Detect symptom-related anomalies
   */
  detectSymptomAnomalies() {
    const anomalies = [];
    
    // Analyze symptom patterns across cycles
    const symptomAnalysis = this.analyzeSymptomPatterns();
    
    // Detect severe pain patterns
    const severePainSymptoms = this.symptoms.filter(s => 
      ['cramps', 'back-pain', 'headache'].includes(s.type) && 
      ['severe', 'extreme'].includes(s.severity)
    );

    if (severePainSymptoms.length >= 5) {
      anomalies.push({
        type: 'chronic_severe_pain',
        severity: 'high',
        description: 'Recurring severe pain symptoms detected',
        occurrences: severePainSymptoms.length,
        medical_concern: 'Possible endometriosis, fibroids, or other gynecological condition',
        urgency: 'urgent',
        recommendation: 'Gynecological examination and imaging studies'
      });
    }

    // Detect unusual bleeding patterns
    const bleedingAnomalies = this.detectBleedingAnomalies();
    if (bleedingAnomalies.length > 0) {
      anomalies.push(...bleedingAnomalies);
    }

    // Detect mood-related concerns
    const moodAnomalies = this.detectMoodAnomalies();
    if (moodAnomalies.length > 0) {
      anomalies.push(...moodAnomalies);
    }

    // Detect concerning symptom clusters
    const clusterAnomalies = this.detectSymptomClusters();
    anomalies.push(...clusterAnomalies);

    return anomalies;
  }

  /**
   * Detect pattern disruptions over time
   */
  detectPatternDisruptions() {
    const disruptions = [];
    
    // Analyze recent vs historical patterns
    const recentCycles = this.cycles.slice(-6); // Last 6 cycles
    const historicalCycles = this.cycles.slice(0, -6); // Earlier cycles

    if (recentCycles.length >= 3 && historicalCycles.length >= 3) {
      const recentStats = this.calculateLengthStatistics(
        this.calculateCycleLengthsFor(recentCycles)
      );
      const historicalStats = this.calculateLengthStatistics(
        this.calculateCycleLengthsFor(historicalCycles)
      );

      // Detect significant pattern changes
      const avgLengthChange = Math.abs(recentStats.average - historicalStats.average);
      const variationChange = Math.abs(recentStats.variation - historicalStats.variation);

      if (avgLengthChange > 7) {
        disruptions.push({
          type: 'cycle_length_shift',
          severity: 'moderate',
          description: 'Significant change in average cycle length',
          change: recentStats.average - historicalStats.average,
          medical_concern: 'Possible hormonal changes or new health condition',
          urgency: 'routine',
          recommendation: 'Monitor patterns and discuss with healthcare provider'
        });
      }

      if (variationChange > 10) {
        disruptions.push({
          type: 'regularity_change',
          severity: 'moderate',
          description: 'Change in cycle regularity pattern',
          change: variationChange,
          medical_concern: 'Possible stress, lifestyle, or hormonal factor changes',
          urgency: 'monitoring',
          recommendation: 'Review lifestyle factors and stress management'
        });
      }
    }

    // Detect medication-related disruptions
    const medicationDisruptions = this.detectMedicationRelatedDisruptions();
    disruptions.push(...medicationDisruptions);

    return disruptions;
  }

  /**
   * Identify medical flags based on established patterns
   */
  identifyMedicalFlags() {
    const flags = [];
    
    // Screen for common conditions
    Object.entries(this.conditionPatterns).forEach(([condition, pattern]) => {
      const matchScore = this.calculateConditionMatch(condition, pattern);
      
      if (matchScore.confidence >= pattern.confidence_threshold) {
        flags.push({
          condition,
          confidence: Math.round(matchScore.confidence * 100),
          indicators: matchScore.indicators,
          description: this.getConditionDescription(condition),
          urgency: this.getConditionUrgency(condition),
          recommendation: this.getConditionRecommendation(condition),
          next_steps: this.getConditionNextSteps(condition)
        });
      }
    });

    // Age-related screening flags
    const ageFlags = this.identifyAgeRelatedFlags();
    flags.push(...ageFlags);

    return flags;
  }

  /**
   * Calculate condition match based on symptoms and patterns
   */
  calculateConditionMatch(condition, pattern) {
    let score = 0;
    let maxScore = 0;
    const matchedIndicators = [];

    // Check symptom indicators
    if (pattern.indicators) {
      pattern.indicators.forEach(indicator => {
        maxScore += 1;
        if (this.hasIndicator(indicator)) {
          score += 1;
          matchedIndicators.push(indicator);
        }
      });
    }

    // Check cycle patterns
    if (pattern.cycle_patterns) {
      maxScore += Object.keys(pattern.cycle_patterns).length;
      Object.entries(pattern.cycle_patterns).forEach(([patternType, threshold]) => {
        if (this.matchesCyclePattern(patternType, threshold)) {
          score += 1;
          matchedIndicators.push(`cycle_${patternType}`);
        }
      });
    }

    // Check age factors (for conditions like perimenopause)
    if (pattern.age_factor) {
      // This would require user age data - placeholder for now
      maxScore += 1;
      // score += this.matchesAgePattern(pattern.age_factor) ? 1 : 0;
    }

    return {
      confidence: maxScore > 0 ? score / maxScore : 0,
      indicators: matchedIndicators,
      score,
      maxScore
    };
  }

  /**
   * Check if user has specific indicator
   */
  hasIndicator(indicator) {
    const symptomMap = {
      'irregular_cycles': () => this.calculateCycleLengthVariation() > 14,
      'long_cycles': () => this.getAverageCycleLength() > 35,
      'severe_cramps': () => this.hasSevereSymptom('cramps'),
      'heavy_flow': () => this.hasHeavyFlow(),
      'acne': () => this.hasSymptom('acne'),
      'mood_swings': () => this.hasSymptom('mood-swings'),
      'hot_flashes': () => this.hasSymptom('hot-flashes'),
      'weight_gain': () => this.hasWeightChanges('gain'),
      'excessive_hair': () => this.hasSymptom('hair-changes'),
      'chronic_pain': () => this.hasChronicPain(),
      'painful_periods': () => this.hasPainfulPeriods(),
      'mood_changes': () => this.hasMoodSymptoms(),
      'weight_changes': () => this.hasWeightChanges('any'),
      'fatigue': () => this.hasSymptom('fatigue'),
      'sleep_issues': () => this.hasSymptom('insomnia')
    };

    return symptomMap[indicator] ? symptomMap[indicator]() : false;
  }

  /**
   * Check if cycle patterns match condition criteria
   */
  matchesCyclePattern(patternType, threshold) {
    switch (patternType) {
      case 'length_variation':
        return this.calculateCycleLengthVariation() >= threshold;
      case 'average_length':
        return this.getAverageCycleLength() >= threshold;
      case 'unpredictable_length':
        return this.calculateCycleLengthVariation() > 14;
      default:
        return false;
    }
  }

  /**
   * Assess overall risk level
   */
  assessOverallRisk() {
    const cycleAnomalies = this.detectCycleAnomalies();
    const symptomAnomalies = this.detectSymptomAnomalies();
    const medicalFlags = this.identifyMedicalFlags();

    const highSeverityCount = [...cycleAnomalies, ...symptomAnomalies]
      .filter(a => a.severity === 'high').length;
    const moderateSeverityCount = [...cycleAnomalies, ...symptomAnomalies]
      .filter(a => a.severity === 'moderate').length;
    const urgentConcerns = [...cycleAnomalies, ...symptomAnomalies]
      .filter(a => a.urgency === 'urgent').length;
    const medicalFlagCount = medicalFlags.filter(f => f.confidence >= 70).length;

    let riskLevel, riskScore;

    if (highSeverityCount >= 2 || urgentConcerns >= 2 || medicalFlagCount >= 2) {
      riskLevel = 'high';
      riskScore = 80 + Math.min(20, highSeverityCount * 5 + urgentConcerns * 5);
    } else if (highSeverityCount >= 1 || moderateSeverityCount >= 3 || medicalFlagCount >= 1) {
      riskLevel = 'moderate';
      riskScore = 50 + Math.min(30, moderateSeverityCount * 5 + medicalFlagCount * 10);
    } else if (moderateSeverityCount >= 1) {
      riskLevel = 'low';
      riskScore = 20 + Math.min(30, moderateSeverityCount * 10);
    } else {
      riskLevel = 'minimal';
      riskScore = Math.max(0, 10 - cycleLengths.length); // Lower with more data
    }

    return {
      level: riskLevel,
      score: Math.min(100, riskScore),
      factors: {
        high_severity_anomalies: highSeverityCount,
        moderate_severity_anomalies: moderateSeverityCount,
        urgent_concerns: urgentConcerns,
        medical_flags: medicalFlagCount
      },
      description: this.getRiskDescription(riskLevel),
      recommendation: this.getRiskRecommendation(riskLevel)
    };
  }

  /**
   * Generate comprehensive medical recommendations
   */
  generateMedicalRecommendations(analysis) {
    const recommendations = [];

    // Recommendations based on cycle anomalies
    analysis.cycle_anomalies.forEach(anomaly => {
      recommendations.push({
        type: 'medical_evaluation',
        priority: this.getUrgencyPriority(anomaly.urgency),
        title: this.getAnomalyTitle(anomaly.type),
        description: anomaly.description,
        actions: [anomaly.recommendation],
        medical_specialty: this.getRecommendedSpecialty(anomaly.type),
        timeframe: this.urgencyLevels[anomaly.urgency].timeframe
      });
    });

    // Recommendations based on medical flags
    analysis.medical_flags.forEach(flag => {
      recommendations.push({
        type: 'condition_screening',
        priority: this.getUrgencyPriority(flag.urgency),
        title: `${flag.condition.toUpperCase()} Screening`,
        description: `${flag.confidence}% match for ${flag.condition} indicators`,
        actions: flag.next_steps,
        medical_specialty: this.getConditionSpecialty(flag.condition),
        timeframe: this.urgencyLevels[flag.urgency].timeframe
      });
    });

    // General preventive recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'preventive_care',
        priority: 1,
        title: 'Routine Gynecological Care',
        description: 'Regular check-ups for optimal reproductive health',
        actions: ['Schedule annual gynecological exam', 'Discuss cycle patterns with healthcare provider'],
        medical_specialty: 'gynecology',
        timeframe: 'annually'
      });
    }

    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Identify urgent concerns requiring immediate attention
   */
  identifyUrgentConcerns(analysis) {
    const urgentConcerns = [];

    // Emergency-level concerns
    const emergencyConcerns = [...analysis.cycle_anomalies, ...analysis.symptom_anomalies]
      .filter(a => a.urgency === 'emergency');
    
    emergencyConcerns.forEach(concern => {
      urgentConcerns.push({
        level: 'emergency',
        title: concern.description,
        medical_concern: concern.medical_concern,
        action_required: 'Seek immediate medical attention',
        timeframe: 'within 24 hours'
      });
    });

    // Urgent-level concerns
    const urgentLevelConcerns = [...analysis.cycle_anomalies, ...analysis.symptom_anomalies]
      .filter(a => a.urgency === 'urgent');
    
    urgentLevelConcerns.forEach(concern => {
      urgentConcerns.push({
        level: 'urgent',
        title: concern.description,
        medical_concern: concern.medical_concern,
        action_required: 'Schedule medical appointment',
        timeframe: 'within 1-2 weeks'
      });
    });

    return urgentConcerns;
  }

  // Helper methods for calculations and checks

  calculateCycleLengths() {
    const lengths = [];
    for (let i = 1; i < this.cycles.length; i++) {
      const current = new Date(this.cycles[i].startDate);
      const previous = new Date(this.cycles[i - 1].startDate);
      const length = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
      if (length >= 15 && length <= 90) { // Filter unrealistic values
        lengths.push(length);
      }
    }
    return lengths;
  }

  calculateCycleLengthsFor(cycles) {
    const lengths = [];
    for (let i = 1; i < cycles.length; i++) {
      const current = new Date(cycles[i].startDate);
      const previous = new Date(cycles[i - 1].startDate);
      const length = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
      if (length >= 15 && length <= 90) {
        lengths.push(length);
      }
    }
    return lengths;
  }

  calculateLengthStatistics(lengths) {
    if (lengths.length === 0) return { average: 28, variation: 0 };

    const average = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - average, 2), 0) / lengths.length;
    const variation = Math.sqrt(variance);

    return {
      average: Math.round(average * 10) / 10,
      variation: Math.round(variation * 10) / 10,
      min: Math.min(...lengths),
      max: Math.max(...lengths)
    };
  }

  detectMissedPeriods() {
    const today = new Date();
    const lastCycle = this.cycles[this.cycles.length - 1];
    const lastPeriodStart = new Date(lastCycle.startDate);
    const avgCycleLength = this.getAverageCycleLength();
    
    const daysSinceLastPeriod = Math.ceil((today - lastPeriodStart) / (1000 * 60 * 60 * 24));
    const expectedCycles = Math.floor(daysSinceLastPeriod / avgCycleLength);
    const missedCount = Math.max(0, expectedCycles - 1); // -1 because current cycle might be in progress

    return {
      count: missedCount,
      days_since_last: daysSinceLastPeriod,
      details: missedCount > 0 ? `${missedCount} expected cycle(s) not recorded` : null
    };
  }

  detectBleedingAnomalies() {
    const anomalies = [];
    
    // Check for very heavy bleeding indicators
    const heavyBleedingSymptoms = this.symptoms.filter(s => 
      s.type === 'heavy-flow' || (s.type === 'cramps' && s.severity === 'extreme')
    );

    if (heavyBleedingSymptoms.length >= 3) {
      anomalies.push({
        type: 'heavy_bleeding',
        severity: 'moderate',
        description: 'Recurring heavy bleeding episodes',
        medical_concern: 'Possible fibroids, polyps, or hormonal imbalance',
        urgency: 'routine',
        recommendation: 'Pelvic examination and blood work'
      });
    }

    // Check for spotting between periods
    const spottingSymptoms = this.symptoms.filter(s => 
      s.type === 'spotting' || s.notes?.toLowerCase().includes('spotting')
    );

    if (spottingSymptoms.length >= 2) {
      anomalies.push({
        type: 'intermenstrual_bleeding',
        severity: 'moderate',
        description: 'Spotting between periods detected',
        medical_concern: 'Possible hormonal imbalance or structural issues',
        urgency: 'routine',
        recommendation: 'Gynecological evaluation'
      });
    }

    return anomalies;
  }

  detectMoodAnomalies() {
    const anomalies = [];
    const moodSymptoms = this.symptoms.filter(s => 
      ['mood-swings', 'depression', 'anxiety', 'irritability'].includes(s.type)
    );

    const severeMoodSymptoms = moodSymptoms.filter(s => 
      ['severe', 'extreme'].includes(s.severity)
    );

    if (severeMoodSymptoms.length >= 5) {
      anomalies.push({
        type: 'severe_pms_pmdd',
        severity: 'high',
        description: 'Severe mood symptoms suggesting PMDD',
        medical_concern: 'Possible Premenstrual Dysphoric Disorder (PMDD)',
        urgency: 'urgent',
        recommendation: 'Mental health evaluation and PMDD screening'
      });
    }

    return anomalies;
  }

  detectSymptomClusters() {
    const clusters = [];
    
    // PCOS symptom cluster
    const pcosSymptoms = this.symptoms.filter(s => 
      ['acne', 'weight-gain', 'hair-changes', 'mood-swings'].includes(s.type)
    );

    if (pcosSymptoms.length >= 3 && this.getAverageCycleLength() > 35) {
      clusters.push({
        type: 'pcos_cluster',
        severity: 'moderate',
        description: 'PCOS-related symptom cluster detected',
        medical_concern: 'Possible Polycystic Ovary Syndrome',
        urgency: 'urgent',
        recommendation: 'PCOS screening including hormone tests and ultrasound'
      });
    }

    return clusters;
  }

  detectMedicationRelatedDisruptions() {
    const disruptions = [];
    
    // Check if cycle changes correlate with medication changes
    this.medications.forEach(medication => {
      if (medication.type === 'birth-control') {
        const startDate = new Date(medication.startDate);
        const cyclesAfterStart = this.cycles.filter(c => 
          new Date(c.startDate) >= startDate
        );

        if (cyclesAfterStart.length >= 3) {
          const beforeLengths = this.calculateCycleLengthsFor(
            this.cycles.filter(c => new Date(c.startDate) < startDate)
          );
          const afterLengths = this.calculateCycleLengthsFor(cyclesAfterStart);

          if (beforeLengths.length >= 3 && afterLengths.length >= 3) {
            const beforeAvg = beforeLengths.reduce((sum, l) => sum + l, 0) / beforeLengths.length;
            const afterAvg = afterLengths.reduce((sum, l) => sum + l, 0) / afterLengths.length;

            if (Math.abs(beforeAvg - afterAvg) > 7) {
              disruptions.push({
                type: 'medication_related_change',
                severity: 'low',
                description: `Cycle changes after starting ${medication.name}`,
                medication: medication.name,
                medical_concern: 'Expected hormonal contraceptive effects',
                urgency: 'monitoring',
                recommendation: 'Monitor adaptation period, discuss concerns with prescriber'
              });
            }
          }
        }
      }
    });

    return disruptions;
  }

  // Helper methods for condition checking
  hasSymptom(symptomType) {
    return this.symptoms.some(s => s.type === symptomType);
  }

  hasSevereSymptom(symptomType) {
    return this.symptoms.some(s => 
      s.type === symptomType && ['severe', 'extreme'].includes(s.severity)
    );
  }

  hasHeavyFlow() {
    return this.cycles.some(c => c.flowIntensity === 'heavy');
  }

  hasWeightChanges(type) {
    // This would require weight tracking data
    return false; // Placeholder
  }

  hasChronicPain() {
    const painSymptoms = this.symptoms.filter(s => 
      ['cramps', 'back-pain', 'headache'].includes(s.type) && 
      ['severe', 'extreme'].includes(s.severity)
    );
    return painSymptoms.length >= 5;
  }

  hasPainfulPeriods() {
    return this.symptoms.some(s => 
      s.type === 'cramps' && ['severe', 'extreme'].includes(s.severity)
    );
  }

  hasMoodSymptoms() {
    return this.symptoms.some(s => 
      ['mood-swings', 'depression', 'anxiety', 'irritability'].includes(s.type)
    );
  }

  getAverageCycleLength() {
    const lengths = this.calculateCycleLengths();
    return lengths.length > 0 ? 
      lengths.reduce((sum, l) => sum + l, 0) / lengths.length : 28;
  }

  calculateCycleLengthVariation() {
    const lengths = this.calculateCycleLengths();
    if (lengths.length < 2) return 0;
    
    const avg = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    return Math.sqrt(variance);
  }

  // Methods for getting condition information
  getConditionDescription(condition) {
    const descriptions = {
      pcos: 'Polycystic Ovary Syndrome - hormonal disorder affecting ovulation',
      endometriosis: 'Endometriosis - tissue similar to uterine lining grows outside uterus',
      thyroid_dysfunction: 'Thyroid disorders affecting hormone regulation',
      hormonal_imbalance: 'General hormonal imbalances affecting cycle regularity',
      perimenopause: 'Perimenopause - transition period before menopause'
    };
    return descriptions[condition] || 'Unknown condition';
  }

  getConditionUrgency(condition) {
    const urgencies = {
      pcos: 'urgent',
      endometriosis: 'urgent',
      thyroid_dysfunction: 'routine',
      hormonal_imbalance: 'routine',
      perimenopause: 'routine'
    };
    return urgencies[condition] || 'routine';
  }

  getConditionRecommendation(condition) {
    const recommendations = {
      pcos: 'Hormone panel, glucose tolerance test, pelvic ultrasound',
      endometriosis: 'Pelvic exam, imaging studies, consider laparoscopy',
      thyroid_dysfunction: 'Thyroid function tests (TSH, T3, T4)',
      hormonal_imbalance: 'Comprehensive hormone panel',
      perimenopause: 'Hormone levels, bone density screening'
    };
    return recommendations[condition] || 'General medical evaluation';
  }

  getConditionNextSteps(condition) {
    const nextSteps = {
      pcos: ['Schedule endocrinologist consultation', 'PCOS-specific blood work', 'Lifestyle counseling'],
      endometriosis: ['Gynecologist referral', 'Pain management consultation', 'Imaging studies'],
      thyroid_dysfunction: ['Endocrinologist referral', 'Thyroid function monitoring'],
      hormonal_imbalance: ['Hormone specialist consultation', 'Lifestyle factor review'],
      perimenopause: ['Menopause counseling', 'Symptom management options']
    };
    return nextSteps[condition] || ['General medical consultation'];
  }

  getConditionSpecialty(condition) {
    const specialties = {
      pcos: 'endocrinology',
      endometriosis: 'gynecology',
      thyroid_dysfunction: 'endocrinology',
      hormonal_imbalance: 'gynecology',
      perimenopause: 'gynecology'
    };
    return specialties[condition] || 'gynecology';
  }

  // Additional helper methods
  analyzeSymptomPatterns() {
    // Analyze symptom frequency, severity, and timing patterns
    return {
      total_symptoms: this.symptoms.length,
      severe_symptoms: this.symptoms.filter(s => ['severe', 'extreme'].includes(s.severity)).length,
      chronic_symptoms: this.identifyChronicSymptoms()
    };
  }

  identifyChronicSymptoms() {
    const symptomCounts = {};
    this.symptoms.forEach(s => {
      symptomCounts[s.type] = (symptomCounts[s.type] || 0) + 1;
    });
    
    return Object.entries(symptomCounts)
      .filter(([, count]) => count >= 5)
      .map(([symptom]) => symptom);
  }

  identifyAgeRelatedFlags() {
    // This would require age data from user profile
    return []; // Placeholder
  }

  getRiskDescription(riskLevel) {
    const descriptions = {
      minimal: 'Your cycle patterns appear normal with no significant concerns',
      low: 'Minor irregularities detected, generally within normal variation',
      moderate: 'Some concerning patterns that warrant medical discussion',
      high: 'Multiple concerning patterns requiring medical evaluation'
    };
    return descriptions[riskLevel];
  }

  getRiskRecommendation(riskLevel) {
    const recommendations = {
      minimal: 'Continue regular tracking and routine gynecological care',
      low: 'Monitor patterns and discuss any concerns at routine appointments',
      moderate: 'Schedule medical consultation to discuss patterns',
      high: 'Seek medical evaluation promptly for comprehensive assessment'
    };
    return recommendations[riskLevel];
  }

  getUrgencyPriority(urgency) {
    const priorities = { emergency: 5, urgent: 4, routine: 3, monitoring: 2 };
    return priorities[urgency] || 2;
  }

  getAnomalyTitle(type) {
    const titles = {
      short_cycles: 'Short Menstrual Cycles',
      long_cycles: 'Long Menstrual Cycles',
      irregular_cycles: 'Irregular Cycles',
      missed_periods: 'Missed Periods',
      frequent_periods: 'Frequent Periods',
      heavy_bleeding: 'Heavy Menstrual Bleeding',
      severe_pms_pmdd: 'Severe PMS/PMDD Symptoms',
      chronic_severe_pain: 'Chronic Severe Pain'
    };
    return titles[type] || 'Cycle Irregularity';
  }

  getRecommendedSpecialty(anomalyType) {
    const specialties = {
      short_cycles: 'gynecology',
      long_cycles: 'endocrinology',
      irregular_cycles: 'gynecology',
      missed_periods: 'gynecology',
      heavy_bleeding: 'gynecology',
      severe_pms_pmdd: 'psychiatry',
      chronic_severe_pain: 'gynecology'
    };
    return specialties[anomalyType] || 'gynecology';
  }

  prioritizeRecommendations(recommendations) {
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  calculateDetectionConfidence(analysis) {
    const totalAnomalies = analysis.cycle_anomalies.length + 
                          analysis.symptom_anomalies.length;
    const dataQuality = Math.min(this.cycles.length / 6, 1); // Better with more cycles
    const symptomData = Math.min(this.symptoms.length / 10, 1); // Better with more symptoms
    
    return Math.round((dataQuality + symptomData) / 2 * 100);
  }
}

/**
 * Factory function for creating anomaly detector
 */
export function createAnomalyDetector(cycles, symptoms, medications, lifestyleData) {
  return new MedicalAnomalyDetector(cycles, symptoms, medications, lifestyleData);
}

/**
 * Quick anomaly detection function
 */
export function detectMedicalAnomalies(cycles, symptoms, medications = [], lifestyleData = {}) {
  const detector = new MedicalAnomalyDetector(cycles, symptoms, medications, lifestyleData);
  return detector.detectAnomalies();
}