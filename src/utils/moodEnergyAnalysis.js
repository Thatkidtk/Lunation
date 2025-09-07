export class MoodEnergyAnalyzer {
  constructor() {
    this.moodHistory = [];
    this.energyHistory = [];
    this.correlationEngine = new CycleCorrelationEngine();
    this.patternRecognition = new MoodPatternRecognition();
    this.interventionSuggestions = new InterventionSuggestionEngine();
    this.wellnessScoring = new WellnessScoring();
  }

  analyzeMoodEnergy(moodData, energyData, cycleContext) {
    const processedMood = this.processMoodEntry(moodData);
    const processedEnergy = this.processEnergyEntry(energyData);
    
    this.moodHistory.push(processedMood);
    this.energyHistory.push(processedEnergy);
    
    const analysis = {
      currentState: this.assessCurrentState(processedMood, processedEnergy),
      cycleCorrelations: this.correlationEngine.analyzeCycleCorrelations(
        this.moodHistory, 
        this.energyHistory, 
        cycleContext
      ),
      patterns: this.patternRecognition.identifyPatterns(
        this.moodHistory, 
        this.energyHistory
      ),
      predictions: this.generatePredictions(cycleContext),
      interventions: this.interventionSuggestions.suggest(
        processedMood, 
        processedEnergy, 
        cycleContext
      ),
      wellnessScore: this.wellnessScoring.calculate(
        processedMood, 
        processedEnergy, 
        this.getRecentHistory()
      ),
      insights: this.generateInsights(processedMood, processedEnergy, cycleContext)
    };
    
    return analysis;
  }

  processMoodEntry(moodData) {
    return {
      timestamp: moodData.timestamp || Date.now(),
      overallMood: this.normalizeMoodScore(moodData.overallMood),
      emotions: this.processEmotions(moodData.emotions || {}),
      energy: this.normalizeEnergyScore(moodData.energy),
      anxiety: this.normalizeScore(moodData.anxiety),
      stress: this.normalizeScore(moodData.stress),
      irritability: this.normalizeScore(moodData.irritability),
      sadness: this.normalizeScore(moodData.sadness),
      happiness: this.normalizeScore(moodData.happiness),
      motivation: this.normalizeScore(moodData.motivation),
      socialability: this.normalizeScore(moodData.socialability),
      confidence: this.normalizeScore(moodData.confidence),
      focus: this.normalizeScore(moodData.focus),
      creativity: this.normalizeScore(moodData.creativity),
      libido: this.normalizeScore(moodData.libido),
      sleepQuality: this.normalizeScore(moodData.sleepQuality),
      triggers: moodData.triggers || [],
      notes: moodData.notes || '',
      context: this.extractContext(moodData),
      cycleDay: this.estimateCycleDay(moodData.timestamp)
    };
  }

  processEnergyEntry(energyData) {
    return {
      timestamp: energyData.timestamp || Date.now(),
      physicalEnergy: this.normalizeScore(energyData.physicalEnergy),
      mentalEnergy: this.normalizeScore(energyData.mentalEnergy),
      emotionalEnergy: this.normalizeScore(energyData.emotionalEnergy),
      fatigue: this.normalizeScore(energyData.fatigue),
      restfulness: this.normalizeScore(energyData.restfulness),
      alertness: this.normalizeScore(energyData.alertness),
      endurance: this.normalizeScore(energyData.endurance),
      recovery: this.normalizeScore(energyData.recovery),
      workCapacity: this.normalizeScore(energyData.workCapacity),
      socialEnergy: this.normalizeScore(energyData.socialEnergy),
      morningEnergy: this.normalizeScore(energyData.morningEnergy),
      afternoonEnergy: this.normalizeScore(energyData.afternoonEnergy),
      eveningEnergy: this.normalizeScore(energyData.eveningEnergy),
      exerciseResponse: this.normalizeScore(energyData.exerciseResponse),
      caffeineSensitivity: this.normalizeScore(energyData.caffeineSensitivity),
      factors: energyData.factors || [],
      interventions: energyData.interventions || [],
      cycleDay: this.estimateCycleDay(energyData.timestamp)
    };
  }

  processEmotions(emotions) {
    const processed = {};
    const emotionCategories = [
      'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
      'contentment', 'excitement', 'frustration', 'overwhelm',
      'calm', 'restless', 'hopeful', 'worried', 'grateful',
      'lonely', 'connected', 'empowered', 'vulnerable'
    ];
    
    emotionCategories.forEach(emotion => {
      processed[emotion] = this.normalizeScore(emotions[emotion] || 0);
    });
    
    return processed;
  }

  assessCurrentState(mood, energy) {
    const overallWellness = this.calculateOverallWellness(mood, energy);
    const dominantEmotions = this.identifyDominantEmotions(mood.emotions);
    const energyProfile = this.assessEnergyProfile(energy);
    const riskFlags = this.identifyRiskFlags(mood, energy);
    
    return {
      overallWellness,
      dominantEmotions,
      energyProfile,
      riskFlags,
      recommendations: this.generateImmediateRecommendations(mood, energy, riskFlags),
      cyclePhaseInfluence: this.assessCyclePhaseInfluence(mood, energy)
    };
  }

  calculateOverallWellness(mood, energy) {
    const moodScore = (
      mood.overallMood * 0.3 +
      mood.happiness * 0.2 +
      (10 - mood.anxiety) * 0.15 +
      (10 - mood.stress) * 0.15 +
      mood.confidence * 0.1 +
      mood.motivation * 0.1
    ) / 10;
    
    const energyScore = (
      energy.physicalEnergy * 0.25 +
      energy.mentalEnergy * 0.25 +
      energy.emotionalEnergy * 0.2 +
      (10 - energy.fatigue) * 0.15 +
      energy.alertness * 0.15
    ) / 10;
    
    return {
      score: (moodScore * 0.6 + energyScore * 0.4) * 10,
      moodComponent: moodScore * 10,
      energyComponent: energyScore * 10,
      category: this.getWellnessCategory((moodScore * 0.6 + energyScore * 0.4) * 10)
    };
  }

  getWellnessCategory(score) {
    if (score >= 8) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 5) return 'moderate';
    if (score >= 3) return 'low';
    return 'concerning';
  }

  identifyDominantEmotions(emotions) {
    return Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, intensity]) => ({
        emotion,
        intensity,
        description: this.getEmotionDescription(emotion, intensity)
      }));
  }

  getEmotionDescription(emotion, intensity) {
    const descriptions = {
      'joy': ['mild happiness', 'moderate joy', 'intense euphoria'],
      'sadness': ['slight melancholy', 'moderate sadness', 'deep sorrow'],
      'anger': ['mild irritation', 'moderate anger', 'intense rage'],
      'anxiety': ['slight worry', 'moderate anxiety', 'severe anxiety'],
      'calm': ['slight peace', 'moderate calm', 'deep tranquility'],
      'excitement': ['mild interest', 'moderate excitement', 'intense enthusiasm']
    };
    
    const levels = descriptions[emotion] || ['low', 'moderate', 'high'];
    const index = Math.min(2, Math.floor(intensity / 4));
    return levels[index];
  }

  assessEnergyProfile(energy) {
    return {
      primaryType: this.identifyPrimaryEnergyType(energy),
      timeOfDayPattern: this.assessTimeOfDayPattern(energy),
      sustainabilityIndex: this.calculateSustainabilityIndex(energy),
      recoveryNeeds: this.assessRecoveryNeeds(energy),
      optimizationAreas: this.identifyOptimizationAreas(energy)
    };
  }

  identifyPrimaryEnergyType(energy) {
    const scores = {
      physical: energy.physicalEnergy,
      mental: energy.mentalEnergy,
      emotional: energy.emotionalEnergy
    };
    
    const highest = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      type: highest[0],
      score: highest[1],
      balance: this.calculateEnergyBalance(scores)
    };
  }

  calculateEnergyBalance(scores) {
    const values = Object.values(scores);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return {
      mean,
      variance,
      isBalanced: variance < 2, // Low variance indicates balance
      recommendation: variance > 3 ? 'Focus on balancing energy types' : 'Well-balanced energy profile'
    };
  }

  identifyRiskFlags(mood, energy) {
    const flags = [];
    
    // Mood risk flags
    if (mood.anxiety >= 8) flags.push({
      type: 'high_anxiety',
      severity: 'high',
      message: 'High anxiety levels detected',
      recommendations: ['Practice breathing exercises', 'Consider relaxation techniques']
    });
    
    if (mood.stress >= 8) flags.push({
      type: 'high_stress',
      severity: 'high',
      message: 'High stress levels detected',
      recommendations: ['Identify stress triggers', 'Implement stress management strategies']
    });
    
    if (mood.overallMood <= 3 && mood.sadness >= 7) flags.push({
      type: 'low_mood',
      severity: 'medium',
      message: 'Consistently low mood detected',
      recommendations: ['Engage in mood-boosting activities', 'Consider professional support if persistent']
    });
    
    // Energy risk flags
    if (energy.fatigue >= 8 || energy.physicalEnergy <= 2) flags.push({
      type: 'severe_fatigue',
      severity: 'high',
      message: 'Severe fatigue detected',
      recommendations: ['Prioritize rest and recovery', 'Evaluate sleep quality', 'Consider medical evaluation']
    });
    
    if (energy.mentalEnergy <= 2 && energy.focus <= 2) flags.push({
      type: 'mental_exhaustion',
      severity: 'medium',
      message: 'Mental exhaustion indicators present',
      recommendations: ['Take mental breaks', 'Reduce cognitive load', 'Practice mindfulness']
    });
    
    return flags;
  }

  generatePredictions(cycleContext) {
    if (this.moodHistory.length < 14 || this.energyHistory.length < 14) {
      return { message: 'Need more data for accurate predictions' };
    }
    
    const cyclePredictions = this.predictByCyclePhase(cycleContext);
    const trendPredictions = this.predictByTrends();
    const seasonalPredictions = this.predictSeasonal();
    
    return {
      nextWeek: this.combineShortTermPredictions(cyclePredictions, trendPredictions),
      cyclePhases: cyclePredictions,
      trends: trendPredictions,
      seasonal: seasonalPredictions,
      interventionOpportunities: this.identifyInterventionOpportunities(),
      confidence: this.calculatePredictionConfidence()
    };
  }

  predictByCyclePhase(cycleContext) {
    const phasePatterns = this.analyzePhasePatternsHistorically();
    const currentPhase = cycleContext.currentPhase;
    const upcomingPhases = cycleContext.upcomingPhases;
    
    return {
      currentPhaseExpectations: phasePatterns[currentPhase] || null,
      upcomingPhasesPredictions: upcomingPhases.map(phase => ({
        phase: phase.name,
        startDate: phase.startDate,
        expectedMood: phasePatterns[phase.name]?.mood || null,
        expectedEnergy: phasePatterns[phase.name]?.energy || null,
        confidence: phasePatterns[phase.name]?.confidence || 0.5
      }))
    };
  }

  analyzePhasePatternsHistorically() {
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    const patterns = {};
    
    phases.forEach(phase => {
      const phaseData = this.getHistoricalDataForPhase(phase);
      if (phaseData.mood.length > 0 && phaseData.energy.length > 0) {
        patterns[phase] = {
          mood: this.calculatePhaseAverages(phaseData.mood),
          energy: this.calculatePhaseAverages(phaseData.energy),
          confidence: Math.min(0.9, phaseData.mood.length / 10) // More data = higher confidence
        };
      }
    });
    
    return patterns;
  }

  getHistoricalDataForPhase(phase) {
    // Simplified phase detection based on cycle day approximations
    const phaseRanges = {
      'menstrual': [1, 5],
      'follicular': [6, 13],
      'ovulation': [14, 16],
      'luteal': [17, 28]
    };
    
    const [start, end] = phaseRanges[phase];
    
    return {
      mood: this.moodHistory.filter(entry => 
        entry.cycleDay >= start && entry.cycleDay <= end
      ),
      energy: this.energyHistory.filter(entry => 
        entry.cycleDay >= start && entry.cycleDay <= end
      )
    };
  }

  calculatePhaseAverages(phaseData) {
    if (phaseData.length === 0) return null;
    
    const keys = Object.keys(phaseData[0]).filter(key => 
      typeof phaseData[0][key] === 'number' && 
      !['timestamp', 'cycleDay'].includes(key)
    );
    
    const averages = {};
    keys.forEach(key => {
      const values = phaseData.map(entry => entry[key]).filter(val => val !== undefined);
      if (values.length > 0) {
        averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    return averages;
  }

  generateInsights(mood, energy, cycleContext) {
    const insights = [];
    
    // Cycle-specific insights
    if (cycleContext.currentPhase === 'luteal') {
      if (mood.irritability > 6 || mood.anxiety > 6) {
        insights.push({
          type: 'cycle_insight',
          message: 'Increased irritability/anxiety common during luteal phase',
          suggestion: 'Consider stress management techniques and gentle self-care',
          confidence: 0.8
        });
      }
    }
    
    if (cycleContext.currentPhase === 'follicular') {
      if (energy.physicalEnergy > 7 && mood.motivation > 7) {
        insights.push({
          type: 'optimization_insight',
          message: 'High energy and motivation typical in follicular phase',
          suggestion: 'Great time for challenging projects and intense workouts',
          confidence: 0.9
        });
      }
    }
    
    // Pattern insights
    const recentTrend = this.calculateRecentTrend();
    if (recentTrend.mood.declining) {
      insights.push({
        type: 'trend_alert',
        message: 'Mood has been declining over recent days',
        suggestion: 'Consider what factors might be contributing and implement mood-boosting activities',
        confidence: 0.7
      });
    }
    
    if (recentTrend.energy.improving) {
      insights.push({
        type: 'positive_trend',
        message: 'Energy levels have been improving',
        suggestion: 'Great progress! Consider what strategies are working',
        confidence: 0.8
      });
    }
    
    return insights;
  }

  calculateRecentTrend() {
    const recent = {
      mood: this.moodHistory.slice(-7),
      energy: this.energyHistory.slice(-7)
    };
    
    const moodTrend = this.calculateTrendDirection(recent.mood.map(m => m.overallMood));
    const energyTrend = this.calculateTrendDirection(recent.energy.map(e => e.physicalEnergy));
    
    return {
      mood: {
        direction: moodTrend,
        improving: moodTrend > 0.1,
        declining: moodTrend < -0.1
      },
      energy: {
        direction: energyTrend,
        improving: energyTrend > 0.1,
        declining: energyTrend < -0.1
      }
    };
  }

  calculateTrendDirection(values) {
    if (values.length < 3) return 0;
    
    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  normalizeMoodScore(score) {
    return Math.max(0, Math.min(10, score || 5));
  }

  normalizeEnergyScore(score) {
    return Math.max(0, Math.min(10, score || 5));
  }

  normalizeScore(score) {
    return Math.max(0, Math.min(10, score || 0));
  }

  extractContext(data) {
    return {
      timeOfDay: new Date(data.timestamp).getHours(),
      dayOfWeek: new Date(data.timestamp).getDay(),
      weather: data.weather,
      location: data.location,
      socialContext: data.socialContext,
      workStatus: data.workStatus,
      healthFactors: data.healthFactors || []
    };
  }

  estimateCycleDay(timestamp) {
    // Simplified cycle day estimation - would integrate with actual cycle tracking
    const date = new Date(timestamp);
    const dayOfMonth = date.getDate();
    return ((dayOfMonth - 1) % 28) + 1;
  }

  getRecentHistory(days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return {
      mood: this.moodHistory.filter(entry => entry.timestamp >= cutoff),
      energy: this.energyHistory.filter(entry => entry.timestamp >= cutoff)
    };
  }

  exportMoodEnergyData() {
    return {
      moodHistory: this.moodHistory,
      energyHistory: this.energyHistory,
      patterns: this.patternRecognition.getStoredPatterns(),
      correlations: this.correlationEngine.getStoredCorrelations(),
      metadata: {
        totalMoodEntries: this.moodHistory.length,
        totalEnergyEntries: this.energyHistory.length,
        dateRange: this.getDateRange(),
        averageWellnessScore: this.calculateAverageWellness()
      }
    };
  }

  getDateRange() {
    const allEntries = [...this.moodHistory, ...this.energyHistory];
    if (allEntries.length === 0) return null;
    
    const dates = allEntries.map(entry => new Date(entry.timestamp));
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates)),
      totalDays: Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24))
    };
  }

  calculateAverageWellness() {
    if (this.moodHistory.length === 0 || this.energyHistory.length === 0) return 0;
    
    const recentMood = this.moodHistory.slice(-30);
    const recentEnergy = this.energyHistory.slice(-30);
    
    let totalWellness = 0;
    let count = 0;
    
    const minLength = Math.min(recentMood.length, recentEnergy.length);
    for (let i = 0; i < minLength; i++) {
      const wellness = this.calculateOverallWellness(recentMood[i], recentEnergy[i]);
      totalWellness += wellness.score;
      count++;
    }
    
    return count > 0 ? totalWellness / count : 0;
  }
}

class CycleCorrelationEngine {
  constructor() {
    this.correlations = new Map();
  }

  analyzeCycleCorrelations(moodHistory, energyHistory, cycleContext) {
    const correlations = {
      cyclePhaseCorrelations: this.analyzePhaseDifferences(moodHistory, energyHistory),
      hormonalCorrelations: this.analyzeHormonalInfluences(moodHistory, energyHistory, cycleContext),
      symptomCorrelations: this.analyzeSymptomMoodCorrelations(moodHistory, cycleContext),
      predictionAccuracy: this.validatePreviousPredictions(),
      recommendations: this.generateCorrelationBasedRecommendations()
    };
    
    this.storeCorrelations(correlations);
    return correlations;
  }

  analyzePhaseDifferences(moodHistory, energyHistory) {
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    const differences = {};
    
    phases.forEach(phase => {
      const moodData = moodHistory.filter(entry => this.getPhaseForCycleDay(entry.cycleDay) === phase);
      const energyData = energyHistory.filter(entry => this.getPhaseForCycleDay(entry.cycleDay) === phase);
      
      if (moodData.length > 0 && energyData.length > 0) {
        differences[phase] = {
          averageMood: this.calculateAverage(moodData, 'overallMood'),
          averageEnergy: this.calculateAverage(energyData, 'physicalEnergy'),
          commonEmotions: this.getCommonEmotions(moodData),
          energyPattern: this.getEnergyPattern(energyData),
          sampleSize: moodData.length
        };
      }
    });
    
    return differences;
  }

  getPhaseForCycleDay(cycleDay) {
    if (cycleDay <= 5) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 16) return 'ovulation';
    return 'luteal';
  }

  calculateAverage(data, field) {
    const values = data.map(item => item[field]).filter(val => val !== undefined);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  getCommonEmotions(moodData) {
    const emotionSums = {};
    
    moodData.forEach(entry => {
      Object.entries(entry.emotions || {}).forEach(([emotion, intensity]) => {
        emotionSums[emotion] = (emotionSums[emotion] || 0) + intensity;
      });
    });
    
    return Object.entries(emotionSums)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, total]) => ({
        emotion,
        averageIntensity: total / moodData.length
      }));
  }

  storeCorrelations(correlations) {
    this.correlations.set(Date.now(), correlations);
    
    // Keep only last 100 correlation analyses
    if (this.correlations.size > 100) {
      const oldest = Math.min(...this.correlations.keys());
      this.correlations.delete(oldest);
    }
  }

  getStoredCorrelations() {
    return Array.from(this.correlations.entries());
  }
}

class MoodPatternRecognition {
  constructor() {
    this.patterns = new Map();
  }

  identifyPatterns(moodHistory, energyHistory) {
    if (moodHistory.length < 14 || energyHistory.length < 14) {
      return { message: 'Insufficient data for pattern recognition' };
    }

    const patterns = {
      cyclicalPatterns: this.identifyCyclicalPatterns(moodHistory, energyHistory),
      weeklyPatterns: this.identifyWeeklyPatterns(moodHistory, energyHistory),
      seasonalPatterns: this.identifySeasonalPatterns(moodHistory, energyHistory),
      triggerPatterns: this.identifyTriggerPatterns(moodHistory),
      recoveryPatterns: this.identifyRecoveryPatterns(moodHistory, energyHistory),
      anomalies: this.identifyAnomalies(moodHistory, energyHistory)
    };

    this.storePatterns(patterns);
    return patterns;
  }

  identifyCyclicalPatterns(moodHistory, energyHistory) {
    const cycleLength = 28; // Assumed average
    const patterns = [];
    
    // Look for repeating patterns over cycle lengths
    for (let offset = 0; offset < cycleLength; offset++) {
      const cyclicalData = this.extractCyclicalData(moodHistory, energyHistory, offset, cycleLength);
      if (cyclicalData.strength > 0.6) {
        patterns.push({
          offset,
          strength: cyclicalData.strength,
          description: cyclicalData.description,
          predictiveValue: cyclicalData.predictiveValue
        });
      }
    }
    
    return patterns;
  }

  identifyWeeklyPatterns(moodHistory, energyHistory) {
    const dayPatterns = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach((day, index) => {
      const dayData = moodHistory.filter(entry => 
        new Date(entry.timestamp).getDay() === index
      );
      
      if (dayData.length > 0) {
        dayPatterns[day] = {
          averageMood: this.calculateAverage(dayData, 'overallMood'),
          commonEmotions: this.getTopEmotions(dayData),
          sampleSize: dayData.length
        };
      }
    });
    
    return dayPatterns;
  }

  getTopEmotions(moodData) {
    const emotionTotals = {};
    
    moodData.forEach(entry => {
      Object.entries(entry.emotions || {}).forEach(([emotion, intensity]) => {
        emotionTotals[emotion] = (emotionTotals[emotion] || 0) + intensity;
      });
    });
    
    return Object.entries(emotionTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, total]) => emotion);
  }

  storePatterns(patterns) {
    this.patterns.set(Date.now(), patterns);
  }

  getStoredPatterns() {
    return Array.from(this.patterns.entries());
  }
}

class InterventionSuggestionEngine {
  constructor() {
    this.interventionDatabase = this.initializeInterventions();
  }

  suggest(mood, energy, cycleContext) {
    const suggestions = [];
    
    // Immediate interventions based on current state
    suggestions.push(...this.getImmediateInterventions(mood, energy));
    
    // Cycle-specific interventions
    suggestions.push(...this.getCycleSpecificInterventions(mood, energy, cycleContext));
    
    // Pattern-based interventions
    suggestions.push(...this.getPatternBasedInterventions(mood, energy));
    
    // Preventive interventions
    suggestions.push(...this.getPreventiveInterventions(cycleContext));
    
    return this.prioritizeInterventions(suggestions);
  }

  getImmediateInterventions(mood, energy) {
    const interventions = [];
    
    if (mood.anxiety > 7) {
      interventions.push({
        type: 'breathing',
        urgency: 'immediate',
        title: '4-7-8 Breathing Exercise',
        description: 'Inhale for 4, hold for 7, exhale for 8 to reduce anxiety',
        duration: '5 minutes',
        effectiveness: 0.8
      });
    }
    
    if (energy.fatigue > 8) {
      interventions.push({
        type: 'rest',
        urgency: 'immediate',
        title: 'Power Nap',
        description: '10-20 minute nap to restore energy',
        duration: '20 minutes',
        effectiveness: 0.7
      });
    }
    
    if (mood.stress > 7) {
      interventions.push({
        type: 'mindfulness',
        urgency: 'immediate',
        title: 'Quick Mindfulness Exercise',
        description: 'Focus on 5 things you can see, 4 you can hear, 3 you can touch',
        duration: '3 minutes',
        effectiveness: 0.6
      });
    }
    
    return interventions;
  }

  getCycleSpecificInterventions(mood, energy, cycleContext) {
    const interventions = [];
    const phase = cycleContext.currentPhase;
    
    if (phase === 'luteal' && mood.irritability > 6) {
      interventions.push({
        type: 'nutrition',
        urgency: 'daily',
        title: 'Magnesium-Rich Foods',
        description: 'Include dark chocolate, nuts, seeds to support mood',
        duration: 'ongoing',
        effectiveness: 0.6
      });
    }
    
    if (phase === 'menstrual' && energy.physicalEnergy < 4) {
      interventions.push({
        type: 'movement',
        urgency: 'gentle',
        title: 'Gentle Yoga',
        description: 'Restorative poses to support energy during menstruation',
        duration: '20 minutes',
        effectiveness: 0.7
      });
    }
    
    return interventions;
  }

  prioritizeInterventions(interventions) {
    return interventions
      .sort((a, b) => {
        const urgencyScore = { immediate: 3, daily: 2, gentle: 1, preventive: 0 };
        return (urgencyScore[b.urgency] || 0) - (urgencyScore[a.urgency] || 0) ||
               b.effectiveness - a.effectiveness;
      })
      .slice(0, 5); // Return top 5 recommendations
  }

  initializeInterventions() {
    return {
      anxiety: [
        { name: 'Deep Breathing', effectiveness: 0.8, duration: '5min' },
        { name: 'Progressive Muscle Relaxation', effectiveness: 0.7, duration: '15min' },
        { name: 'Mindful Walking', effectiveness: 0.6, duration: '10min' }
      ],
      low_energy: [
        { name: 'Power Nap', effectiveness: 0.8, duration: '20min' },
        { name: 'Light Exercise', effectiveness: 0.7, duration: '15min' },
        { name: 'Caffeine (if appropriate)', effectiveness: 0.6, duration: 'immediate' }
      ],
      low_mood: [
        { name: 'Gratitude Practice', effectiveness: 0.7, duration: '10min' },
        { name: 'Social Connection', effectiveness: 0.8, duration: '30min' },
        { name: 'Music Therapy', effectiveness: 0.6, duration: '15min' }
      ]
    };
  }
}

class WellnessScoring {
  calculate(mood, energy, recentHistory) {
    const currentScore = this.calculateCurrentScore(mood, energy);
    const trendScore = this.calculateTrendScore(recentHistory);
    const consistencyScore = this.calculateConsistencyScore(recentHistory);
    
    const overallScore = (currentScore * 0.5 + trendScore * 0.3 + consistencyScore * 0.2);
    
    return {
      overall: overallScore,
      current: currentScore,
      trend: trendScore,
      consistency: consistencyScore,
      category: this.getScoreCategory(overallScore),
      recommendations: this.getScoreRecommendations(overallScore, trendScore)
    };
  }

  calculateCurrentScore(mood, energy) {
    const moodFactors = [
      mood.overallMood,
      mood.happiness,
      10 - mood.anxiety, // Inverse scoring for negative emotions
      10 - mood.stress,
      mood.confidence,
      mood.motivation
    ];
    
    const energyFactors = [
      energy.physicalEnergy,
      energy.mentalEnergy,
      energy.emotionalEnergy,
      10 - energy.fatigue, // Inverse scoring
      energy.alertness
    ];
    
    const moodScore = moodFactors.reduce((sum, val) => sum + val, 0) / moodFactors.length;
    const energyScore = energyFactors.reduce((sum, val) => sum + val, 0) / energyFactors.length;
    
    return (moodScore * 0.6 + energyScore * 0.4);
  }

  calculateTrendScore(recentHistory) {
    if (recentHistory.mood.length < 3 || recentHistory.energy.length < 3) {
      return 5; // Neutral score if insufficient data
    }
    
    const moodTrend = this.calculateTrend(recentHistory.mood.map(m => m.overallMood));
    const energyTrend = this.calculateTrend(recentHistory.energy.map(e => e.physicalEnergy));
    
    // Convert trend to score (positive trend = higher score)
    const moodTrendScore = 5 + (moodTrend * 5);
    const energyTrendScore = 5 + (energyTrend * 5);
    
    return Math.max(0, Math.min(10, (moodTrendScore + energyTrendScore) / 2));
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  calculateConsistencyScore(recentHistory) {
    if (recentHistory.mood.length < 3 || recentHistory.energy.length < 3) {
      return 5;
    }
    
    const moodValues = recentHistory.mood.map(m => m.overallMood);
    const energyValues = recentHistory.energy.map(e => e.physicalEnergy);
    
    const moodVariability = this.calculateVariability(moodValues);
    const energyVariability = this.calculateVariability(energyValues);
    
    // Lower variability = higher consistency score
    const moodConsistency = Math.max(0, 10 - moodVariability * 2);
    const energyConsistency = Math.max(0, 10 - energyVariability * 2);
    
    return (moodConsistency + energyConsistency) / 2;
  }

  calculateVariability(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  getScoreCategory(score) {
    if (score >= 8) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 5) return 'moderate';
    if (score >= 3) return 'needs_attention';
    return 'concerning';
  }

  getScoreRecommendations(overallScore, trendScore) {
    const recommendations = [];
    
    if (overallScore < 5) {
      recommendations.push('Focus on basic self-care: sleep, nutrition, gentle movement');
    }
    
    if (trendScore < 4) {
      recommendations.push('Current trend is declining - consider implementing mood and energy interventions');
    }
    
    if (overallScore >= 7) {
      recommendations.push('Great wellness level! Focus on maintaining current habits');
    }
    
    return recommendations;
  }
}