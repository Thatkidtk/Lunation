export class BasalBodyTemperaturePredictor {
  constructor() {
    this.temperatureHistory = [];
    this.predictions = [];
    this.deviceCalibrations = new Map();
    this.algorithms = {
      thermal: new ThermalShiftAnalyzer(),
      coverline: new CoverlineMethod(),
      bayesian: new BayesianTemperatureModel(),
      neural: new TemperatureNeuralNetwork()
    };
  }

  addTemperature(temperature, timestamp, metadata = {}) {
    const processedData = this.processTemperatureReading({
      temperature,
      timestamp,
      device: metadata.device || 'manual',
      timeOfDay: metadata.timeOfDay || new Date(timestamp).getHours(),
      sleepQuality: metadata.sleepQuality,
      alcoholConsumption: metadata.alcoholConsumption,
      illness: metadata.illness,
      stressLevel: metadata.stressLevel,
      medication: metadata.medication,
      location: metadata.location,
      ambient: metadata.ambientTemperature
    });

    this.temperatureHistory.push(processedData);
    this.updatePredictions();
    return this.getCurrentInsights();
  }

  processTemperatureReading(reading) {
    const adjusted = this.adjustForFactors(reading);
    const validated = this.validateReading(adjusted);
    const calibrated = this.calibrateDevice(validated);
    
    return {
      ...calibrated,
      quality: this.assessDataQuality(calibrated),
      reliability: this.calculateReliability(calibrated),
      normalized: this.normalizeTemperature(calibrated)
    };
  }

  adjustForFactors(reading) {
    let adjusted = reading.temperature;
    
    // Time of day adjustment
    if (reading.timeOfDay > 6) {
      adjusted -= (reading.timeOfDay - 6) * 0.02; // Compensate for rising temps
    }
    
    // Sleep quality adjustment
    if (reading.sleepQuality && reading.sleepQuality < 7) {
      adjusted += (7 - reading.sleepQuality) * 0.01;
    }
    
    // Alcohol consumption adjustment
    if (reading.alcoholConsumption) {
      adjusted -= 0.1; // Alcohol typically lowers BBT
    }
    
    // Illness adjustment
    if (reading.illness) {
      adjusted -= 0.2; // Flag as potentially unreliable
    }
    
    // Stress level adjustment
    if (reading.stressLevel && reading.stressLevel > 7) {
      adjusted += (reading.stressLevel - 7) * 0.015;
    }
    
    return { ...reading, temperature: adjusted, originalTemperature: reading.temperature };
  }

  validateReading(reading) {
    const issues = [];
    
    // Temperature range validation
    if (reading.temperature < 96.0 || reading.temperature > 100.0) {
      issues.push('temperature_out_of_range');
    }
    
    // Time consistency validation
    if (reading.timeOfDay > 8) {
      issues.push('late_measurement');
    }
    
    // Device consistency validation
    const recentDeviceTemps = this.temperatureHistory
      .filter(t => t.device === reading.device)
      .slice(-7);
    
    if (recentDeviceTemps.length > 3) {
      const avgTemp = recentDeviceTemps.reduce((sum, t) => sum + t.temperature, 0) / recentDeviceTemps.length;
      if (Math.abs(reading.temperature - avgTemp) > 0.5) {
        issues.push('temperature_anomaly');
      }
    }
    
    return { ...reading, validationIssues: issues, isValid: issues.length === 0 };
  }

  calibrateDevice(reading) {
    if (!this.deviceCalibrations.has(reading.device)) {
      this.initializeDeviceCalibration(reading.device);
    }
    
    const calibration = this.deviceCalibrations.get(reading.device);
    const calibratedTemp = reading.temperature + calibration.offset;
    
    return {
      ...reading,
      temperature: calibratedTemp,
      deviceCalibration: calibration
    };
  }

  initializeDeviceCalibration(deviceId) {
    const deviceProfiles = {
      'manual': { offset: 0, reliability: 0.7, precision: 0.1 },
      'smart_thermometer': { offset: 0, reliability: 0.95, precision: 0.01 },
      'wearable': { offset: -0.1, reliability: 0.8, precision: 0.05 },
      'fertility_tracker': { offset: 0.05, reliability: 0.9, precision: 0.02 }
    };
    
    this.deviceCalibrations.set(deviceId, 
      deviceProfiles[deviceId] || deviceProfiles['manual']
    );
  }

  assessDataQuality(reading) {
    let quality = 1.0;
    
    // Reduce quality for validation issues
    quality -= reading.validationIssues.length * 0.2;
    
    // Adjust for measurement conditions
    if (reading.timeOfDay > 7) quality -= 0.2;
    if (reading.sleepQuality && reading.sleepQuality < 6) quality -= 0.15;
    if (reading.alcoholConsumption) quality -= 0.1;
    if (reading.illness) quality -= 0.3;
    if (reading.stressLevel && reading.stressLevel > 8) quality -= 0.1;
    
    // Adjust for device reliability
    quality *= reading.deviceCalibration.reliability;
    
    return Math.max(0, Math.min(1, quality));
  }

  updatePredictions() {
    if (this.temperatureHistory.length < 10) return;
    
    const recentHistory = this.temperatureHistory.slice(-60); // Last 60 days
    
    // Run multiple prediction algorithms
    const thermalShift = this.algorithms.thermal.predictOvulation(recentHistory);
    const coverlineResult = this.algorithms.coverline.detectOvulation(recentHistory);
    const bayesianPred = this.algorithms.bayesian.predict(recentHistory);
    const neuralPred = this.algorithms.neural.forecast(recentHistory);
    
    // Ensemble prediction
    this.predictions = this.combineAlgorithms({
      thermalShift,
      coverlineResult,
      bayesianPred,
      neuralPred
    });
  }

  combineAlgorithms(predictions) {
    const weights = {
      thermalShift: 0.3,
      coverlineResult: 0.25,
      bayesianPred: 0.25,
      neuralPred: 0.2
    };
    
    const combinedPrediction = {
      ovulationDate: this.weightedAverage(predictions, 'ovulationDate', weights),
      confidence: this.calculateCombinedConfidence(predictions),
      fertileWindow: this.calculateFertileWindow(predictions),
      nextPeriodTemp: this.predictNextPeriodTemperature(predictions),
      temperatureTrend: this.analyzeTrend(predictions),
      algorithmResults: predictions
    };
    
    return combinedPrediction;
  }

  getCurrentInsights() {
    if (this.temperatureHistory.length < 5) {
      return { message: 'Need more data for meaningful insights' };
    }
    
    const recent = this.temperatureHistory.slice(-14);
    const currentPhase = this.determineCurrentPhase(recent);
    const trends = this.analyzeTemperatureTrends(recent);
    
    return {
      currentPhase,
      trends,
      predictions: this.predictions,
      recommendations: this.generateRecommendations(currentPhase, trends),
      dataQuality: this.assessOverallDataQuality(),
      nextMeasurementAdvice: this.getNextMeasurementAdvice()
    };
  }

  determineCurrentPhase(recentTemps) {
    const temps = recentTemps.map(t => t.temperature);
    const recentAvg = temps.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = temps.slice(-10, -3).reduce((a, b) => a + b, 0) / 7;
    
    const thermalShift = recentAvg - earlierAvg;
    
    if (thermalShift > 0.2) {
      return {
        phase: 'luteal',
        description: 'Post-ovulation phase detected',
        confidence: Math.min(0.9, 0.5 + thermalShift * 2),
        daysPostOvulation: this.estimateDaysPostOvulation(recentTemps)
      };
    } else if (thermalShift < -0.1) {
      return {
        phase: 'menstrual',
        description: 'Menstrual phase likely starting',
        confidence: 0.7,
        recommendation: 'Expect temperature to remain low'
      };
    } else {
      return {
        phase: 'follicular',
        description: 'Pre-ovulation phase',
        confidence: 0.6,
        recommendation: 'Watch for temperature rise indicating ovulation'
      };
    }
  }

  generateRecommendations(phase, trends) {
    const recommendations = [];
    
    // Phase-specific recommendations
    if (phase.phase === 'follicular') {
      recommendations.push({
        type: 'measurement',
        message: 'Take temperature at the same time daily for best accuracy',
        priority: 'high'
      });
      recommendations.push({
        type: 'timing',
        message: 'Ovulation may occur soon - watch for temperature rise',
        priority: 'medium'
      });
    } else if (phase.phase === 'luteal') {
      recommendations.push({
        type: 'confirmation',
        message: 'Sustained temperature rise confirms ovulation',
        priority: 'high'
      });
      recommendations.push({
        type: 'timing',
        message: `Expect period in ${14 - phase.daysPostOvulation} days if not pregnant`,
        priority: 'medium'
      });
    }
    
    // Trend-based recommendations
    if (trends.consistency < 0.7) {
      recommendations.push({
        type: 'improvement',
        message: 'Consider using a smart thermometer for more consistent readings',
        priority: 'medium'
      });
    }
    
    if (trends.dataQuality < 0.6) {
      recommendations.push({
        type: 'technique',
        message: 'Ensure 3+ hours of sleep before measuring and measure immediately upon waking',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  predictNextPeriodTemperature(predictions) {
    const lutealLength = 14; // Average luteal phase length
    const currentDate = new Date();
    const projectedPeriodDate = new Date(currentDate.getTime() + lutealLength * 24 * 60 * 60 * 1000);
    
    return {
      date: projectedPeriodDate,
      expectedTemperature: this.calculateBaselineTemperature() - 0.1,
      confidence: 0.75,
      range: [this.calculateBaselineTemperature() - 0.3, this.calculateBaselineTemperature() + 0.1]
    };
  }

  calculateBaselineTemperature() {
    const follicularTemps = this.temperatureHistory
      .filter(t => this.isFollicularPhase(t))
      .slice(-30)
      .map(t => t.temperature);
    
    if (follicularTemps.length < 5) {
      return 97.5; // Default baseline
    }
    
    return follicularTemps.reduce((sum, temp) => sum + temp, 0) / follicularTemps.length;
  }

  isFollicularPhase(tempReading) {
    // Simplified phase detection for baseline calculation
    return tempReading.temperature < this.calculateMovingAverage() + 0.1;
  }

  calculateMovingAverage(days = 6) {
    if (this.temperatureHistory.length < days) return null;
    
    const recent = this.temperatureHistory.slice(-days);
    return recent.reduce((sum, temp) => sum + temp.temperature, 0) / recent.length;
  }

  exportTemperatureData() {
    return {
      temperatureHistory: this.temperatureHistory,
      predictions: this.predictions,
      deviceCalibrations: Object.fromEntries(this.deviceCalibrations),
      insights: this.getCurrentInsights(),
      metadata: {
        totalReadings: this.temperatureHistory.length,
        averageQuality: this.assessOverallDataQuality(),
        deviceCount: this.deviceCalibrations.size,
        dateRange: this.getDateRange()
      }
    };
  }

  assessOverallDataQuality() {
    if (this.temperatureHistory.length === 0) return 0;
    
    const totalQuality = this.temperatureHistory
      .reduce((sum, temp) => sum + temp.quality, 0);
    
    return totalQuality / this.temperatureHistory.length;
  }

  getDateRange() {
    if (this.temperatureHistory.length === 0) return null;
    
    const dates = this.temperatureHistory.map(t => new Date(t.timestamp));
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates)),
      totalDays: Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24))
    };
  }
}

class ThermalShiftAnalyzer {
  predictOvulation(temperatureHistory) {
    const temps = temperatureHistory.map(t => t.temperature);
    const shifts = this.detectThermalShifts(temps);
    
    if (shifts.length === 0) {
      return { ovulationDate: null, confidence: 0, method: 'thermal_shift' };
    }
    
    const lastShift = shifts[shifts.length - 1];
    return {
      ovulationDate: new Date(temperatureHistory[lastShift.index].timestamp),
      confidence: lastShift.strength,
      method: 'thermal_shift',
      shiftMagnitude: lastShift.magnitude
    };
  }

  detectThermalShifts(temperatures) {
    const shifts = [];
    
    for (let i = 6; i < temperatures.length - 1; i++) {
      const preShift = temperatures.slice(i - 6, i).reduce((a, b) => a + b, 0) / 6;
      const postShift = temperatures.slice(i, i + 3).reduce((a, b) => a + b, 0) / 3;
      
      const magnitude = postShift - preShift;
      
      if (magnitude > 0.2) {
        shifts.push({
          index: i,
          magnitude,
          strength: Math.min(0.95, 0.5 + magnitude * 2),
          preShiftAvg: preShift,
          postShiftAvg: postShift
        });
      }
    }
    
    return shifts;
  }
}

class CoverlineMethod {
  detectOvulation(temperatureHistory) {
    const temps = temperatureHistory.map(t => t.temperature);
    const coverline = this.calculateCoverline(temps);
    
    if (!coverline) {
      return { ovulationDate: null, confidence: 0, method: 'coverline' };
    }
    
    const ovulationIndex = this.findOvulationFromCoverline(temps, coverline.value);
    
    if (ovulationIndex === -1) {
      return { ovulationDate: null, confidence: 0, method: 'coverline' };
    }
    
    return {
      ovulationDate: new Date(temperatureHistory[ovulationIndex].timestamp),
      confidence: 0.8,
      method: 'coverline',
      coverlineValue: coverline.value
    };
  }

  calculateCoverline(temperatures) {
    // Find the last 6 low temperatures before a sustained rise
    for (let i = 6; i < temperatures.length - 3; i++) {
      const preTemps = temperatures.slice(i - 6, i);
      const postTemps = temperatures.slice(i, i + 3);
      
      const preAvg = preTemps.reduce((a, b) => a + b, 0) / preTemps.length;
      const postAvg = postTemps.reduce((a, b) => a + b, 0) / postTemps.length;
      
      if (postAvg - preAvg > 0.2) {
        const highestLow = Math.max(...preTemps);
        return {
          value: highestLow + 0.1,
          baseIndex: i - 6,
          confidence: 0.8
        };
      }
    }
    
    return null;
  }

  findOvulationFromCoverline(temperatures, coverline) {
    for (let i = 0; i < temperatures.length - 2; i++) {
      if (temperatures[i] < coverline && 
          temperatures[i + 1] >= coverline && 
          temperatures[i + 2] >= coverline) {
        return i;
      }
    }
    return -1;
  }
}

class BayesianTemperatureModel {
  constructor() {
    this.priorOvulationDay = 14; // Cycle day 14 is common
    this.priorVariance = 3; // ±3 days variance
  }

  predict(temperatureHistory) {
    const likelihood = this.calculateLikelihood(temperatureHistory);
    const posterior = this.updatePosterior(likelihood);
    
    return {
      ovulationDate: this.estimateOvulationDate(posterior),
      confidence: posterior.confidence,
      method: 'bayesian',
      uncertaintyRange: posterior.range
    };
  }

  calculateLikelihood(temperatureHistory) {
    const likelihoods = [];
    
    for (let day = 10; day <= 20; day++) {
      const likelihood = this.calculateDayLikelihood(temperatureHistory, day);
      likelihoods.push({ day, likelihood });
    }
    
    return likelihoods;
  }

  calculateDayLikelihood(temperatures, ovulationDay) {
    let likelihood = 1.0;
    
    temperatures.forEach((temp, index) => {
      const cycleDay = this.estimateCycleDay(temp, temperatures);
      const expectedTemp = this.expectedTemperature(cycleDay, ovulationDay);
      const variance = 0.1; // Temperature measurement variance
      
      // Gaussian likelihood
      const diff = temp.temperature - expectedTemp;
      likelihood *= Math.exp(-(diff * diff) / (2 * variance));
    });
    
    return likelihood;
  }

  expectedTemperature(cycleDay, ovulationDay) {
    const baselineTemp = 97.5;
    const lutealBoost = 0.4;
    
    if (cycleDay < ovulationDay) {
      return baselineTemp;
    } else {
      return baselineTemp + lutealBoost;
    }
  }

  updatePosterior(likelihoods) {
    // Combine prior with likelihood to get posterior
    let totalPosterior = 0;
    const posteriors = likelihoods.map(item => {
      const prior = this.gaussianPrior(item.day);
      const posterior = prior * item.likelihood;
      totalPosterior += posterior;
      return { day: item.day, posterior };
    });
    
    // Normalize
    posteriors.forEach(item => {
      item.posterior /= totalPosterior;
    });
    
    // Find MAP (Maximum A Posteriori) estimate
    const map = posteriors.reduce((max, current) => 
      current.posterior > max.posterior ? current : max
    );
    
    return {
      mostLikelyDay: map.day,
      confidence: map.posterior,
      range: this.calculateCredibleInterval(posteriors)
    };
  }

  gaussianPrior(day) {
    const variance = this.priorVariance * this.priorVariance;
    const diff = day - this.priorOvulationDay;
    return Math.exp(-(diff * diff) / (2 * variance));
  }

  calculateCredibleInterval(posteriors) {
    let cumulative = 0;
    let lowerBound = null;
    let upperBound = null;
    
    const sorted = posteriors.sort((a, b) => b.posterior - a.posterior);
    
    for (const item of sorted) {
      cumulative += item.posterior;
      if (cumulative >= 0.05 && !lowerBound) lowerBound = item.day;
      if (cumulative >= 0.95 && !upperBound) {
        upperBound = item.day;
        break;
      }
    }
    
    return { lower: lowerBound || 10, upper: upperBound || 20 };
  }

  estimateOvulationDate(posterior) {
    // Convert cycle day to actual date (simplified)
    const today = new Date();
    const daysAgo = 14 - posterior.mostLikelyDay; // Approximate
    return new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }
}

class TemperatureNeuralNetwork {
  constructor() {
    this.weights = this.initializeWeights();
    this.learningRate = 0.01;
  }

  forecast(temperatureHistory) {
    const features = this.extractFeatures(temperatureHistory);
    const prediction = this.forward(features);
    
    return {
      ovulationDate: this.interpretPrediction(prediction, temperatureHistory),
      confidence: prediction.confidence,
      method: 'neural_network',
      nextTemperatures: prediction.forecast
    };
  }

  extractFeatures(temperatureHistory) {
    const recent = temperatureHistory.slice(-14);
    const temperatures = recent.map(t => t.temperature);
    
    return {
      currentTemp: temperatures[temperatures.length - 1],
      tempTrend: this.calculateTrend(temperatures),
      variance: this.calculateVariance(temperatures),
      movingAverage: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      dayOfCycle: recent.length,
      qualityScore: recent.reduce((sum, t) => sum + t.quality, 0) / recent.length
    };
  }

  forward(features) {
    // Simplified neural network computation
    const hiddenLayer = this.computeHiddenLayer(features);
    const output = this.computeOutput(hiddenLayer);
    
    return {
      ovulationProbability: output.ovulation,
      confidence: output.confidence,
      forecast: output.forecast
    };
  }

  computeHiddenLayer(features) {
    const h1 = Math.tanh(features.currentTemp * this.weights.w1[0] + 
                        features.tempTrend * this.weights.w1[1] + 
                        features.variance * this.weights.w1[2] + this.weights.b1[0]);
    
    const h2 = Math.tanh(features.movingAverage * this.weights.w1[3] + 
                        features.dayOfCycle * this.weights.w1[4] + 
                        features.qualityScore * this.weights.w1[5] + this.weights.b1[1]);
    
    return [h1, h2];
  }

  computeOutput(hiddenLayer) {
    const ovulation = 1 / (1 + Math.exp(-(hiddenLayer[0] * this.weights.w2[0] + 
                                         hiddenLayer[1] * this.weights.w2[1] + this.weights.b2[0])));
    
    const confidence = Math.abs(ovulation - 0.5) * 2; // Distance from uncertainty
    
    return {
      ovulation,
      confidence,
      forecast: this.generateForecast(hiddenLayer)
    };
  }

  generateForecast(hiddenLayer) {
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const predicted = 97.5 + hiddenLayer[0] * 0.3 + Math.sin(i / 7 * Math.PI) * 0.2;
      forecast.push({
        day: i,
        temperature: predicted,
        uncertainty: 0.1 + i * 0.02
      });
    }
    return forecast;
  }

  initializeWeights() {
    return {
      w1: Array.from({length: 6}, () => (Math.random() - 0.5) * 2),
      b1: Array.from({length: 2}, () => (Math.random() - 0.5) * 2),
      w2: Array.from({length: 2}, () => (Math.random() - 0.5) * 2),
      b2: [(Math.random() - 0.5) * 2]
    };
  }

  calculateTrend(temperatures) {
    if (temperatures.length < 2) return 0;
    
    const recent = temperatures.slice(-3);
    const earlier = temperatures.slice(-6, -3);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    return recentAvg - earlierAvg;
  }

  calculateVariance(temperatures) {
    const mean = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const variance = temperatures.reduce((sum, temp) => sum + Math.pow(temp - mean, 2), 0) / temperatures.length;
    return variance;
  }

  interpretPrediction(prediction, temperatureHistory) {
    if (prediction.ovulationProbability > 0.7) {
      // Ovulation likely happened recently or happening now
      const today = new Date();
      return new Date(today.getTime() - 24 * 60 * 60 * 1000); // Yesterday
    } else if (prediction.ovulationProbability > 0.3) {
      // Ovulation likely in next few days
      const today = new Date();
      return new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // In 2 days
    } else {
      // Ovulation not imminent
      return null;
    }
  }
}