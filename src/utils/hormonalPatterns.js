// Hormonal Pattern Recognition Engine
// Analyzes cycle day correlations to identify hormonal fluctuations and patterns

/**
 * Hormonal Pattern Recognition System
 * Maps symptoms and cycle characteristics to hormonal phases
 */
export class HormonalPatternAnalyzer {
  constructor(cycles = [], symptoms = [], temperatures = [], medications = []) {
    this.cycles = cycles;
    this.symptoms = symptoms;
    this.temperatures = temperatures; // BBT data when available
    this.medications = medications;
    
    // Hormonal phase characteristics based on medical research
    this.hormonalPhases = {
      menstrual: { days: [1, 2, 3, 4, 5], hormones: ['estrogen_low', 'progesterone_low'] },
      follicular_early: { days: [6, 7, 8, 9], hormones: ['estrogen_rising', 'fsh_high'] },
      follicular_late: { days: [10, 11, 12, 13], hormones: ['estrogen_peak_approaching', 'lh_rising'] },
      ovulatory: { days: [14, 15, 16], hormones: ['estrogen_peak', 'lh_surge', 'progesterone_start'] },
      luteal_early: { days: [17, 18, 19, 20, 21], hormones: ['progesterone_rising', 'estrogen_secondary'] },
      luteal_late: { days: [22, 23, 24, 25, 26, 27, 28], hormones: ['progesterone_peak', 'estrogen_decline'] }
    };

    // Symptom-hormone correlations based on research
    this.symptomHormoneMap = {
      // Estrogen-dominant symptoms
      'mood-swings': { primary: 'estrogen', phases: ['follicular_late', 'ovulatory'] },
      'breast-tenderness': { primary: 'estrogen', phases: ['follicular_late', 'ovulatory', 'luteal_early'] },
      'bloating': { primary: 'estrogen', phases: ['ovulatory', 'luteal_early'] },
      'headache': { primary: 'estrogen', phases: ['follicular_late', 'ovulatory', 'luteal_late'] },
      'skin-oiliness': { primary: 'estrogen', phases: ['follicular_late', 'ovulatory'] },
      
      // Progesterone-dominant symptoms
      'fatigue': { primary: 'progesterone', phases: ['luteal_early', 'luteal_late'] },
      'anxiety': { primary: 'progesterone', phases: ['luteal_early', 'luteal_late'] },
      'insomnia': { primary: 'progesterone', phases: ['luteal_late'] },
      'food-cravings': { primary: 'progesterone', phases: ['luteal_early', 'luteal_late'] },
      'depression': { primary: 'progesterone', phases: ['luteal_late', 'menstrual'] },
      'irritability': { primary: 'progesterone', phases: ['luteal_late'] },
      'acne': { primary: 'progesterone', phases: ['luteal_late', 'menstrual'] },
      
      // Low hormone symptoms (menstrual phase)
      'cramps': { primary: 'low_hormones', phases: ['menstrual'] },
      'back-pain': { primary: 'low_hormones', phases: ['menstrual'] },
      'nausea': { primary: 'low_hormones', phases: ['menstrual'] },
      
      // Multi-hormonal symptoms
      'brain-fog': { primary: 'multi', phases: ['luteal_late', 'menstrual'] },
      'joint-pain': { primary: 'multi', phases: ['luteal_late', 'menstrual'] },
      'hot-flashes': { primary: 'multi', phases: ['ovulatory', 'luteal_late'] }
    };
  }

  /**
   * Analyze hormonal patterns across all cycles
   */
  analyzeHormonalPatterns() {
    if (this.cycles.length < 2) {
      return { patterns: [], insights: [], confidence: 'low' };
    }

    const patterns = this.identifyHormonalPatterns();
    const insights = this.generateHormonalInsights(patterns);
    const confidence = this.calculatePatternConfidence(patterns);

    return {
      patterns,
      insights,
      confidence,
      hormonalProfile: this.buildHormonalProfile(patterns),
      recommendations: this.generateHormonalRecommendations(patterns)
    };
  }

  /**
   * Identify hormonal patterns from cycle and symptom data
   */
  identifyHormonalPatterns() {
    const patterns = [];

    this.cycles.forEach((cycle, cycleIndex) => {
      const cycleStart = new Date(cycle.startDate);
      const nextCycle = this.cycles[cycleIndex + 1];
      const cycleLength = cycle.length || this.estimateCycleLength(cycleIndex);
      
      // Get symptoms for this cycle
      const cycleSymptoms = this.getCycleSymptomsWithDays(cycle, cycleIndex, cycleLength);
      
      // Analyze each hormonal phase
      Object.entries(this.hormonalPhases).forEach(([phaseName, phaseData]) => {
        const phaseSymptoms = this.getSymptomsInPhase(cycleSymptoms, phaseData.days, cycleLength);
        
        if (phaseSymptoms.length > 0) {
          patterns.push({
            cycle: cycleIndex + 1,
            phase: phaseName,
            cycleDay: phaseData.days,
            symptoms: phaseSymptoms,
            hormonalActivity: this.analyzeHormonalActivity(phaseSymptoms, phaseName),
            intensity: this.calculatePhaseIntensity(phaseSymptoms),
            correlationScore: this.calculateCorrelationScore(phaseSymptoms, phaseName)
          });
        }
      });
    });

    return this.groupPatternsByPhase(patterns);
  }

  /**
   * Get cycle symptoms with calculated cycle days
   */
  getCycleSymptomsWithDays(cycle, cycleIndex, cycleLength) {
    const cycleStart = new Date(cycle.startDate);
    const nextCycle = this.cycles[cycleIndex + 1];
    const cycleEnd = nextCycle ? 
      new Date(nextCycle.startDate) : 
      new Date(cycleStart.getTime() + cycleLength * 24 * 60 * 60 * 1000);

    return this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate >= cycleStart && symptomDate < cycleEnd;
    }).map(symptom => ({
      ...symptom,
      cycleDay: Math.ceil((new Date(symptom.date) - cycleStart) / (1000 * 60 * 60 * 24))
    }));
  }

  /**
   * Get symptoms occurring within specific phase days
   */
  getSymptomsInPhase(cycleSymptoms, phaseDays, cycleLength) {
    // Adjust phase days for cycle length variations
    const adjustedDays = this.adjustPhaseDaysForCycleLength(phaseDays, cycleLength);
    
    return cycleSymptoms.filter(symptom => 
      adjustedDays.includes(symptom.cycleDay)
    );
  }

  /**
   * Adjust phase days based on actual cycle length
   */
  adjustPhaseDaysForCycleLength(standardDays, actualLength) {
    const standardLength = 28;
    const ratio = actualLength / standardLength;
    
    return standardDays.map(day => Math.round(day * ratio)).filter(day => day <= actualLength);
  }

  /**
   * Analyze hormonal activity for a phase based on symptoms
   */
  analyzeHormonalActivity(symptoms, phaseName) {
    const activity = {
      estrogen: 0,
      progesterone: 0,
      fsh: 0,
      lh: 0,
      overall_intensity: 0
    };

    symptoms.forEach(symptom => {
      const mapping = this.symptomHormoneMap[symptom.type];
      if (mapping) {
        const severity = this.getSeverityScore(symptom.severity);
        
        switch (mapping.primary) {
          case 'estrogen':
            activity.estrogen += severity;
            break;
          case 'progesterone':
            activity.progesterone += severity;
            break;
          case 'low_hormones':
            activity.overall_intensity += severity * 0.5;
            break;
          case 'multi':
            activity.estrogen += severity * 0.5;
            activity.progesterone += severity * 0.5;
            break;
        }
      }
    });

    // Normalize by symptom count
    const symptomCount = Math.max(symptoms.length, 1);
    Object.keys(activity).forEach(hormone => {
      activity[hormone] = Math.round((activity[hormone] / symptomCount) * 100) / 100;
    });

    return activity;
  }

  /**
   * Convert severity string to numerical score
   */
  getSeverityScore(severity) {
    const scores = { mild: 1, moderate: 2, severe: 3, extreme: 4 };
    return scores[severity] || 1;
  }

  /**
   * Calculate phase intensity based on symptom severity
   */
  calculatePhaseIntensity(symptoms) {
    if (symptoms.length === 0) return 0;

    const totalSeverity = symptoms.reduce((sum, symptom) => 
      sum + this.getSeverityScore(symptom.severity), 0);
    
    return Math.round((totalSeverity / symptoms.length) * 100) / 100;
  }

  /**
   * Calculate correlation score between symptoms and expected phase
   */
  calculateCorrelationScore(symptoms, phaseName) {
    if (symptoms.length === 0) return 0;

    let correlatedSymptoms = 0;

    symptoms.forEach(symptom => {
      const mapping = this.symptomHormoneMap[symptom.type];
      if (mapping && mapping.phases.includes(phaseName)) {
        correlatedSymptoms++;
      }
    });

    return Math.round((correlatedSymptoms / symptoms.length) * 100);
  }

  /**
   * Group patterns by hormonal phase for analysis
   */
  groupPatternsByPhase(patterns) {
    const groupedPatterns = {};

    patterns.forEach(pattern => {
      if (!groupedPatterns[pattern.phase]) {
        groupedPatterns[pattern.phase] = [];
      }
      groupedPatterns[pattern.phase].push(pattern);
    });

    // Calculate averages for each phase
    Object.keys(groupedPatterns).forEach(phase => {
      const phasePatterns = groupedPatterns[phase];
      
      groupedPatterns[phase] = {
        occurrences: phasePatterns.length,
        averageIntensity: this.calculateAverageIntensity(phasePatterns),
        averageCorrelation: this.calculateAverageCorrelation(phasePatterns),
        commonSymptoms: this.findCommonSymptoms(phasePatterns),
        hormonalProfile: this.calculateAverageHormonalActivity(phasePatterns),
        consistency: this.calculatePhaseConsistency(phasePatterns)
      };
    });

    return groupedPatterns;
  }

  /**
   * Calculate average intensity for a phase
   */
  calculateAverageIntensity(patterns) {
    const intensities = patterns.map(p => p.intensity).filter(i => i > 0);
    return intensities.length > 0 ? 
      Math.round((intensities.reduce((sum, i) => sum + i, 0) / intensities.length) * 100) / 100 : 0;
  }

  /**
   * Calculate average correlation for a phase
   */
  calculateAverageCorrelation(patterns) {
    const correlations = patterns.map(p => p.correlationScore).filter(c => c > 0);
    return correlations.length > 0 ? 
      Math.round(correlations.reduce((sum, c) => sum + c, 0) / correlations.length) : 0;
  }

  /**
   * Find most common symptoms in a phase
   */
  findCommonSymptoms(patterns) {
    const symptomCounts = {};
    
    patterns.forEach(pattern => {
      pattern.symptoms.forEach(symptom => {
        symptomCounts[symptom.type] = (symptomCounts[symptom.type] || 0) + 1;
      });
    });

    return Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({
        symptom,
        frequency: count,
        percentage: Math.round((count / patterns.length) * 100)
      }));
  }

  /**
   * Calculate average hormonal activity for a phase
   */
  calculateAverageHormonalActivity(patterns) {
    const activities = patterns.map(p => p.hormonalActivity);
    const averaged = { estrogen: 0, progesterone: 0, fsh: 0, lh: 0, overall_intensity: 0 };

    if (activities.length === 0) return averaged;

    Object.keys(averaged).forEach(hormone => {
      const values = activities.map(a => a[hormone]).filter(v => v > 0);
      averaged[hormone] = values.length > 0 ? 
        Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100 : 0;
    });

    return averaged;
  }

  /**
   * Calculate phase consistency (how regularly symptoms occur in this phase)
   */
  calculatePhaseConsistency(patterns) {
    const totalCycles = this.cycles.length;
    const occurrences = patterns.length;
    
    return Math.round((occurrences / totalCycles) * 100);
  }

  /**
   * Generate hormonal insights based on patterns
   */
  generateHormonalInsights(patterns) {
    const insights = [];

    Object.entries(patterns).forEach(([phase, data]) => {
      if (data.occurrences > 0) {
        // High correlation insight
        if (data.averageCorrelation >= 70) {
          insights.push({
            type: 'high_correlation',
            phase,
            message: `Your symptoms strongly correlate with expected ${phase.replace('_', ' ')} hormonal changes`,
            confidence: 'high',
            hormonalActivity: data.hormonalProfile
          });
        }

        // Intensity insight
        if (data.averageIntensity >= 3) {
          insights.push({
            type: 'high_intensity',
            phase,
            message: `You experience intense symptoms during ${phase.replace('_', ' ')} phase`,
            confidence: 'medium',
            recommendations: this.getIntensityRecommendations(phase)
          });
        }

        // Consistency insight
        if (data.consistency >= 80) {
          insights.push({
            type: 'high_consistency',
            phase,
            message: `Your ${phase.replace('_', ' ')} symptoms are very consistent across cycles`,
            confidence: 'high',
            predictability: data.consistency
          });
        }

        // Hormonal dominance insight
        const dominantHormone = this.identifyDominantHormone(data.hormonalProfile);
        if (dominantHormone.hormone !== 'none') {
          insights.push({
            type: 'hormonal_dominance',
            phase,
            hormone: dominantHormone.hormone,
            message: `${dominantHormone.hormone} appears dominant during your ${phase.replace('_', ' ')} phase`,
            confidence: dominantHormone.confidence,
            activity_level: dominantHormone.level
          });
        }
      }
    });

    return insights;
  }

  /**
   * Identify dominant hormone in a phase
   */
  identifyDominantHormone(profile) {
    const hormones = ['estrogen', 'progesterone'];
    let maxHormone = 'none';
    let maxLevel = 0;

    hormones.forEach(hormone => {
      if (profile[hormone] > maxLevel) {
        maxLevel = profile[hormone];
        maxHormone = hormone;
      }
    });

    if (maxLevel < 1) {
      return { hormone: 'none', level: 0, confidence: 'low' };
    }

    return {
      hormone: maxHormone,
      level: maxLevel,
      confidence: maxLevel >= 2 ? 'high' : maxLevel >= 1.5 ? 'medium' : 'low'
    };
  }

  /**
   * Get recommendations for high intensity phases
   */
  getIntensityRecommendations(phase) {
    const recommendations = {
      menstrual: [
        'Consider iron-rich foods to support energy',
        'Gentle exercise like yoga or walking',
        'Stay hydrated and rest when needed'
      ],
      follicular_early: [
        'Focus on energizing foods',
        'Gradually increase exercise intensity',
        'Support liver function with leafy greens'
      ],
      follicular_late: [
        'Monitor skin changes as estrogen peaks',
        'Consider magnesium for mood support',
        'Stay consistent with skincare routine'
      ],
      ovulatory: [
        'Track cervical mucus changes',
        'Consider vitamin B6 for hormone support',
        'Stay well hydrated'
      ],
      luteal_early: [
        'Focus on complex carbohydrates',
        'Consider calcium and vitamin D',
        'Plan for gradual energy changes'
      ],
      luteal_late: [
        'Prioritize stress management',
        'Consider evening primrose oil',
        'Maintain regular sleep schedule',
        'Plan for PMS symptom management'
      ]
    };

    return recommendations[phase] || [];
  }

  /**
   * Build comprehensive hormonal profile
   */
  buildHormonalProfile(patterns) {
    const profile = {
      overall_pattern: 'normal',
      dominant_phases: [],
      hormone_sensitivity: {},
      cycle_characteristics: {}
    };

    // Identify dominant phases (highest activity)
    const phaseIntensities = Object.entries(patterns).map(([phase, data]) => ({
      phase,
      intensity: data.averageIntensity,
      consistency: data.consistency
    })).sort((a, b) => b.intensity - a.intensity);

    profile.dominant_phases = phaseIntensities.slice(0, 2).map(p => p.phase);

    // Calculate hormone sensitivity
    Object.entries(patterns).forEach(([phase, data]) => {
      Object.entries(data.hormonalProfile).forEach(([hormone, level]) => {
        if (!profile.hormone_sensitivity[hormone]) {
          profile.hormone_sensitivity[hormone] = [];
        }
        profile.hormone_sensitivity[hormone].push({ phase, level });
      });
    });

    // Overall pattern classification
    const totalIntensity = Object.values(patterns).reduce((sum, data) => sum + data.averageIntensity, 0);
    const avgIntensity = totalIntensity / Object.keys(patterns).length;

    if (avgIntensity >= 3) {
      profile.overall_pattern = 'high_sensitivity';
    } else if (avgIntensity >= 2) {
      profile.overall_pattern = 'moderate_sensitivity';
    } else {
      profile.overall_pattern = 'low_sensitivity';
    }

    return profile;
  }

  /**
   * Generate hormonal recommendations
   */
  generateHormonalRecommendations(patterns) {
    const recommendations = [];

    // General recommendations based on overall pattern
    const overallIntensity = Object.values(patterns).reduce((sum, data) => sum + data.averageIntensity, 0) / Object.keys(patterns).length;

    if (overallIntensity >= 2.5) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        title: 'High Hormonal Sensitivity Detected',
        message: 'Consider consulting with a healthcare provider about hormone balance',
        actions: [
          'Track symptoms consistently for better pattern recognition',
          'Consider hormone-supporting nutrition',
          'Evaluate stress management techniques',
          'Discuss hormone testing with your doctor'
        ]
      });
    }

    // Phase-specific recommendations
    Object.entries(patterns).forEach(([phase, data]) => {
      if (data.averageIntensity >= 2.5 && data.consistency >= 60) {
        recommendations.push({
          type: 'phase_specific',
          phase,
          priority: 'medium',
          title: `Optimize ${phase.replace('_', ' ')} Phase`,
          message: `Consistent intense symptoms during ${phase.replace('_', ' ')} phase`,
          actions: this.getIntensityRecommendations(phase)
        });
      }
    });

    return recommendations;
  }

  /**
   * Calculate overall pattern confidence
   */
  calculatePatternConfidence(patterns) {
    const phaseCount = Object.keys(patterns).length;
    const totalOccurrences = Object.values(patterns).reduce((sum, data) => sum + data.occurrences, 0);
    const avgCorrelation = Object.values(patterns).reduce((sum, data) => sum + data.averageCorrelation, 0) / phaseCount;

    if (this.cycles.length >= 6 && avgCorrelation >= 70 && totalOccurrences >= 12) {
      return 'high';
    } else if (this.cycles.length >= 3 && avgCorrelation >= 50 && totalOccurrences >= 6) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Estimate cycle length for cycles without explicit length
   */
  estimateCycleLength(cycleIndex) {
    if (cycleIndex === this.cycles.length - 1) return 28; // Default for last cycle
    
    const currentStart = new Date(this.cycles[cycleIndex].startDate);
    const nextStart = new Date(this.cycles[cycleIndex + 1].startDate);
    
    return Math.ceil((nextStart - currentStart) / (1000 * 60 * 60 * 24));
  }

  /**
   * Predict hormonal activity for future cycles
   */
  predictHormonalActivity(targetDate) {
    const patterns = this.identifyHormonalPatterns();
    
    // Determine which phase the target date falls into
    const lastCycle = this.cycles[this.cycles.length - 1];
    const lastCycleStart = new Date(lastCycle.startDate);
    const avgCycleLength = this.calculateAverageCycleLength();
    
    // Calculate cycle day for target date
    const daysSinceLastPeriod = Math.ceil((new Date(targetDate) - lastCycleStart) / (1000 * 60 * 60 * 24));
    const cycleDay = daysSinceLastPeriod % avgCycleLength || avgCycleLength;
    
    // Determine phase
    const phase = this.getCyclePhaseForDay(cycleDay, avgCycleLength);
    
    // Return predicted activity based on historical patterns
    return {
      date: targetDate,
      cycleDay,
      phase,
      expectedActivity: patterns[phase]?.hormonalProfile || {},
      expectedSymptoms: patterns[phase]?.commonSymptoms || [],
      confidence: patterns[phase]?.consistency || 0
    };
  }

  /**
   * Calculate average cycle length
   */
  calculateAverageCycleLength() {
    if (this.cycles.length < 2) return 28;
    
    let totalLength = 0;
    let validCycles = 0;

    for (let i = 1; i < this.cycles.length; i++) {
      const length = this.estimateCycleLength(i - 1);
      if (length >= 15 && length <= 60) {
        totalLength += length;
        validCycles++;
      }
    }

    return validCycles > 0 ? Math.round(totalLength / validCycles) : 28;
  }

  /**
   * Get cycle phase for specific day
   */
  getCyclePhaseForDay(day, cycleLength) {
    const phases = Object.entries(this.hormonalPhases);
    
    for (const [phaseName, phaseData] of phases) {
      const adjustedDays = this.adjustPhaseDaysForCycleLength(phaseData.days, cycleLength);
      if (adjustedDays.includes(day)) {
        return phaseName;
      }
    }
    
    return 'unknown';
  }
}

/**
 * Factory function for creating hormonal pattern analyzer
 */
export function createHormonalAnalyzer(cycles, symptoms, temperatures = [], medications = []) {
  return new HormonalPatternAnalyzer(cycles, symptoms, temperatures, medications);
}

/**
 * Quick analysis function for integration with existing components
 */
export function analyzeHormonalPatterns(cycles, symptoms, temperatures = [], medications = []) {
  const analyzer = new HormonalPatternAnalyzer(cycles, symptoms, temperatures, medications);
  return analyzer.analyzeHormonalPatterns();
}