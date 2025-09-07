export class CervicalMucusAnalyzer {
  constructor() {
    this.mucusHistory = [];
    this.patterns = this.initializePatterns();
    this.photoRecognition = new MucusPhotoRecognition();
    this.fertilityPredictor = new FertilityWindowPredictor();
    this.qualityAssessment = new MucusQualityAssessment();
  }

  analyzeMucus(mucusData) {
    const processedData = this.processMucusObservation(mucusData);
    this.mucusHistory.push(processedData);
    
    const analysis = {
      currentType: processedData.type,
      fertilityScore: this.calculateFertilityScore(processedData),
      cyclePhase: this.determineCyclePhase(processedData),
      predictions: this.generatePredictions(),
      recommendations: this.generateRecommendations(processedData),
      patterns: this.analyzePatterns(),
      photoAnalysis: processedData.photoAnalysis
    };
    
    return analysis;
  }

  processMucusObservation(data) {
    const processed = {
      timestamp: data.timestamp || Date.now(),
      type: data.type,
      amount: data.amount,
      consistency: data.consistency,
      color: data.color,
      sensation: data.sensation,
      photo: data.photo,
      notes: data.notes,
      method: data.method || 'visual'
    };

    if (data.photo) {
      processed.photoAnalysis = this.photoRecognition.analyzePhoto(data.photo);
      processed = this.mergePhotoAnalysis(processed);
    }

    processed.fertilityIndex = this.calculateFertilityIndex(processed);
    processed.quality = this.assessObservationQuality(processed);
    processed.cycleDay = this.estimateCycleDay(processed.timestamp);

    return processed;
  }

  mergePhotoAnalysis(observation) {
    if (!observation.photoAnalysis) return observation;

    const photo = observation.photoAnalysis;
    
    return {
      ...observation,
      type: this.reconcileType(observation.type, photo.predictedType),
      consistency: this.reconcileConsistency(observation.consistency, photo.consistency),
      color: this.reconcileColor(observation.color, photo.color),
      amount: this.reconcileAmount(observation.amount, photo.amount),
      confidence: photo.confidence,
      photoFeatures: photo.features
    };
  }

  calculateFertilityIndex(observation) {
    let index = 0;

    // Type scoring (most important factor)
    const typeScores = {
      'dry': 0,
      'sticky': 1,
      'creamy': 2,
      'watery': 3,
      'egg_white': 4,
      'peak': 4
    };
    index += (typeScores[observation.type] || 0) * 0.4;

    // Amount scoring
    const amountScores = {
      'none': 0,
      'light': 1,
      'moderate': 2,
      'heavy': 3
    };
    index += (amountScores[observation.amount] || 0) * 0.2;

    // Consistency scoring
    const consistencyScores = {
      'dry': 0,
      'thick': 1,
      'creamy': 2,
      'stretchy': 3,
      'very_stretchy': 4
    };
    index += (consistencyScores[observation.consistency] || 0) * 0.25;

    // Sensation scoring
    const sensationScores = {
      'dry': 0,
      'nothing': 0.5,
      'damp': 1,
      'wet': 2,
      'slippery': 3
    };
    index += (sensationScores[observation.sensation] || 0) * 0.15;

    return Math.min(4, index);
  }

  calculateFertilityScore(observation) {
    const index = observation.fertilityIndex;
    const maxScore = 4;
    
    const score = {
      numerical: (index / maxScore) * 100,
      category: this.getFertilityCategory(index),
      description: this.getFertilityDescription(index),
      confidence: observation.quality * 100
    };

    return score;
  }

  getFertilityCategory(index) {
    if (index >= 3.5) return 'peak';
    if (index >= 2.5) return 'high';
    if (index >= 1.5) return 'medium';
    if (index >= 0.5) return 'low';
    return 'infertile';
  }

  getFertilityDescription(index) {
    const descriptions = {
      'peak': 'Peak fertility - optimal conception chance',
      'high': 'High fertility - very favorable for conception',
      'medium': 'Moderate fertility - approaching fertile window',
      'low': 'Low fertility - less favorable conditions',
      'infertile': 'Infertile period - conception unlikely'
    };
    
    return descriptions[this.getFertilityCategory(index)];
  }

  determineCyclePhase(observation) {
    const recentObservations = this.mucusHistory.slice(-7);
    const currentIndex = observation.fertilityIndex;
    const trend = this.calculateTrend(recentObservations);

    if (currentIndex >= 3 && trend > 0) {
      return {
        phase: 'pre_ovulation',
        description: 'Approaching ovulation',
        confidence: 0.8,
        daysToOvulation: this.estimateDaysToOvulation(observation)
      };
    } else if (currentIndex >= 3.5) {
      return {
        phase: 'ovulation',
        description: 'Peak fertility/ovulation likely',
        confidence: 0.9,
        recommendation: 'Optimal time for conception attempts'
      };
    } else if (currentIndex < 2 && trend < 0) {
      return {
        phase: 'post_ovulation',
        description: 'Post-ovulation phase',
        confidence: 0.7,
        daysSinceOvulation: this.estimateDaysSinceOvulation()
      };
    } else if (currentIndex < 1) {
      return {
        phase: 'menstrual',
        description: 'Menstrual or dry phase',
        confidence: 0.6,
        recommendation: 'Infertile period'
      };
    } else {
      return {
        phase: 'follicular',
        description: 'Early follicular phase',
        confidence: 0.5,
        recommendation: 'Monitor for increasing fertility signs'
      };
    }
  }

  generatePredictions() {
    if (this.mucusHistory.length < 10) {
      return { message: 'Need more observations for predictions' };
    }

    const recentPattern = this.analyzeRecentPattern();
    const historicalPatterns = this.analyzeHistoricalPatterns();
    
    return {
      nextOvulation: this.predictNextOvulation(recentPattern, historicalPatterns),
      fertileWindow: this.predictFertileWindow(recentPattern),
      mucusProgression: this.predictMucusProgression(),
      patternConfidence: this.calculatePatternConfidence(recentPattern)
    };
  }

  predictNextOvulation(recentPattern, historicalPatterns) {
    const avgCycleLength = this.calculateAverageCycleLength();
    const mucusPatternLength = this.calculateAverageMucusPatternLength();
    
    const today = new Date();
    const daysSinceLastPeriod = this.getDaysSinceLastPeriod();
    const expectedOvulationDay = Math.round(avgCycleLength - 14); // Luteal phase ~14 days
    
    if (daysSinceLastPeriod < expectedOvulationDay - 5) {
      return {
        date: new Date(today.getTime() + (expectedOvulationDay - daysSinceLastPeriod) * 24 * 60 * 60 * 1000),
        confidence: 0.7,
        method: 'cycle_length_based'
      };
    }

    // Use mucus pattern analysis for near-term prediction
    const currentFertilityTrend = this.calculateTrend(this.mucusHistory.slice(-5));
    
    if (currentFertilityTrend > 0.5) {
      return {
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        confidence: 0.8,
        method: 'mucus_pattern_based'
      };
    }

    return {
      date: new Date(today.getTime() + (expectedOvulationDay - daysSinceLastPeriod) * 24 * 60 * 60 * 1000),
      confidence: 0.6,
      method: 'historical_average'
    };
  }

  predictFertileWindow(pattern) {
    const today = new Date();
    const ovulationPrediction = this.predictNextOvulation(pattern, null);
    
    // Fertile window: 5 days before ovulation + day of ovulation
    const windowStart = new Date(ovulationPrediction.date.getTime() - 5 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(ovulationPrediction.date.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      start: windowStart,
      end: windowEnd,
      peak: ovulationPrediction.date,
      confidence: ovulationPrediction.confidence,
      currentStatus: this.getCurrentFertileStatus(today, windowStart, windowEnd)
    };
  }

  predictMucusProgression() {
    const recent = this.mucusHistory.slice(-5);
    const currentTrend = this.calculateTrend(recent);
    
    const predictions = [];
    for (let day = 1; day <= 7; day++) {
      const predicted = this.predictMucusForDay(day, currentTrend);
      predictions.push({
        day,
        expectedType: predicted.type,
        expectedFertility: predicted.fertility,
        confidence: predicted.confidence
      });
    }
    
    return predictions;
  }

  generateRecommendations(observation) {
    const recommendations = [];
    const phase = this.determineCyclePhase(observation);
    
    // Phase-specific recommendations
    if (phase.phase === 'pre_ovulation') {
      recommendations.push({
        type: 'timing',
        message: 'Fertility is increasing - consider timing intercourse',
        priority: 'high'
      });
      recommendations.push({
        type: 'observation',
        message: 'Check mucus consistency throughout the day',
        priority: 'medium'
      });
    } else if (phase.phase === 'ovulation') {
      recommendations.push({
        type: 'timing',
        message: 'Peak fertility detected - optimal conception window',
        priority: 'high'
      });
      recommendations.push({
        type: 'tracking',
        message: 'Continue daily observations to confirm ovulation',
        priority: 'high'
      });
    } else if (phase.phase === 'post_ovulation') {
      recommendations.push({
        type: 'confirmation',
        message: 'Ovulation likely occurred - less fertile period ahead',
        priority: 'medium'
      });
    }

    // Quality-based recommendations
    if (observation.quality < 0.6) {
      recommendations.push({
        type: 'technique',
        message: 'Consider checking mucus multiple times per day for better accuracy',
        priority: 'medium'
      });
    }

    // Pattern-based recommendations
    const patterns = this.analyzePatterns();
    if (patterns.irregularityScore > 0.7) {
      recommendations.push({
        type: 'health',
        message: 'Consider consulting healthcare provider about irregular patterns',
        priority: 'high'
      });
    }

    return recommendations;
  }

  analyzePatterns() {
    if (this.mucusHistory.length < 30) {
      return { message: 'Need more data for pattern analysis' };
    }

    const cycles = this.groupByCycles();
    const patterns = {
      averageCycleLength: this.calculateAverageCycleLength(),
      mucusPatternLength: this.calculateAverageMucusPatternLength(),
      peakDays: this.analyzePeakDays(cycles),
      consistency: this.analyzeConsistency(cycles),
      irregularityScore: this.calculateIrregularityScore(cycles),
      seasonalVariations: this.analyzeSeasonalVariations(),
      qualityTrends: this.analyzeQualityTrends()
    };

    return patterns;
  }

  analyzePeakDays(cycles) {
    const peakDays = cycles.map(cycle => {
      const peakObservation = cycle.observations
        .reduce((peak, current) => 
          current.fertilityIndex > peak.fertilityIndex ? current : peak
        );
      return peakObservation.cycleDay;
    });

    return {
      average: peakDays.reduce((sum, day) => sum + day, 0) / peakDays.length,
      range: { min: Math.min(...peakDays), max: Math.max(...peakDays) },
      consistency: this.calculateVarianceScore(peakDays)
    };
  }

  calculateTrend(observations) {
    if (observations.length < 2) return 0;
    
    const indices = observations.map(obs => obs.fertilityIndex);
    const n = indices.length;
    
    // Simple linear regression slope
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = indices.reduce((sum, val) => sum + val, 0);
    const sumXY = indices.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  assessObservationQuality(observation) {
    let quality = 1.0;
    
    // Reduce quality for missing key observations
    if (!observation.type) quality -= 0.3;
    if (!observation.amount) quality -= 0.2;
    if (!observation.consistency) quality -= 0.2;
    
    // Adjust for observation method
    if (observation.method === 'visual') quality *= 0.8;
    else if (observation.method === 'photo') quality *= 0.9;
    else if (observation.method === 'physical') quality *= 1.0;
    
    // Photo analysis confidence boost
    if (observation.photoAnalysis && observation.photoAnalysis.confidence > 0.7) {
      quality *= 1.1;
    }
    
    return Math.max(0, Math.min(1, quality));
  }

  exportMucusData() {
    return {
      mucusHistory: this.mucusHistory,
      patterns: this.analyzePatterns(),
      currentAnalysis: this.mucusHistory.length > 0 ? 
        this.analyzeMucus(this.mucusHistory[this.mucusHistory.length - 1]) : null,
      metadata: {
        totalObservations: this.mucusHistory.length,
        averageQuality: this.calculateAverageQuality(),
        dateRange: this.getDateRange(),
        cycleCount: this.countCompleteCycles()
      }
    };
  }

  calculateAverageQuality() {
    if (this.mucusHistory.length === 0) return 0;
    return this.mucusHistory.reduce((sum, obs) => sum + obs.quality, 0) / this.mucusHistory.length;
  }

  getDateRange() {
    if (this.mucusHistory.length === 0) return null;
    
    const dates = this.mucusHistory.map(obs => new Date(obs.timestamp));
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates)),
      totalDays: Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24))
    };
  }

  initializePatterns() {
    return {
      mucusTypes: {
        'dry': { description: 'No mucus present', fertility: 0 },
        'sticky': { description: 'Thick, pasty, crumbly', fertility: 1 },
        'creamy': { description: 'Smooth, lotion-like', fertility: 2 },
        'watery': { description: 'Thin, watery consistency', fertility: 3 },
        'egg_white': { description: 'Clear, stretchy, slippery', fertility: 4 },
        'peak': { description: 'Most fertile quality observed', fertility: 4 }
      },
      fertilityRules: {
        peak_detection: 'Last day of egg-white or peak mucus',
        dry_day_rule: 'Dry days after peak indicate infertile period',
        pattern_recognition: 'Individual patterns vary but follow general progression'
      }
    };
  }
}

class MucusPhotoRecognition {
  constructor() {
    this.models = this.initializeModels();
    this.featureExtractor = new MucusFeatureExtractor();
  }

  analyzePhoto(photoData) {
    try {
      const features = this.featureExtractor.extract(photoData);
      const classification = this.classifyMucus(features);
      const quality = this.assessPhotoQuality(features);
      
      return {
        predictedType: classification.type,
        consistency: classification.consistency,
        color: classification.color,
        amount: classification.amount,
        confidence: classification.confidence,
        quality: quality,
        features: features,
        recommendations: this.getPhotoRecommendations(quality, features)
      };
    } catch (error) {
      return {
        error: 'Failed to analyze photo',
        message: 'Please ensure photo is clear and well-lit',
        confidence: 0
      };
    }
  }

  classifyMucus(features) {
    // Simplified ML-like classification based on extracted features
    let type = 'unknown';
    let confidence = 0;
    
    // Texture-based classification
    if (features.transparency > 0.8 && features.stretchiness > 0.7) {
      type = 'egg_white';
      confidence = 0.9;
    } else if (features.transparency > 0.5 && features.viscosity < 0.4) {
      type = 'watery';
      confidence = 0.8;
    } else if (features.opacity > 0.6 && features.viscosity > 0.6) {
      type = 'creamy';
      confidence = 0.7;
    } else if (features.opacity > 0.8 && features.viscosity > 0.8) {
      type = 'sticky';
      confidence = 0.6;
    } else if (features.presence < 0.2) {
      type = 'dry';
      confidence = 0.5;
    }
    
    return {
      type,
      consistency: this.determineConsistency(features),
      color: this.determineColor(features),
      amount: this.determineAmount(features),
      confidence: confidence * features.imageQuality
    };
  }

  determineConsistency(features) {
    if (features.stretchiness > 0.8) return 'very_stretchy';
    if (features.stretchiness > 0.5) return 'stretchy';
    if (features.viscosity > 0.7) return 'thick';
    if (features.viscosity > 0.4) return 'creamy';
    return 'thin';
  }

  determineColor(features) {
    if (features.colorAnalysis.clear > 0.8) return 'clear';
    if (features.colorAnalysis.white > 0.6) return 'white';
    if (features.colorAnalysis.yellow > 0.4) return 'yellow';
    if (features.colorAnalysis.brown > 0.3) return 'brown';
    return 'other';
  }

  determineAmount(features) {
    if (features.coverage > 0.7) return 'heavy';
    if (features.coverage > 0.4) return 'moderate';
    if (features.coverage > 0.1) return 'light';
    return 'none';
  }

  assessPhotoQuality(features) {
    let quality = 1.0;
    
    // Penalize poor image quality factors
    if (features.blur > 0.5) quality -= 0.3;
    if (features.lighting < 0.3) quality -= 0.4;
    if (features.contrast < 0.2) quality -= 0.2;
    if (features.focus < 0.6) quality -= 0.2;
    
    return Math.max(0, Math.min(1, quality));
  }

  getPhotoRecommendations(quality, features) {
    const recommendations = [];
    
    if (quality < 0.6) {
      if (features.blur > 0.5) {
        recommendations.push('Hold camera steady for clearer image');
      }
      if (features.lighting < 0.3) {
        recommendations.push('Ensure adequate lighting for better analysis');
      }
      if (features.focus < 0.6) {
        recommendations.push('Focus camera properly on the sample');
      }
    }
    
    if (features.coverage < 0.2) {
      recommendations.push('Include more of the sample in the image');
    }
    
    return recommendations;
  }

  initializeModels() {
    // Placeholder for ML models - would be actual trained models in production
    return {
      typeClassifier: 'cnn_model_v1',
      qualityAssessment: 'image_quality_model_v1',
      featureExtraction: 'feature_extraction_model_v1'
    };
  }
}

class MucusFeatureExtractor {
  extract(photoData) {
    // Simplified feature extraction - would use actual image processing in production
    return {
      transparency: Math.random(), // 0-1, higher = more transparent
      opacity: Math.random(), // 0-1, higher = more opaque
      viscosity: Math.random(), // 0-1, higher = thicker
      stretchiness: Math.random(), // 0-1, higher = more stretchy
      presence: Math.random(), // 0-1, amount present
      coverage: Math.random(), // 0-1, image coverage
      
      // Image quality metrics
      blur: Math.random(), // 0-1, higher = more blurred
      lighting: Math.random(), // 0-1, higher = better lighting
      contrast: Math.random(), // 0-1, higher = better contrast
      focus: Math.random(), // 0-1, higher = better focus
      imageQuality: Math.random(), // 0-1, overall quality
      
      // Color analysis
      colorAnalysis: {
        clear: Math.random(),
        white: Math.random(),
        yellow: Math.random(),
        brown: Math.random()
      },
      
      // Texture analysis
      textureMetrics: {
        smoothness: Math.random(),
        granularity: Math.random(),
        homogeneity: Math.random()
      }
    };
  }
}

class FertilityWindowPredictor {
  constructor() {
    this.historicalData = [];
  }

  updateHistory(mucusHistory) {
    this.historicalData = mucusHistory;
  }

  predictWindow(currentObservation) {
    const recentPattern = this.analyzeRecentPattern(currentObservation);
    const historicalWindow = this.calculateHistoricalWindow();
    
    return {
      predicted: this.combineAnalyses(recentPattern, historicalWindow),
      confidence: this.calculateConfidence(recentPattern, historicalWindow),
      method: 'combined_analysis'
    };
  }

  analyzeRecentPattern(current) {
    const trend = this.calculateFertilityTrend();
    const peakPrediction = this.predictPeakDay(trend);
    
    return {
      trend,
      peakPrediction,
      currentFertility: current.fertilityIndex
    };
  }

  calculateHistoricalWindow() {
    // Analyze historical fertile windows
    const cycles = this.groupObservationsByCycle();
    const fertileWindows = cycles.map(cycle => this.extractFertileWindow(cycle));
    
    return {
      averageStart: this.calculateAverageStart(fertileWindows),
      averageLength: this.calculateAverageLength(fertileWindows),
      consistency: this.calculateConsistency(fertileWindows)
    };
  }
}

class MucusQualityAssessment {
  assessQuality(observation) {
    const factors = {
      completeness: this.assessCompleteness(observation),
      consistency: this.assessConsistency(observation),
      timeliness: this.assessTimeliness(observation),
      accuracy: this.assessAccuracy(observation)
    };
    
    const overallQuality = Object.values(factors)
      .reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
    
    return {
      overall: overallQuality,
      factors,
      recommendations: this.generateQualityRecommendations(factors)
    };
  }

  assessCompleteness(observation) {
    let score = 1.0;
    const requiredFields = ['type', 'amount', 'consistency'];
    
    requiredFields.forEach(field => {
      if (!observation[field]) score -= 0.25;
    });
    
    return Math.max(0, score);
  }

  assessConsistency(observation) {
    // Check if observation is consistent with expected patterns
    return 0.8; // Placeholder
  }

  assessTimeliness(observation) {
    const now = Date.now();
    const observationTime = new Date(observation.timestamp).getTime();
    const hoursOld = (now - observationTime) / (1000 * 60 * 60);
    
    // Fresher observations are better
    if (hoursOld < 1) return 1.0;
    if (hoursOld < 6) return 0.9;
    if (hoursOld < 12) return 0.8;
    if (hoursOld < 24) return 0.6;
    return 0.4;
  }

  assessAccuracy(observation) {
    // Would compare with photo analysis if available
    if (observation.photoAnalysis) {
      return observation.photoAnalysis.confidence;
    }
    return 0.7; // Default assumption for manual observations
  }

  generateQualityRecommendations(factors) {
    const recommendations = [];
    
    if (factors.completeness < 0.8) {
      recommendations.push('Include all key observations: type, amount, consistency');
    }
    if (factors.timeliness < 0.6) {
      recommendations.push('Record observations as soon as possible');
    }
    if (factors.accuracy < 0.7) {
      recommendations.push('Consider using photo analysis for better accuracy');
    }
    
    return recommendations;
  }
}